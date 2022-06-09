#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "hpma115s0.h"
#include "driver/uart.h"
#include "soc/uart_struct.h"

#define HPMA115S0_UART_NUM UART_NUM_2
#define HPMA115S0_UART_BAUDRATE 9600
#define HPMA115S0_TX_BUF_SIZE 128
#define HPMA115S0_RX_BUF_SIZE 128

#define HPMA115S0_PWR_CTRL GPIO_NUM_23

#define HPMA115S0_ACK 0xa5
#define HPMA115S0_NACK 0x96

const uint8_t hpma115s0_read[] = {0x68, 0x01, 0x04, 0x93};	      // Read Particle Measuring Results
const uint8_t hpma115s0_stop[] = {0x68, 0x01, 0x02, 0x95};	      // Stop Particle Measurement
const uint8_t hpma115s0_start[] = {0x68, 0x01, 0x01, 0x96};	      // Start Particle Measurement
const uint8_t hpma115s0_autosend_stop[] = {0x68, 0x01, 0x20, 0x77};   // Stop Auto Send
const uint8_t hpma115s0_autosend_enable[] = {0x68, 0x01, 0x40, 0x57}; // Enable Auto Send (32-byte frame sending from hpma115s0 every 1 second)

#define __DEBUG__
//#undef __DEBUG__

#ifdef __DEBUG__
#include "esp_log.h"
static const char *TAG = "hpma115s0";
#endif

HPMA115S0::HPMA115S0(int tx_io, int rx_io)
{
	tx_pin = tx_io;
	rx_pin = rx_io;
	polling_ms = HPMA115S0_POLLING_MS;
}

void HPMA115S0::init(void)
{
	gpio_config_t io_conf;

#ifdef __DEBUG__
	esp_log_level_set(TAG, ESP_LOG_VERBOSE);
#endif

	pm2_5 = 0;
	pm10 = 0;

	error_count = 0;
	error_clear_count = 0;

	// outputs init
	io_conf.intr_type = GPIO_INTR_DISABLE;		     // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT;		     // set as output mode
	io_conf.pin_bit_mask = (1ULL << HPMA115S0_PWR_CTRL); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE;	     // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE;	     // disable pull-up mode
	gpio_set_level(HPMA115S0_PWR_CTRL, 1);		     // active low
	gpio_config(&io_conf);

	// uart init
	uart_config_t uart_config = {
	    .baud_rate = HPMA115S0_UART_BAUDRATE,
	    .data_bits = UART_DATA_8_BITS,
	    .parity = UART_PARITY_DISABLE,
	    .stop_bits = UART_STOP_BITS_1,
	    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
	    .rx_flow_ctrl_thresh = 0,
	    .use_ref_tick = true};

	// uart config
	uart_param_config(HPMA115S0_UART_NUM, &uart_config);
	// set uart pins
	uart_set_pin(HPMA115S0_UART_NUM, tx_pin, rx_pin, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
	// inverse tx polarity (open-drain output)
	uart_set_line_inverse(HPMA115S0_UART_NUM, UART_INVERSE_TXD);
	// install uart driver
	uart_driver_install(HPMA115S0_UART_NUM, (HPMA115S0_RX_BUF_SIZE * 2), (HPMA115S0_TX_BUF_SIZE * 2), 0, NULL, 0);

	state = s_detect;
}

int HPMA115S0::prop_count(void)
{
	return 2;
}

bool HPMA115S0::prop_name(int index, char *name)
{
	if (index == 0)
	{
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "pm2.5");
		return true;
	}
	else if (index == 1)
	{
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "pm10");
		return true;
	}

	// not supported
	return false;
}

bool HPMA115S0::prop_unit(int index, char *unit)
{
	if ((index == 0) || (index == 1))
	{
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%sg/m%s", "\xc2\xb5", "\xc2\xb3");
		return true;
	}

	// not supported
	return false;
}

