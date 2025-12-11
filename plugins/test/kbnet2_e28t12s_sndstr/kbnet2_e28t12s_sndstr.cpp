#include <string.h>
#include <math.h>
#include <sys/fcntl.h>
#include <sys/errno.h>
#include <sys/unistd.h>
#include <sys/select.h>
#include <ctype.h>
#include <time.h>
#include "esp_system.h"
#include "driver/uart.h"
#include "soc/uart_struct.h"
#include "kidbright32.h"
#include "mcp7940n.h"
#include "kbnet2_e28t12s_sndstr.h"
#include "esp_vfs.h"
#include "esp_vfs_dev.h"

extern MCP7940N mcp7940n;

#define __DEBUG__
//#undef __DEBUG__

#define E28_LED_GPIO			GPIO_NUM_25
#define E28_M0_M1_GPIO			GPIO_NUM_0	// M1:M0 => 00: transmission, 11: configuration
#define E28_AUX_GPIO			GPIO_NUM_32

#define E28_PWR_GPIO			GPIO_NUM_26
#define E28_UART_TXD_GPIO		GPIO_NUM_18
#define E28_UART_RXD_GPIO		GPIO_NUM_19
#define E28_UART_NUM			UART_NUM_1
#define E28_UART_BAUDRATE		9600
#define E28_TX_BUF_SIZE			256
#define E28_RX_BUF_SIZE			256

#define E28_POWER_DEFAULT		12
// channel frequency = 2400 + (CHAN * 1MHz)
#define E28_FREQ_START			77	// 2477 MHz
#define E28_FREQ_STOP			96	// 2496 MHz
#define E28_FREQ_DEFAULT		82	// 2482 MHz

const char *E28_SPED_76[] = {
	"8N1",
	"8O1",
	"8E1",
	"8N1"
};

const char *E28_SPED_543[] = {
	"1200",
	"4800",
	"9600",
	"19200",
	"57600",
	"115200",
	"460800",
	"921600"
};

const char *E28_SPED_210[] = {
	"continuous transmission",
	"1k",
	"5k",
	"10k",
	"50k",
	"100k",
	"1M(FLRC)",
	"2M(FSK)"
};

const int E28_2G4T27SX_OPTION_10[] = {
	27,
	23,
	20,
	17
};

const int E28_2G4T12S_OPTION_10[] = {
	12,
	10,
	7,
	4
};

#ifdef __DEBUG__
static const char *TAG = "KBNET2_E28T12S_SNDSTR";
// light weight logging
#define LOGI(fmt, ...) log_print(37, fmt, __VA_ARGS__)
#define LOGW(fmt, ...) log_print(33, fmt, __VA_ARGS__)
#define LOGE(fmt, ...) log_print(31, fmt, __VA_ARGS__)
// log_print
void IRAM_ATTR log_print(int color, const char *fmt, ...) {
	va_list ap;

	va_start(ap, fmt);
	printf("\033[1;%dm(%lld) %s: ", color, esp_timer_get_time() / 1000, TAG); // timestamp in milli-second
	vprintf(fmt, ap);
	printf("\033[0m\n");
	va_end(ap);
}
#endif

void log_hexdump(char log_type, uint8_t *buf, int len) {
	int i;

	i = 0;
	while (len > 0) {
		if ((i % 16) == 0) {
			if (i != 0) {
				printf("\n");
			}
			printf("%c (%lld) %s:", log_type, esp_timer_get_time() / 1000, TAG);			
		}
		printf(" %2.2x", buf[i]);

		if (((((i + 1) % 8) == 0) && (((i + 1) % 16) != 0)) && ((len - 1) > 0))  {
			printf(" -");
		}

		i++;
		len --;
	}
	printf("\n");
}

