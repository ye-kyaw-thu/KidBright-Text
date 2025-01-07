#include <string.h>
#include <sys/fcntl.h>
#include <sys/errno.h>
#include <sys/unistd.h>
#include <sys/select.h>
#include <ctype.h>
#include <time.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "driver/uart.h"
#include "soc/uart_struct.h"
#include "kidbright32.h"
#include "mcp7940n.h"
#include "ports.h"
#include "kbnet_dl7612.h"
#include "esp_vfs.h"
#include "esp_vfs_dev.h"
#include "button12.h"
#include "sound.h"

// uncomment to enable qc test mode
//#define QC_TEST_MODE

// uncomment to enable log print
#define __LOG_PRINT__

#ifdef __LOG_PRINT__
static const char *TAG = "KBNET_DL7612";
// light weight logging
#define LOG(fmt, ...) log_print(fmt, __VA_ARGS__)
// log_print
void IRAM_ATTR log_print(const char *fmt, ...) {
	va_list ap;
	
	va_start(ap, fmt);
	printf("(%lld) %s: ", esp_timer_get_time() / 1000, TAG); // timestamp in milli-second
	vprintf(fmt, ap);
	printf("\n");
	va_end(ap);
}
#endif

extern BUTTON12 button12;
extern SOUND sound;

/*

### reboot
AT+NRB
```
REBOOTING
Booting...
DevName: DL7612
Version: DL7612R01A74
LoraMac: 1.0.2
Date:    2021-10-11
Comp:    Maxiiot Ltd.
OK
ChannelMask :255,0,0,0,0,0
```

### get module info
AT+INFO
```
MAXIIOT
DL7612
Revision:DL7612R01A74
Date:2021-10-11
OK
```

### get module address
AT+ADDR?
```
+ADDR:260b41c7
OK
```

### get module app key
AT+APPSKEY?
```
+APPSKEY:ef6ebe0953dff17aa7b89e64fb8a2add
OK
```

### get module network key
AT+NWKSKEY?
```
+NWKSKEY:b5a6e1b6c840146389c4abb4835cb5ba
OK
```

### get module ism band
AT+ISMBAND?
```
+ISMBAND:2
OK
```

### get module activate
AT+ACTIVATE?
```
+ACTIVATE:0
OK
```

### set ABP
AT+ADDR=260B41C7
AT+APPSKEY=EF6EBE0953DFF17AA7B89E64FB8A2ADD
AT+NWKSKEY=B5A6E1B6C840146389C4ABB4835CB5BA
AT+ISMBAND=2
AT+ACTIVATE=0
AT+SAVE

AT+NRB

AT+CHSET

AT+CGATT

### send text
AT+NCMGS=5,HELLO
```
+NCMGS:0
OK
+NSMI:0
+NSMI:0
```

### send hex
AT+NMGS=5,AA112233BB

### 2 decimal point double to int
double f = -20000000.0234;
printf("%f\n", f);

int x = (int)(f * 100);
printf("%d\n", x);
printf("0x%8.8x\n\n", x);

int y = 0x88ca6bfe;
double z = ((double)y) / 100;
printf("%f\n", z);

### mosqutto_sub
mosquitto_sub -v -h 127.0.0.1 -p 11883 -t '#'
*/

#define DL7612_UART_NUM UART_NUM_1
#define DL7612_UART_BAUDRATE 115200
#define DL7612_TX_BUF_SIZE 256
#define DL7612_RX_BUF_SIZE 256

extern MCP7940N mcp7940n;
extern PORTS ports;

const char *TX_POWER_DBM[] = {
	"20 dBm",
	"14 dBm",
	"11 dBm",
	"8 dBm",
	"5 dBm",
	"2 dBm"
};

