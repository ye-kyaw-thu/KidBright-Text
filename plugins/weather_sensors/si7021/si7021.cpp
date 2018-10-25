#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "si7021.h"

// si7021 registers
#define SI7021_TEMP_MEAS_NOHOLD		0xf3
#define SI7021_HUMD_MEAS_NOHOLD		0xf5
#define SI7021_SOFT_RESET			0xfe

SI7021::SI7021(int bus_ch, int dev_addr) {
	channel = bus_ch;
	address = dev_addr;
	polling_ms = SI7021_POLLING_MS;
}

void SI7021::init(void) {
	temperature = 0;
	humidity = 0;
	state = s_detect;
}

void SI7021::process(Driver *drv) {
	I2CDev *i2c = (I2CDev *)drv;
	uint8_t byte, data[6];
	uint16_t temp, humid;
	double dtemp, dhumid;

	switch (state) {
		case s_detect:
			// stamp polling tickcnt
			polling_tickcnt = get_tickcnt();
			// detect i2c device
			if (i2c->detect(channel, address) == ESP_OK) {
				// reset
				byte = SI7021_SOFT_RESET;
				if (i2c->write(channel, address, &byte, 1) == ESP_OK) {
					// clear error flag
					error = false;
					// get current tickcnt
					tickcnt = get_tickcnt();
					state = s_read_temp;
				}
				else {
					state = s_error;
				}
			}
			else {
				state = s_error;
			}
			break;

		case s_read_temp:
			// delay for 40ms
			if (is_tickcnt_elapsed(tickcnt, 40)) {
				// read temp
				byte = SI7021_TEMP_MEAS_NOHOLD;
				if (i2c->write(channel, address, &byte, 1) == ESP_OK) {
					// clear error flag
					error = false;
					// get current tickcnt
					tickcnt = get_tickcnt();
					state = s_get_temp;
				}
				else {
					state = s_error;
				}
			}
			break;

		case s_get_temp:
			// delay for 40ms
			if (is_tickcnt_elapsed(tickcnt, 40)) {
				// get temp
				if (i2c->read(channel, address, NULL, 0, data, 3) == ESP_OK) {
					temp = data[0] << 8 | data[1];
					dtemp = (175.72 * temp / 65536) - 46.85;
					temperature = dtemp;
					// get current tickcnt
					tickcnt = get_tickcnt();
					state = s_read_humid;
				}
				else {
					state = s_error;
				}
			}
			break;


		case s_read_humid:
			// delay for 40ms
			if (is_tickcnt_elapsed(tickcnt, 40)) {
				// read humid
				byte = SI7021_HUMD_MEAS_NOHOLD;
				if (i2c->write(channel, address, &byte, 1) == ESP_OK) {
					// clear error flag
					error = false;
					// get current tickcnt
					tickcnt = get_tickcnt();
					state = s_get_humid;
				}
				else {
					state = s_error;
				}
			}
			break;

		case s_get_humid:
			// delay for 40ms
			if (is_tickcnt_elapsed(tickcnt, 40)) {
				// get humid
				if (i2c->read(channel, address, NULL, 0, data, 3) == ESP_OK) {
					humid = data[0] << 8 | data[1];
					dhumid = ((125.0 * humid) / 65536) - 6;
					humidity = dhumid;
					// set initialized flag
					initialized = true;

					// load polling tickcnt
					tickcnt = polling_tickcnt;
					// goto wait and retry with detect state
					state = s_wait;
				}
				else {
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
			// wait polling_ms timeout
			if (is_tickcnt_elapsed(tickcnt, polling_ms)) {
				state = s_detect;
			}
			break;
	}
}

double SI7021::get_temperature(void) {
	return temperature;
}

double SI7021::get_humidity(void) {
	return humidity;
}