static void vE28UartSelectTask(void *pvParameters) {
	KBNET2_E28T12S_SNDSTR *dev = (KBNET2_E28T12S_SNDSTR *)pvParameters;
	uint8_t dat, buf[MAX_CHAR_PER_LINE];
	bool quit, rx_packet_found;
	int len;
	
	// flush uart
	uart_flush(E28_UART_NUM);
	
	while (1) {
		// skip uart read in operation state
		if (dev->state == KBNET2_E28T12S_SNDSTR::s_operation) {
			vTaskDelay(100 / portTICK_RATE_MS);
			continue;
		}

		len = 0;
		rx_packet_found = false;
		quit = false;
		while (!quit) {
			// read 1 byte
			if (uart_read_bytes(E28_UART_NUM, &dat, 1, 100 / portTICK_PERIOD_MS) == 1) {
				if (!dev->wait_reply_flag) {
					quit = true;
				}
				else {
					// check first reply byte match
					if ((len == 0) && (dev->wait_reply_byte != dat)) {
						#ifdef __DEBUG__
						LOGW("rx byte %2.2x not match wait_reply_byte!", dat);
						#endif
						quit = true;
					
					}
					else {
						buf[len] = dat;
						len++;
						// check packet overflow
						if (len < MAX_CHAR_PER_LINE) {
							switch (buf[0]) {
								case 0xc0:
								//case 0xc2:
									if (len == 6) {
										rx_packet_found = true;
										quit = true;
									}
									break;

								case 0xc3:
									if (len == 8) {
										rx_packet_found = true;
										quit = true;
									}
									break;
									
								default:
									// not supported rx packet, just flush buffer
									quit = true;
									break;
							}
						}
						else {
							// packet overflow
							quit = true;
						}
					}
				}
			}
			
			if (dev->state == KBNET2_E28T12S_SNDSTR::s_operation) {
				quit = true;
			}
		}
	
		if (rx_packet_found) {	
			log_hexdump('R', (uint8_t *)buf, len);

			// copy to frame index tail
			memcpy(dev->e28_frames[dev->e28_frame_index_tail].data, buf, len);
			// set data length
			dev->e28_frames[dev->e28_frame_index_tail].length = len;

			// increment frame index tail
			if (dev->e28_frame_index_tail < (MAX_E28_FRAME_NUM - 1)) {
				dev->e28_frame_index_tail++;
			}
			else {
				dev->e28_frame_index_tail = 0;
			}
		}	
	}
	
	vTaskDelete(NULL);
}

void e28_gpio_mode(e28_mode_t m) {
	// inverting mode pin via mosfet open drain
	if (m == m_configuration) {
		gpio_set_level(E28_M0_M1_GPIO, 0);
	}
	else
	if (m == m_transmission) {
		gpio_set_level(E28_M0_M1_GPIO, 1);
	}
}

static void e28_command(uint8_t *cmd, int len, bool log_hexdump_flag) {
	if (log_hexdump_flag) {
		log_hexdump('T', cmd, len);
	}
	uart_write_bytes(E28_UART_NUM, (char *)cmd, len);
}

static void mac_to_str(char *str, uint8_t *mac) {
	int i;

	for (i = 0; i < 6; i++) {
		sprintf(&str[3 * i], "%2.2x:", mac[i]);
	}
	str[17] = '\x0';
}

static void mac_to_str_without_colon(char *str, uint8_t *mac) {
	int i;

	for (i = 0; i < 6; i++) {
		sprintf(&str[2 * i], "%2.2x", mac[i]);
	}
	str[12] = '\x0';
}

static void mac_to_dev_addr_str(char *str, uint8_t *mac) {
	int i;

	for (i = 2; i < 6; i++) {
		sprintf(&str[2 * (i - 2)], "%2.2x", mac[i]);
	}
	str[8] = '\x0';
}

static void byte_to_str(uint8_t byte, char *str) {
	uint8_t val;
	
	val = ((byte >> 4) & 0x0f);
	if (val <= 9) {
		str[0] = 0x30 + val;
	}
	else {
		str[0] = 0x37 + val;
	}
	
	val = (byte & 0x0f);
	if (val <= 9) {
		str[1] = 0x30 + val;
	}
	else {
		str[1] = 0x37 + val;
	}
}

KBNET2_E28T12S_SNDSTR::KBNET2_E28T12S_SNDSTR(int tx_pwr, int rf_freq) {
	// validate store tx power index
	if ((tx_pwr == 4) || (tx_pwr == 7) || (tx_pwr == 10) || (tx_pwr == 12)) {
		tx_power = tx_pwr;
	}
	else {
		tx_power = E28_POWER_DEFAULT;
	}
	
	// validate and store rf frequency
	//if ((rf_freq >= E28_FREQ_START) && (rf_freq <= E28_FREQ_STOP)) {
		rf_frequency = rf_freq;
	//}
	//else {
	//	rf_frequency = E28_FREQ_DEFAULT;
	//}
}