void uart_parser(KBNET_DL7612 *dl7612, char *line, char *buf) {
    char *ptr;
    int len, i;

    strncat(line, buf, (2 * MAX_AT_CHAR_PER_LINE) - 1);
    len = strlen(line);
    ptr = &line[0];
    for (i = 0; i < len; i++) {
        if (line[i] == '\r') {
            line[i] = '\0';            
        }
        else
        if (line[i] == '\n') {
            line[i] = '\0';

            // line found
			strncpy(dl7612->at_lines[dl7612->at_line_tail_index].line, ptr, MAX_AT_CHAR_PER_LINE - 1);

			#ifdef __LOG_PRINT__
				LOG("rx: %s", ptr);
				//LOG("dl7612->at_line_tail_index: %d", dl7612->at_line_tail_index);
				//ESP_LOG_BUFFER_HEXDUMP(TAG, line, strlen(line), ESP_LOG_INFO);
			#endif

			// increment at tail line array index
			dl7612->at_line_tail_index++;
			if (dl7612->at_line_tail_index >= MAX_AT_LINE) {
				dl7612->at_line_tail_index = 0;
			}

			// update ptr pointer
            ptr = &line[i + 1];
        }
    }

    if (ptr != &line[len]) {
        //printf("has some chars left (%s)\n", ptr);
        strncpy(line, ptr, (2 * MAX_AT_CHAR_PER_LINE) - 1);
    }
	else {
		// init line string
		line[0] = '\0';
	}
}

void vUartSelectTask(void *pvParameters) {	
	KBNET_DL7612 *dl7612 = (KBNET_DL7612 *)pvParameters;
	char buf[MAX_AT_CHAR_PER_LINE], line[2 * MAX_AT_CHAR_PER_LINE];
	int len;

	// init line string
	line[0] = '\0';
    while (1) {
        len = uart_read_bytes(DL7612_UART_NUM, (uint8_t *)buf, MAX_AT_CHAR_PER_LINE - 1, 100 / portTICK_RATE_MS);
        if (len > 0) {
			// null terminated string
            buf[len] = 0;
			// apply uart parser
			uart_parser(dl7612, line, buf);			
        }
    }
    
    vTaskDelete(NULL);
}

void mac_to_str(char *str, uint8_t *mac) {
	int i;

	for (i = 0; i < 6; i++) {
		sprintf(&str[3 * i], "%2.2x:", mac[i]);
	}
	str[17] = '\x0';
}

void mac_to_str_without_colon(char *str, uint8_t *mac) {
	int i;

	for (i = 0; i < 6; i++) {
		sprintf(&str[2 * i], "%2.2x", mac[i]);
	}
	str[12] = '\x0';
}

void mac_to_dev_addr_str(char *str, uint8_t *mac) {
	int i;

	for (i = 2; i < 6; i++) {
		sprintf(&str[2 * (i - 2)], "%2.2x", mac[i]);
	}
	str[8] = '\x0';
}

bool ch_to_byte(char ch, uint8_t *byte) {
	if ((ch >= '0') && (ch <= '9')) {
		*byte = ch - 0x30;
		return true;
	}
	else
	if ((ch >= 'A') && (ch <= 'F')) {
		*byte = ch - ((uint8_t)('A')) + 0x0a;
		return true;
	}
	else
	if ((ch >= 'a') && (ch <= 'f')) {
		*byte = ch - ((uint8_t)('a')) + 0x0a;
		return true;
	}

	return false;
}

bool mac_from_str(uint8_t *mac, char *str) {
	int i, indx;
	uint8_t nh, nl;

	if (strlen(str) != 12) {
		return false;
	}

	indx = 0;
	for (i = 0; i < 6; i++) {
		if (ch_to_byte(str[indx], &nh) && ch_to_byte(str[indx + 1], &nl)) {
			mac[i] = (nh << 4) | (nl);
			indx += 2;
		}
		else {
			return false;
		}
	}
	
	return true;
}

void remove_zero_leading(char *str) {
	char temp_str[64], *pchar;

	strcpy(temp_str, str);
	pchar = &temp_str[0];	
	while (*pchar != '\0') {
		if (*pchar != '0') {
			break;
		}
		else {
			pchar++;
		}		
	}

	strcpy(str, pchar);
}