bool HPMA115S0::prop_attr(int index, char *attr)
{
	if ((index == 0) || (index == 1))
	{
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool HPMA115S0::prop_read(int index, char *value)
{
	if (index == 0)
	{
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%d", pm2_5);
		return true;
	}
	else if (index == 1)
	{
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%d", pm10);
		return true;
	}

	// not supported
	return false;
}

bool HPMA115S0::prop_write(int index, char *value)
{
	// not supported
	return false;
}

bool HPMA115S0::command(const uint8_t *cmd)
{
	uint8_t buf[2];
	bool ret = false;

#ifdef __DEBUG__
	ESP_LOGI(TAG, "TX: %2.2X %2.2X %2.2X %2.2X", cmd[0], cmd[1], cmd[2], cmd[3]);
#endif

	uart_write_bytes(HPMA115S0_UART_NUM, (const char *)cmd, 4);
	if ((uart_read_bytes(HPMA115S0_UART_NUM, (uint8_t *)buf, 2, (100 / portTICK_RATE_MS))) == 2)
	{

#ifdef __DEBUG__
		ESP_LOGI(TAG, "RX: %2.2X - %2.2X", buf[0], buf[1]);
#endif

		if ((buf[0] == HPMA115S0_ACK) && (buf[1] == HPMA115S0_ACK))
		{
			ret = true;
		}
	}
	else
	{

#ifdef __DEBUG__
		ESP_LOGI(TAG, "RX: %s", "timeout!");
#endif
	}

	// flush uart rx buffer
	uart_flush(HPMA115S0_UART_NUM);
	return ret;
}

bool HPMA115S0::read(int *pm2_5_val, int *pm10_val)
{
	const uint8_t *cmd = hpma115s0_read;
	uint8_t buf[32], *ptr;
	int len, i, chksum;
	char str[64], temp_str[16];

#ifdef __DEBUG__
	ESP_LOGI(TAG, "TX: %2.2X %2.2X %2.2X %2.2X", cmd[0], cmd[1], cmd[2], cmd[3]);
#endif

	// flush uart rx buffer
	uart_flush(HPMA115S0_UART_NUM);

	uart_write_bytes(HPMA115S0_UART_NUM, (const char *)cmd, 4);
	if ((len = uart_read_bytes(HPMA115S0_UART_NUM, (uint8_t *)buf, 16, (100 / portTICK_RATE_MS))) >= 8)
	{

		strcpy(str, "RX: ");
		for (i = 0; i < len; i++)
		{
			if (i == 0)
			{
				snprintf(temp_str, sizeof(temp_str) - 1, "%2.2X", buf[i]);
			}
			else
			{
				snprintf(temp_str, sizeof(temp_str) - 1, " - %2.2X", buf[i]);
			}
			strcat(str, temp_str);
		}

#ifdef __DEBUG__
		ESP_LOGI(TAG, "%s", str);
#endif

		if (((len == 10) && (buf[2] == 0x40) && (buf[3] == 0x05) && (buf[4] == 0x04)) || ((len == 8) && (buf[0] == 0x40) && (buf[1] == 0x05) && (buf[2] == 0x04)))
		{
			if (len == 10)
			{
				ptr = &buf[2];
			}
			else
			{
				ptr = &buf[0];
			}

			// calc checksum
			chksum = (65536 - (ptr[0] + ptr[1] + ptr[2] + ptr[3] + ptr[4] + ptr[5] + ptr[6])) % 256;
			if (chksum == ((int)ptr[7]))
			{
				*pm2_5_val = (ptr[3] * 256) + ptr[4];
				*pm10_val = (ptr[5] * 256) + ptr[6];
				return true;
			}
		}
	}

	return false;
}

void HPMA115S0::process(Driver *drv)
{
	switch (state)
	{
	case s_detect:

#ifdef __DEBUG__
		ESP_LOGI(TAG, "%s", "power off");
#endif

		// set sensor power to off state
		gpio_set_level(HPMA115S0_PWR_CTRL, 1); // active low
		// get current tickcnt
		tickcnt = get_tickcnt();
		state = s_power_on;
		break;

	case s_power_on:
		if (is_tickcnt_elapsed(tickcnt, 1000))
		{

#ifdef __DEBUG__
			ESP_LOGI(TAG, "%s", "power on");
#endif

			// set sensor power to on state
			gpio_set_level(HPMA115S0_PWR_CTRL, 0); // active low
			// reset retry count
			retry_count = 0;
			// get current tickcnt
			tickcnt = get_tickcnt();
			state = s_autosend_stop;
		}
		break;

	case s_autosend_stop:
		if (is_tickcnt_elapsed(tickcnt, 500))
		{
			if (command(hpma115s0_autosend_stop))
			{
				// clear error flag
				error = false;
				// error clear count
				error_clear_count++;
				// get current tickcnt
				tickcnt = get_tickcnt();
				state = s_cmd_stop;
			}
			else
			{
				if (retry_count < 10)
				{
#ifdef __DEBUG__
					ESP_LOGI(TAG, "%s", "retry sending autosend stop command...");
#endif

					// get current tickcnt
					tickcnt = get_tickcnt();
					retry_count++;
				}
				else
				{
					state = s_error;
				}
			}
		}
		break;

	case s_cmd_stop:
		if (is_tickcnt_elapsed(tickcnt, 100))
		{
			if (command(hpma115s0_stop))
			{
				// get current tickcnt
				tickcnt = get_tickcnt();
				state = s_cmd_start;
			}
			else
			{
				state = s_error;
			}
		}
		break;

	case s_cmd_start:
		if (is_tickcnt_elapsed(tickcnt, 100))
		{
			if (command(hpma115s0_start))
			{
				// get current tickcnt
				tickcnt = get_tickcnt();
				state = s_cmd_read;
			}
			else
			{
				state = s_error;
			}
		}
		break;

	case s_cmd_read:
		if (is_tickcnt_elapsed(tickcnt, polling_ms))
		{
			if (read(&pm2_5, &pm10))
			{

#ifdef __DEBUG__
				ESP_LOGI(TAG, "pm2.5 = %d, pm10 = %d", pm2_5, pm10);
#endif

				// read once
				initialized = true;
				// get current tickcnt
				tickcnt = get_tickcnt();
			}
			else
			{

#ifdef __DEBUG__
				ESP_LOGI(TAG, "%s", "sensor error!");
#endif

				state = s_error;
			}
		}
		break;

	case s_error:
		if (!error)
		{
			// error count
			error_count++;
		}
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
		if (is_tickcnt_elapsed(tickcnt, 1000))
		{
			// flush uart rx buffer
			uart_flush(HPMA115S0_UART_NUM);
			state = s_detect;
		}
		break;

	case s_idle:
		break;
	}
}

int HPMA115S0::get_pm2_5(void)
{
	return pm2_5;
}

int HPMA115S0::get_pm10(void)
{
	return pm10;
}

int HPMA115S0::get_error_count(void)
{
	return error_count;
}

int HPMA115S0::get_error_clear_count(void)
{
	return error_clear_count;
}