void KBNET2_E28T12S_SNDSTR::init(void) {
	gpio_config_t io_conf;
	int i;
	char chars[2], str[32];
	
	// create send queue
    send_queue = xQueueCreate(4, sizeof(ascii_frame_t));

	// outputs init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT; // set as output mode
	io_conf.pin_bit_mask = (1ULL << E28_PWR_GPIO) | (1ULL << E28_M0_M1_GPIO) | (1ULL << E28_LED_GPIO); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode	
	// e28 power off
	gpio_set_level(E28_PWR_GPIO, 0);
	// set to configuration mode
	e28_gpio_mode(m_configuration);
	// lora led off
	led_set_level(LED_OFF);
	gpio_config(&io_conf);
	
	// inputs init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_INPUT; // set as input mode
	io_conf.pin_bit_mask = (1ULL << E28_AUX_GPIO); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	//io_conf.pull_up_en = GPIO_PULLUP_ENABLE; // enable pull-up mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
	gpio_config(&io_conf);
	
	// uart init
	uart_config_t uart_config = {
	    .baud_rate = E28_UART_BAUDRATE,
	    .data_bits = UART_DATA_8_BITS,
	    .parity = UART_PARITY_DISABLE,
	    .stop_bits = UART_STOP_BITS_1,
	    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
	    .rx_flow_ctrl_thresh = 0,
	    .use_ref_tick = true
	};

	// uart config
	uart_param_config(E28_UART_NUM, &uart_config);
	// set uart pins
	uart_set_pin(E28_UART_NUM, E28_UART_TXD_GPIO, E28_UART_RXD_GPIO, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
	// install uart driver
	uart_driver_install(E28_UART_NUM, (E28_RX_BUF_SIZE * 2), (E28_TX_BUF_SIZE * 2), 0, NULL, 0);
	// create uart select task
	xTaskCreatePinnedToCore(vE28UartSelectTask, "E28 Uart Select Task",  UART_STACK_SIZE_MIN, this, UART_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);

	// get mac address
	esp_read_mac(mac_address.wifi_sta, ESP_MAC_WIFI_STA);
	esp_read_mac(mac_address.wifi_softap, ESP_MAC_WIFI_SOFTAP);
	esp_read_mac(mac_address.bluetooth, ESP_MAC_BT);
	esp_read_mac(mac_address.ethernet, ESP_MAC_ETH);

#ifdef __DEBUG__
	mac_to_str(str, mac_address.wifi_sta);
	LOGI("wifi sta mac = %s", str);
	mac_to_str(str, mac_address.wifi_softap);
	LOGI("wifi softap mac = %s", str);
	mac_to_str(str, mac_address.bluetooth);
	LOGI("bluetooth mac = %s", str);
	mac_to_str(str, mac_address.ethernet);
	LOGI("ethernet mac = %s", str);
	mac_to_dev_addr_str(str, mac_address.wifi_sta);
	LOGI("device address = %s", str);
#endif

	// clear e28 frames
	for (i = 0; i < MAX_E28_FRAME_NUM; i++) {
		memset(e28_frames[i].data, 0, sizeof(e28_frames[i].data));
		e28_frames[i].length = 0;
	}
	// clear reply frame
	memset(reply_frame.data, 0, sizeof(reply_frame.data));
	reply_frame.length = 0;
	
	// init frame item index
	e28_frame_index_head = 0;
	e28_frame_index_tail = 0;
	
	rate_limit_tickcnt = DEFAULT_RATE_LIMIT_MS;
	current_rate_limit_tickcnt = 0;
	first_send_flag = true;
	standby_flag = false;
	state = s_detect;

	// get current tickcnt
	led_tickcnt = get_tickcnt();	
}

int KBNET2_E28T12S_SNDSTR::prop_count(void) {
	// not supported
	return 0;
}

bool KBNET2_E28T12S_SNDSTR::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_SNDSTR::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_SNDSTR::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_SNDSTR::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_SNDSTR::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET2_E28T12S_SNDSTR::led_set_level(uint32_t lvl) {
	led_level = lvl;
	gpio_set_level(E28_LED_GPIO, led_level);
}

uint8_t crc8(uint8_t crc, uint8_t size, uint8_t *dat) {
	// CRC-8/SMBUS (https://crccalc.com)
	// google gemini = CRC-8/CCITT 
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

void KBNET2_E28T12S_SNDSTR::process(Driver *drv) {
	uint8_t buf[MAX_CHAR_PER_LINE], frame[MAX_CHAR_PER_LINE];
	char line_buf[MAX_CHAR_PER_LINE], str[32];
	char ch;
	ascii_frame_t ascii_frame;
	int i, pwr, len;

	switch (state) {
		case s_detect:
			// e28 power off
			gpio_set_level(E28_PWR_GPIO, 0);
			// get current tickcnt					
			tickcnt = get_tickcnt();
			// go to power on state
			state = s_power_on;
			break;
			
		case s_power_on:
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				// switch to configuration mode
				e28_gpio_mode(m_configuration);

				// clear wait reply flag
				wait_reply_flag = false;
				// wait no reply byte 
				wait_reply_byte = 0;
				// e28 power on
				gpio_set_level(E28_PWR_GPIO, 1);

				// get current tickcnt
				tickcnt = get_tickcnt();
				// set next state to reset
				next_state = s_reset;
				// go to wait aux state
				state = s_wait_aux;
			}
			break;

		case s_reset:
			if (is_tickcnt_elapsed(tickcnt, 500)) {
				#ifdef __DEBUG__
				LOGI("%s", "reset module");
				#endif

				// reset
				buf[0] = 0xc4;
				buf[1] = 0xc4;
				buf[2] = 0xc4;
				e28_command(buf, 3, true);

				// get current tickcnt
				tickcnt = get_tickcnt();
				// set next state to read version
				next_state = s_read_version;
				// go to wait aux state
				state = s_wait_aux;
			}
			break;

		case s_read_version:
			#ifdef __DEBUG__
			LOGI("%s", "read version");
			#endif
			
			// init frame item index
			e28_frame_index_head = 0;
			e28_frame_index_tail = 0;
			// set wait reply flag
			wait_reply_flag = true;
			
			// read version number
			buf[0] = 0xc3;
			buf[1] = 0xc3;
			buf[2] = 0xc3;
			e28_command(buf, 3, true);

			// get current tickcnt
			tickcnt = get_tickcnt();
			// set next state to read config
			next_state = s_read_config;
			// set wait reply byte
			wait_reply_byte = 0xc3;
			// go to wait uart reply state
			state = s_wait_uart_reply;
			break;

		case s_read_config:
			//ESP_LOGW(TAG, "================> %d", reply_frame.length);
			//ESP_LOG_BUFFER_HEXDUMP(TAG, reply_frame.data, reply_frame.length, ESP_LOG_WARN);
			#ifdef __DEBUG__
			LOGI("EBYTE E%2.2X v.%2.2X, %d dBm max", reply_frame.data[2], reply_frame.data[3], reply_frame.data[4]);
			#endif

			//T (1239) KBNET2_E28T12S_SNDSTR: c3 c3 c3
			//R (1352) KBNET2_E28T12S_SNDSTR: c3 00 47 13 0c 09 01 00
			//(1819) KBNET2_E28T12S_SNDSTR: EBYTE E47 v.13, 12 dBm max

			LOGI("%s", "read config");				
			// read config
			buf[0] = 0xc1;
			buf[1] = 0xc1;
			buf[2] = 0xc1;
			e28_command(buf, 3, true);

			// get current tickcnt
			tickcnt = get_tickcnt();
			// set next state to write config
			next_state = s_write_config;
			// set wait reply byte
			wait_reply_byte = 0xc0;
			// go to wait uart reply state
			state = s_wait_uart_reply;
			break;
			
		case s_write_config:
			//ESP_LOGW(TAG, "================> %d", reply_frame.length);
			//ESP_LOG_BUFFER_HEXDUMP(TAG, reply_frame.data, reply_frame.length, ESP_LOG_WARN);

			//T (1819) KBNET2_E28T12S_SNDSTR: c1 c1 c1
			//R (1931) KBNET2_E28T12S_SNDSTR: c0 00 00 13 58 04
			//(1979) KBNET2_E28T12S_SNDSTR: air datarate: 10k, channel: 88 (2488 MHz), trasmit power: 12 dBm
			
			pwr = E28_2G4T12S_OPTION_10[reply_frame.data[5] & 0x03];
			#ifdef __DEBUG__
			LOGI("air datarate: %s, channel: %d (%d MHz), tx power: %d dBm", E28_SPED_210[reply_frame.data[3] & 0x07], reply_frame.data[4], 2400 + reply_frame.data[4], pwr);
			#endif
			printf("air datarate: %s, channel: %d (%d MHz), tx power: %d dBm", E28_SPED_210[reply_frame.data[3] & 0x07], reply_frame.data[4], 2400 + reply_frame.data[4], pwr);
			
			// compare frequency and power
			if ((reply_frame.data[4] != rf_frequency) || (pwr != tx_power)) {
				#ifdef __DEBUG__
				LOGW("===============> %d %d, %d %d", rf_frequency, reply_frame.data[4], tx_power, pwr);
				#endif

				// write new config
				LOGI("%s", "write config");
				buf[0] = 0xc0;	// save the parameters when power-down
				buf[1] = 0x00;
				buf[2] = 0x00;
				buf[3] = 0x13;
				buf[4] = rf_frequency; // load 2-digit rf frequency
				if (tx_power == 10) {
					buf[5] = 0x05;
				}
				else
				if (tx_power == 7) {
					buf[5] = 0x06;
				}
				else
				if (tx_power == 4) {
					buf[5] = 0x07;
				}
				else {
					buf[5] = 0x04; // maximum tx power
				}
				// send command
				e28_command(buf, 6, true);

				// get current tickcnt
				tickcnt = get_tickcnt();
				// set next state to transmission mode
				next_state = s_transmission_mode;
				// set wait reply byte
				wait_reply_byte = 0xc0;
				// go to wait uart reply state
				state = s_wait_uart_reply;
			}
			else {				
				// go to transmission mode state			
				state = s_transmission_mode;
			}
			break;

		case s_transmission_mode:
			#ifdef __DEBUG__
			LOGI("%s", "switch to transmission mode");
			#endif

			// clear wait reply flag
			wait_reply_flag = false;
			// wait no reply byte 
			wait_reply_byte = 0;

			// switch to trasmission mode
			e28_gpio_mode(m_transmission);
			
			// device ready
			initialized = true;
			error = false;
			// go to operation state			
			state = s_operation;
			break;

		case s_operation:
			if (standby_flag) {
				// wait sleep tickcnt for flushing send_queue
				if (is_tickcnt_elapsed(sleep_tickcnt, 3000)) {
					// e28 power off
					gpio_set_level(E28_PWR_GPIO, 0);
					// go to standby state
					state = s_standby;
				}
			}
			else
			if (xQueueReceive(send_queue, &curr_ascii_frame, (100 / portTICK_PERIOD_MS))) {
				
				#ifdef __DEBUG__
				curr_ascii_frame.data[curr_ascii_frame.length] = '\0';
				LOGW("ASCII Frame: %s (%d)", curr_ascii_frame.data, curr_ascii_frame.length);
				#endif

				// e28 send frame
				e28_command(curr_ascii_frame.data, strlen((char *)curr_ascii_frame.data), false);
			}
			break;

		case s_wait_aux:	
			// wait aux go high
			if (gpio_get_level(E28_AUX_GPIO)) {
				// prepare tickcnt for next state
				tickcnt = get_tickcnt();
				// go to next state
				state = next_state;
			}
			// check timeout
			else {
				if (is_tickcnt_elapsed(tickcnt, 3000)) {
					// reset failed aux does not go high
					#ifdef __DEBUG__
					LOGE("%s", "aux does not go high time out!");
					#endif
					// go to error state
					state = s_error;
				}
			}
			break;

		case s_wait_uart_reply:
			if (e28_frame_index_head != e28_frame_index_tail) {
				// copy e28 reply frame
				memcpy(&reply_frame, &e28_frames[e28_frame_index_head], sizeof(e28_frame_t));
				// increment frame index head
				if (e28_frame_index_head < (MAX_E28_FRAME_NUM - 1)) {
					e28_frame_index_head++;
				}
				else {
					e28_frame_index_head = 0;
				}

				// go to next state
				state = next_state;
			}
			else {
				if (is_tickcnt_elapsed(tickcnt, 3000)) {
					// reset failed aux does not go high
					#ifdef __DEBUG__
					LOGE("%s", "uart reply timeout!");
					#endif
					// go to error state
					state = s_error;
				}
			}
			break;

		case s_error:
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
			// delay 3000ms before retry detect
			if (is_tickcnt_elapsed(tickcnt, 3000)) {
				state = s_detect;
			}
			break;

		case s_idle:
			break;
			
		case s_standby:
			break;
	}
}

bool KBNET2_E28T12S_SNDSTR::send_01(char *msg) {
	ascii_frame_t ascii_frame;
	char *frame = (char *)ascii_frame.data;

	strcpy(frame, msg);

	// add to send queue
	ascii_frame.length = strlen(msg);
	if (xQueueSend(send_queue, &ascii_frame, (20 / portTICK_PERIOD_MS)) != pdPASS) {
		#ifdef __DEBUG__
		LOGW("%s", "send_queue full, message not sent");
		#endif
	}
	
	return true;
}

void KBNET2_E28T12S_SNDSTR::standby_enable(void) {
	// get tickcnt for sleep
	sleep_tickcnt = get_tickcnt();
	// set standby flag
	standby_flag = true;
}

bool KBNET2_E28T12S_SNDSTR::standby_ready(void) {
	// check if in standby state or not initialized or error
	return ((state == s_standby) || (initialized == false) || (error == true));
}