uint8_t crc8(uint8_t crc, uint8_t size, uint8_t * dat) {
	// https://crccalc.com
	const uint8_t crc_tab[] = {
		0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 
		0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d, 
		0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 
		0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d, 
		0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 
		0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 
		0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 
		0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd, 
		0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 
		0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 
		0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 
		0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a, 
		0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 
		0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 
		0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 
		0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a, 
		0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 
		0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4, 
		0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 
		0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4, 
		0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 
		0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 
		0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 
		0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34, 
		0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 
		0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63, 
		0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 
		0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13, 
		0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 
		0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83, 
		0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 
		0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3
	};
 
	while (size--) {
		crc = crc ^ *dat++; 
		crc = crc_tab[crc & 0xff];
	}

	return(crc);
}

void memcpy_int(uint8_t *dst, int src) {
	dst[0] = src >> 24;
	dst[1] = src >> 16;
	dst[2] = src >> 8;
	dst[3] = src & 0xff;
}

KBNET_DL7612::KBNET_DL7612(char *appskey, char *nwkskey, int _tx_power_index) {
	// init qc test switch enabled flag
	qc_test_sw_enabled = false;
	// store abp keys
	strncpy(APPSKEY, appskey, MAX_ABP_KEY_CHAR - 1);
	strncpy(NWKSKEY, nwkskey, MAX_ABP_KEY_CHAR - 1);
	// store tx power index
	tx_power_index = _tx_power_index;
}

