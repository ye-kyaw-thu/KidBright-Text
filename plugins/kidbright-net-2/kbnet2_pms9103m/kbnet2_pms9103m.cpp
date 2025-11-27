#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "kbnet2_pms9103m.h"
#include "driver/uart.h"
#include "soc/uart_struct.h"

#undef __DEBUG__
//#define __DEBUG__

#define KBNET2_PMS9103M_UART_NUM		UART_NUM_2
#define KBNET2_PMS9103M_UART_BAUDRATE	9600
#define KBNET2_PMS9103M_TX_BUF_SIZE		128
#define KBNET2_PMS9103M_RX_BUF_SIZE		128
#define KBNET2_PMS9103M_TXD_PIN			GPIO_NUM_27
#define KBNET2_PMS9103M_RXD_PIN			GPIO_NUM_33
#define KBNET2_PMS9103M_PWR_CTRL		GPIO_NUM_23

#define KBNET2_PMS9103M_STANDBY_FLAG	0x01

KBNET2_PMS9103M::KBNET2_PMS9103M(void) {	
	polling_ms = KBNET2_PMS9103M_POLLING_MS;
}

void KBNET2_PMS9103M::read(uint8_t *data) {
    if (data[0] == 0x42 && data[1] == 0x4d) {
        uint16_t frame_length = (data[2] << 8) | data[3];

        if (frame_length == 28) {
            // Calculate checksum (sum of bytes from 0 to 29)
            uint16_t checksum = 0;
            
            #ifdef __DEBUG__
            printf("rx: ");
            #endif
            for (int i = 0; i < 30; i++) {
				#ifdef __DEBUG__
				printf("%2.2x ", data[i]);
				#endif
                checksum += data[i];
            }
            #ifdef __DEBUG__
            // print checksum
            printf("%2.2x %2.2x\n", data[30], data[31]);
            #endif

            uint16_t received_checksum = (data[30] << 8) | data[31];
            if (checksum == received_checksum) {
                pm1_0 = (data[10] << 8) | data[11];
                pm2_5 = (data[12] << 8) | data[13];
                pm10  = (data[14] << 8) | data[15];
				
				#ifdef __DEBUG__
                printf("PM1.0: %d | PM2.5: %d | PM10: %d\n", pm1_0, pm2_5, pm10);
                #endif
            } else {
				#ifdef __DEBUG__
                printf("Checksum mismatch! Expected: 0x%04x, Got: 0x%04x\n", checksum, received_checksum);
                #endif
            }
        }
    }
}

void vKBNET2_PMS9103M_Task(void *pvParameters) {
	KBNET2_PMS9103M *pms9103 = (KBNET2_PMS9103M *)pvParameters;
	uint8_t buf[64];
	int len;	

	while (1) {
		// read 32 bytes (1.5 sec. timeout)
		if ((len = uart_read_bytes(KBNET2_PMS9103M_UART_NUM, (uint8_t *)buf, 32, (1500 / portTICK_RATE_MS))) == 32) {
			
			// clear error flag
			pms9103->error = false;
			// set initialized flag
			pms9103->initialized = true;
			
/*			#ifdef __DEBUG__
			printf("RX: ");
			for (int i = 0; i < len; i++) {
				if (i == 0) {
					printf("%2.2X", buf[i]);
				}
				else {
					printf(" %2.2X", buf[i]);
				}
			}
			printf("\n");
			#endif*/
			
			pms9103->read(&buf[0]);
		}
		else {
			// set error flag
			pms9103->error = true;
			// clear initialized flag
			pms9103->initialized = false;
		}
	}
}

