#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "soc/uart_struct.h"
#include "kidbright32.h"
#include "ports.h"
#include "uartchk.h"

#define __DEBUG__

#define UARTCHK_BAUDRATE	115200
#define UARTCHK_TX_BUF_SIZE 256
#define UARTCHK_RX_BUF_SIZE 256

#ifdef __DEBUG__
#include "esp_log.h"
static const char *TAG = "UARTCHK";
#endif

void uart_parser(UARTCHK *uartchk, char *line, char *buf) {
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
			strncpy(uartchk->at_lines[uartchk->at_line_tail_index].line, ptr, MAX_AT_CHAR_PER_LINE - 1);

			#ifdef __DEBUG__
				ESP_LOGW(TAG, "rx(%d): %s", uartchk->rx_gpio, ptr);
				//ESP_LOGI(TAG, "uartchk->at_line_tail_index: %d", uartchk->at_line_tail_index);
				//ESP_LOG_BUFFER_HEXDUMP(TAG, line, strlen(line), ESP_LOG_INFO);
			#endif

			// increment at tail line array index
			uartchk->at_line_tail_index++;
			if (uartchk->at_line_tail_index >= MAX_AT_LINE) {
				uartchk->at_line_tail_index = 0;
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
	UARTCHK *uartchk = (UARTCHK *)pvParameters;
	char buf[MAX_AT_CHAR_PER_LINE], line[2 * MAX_AT_CHAR_PER_LINE];
	int len;

	// init line string
	line[0] = '\0';
    while (1) {
        len = uart_read_bytes(uartchk->uart_num, (uint8_t *)buf, MAX_AT_CHAR_PER_LINE - 1, 100 / portTICK_RATE_MS);
        if (len > 0) {
			// null terminated string
            buf[len] = 0;
			// apply uart parser
			uart_parser(uartchk, line, buf);			
        }
    }
    
    vTaskDelete(NULL);
}

UARTCHK::UARTCHK(uart_port_t _uart_num, int _tx_gpio, int _rx_gpio, gpio_num_t _pwr_en_gpio) {
	uart_num = _uart_num;
	tx_gpio = _tx_gpio;
	rx_gpio = _rx_gpio;
	pwr_en_gpio = _pwr_en_gpio;
}

void UARTCHK::init(void) {	
	gpio_config_t io_conf;

	// debug
#ifdef __DEBUG__	
	esp_log_level_set(TAG, ESP_LOG_VERBOSE);
#endif

	// power enable init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT; // set as output mode
	io_conf.pin_bit_mask = (1ULL << pwr_en_gpio); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
	gpio_set_level(pwr_en_gpio, 0); // enable high
	gpio_config(&io_conf);	
	
	// uart init
	uart_config_t uart_config = {
	    .baud_rate = UARTCHK_BAUDRATE,
	    .data_bits = UART_DATA_8_BITS,
	    .parity = UART_PARITY_DISABLE,
	    .stop_bits = UART_STOP_BITS_1,
	    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
	    .rx_flow_ctrl_thresh = 0,
	    .use_ref_tick = true
	};

	// uart config
	uart_param_config(uart_num, &uart_config);
	// set uart pins
	uart_set_pin(uart_num, tx_gpio, rx_gpio, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
	// install uart driver
	uart_driver_install(uart_num, (UARTCHK_RX_BUF_SIZE * 2), (UARTCHK_TX_BUF_SIZE * 2), 0, NULL, 0);	
	// create uart task
	xTaskCreatePinnedToCore(vUartSelectTask, "Uart Select Task",  UART_STACK_SIZE_MIN, this, UART_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);

	// init state
	state = s_detect;
	// get current tickcnt
	tickcnt = get_tickcnt();
}

int UARTCHK::prop_count(void) {
	// not supported
	return 0;
}

bool UARTCHK::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool UARTCHK::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool UARTCHK::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool UARTCHK::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool UARTCHK::prop_write(int index, char *value) {
	// not supported
	return false;
}

void UARTCHK::process(Driver *drv) {
	switch (state) {
		case s_detect:
			// clear initialized flag
			error = false;
			// set initialized flag
			initialized = true;

			// go to idle state
			state = s_idle;			
			break;

		case s_idle:
			break;
	}
}

at_line_begin_t UARTCHK::at_line_check(bool match_all_flag, char *str, TickType_t *timeout_tickcnt, TickType_t timeout, char *rx_str) {
	at_line_begin_t ret;
	int str_len;
	
	// found new rx line ?
	if (at_line_head_index == at_line_tail_index) {
		if (is_tickcnt_elapsed(*timeout_tickcnt, timeout)) {
#ifdef __DEBUG__
			ESP_LOGE(TAG, "%s", "timeout!");
#endif
			return alb_timeout;
		}
		else {
#ifdef __DEBUG__
//			ESP_LOGW(TAG, "%s", "waiting...");
#endif
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

#ifdef __DEBUG__
//		ESP_LOGW(TAG, "%s", "match.");chars
#endif

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

bool UARTCHK::check(void) {
	bool res = false;
	at_line_begin_t ret;
	char rx_str[MAX_AT_CHAR_PER_LINE];
	char cmd[MAX_AT_CHAR_PER_LINE];	
	char buf[MAX_AT_CHAR_PER_LINE];

	strcpy(cmd, "Loopback...");

	// turn on
#ifdef __DEBUG__
	ESP_LOGW(TAG, "pwr_en(%d): 1", pwr_en_gpio);
#endif
	gpio_set_level(pwr_en_gpio, 1); // enable high
	vTaskDelay(200 / portTICK_PERIOD_MS);

#ifdef __DEBUG__
	ESP_LOGW(TAG, "tx(%d): %s", tx_gpio, cmd);
#endif
	snprintf(buf, MAX_AT_CHAR_PER_LINE - 1, "%s\r\n", cmd);
	uart_write_bytes(uart_num, buf, strlen(buf));

	// get current tickcnt
	tickcnt = get_tickcnt();
	// match all
	while ((ret = at_line_check(true, cmd, &tickcnt, 1000, rx_str)) == alb_wait);
	// check result
	if (ret == alb_ok) {
		res = true;
	#ifdef __DEBUG__
		ESP_LOGW(TAG, "at_line_check = alb_ok");
	#endif
	}
	else
	if (ret == alb_timeout) {
	#ifdef __DEBUG__
		ESP_LOGW(TAG, "at_line_check = alb_timeout");
	#endif
	}

	vTaskDelay(200 / portTICK_PERIOD_MS);
	// turn off
#ifdef __DEBUG__
	ESP_LOGW(TAG, "pwr_en(%d): 0", pwr_en_gpio);
#endif	
	gpio_set_level(pwr_en_gpio, 0); // enable high

	return res;
}