void KBNET_DL7612::init(void) {	
	gpio_config_t io_conf;
	int i;
	char chars[2], str[32];
#ifdef QC_TEST_MODE
	uint8_t mac[6];
#endif

	led_set_level(LED_OFF);

	// get mac address
	esp_read_mac(mac_address.wifi_sta, ESP_MAC_WIFI_STA);
	esp_read_mac(mac_address.wifi_softap, ESP_MAC_WIFI_SOFTAP);
	esp_read_mac(mac_address.bluetooth, ESP_MAC_BT);
	esp_read_mac(mac_address.ethernet, ESP_MAC_ETH);

#ifdef __LOG_PRINT__
	mac_to_str(str, mac_address.wifi_sta);
	LOG("wifi sta mac = %s", str);
	mac_to_str(str, mac_address.wifi_softap);
	LOG("wifi softap mac = %s", str);
	mac_to_str(str, mac_address.bluetooth);
	LOG("bluetooth mac = %s", str);
	mac_to_str(str, mac_address.ethernet);
	LOG("ethernet mac = %s", str);
	mac_to_dev_addr_str(str, mac_address.wifi_sta);
	LOG("device address = %s", str);
#endif

#ifdef QC_TEST_MODE
#ifdef __LOG_PRINT__
	LOG("%s", "*** QC Test Mode");
#endif
	// fixed mac address
	//if (mac_from_str(mac, "64B70840DC60")) {
	if (mac_from_str(mac, (char *)"111111111111")) {
		mac_to_str(str, mac);
		#ifdef __LOG_PRINT__
			LOG("*** force setting mac address to %s", str);
		#endif
		// update wifi_sta mac address
		memcpy(mac_address.wifi_sta, mac, 6);
	}
#endif

	// init at command configs
	for (i = 0; i < MAX_CONFIG_LINE; i++) {
		configs[i].at_command[0] = '\0';
		configs[i].value[0] = '\0';
	}

	// device address config
	mac_to_dev_addr_str(str, mac_address.wifi_sta);
	strncpy(configs[0].at_command, "AT+ADDR", MAX_AT_CHAR_PER_LINE - 1);
	strncpy(configs[0].value, str, MAX_AT_CHAR_PER_LINE - 1);

	// abp application key config
	strncpy(configs[1].at_command, "AT+APPSKEY", MAX_AT_CHAR_PER_LINE - 1);
	strncpy(configs[1].value, APPSKEY, MAX_AT_CHAR_PER_LINE - 1);

	// abp network key config
	strncpy(configs[2].at_command, "AT+NWKSKEY", MAX_AT_CHAR_PER_LINE - 1);
	strncpy(configs[2].value, NWKSKEY, MAX_AT_CHAR_PER_LINE - 1);

	// ism band config
	strncpy(configs[3].at_command, "AT+ISMBAND", MAX_AT_CHAR_PER_LINE - 1);
	strncpy(configs[3].value, "2", MAX_AT_CHAR_PER_LINE - 1);

	// activation mode config (ABP)
	strncpy(configs[4].at_command, "AT+ACTIVATE", MAX_AT_CHAR_PER_LINE - 1);
	strncpy(configs[4].value, "0", MAX_AT_CHAR_PER_LINE - 1);

	// tx power config
	chars[0] = tx_power_index + 0x30;
	chars[1] = '\0';
	strncpy(configs[5].at_command, "AT+POWER", MAX_AT_CHAR_PER_LINE - 1);
	strncpy(configs[5].value, chars, MAX_AT_CHAR_PER_LINE - 1);

	// init at command line buffer
	for (i = 0; i < MAX_AT_LINE; i++) {
		at_lines[i].line[0] = '\0';
	}
	at_line_head_index = 0;
	at_line_tail_index = 0;
	rate_limit_tickcnt = DEFAULT_RATE_LIMIT_MS;
	current_rate_limit_tickcnt = 0;
	first_send_flag = true;	
	send_buffer[0] = '\0';
	state = s_detect;

	// get current tickcnt
	led_tickcnt = get_tickcnt();

	// uart init
	uart_config_t uart_config = {
	    .baud_rate = DL7612_UART_BAUDRATE,
	    .data_bits = UART_DATA_8_BITS,
	    .parity = UART_PARITY_DISABLE,
	    .stop_bits = UART_STOP_BITS_1,
	    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
	    .rx_flow_ctrl_thresh = 0,
	    .use_ref_tick = true
	};

	// uart config
	uart_param_config(DL7612_UART_NUM, &uart_config);
	// set uart pins
	uart_set_pin(DL7612_UART_NUM, GPIO_NUM_18, GPIO_NUM_19, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
	// install uart driver
	uart_driver_install(DL7612_UART_NUM, (DL7612_RX_BUF_SIZE * 2), (DL7612_TX_BUF_SIZE * 2), 0, NULL, 0);
	// create uart select task
	xTaskCreatePinnedToCore(vUartSelectTask, "Uart Select Task",  UART_STACK_SIZE_MIN, this, UART_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);
}

int KBNET_DL7612::prop_count(void) {
	// not supported
	return 0;
}

bool KBNET_DL7612::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool KBNET_DL7612::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool KBNET_DL7612::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool KBNET_DL7612::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool KBNET_DL7612::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET_DL7612::led_set_level(uint32_t lvl) {
	led_level = lvl;
	gpio_set_level(USBSW_GPIO, led_level);
}

void KBNET_DL7612::command(char *cmd) {
	char buf[MAX_AT_CHAR_PER_LINE];

	#ifdef __LOG_PRINT__
		LOG("tx: %s", cmd);
	#endif

	snprintf(buf, MAX_AT_CHAR_PER_LINE - 1, "%s\r\n", cmd);
	uart_write_bytes(DL7612_UART_NUM, buf, strlen(buf));	
}

at_line_begin_t KBNET_DL7612::at_line_check(bool match_all_flag, char *str, TickType_t *timeout_tickcnt, TickType_t timeout, char *rx_str) {
	at_line_begin_t ret;
	int str_len;
	
	// found new rx line ?
	if (at_line_head_index == at_line_tail_index) {
		if (is_tickcnt_elapsed(*timeout_tickcnt, timeout)) {
			#ifdef __LOG_PRINT__
				LOG("%s", "at command timeout!");
			#endif
			return alb_timeout;
		}
		else {
			return alb_wait;
		}		
	}

	// reload timeout tickcnt
	*timeout_tickcnt = get_tickcnt();
	// init return as waiting match
	ret = alb_wait;

	// return current at_lines as *rx_str
	strncpy(rx_str, at_lines[at_line_head_index].line, MAX_AT_CHAR_PER_LINE - 1);

	str_len = strlen(str);
	if (strlen(at_lines[at_line_head_index].line) >= str_len) {
		at_lines[at_line_head_index].line[str_len] = '\0';
		if (strcmp(at_lines[at_line_head_index].line, str) == 0) {
			if ((match_all_flag) && (strlen(at_lines[at_line_head_index].line) == str_len)) {				
				ret = alb_ok;
			}
			else {
				ret = alb_ok;
			}			
		}
	}

	// increment at head line array index
	at_line_head_index++;
	if (at_line_head_index >= MAX_AT_LINE) {
		at_line_head_index = 0;
	}

	return ret;
}

char *KBNET_DL7612::get_str_at_char(char *str, char ch) {
	int len, i;

	len = strlen(str);
	for (i = 0; i < len; i++) {
		if (str[i] == ch) {
			return &str[i + 1];
		}
	}

	return NULL;
}

void KBNET_DL7612::process(Driver *drv) {
	int len;
	at_line_begin_t ret;
	char *str, rx_str[MAX_AT_CHAR_PER_LINE], temp_str[64];;

	switch (state) {
		case s_detect:
			// turn off dl7612
			ports.output1_write(0);
			// get current tickcnt
			tickcnt = get_tickcnt();

			#ifdef QC_TEST_MODE
				// go to qc test state
				state = s_qc_test;				
			#else	
				// go to power on state
				state = s_power_on;
			#endif
			break;

		case s_qc_test:
			// qc test already enabled
			if (qc_test_sw_enabled) {
				// get current tickcnt
				tickcnt = get_tickcnt();
				// go to power on state
				state = s_power_on;
			}
			else
			// check sw1 held for 3 seconds to enable lora
			if (button12.is_sw1_pressed()) {
				if (is_tickcnt_elapsed(tickcnt, 3000)) {
					#ifdef __LOG_PRINT__
						LOG("%s", "*** key sequence found, qc mode starts");
					#endif

					// sound on
					sound.on(2093, (SOUND_DUTY_CYCLE_PERCENT_MAX * 10) / 100); // freq=2093, duty=10%
					// qc test is enabled by switch
					qc_test_sw_enabled = true;
					// get current tickcnt
					tickcnt = get_tickcnt();
					// go to power on state
					state = s_power_on;
				}
			}
			else {
				#ifdef __LOG_PRINT__
					LOG("%s", "*** no key sequence found, qc test mode stopped!");
				#endif
				// turn off lora led
				led_set_level(LED_OFF);
				// clear error flag
				error = false;
				// set initialized flag
				initialized = true;
				// disable lora
				state = s_idle;
			}		
			break;

		case s_power_on:
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				// sound off
				sound.off();

				// turn off dl7612
				ports.output1_write(1);
				// get current tickcnt
				tickcnt = get_tickcnt();
				// go to at command check state
				state = s_at_cmd_chk;
			}
			break;

		case s_at_cmd_chk:
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				#ifdef __LOG_PRINT__
					LOG("%s", "at command checking...");
				#endif
				command((char *)"AT");
				// get current tickcnt
				tickcnt = get_tickcnt();
				// go to init state
				state = s_init;
			}
			break;

		case s_init:
			ret = at_line_check(true, (char *)"OK", &tickcnt, 1000, rx_str); // match all
			if (ret == alb_ok) {
				#ifdef __LOG_PRINT__
					LOG("%s", "reboot module...");
				#endif

				// clear config changed flag
				config_changed_flag = false;
				// reboot command
				command((char *)"AT+NRB");
				// get current tickcnt
				tickcnt = get_tickcnt();
				// goto wait reboot
				state = s_reboot_wait;
			}
			else
			if (ret == alb_timeout) {
				state = s_error;
			}
			break;

		case s_reboot_wait:
			ret = at_line_check(false, (char *)"ChannelMask", &tickcnt, 1000, rx_str); // match begin
			if (ret == alb_ok) {						
				// init current config index to check
				curr_config_index = 0;				
				// goto config check
				state = s_config_chk;
				#ifdef __LOG_PRINT__
					LOG("%s", "lora module config checking...");
				#endif
			}
			else
			if (ret == alb_timeout) {
				state = s_error;
			}
			break;

		case s_config_chk:
			// // check end config
			if (configs[curr_config_index].at_command[0] == '\0') {
				// if config changed
				if (config_changed_flag) {
					// save config
					#ifdef __LOG_PRINT__
						LOG("%s", "saving config...");
					#endif

					// config save command
					command((char *)"AT+SAVE");
					// get current tickcnt
					tickcnt = get_tickcnt();			
					// goto init and reboot module
					state = s_init;
				}
				else {					
					// get current tickcnt
					tickcnt = get_tickcnt();					
					// goto command delay
					state = s_cmd_delay;
				}
			}
			else {
				snprintf(current_chk_cmd, MAX_AT_CHAR_PER_LINE - 1, "%s?", configs[curr_config_index].at_command);

				// for AT+ADDR command, remove zero leading from expected reply value	
				strncpy(temp_str, configs[curr_config_index].value, sizeof(temp_str) - 1);
				if (strcmp(configs[curr_config_index].at_command ,"AT+ADDR") == 0) {
					remove_zero_leading(temp_str);
				}
				
				#ifdef __LOG_PRINT__
					LOG("checking with %s expecting reply %s", configs[curr_config_index].at_command, temp_str);
				#endif

				// init wait reply string
				snprintf(current_wait_reply, MAX_AT_CHAR_PER_LINE - 1, "%s", &current_chk_cmd[2]);
				len = strlen(current_wait_reply);
				current_wait_reply[len - 1] = '\0';
				// send command
				command(current_chk_cmd);

				// get current tickcnt
				tickcnt = get_tickcnt();
				// goto config wait
				state = s_config_wait;
			}
			break;

		case s_config_wait:
			ret = at_line_check(false, current_wait_reply, &tickcnt, 1000, rx_str); // match begin
			if (ret == alb_ok) {
				// check reply value
				str = get_str_at_char(rx_str, ':');
				if (str != NULL) {
					// for AT+ADDR command, remove zero leading from expected reply value	
					strcpy(temp_str, configs[curr_config_index].value);							
					if (strcmp(configs[curr_config_index].at_command ,"AT+ADDR") == 0) {
						remove_zero_leading(temp_str);
					}

					#ifdef __LOG_PRINT__
						LOG("compare current setting %s with %s", temp_str, str);
					#endif
					
					if (strcmp(temp_str, str) == 0) {
						// next config
						curr_config_index++;				
						// goto config check
						state = s_config_chk;
					}
					else {
						// config set
						snprintf(current_set_cmd, MAX_AT_CHAR_PER_LINE - 1, "%s=%s", configs[curr_config_index].at_command, configs[curr_config_index].value);						

						// get current tickcnt
						tickcnt = get_tickcnt();						
						// goto config delay set
						state = s_config_delay_set;
					}
				}
				else {
					state = s_error;
				}
			}
			else
			if (ret == alb_timeout) {
				state = s_error;
			}
			break;

		case s_config_delay_set:
			// delay config set waiting for module stable
			if (is_tickcnt_elapsed(tickcnt, 1000)) {
				// send command set
				command(current_set_cmd);
				// set config changed flag
				config_changed_flag = true;			

				// get current tickcnt
				tickcnt = get_tickcnt();
				// goto config delay set
				state = s_config_set;
			}
			break;

		case s_config_set:
			ret = at_line_check(true, (char *)"OK", &tickcnt, 1000, rx_str); // match all
			if (ret == alb_ok) {
				// goto config check
				state = s_config_chk;
			}
			else
			if (ret == alb_timeout) {
				state = s_error;
			}
			break;

		case s_cmd_delay:
			if (is_tickcnt_elapsed(tickcnt, 15000)) { // delay 15 sec.
				// clear error flag
				error = false;
				// set initialized flag
				initialized = true;
				// turn on lora led
				led_set_level(LED_ON);
				// goto wait command
				state = s_cmd_wait;
			}				
			break;

		case s_cmd_wait:
			if (send_buffer[0] != '\0') {
				#ifdef __LOG_PRINT__
					LOG("send lora: %s", send_buffer);
				#endif

				// at command
				command(send_buffer);
				// clear send buffer
				send_buffer[0] = '\0';

				// get current tickcnt
				tickcnt = get_tickcnt();
				// go to wait command ok
				state = s_cmd_wait_ok;
			}
			break;

		case s_cmd_wait_ok:
			ret = at_line_check(true, (char *)"OK", &tickcnt, 1000, rx_str); // match all
			if (ret == alb_ok) {
				#ifdef __LOG_PRINT__
					LOG("%s", "send command => found OK");
				#endif

				// go back to wait next command
				state = s_cmd_wait;
			}
			else
			if (ret == alb_timeout) {
				state = s_error;
			}
			break;

		case s_error:
			#ifdef __LOG_PRINT__
				LOG("%s", "communication error, reset dl7612!");
			#endif

			// set error flag
			error = true;
			// clear initialized flag
			initialized = false;
			// get current tickcnt
			tickcnt = get_tickcnt();
			// goto wait and retry with detect state
			state = s_wait;
			break;

		case s_wait:
			// wait polling_ms timeout
			if (is_tickcnt_elapsed(tickcnt, 3000)) {
				state = s_detect;
			}
			break;

		case s_idle:
			break;
	}

	if (!((state == s_cmd_wait) || (state == s_cmd_wait_ok) || (state == s_qc_test) || (state == s_idle))) {
		if (is_tickcnt_elapsed(led_tickcnt, 500)) {
			// get current tickcnt
			led_tickcnt = get_tickcnt();
			// toggle lora led
			led_set_level(!led_level);
		}
	}
}