void KBNET2_PMS9103M::init(void) {
	gpio_config_t io_conf;

	standby_flag = false;
	pm1_0 = 0;
	pm2_5 = 0;
	pm10 = 0;

	// outputs init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT; // set as output mode
	io_conf.pin_bit_mask = (1ULL << KBNET2_PMS9103M_PWR_CTRL); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
	gpio_set_level(KBNET2_PMS9103M_PWR_CTRL, 0); // active high
	gpio_config(&io_conf);

	// uart init
	uart_config_t uart_config = {
		.baud_rate = KBNET2_PMS9103M_UART_BAUDRATE,
		.data_bits = UART_DATA_8_BITS,
		.parity = UART_PARITY_DISABLE,
		.stop_bits = UART_STOP_BITS_1,
		.flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
		.rx_flow_ctrl_thresh = 0,
		.use_ref_tick = true
	};

	// uart config
	uart_param_config(KBNET2_PMS9103M_UART_NUM, &uart_config);
	// set uart pins
	uart_set_pin(KBNET2_PMS9103M_UART_NUM, KBNET2_PMS9103M_TXD_PIN, KBNET2_PMS9103M_RXD_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
	// inverse tx polarity (open-drain output)
	//uart_set_line_inverse(KBNET2_PMS9103M_UART_NUM, UART_INVERSE_TXD);
	// install uart driver
	uart_driver_install(KBNET2_PMS9103M_UART_NUM, (KBNET2_PMS9103M_RX_BUF_SIZE * 2), (KBNET2_PMS9103M_TX_BUF_SIZE * 2), 0, NULL, 0);
	
	// uart task
	xTaskCreatePinnedToCore(vKBNET2_PMS9103M_Task, "KBNET2 PMS9103M", UART_STACK_SIZE_MIN, this, UART_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);

	state = s_detect;
}

int KBNET2_PMS9103M::prop_count(void) {
	return 2;
}

bool KBNET2_PMS9103M::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "pm2.5");
		return true;
	}
	else if (index == 1) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "pm10");
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_PMS9103M::prop_unit(int index, char *unit) {
	if ((index == 0) || (index == 1)) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%sg/m%s", "\xc2\xb5", "\xc2\xb3");
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_PMS9103M::prop_attr(int index, char *attr) {
	if ((index == 0) || (index == 1)) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_PMS9103M::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%d", pm2_5);
		return true;
	}
	else if (index == 1) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%d", pm10);
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_PMS9103M::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET2_PMS9103M::process(Driver *drv) {
	switch (state) {
		case s_detect:
			#ifdef __DEBUG__
			printf("%s", "power off\n");
			#endif

			// set sensor power to off state
			gpio_set_level(KBNET2_PMS9103M_PWR_CTRL, 0); // active high
			// get current tickcnt
			tickcnt = get_tickcnt();
			// go to power on state
			state = s_power_on;
			break;

		case s_power_on:
			if (is_tickcnt_elapsed(tickcnt, 1000)) {
				#ifdef __DEBUG__
				printf("%s", "power on\n");
				#endif
				
				// flush uart rx buffer
				uart_flush(KBNET2_PMS9103M_UART_NUM);
				// set sensor power to on state
				gpio_set_level(KBNET2_PMS9103M_PWR_CTRL, 1); // active high
				// get current tickcnt
				tickcnt = get_tickcnt();
				// go to idle state
				state = s_idle;
			}
			break;

		case s_power_off:
			#ifdef __DEBUG__
			printf("%s", "power off\n");
			#endif

			// set sensor power to off state
			gpio_set_level(KBNET2_PMS9103M_PWR_CTRL, 0); // active high
			// go to idle state
			state = s_idle;
			break;

		case s_idle:
			if (standby_flag) {
				// set sensor power to off state
				gpio_set_level(KBNET2_PMS9103M_PWR_CTRL, 0); // active high
				// go to stanby state
				state = s_standby;
			}
			break;
			
		case s_standby:
			break;
	}
}

uint16_t KBNET2_PMS9103M::get_pm1_0(void) {
	return pm1_0;
}

uint16_t KBNET2_PMS9103M::get_pm2_5(void) {
	return pm2_5;
}

uint16_t KBNET2_PMS9103M::get_pm10(void) {
	return pm10;
}

void KBNET2_PMS9103M::power_off(void) {
	// go to power off state
	state = s_power_off;
}

void KBNET2_PMS9103M::standby_enable(void) {
	// set standby flag
	standby_flag = true;
}

bool KBNET2_PMS9103M::standby_ready(void) {
	// check if in standby state or not initialized or error
	return ((state == s_standby) || (initialized == false) || (error == true));
}