bool KBNET_DL7612::send_01(double temperature, double humidity, double wind_speed, double wind_direction, double rain_volume) {
	char temp_str[32];
	char buf[MAX_AT_CHAR_PER_LINE];
	int day, month, year, hour, minute, second;	
	struct tm timeinfo;	
	time_t ts;
	int tp, hm, ws, wd, rv;
	uint8_t dat[64], crc;

	#ifdef QC_TEST_MODE
		if (state == s_idle) {
			return true;
		}	
	#endif

	// check rate limit
	if (first_send_flag || is_tickcnt_elapsed(current_rate_limit_tickcnt, rate_limit_tickcnt)) { // check rate limit
		first_send_flag = false;
		// update rate limit tickcnt
		current_rate_limit_tickcnt = get_tickcnt();

		// get date/time
		strncpy(temp_str, mcp7940n.get_date(), sizeof(temp_str) - 1); // "05/01/2023"
		temp_str[2] = '\0';
		temp_str[5] = '\0';
		temp_str[10] = '\0';
		day = atoi(&temp_str[0]);
		month = atoi(&temp_str[3]);
		year = atoi(&temp_str[6]);
		strncpy(temp_str, mcp7940n.get_time_with_second(), sizeof(temp_str) - 1); // "14:11:50"
		temp_str[2] = '\0';
		temp_str[5] = '\0';
		temp_str[8] = '\0';
		hour = atoi(&temp_str[0]);
		minute = atoi(&temp_str[3]);
		second = atoi(&temp_str[6]);
		// convert to timestamp
		memset(&timeinfo, 0, sizeof(struct tm));
		timeinfo.tm_mday = day;
		timeinfo.tm_mon = month - 1;
        timeinfo.tm_year = year - 1900;
        timeinfo.tm_hour = hour;
        timeinfo.tm_min = minute;
        timeinfo.tm_sec = second;
        // mktime will also set tm_wday
        ts = mktime(&timeinfo);

		// sensor value
		tp = (int)(temperature * 100);
		hm = (int)(humidity * 100);
		ws = (int)(wind_speed * 100);
		wd = (int)(wind_direction * 100);
		rv = (int)(rain_volume * 100);

		// format - 01<mac_2><temperature><humidity><wind_speed><wind_direction><rain_volume><crc8>
		snprintf(buf, MAX_AT_CHAR_PER_LINE - 1, "01%2.2x%2.2x%8.8x%8.8x%8.8x%8.8x%8.8x", mac_address.wifi_sta[0], mac_address.wifi_sta[1], tp, hm, ws, wd, rv);
		// calc crc8
		dat[0] = 0x01;
		memcpy(&dat[1], &mac_address.wifi_sta[0], 2);		
		memcpy_int(&dat[3], tp);
		memcpy_int(&dat[7], hm);
		memcpy_int(&dat[11], ws);
		memcpy_int(&dat[15], wd);
		memcpy_int(&dat[19], rv);				
		crc = 0x00;
		snprintf(buf, MAX_AT_CHAR_PER_LINE - 1, "%s%2.2x", buf, crc8(crc, strlen(buf) / 2, dat));

		// init at send command
		snprintf(send_buffer, MAX_AT_CHAR_PER_LINE - 1, "AT+NMGS=%d,%s", strlen(buf) / 2, buf);

		return true;
	}

	#ifdef __LOG_PRINT__
		LOG("%s", "send rate limit reached!");
	#endif

	return false;	
}

bool KBNET_DL7612::send_02(uint32_t flags, double temperature, double humidity, double wind_speed, double wind_direction, double rain_volume, double light, double pm2_5, double pm10) {
	char temp_str[32];
	char buf[MAX_AT_CHAR_PER_LINE];
	int day, month, year, hour, minute, second;	
	struct tm timeinfo;	
	time_t ts;
	int tp, hm, ws, wd, rv;
	uint8_t dat[64], crc;

	#ifdef QC_TEST_MODE
		if (state == s_idle) {
			return true;
		}	
	#endif

	// check rate limit
	if (first_send_flag || is_tickcnt_elapsed(current_rate_limit_tickcnt, rate_limit_tickcnt)) { // check rate limit
		first_send_flag = false;
		// update rate limit tickcnt
		current_rate_limit_tickcnt = get_tickcnt();

		// get date/time
		strncpy(temp_str, mcp7940n.get_date(), sizeof(temp_str) - 1); // "05/01/2023"
		temp_str[2] = '\0';
		temp_str[5] = '\0';
		temp_str[10] = '\0';
		day = atoi(&temp_str[0]);
		month = atoi(&temp_str[3]);
		year = atoi(&temp_str[6]);
		strncpy(temp_str, mcp7940n.get_time_with_second(), sizeof(temp_str) - 1); // "14:11:50"
		temp_str[2] = '\0';
		temp_str[5] = '\0';
		temp_str[8] = '\0';
		hour = atoi(&temp_str[0]);
		minute = atoi(&temp_str[3]);
		second = atoi(&temp_str[6]);
		// convert to timestamp
		memset(&timeinfo, 0, sizeof(struct tm));
		timeinfo.tm_mday = day;
		timeinfo.tm_mon = month - 1;
        timeinfo.tm_year = year - 1900;
        timeinfo.tm_hour = hour;
        timeinfo.tm_min = minute;
        timeinfo.tm_sec = second;
        // mktime will also set tm_wday
        ts = mktime(&timeinfo);

		// sensor value
		tp = (int)(temperature * 100);
		hm = (int)(humidity * 100);
		ws = (int)(wind_speed * 100);
		wd = (int)(wind_direction * 100);
		rv = (int)(rain_volume * 100);

		// format - 01<mac_2><temperature><humidity><wind_speed><wind_direction><rain_volume><crc8>
		snprintf(buf, MAX_AT_CHAR_PER_LINE - 1, "01%2.2x%2.2x%8.8x%8.8x%8.8x%8.8x%8.8x", mac_address.wifi_sta[0], mac_address.wifi_sta[1], tp, hm, ws, wd, rv);
		// calc crc8
		dat[0] = 0x01;
		memcpy(&dat[1], &mac_address.wifi_sta[0], 2);		
		memcpy_int(&dat[3], tp);
		memcpy_int(&dat[7], hm);
		memcpy_int(&dat[11], ws);
		memcpy_int(&dat[15], wd);
		memcpy_int(&dat[19], rv);				
		crc = 0x00;
		snprintf(buf, MAX_AT_CHAR_PER_LINE - 1, "%s%2.2x", buf, crc8(crc, strlen(buf) / 2, dat));

		// init at send command
		snprintf(send_buffer, MAX_AT_CHAR_PER_LINE - 1, "AT+NMGS=%d,%s", strlen(buf) / 2, buf);

		return true;
	}

	#ifdef __LOG_PRINT__
		LOG("%s", "send rate limit reached!");
	#endif

	return false;	
}
