#include <stdio.h>
#include <string.h>
#include <math.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "ads1115.h"

ADS1115::ADS1115(int bus_ch, int dev_addr) {
	channel = bus_ch;
	address = dev_addr;
	polling_ms = ADS1115_POLLING_MS;
}

void ADS1115::init(void) {
	int i;

	for (i = 0; i < 4; i++) {
		volts[i] = 0;
	}
	conv_channel = 0;

	state = s_detect;
}

int ADS1115::prop_count(void) {
	return 4;
}

bool ADS1115::prop_name(int index, char *name) {
	if ((index >= 0) && (index <= 3)) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s%d", "AIN", index);
		return true;
	}

	// not supported
	return false;
}

bool ADS1115::prop_unit(int index, char *unit) {
	if ((index >= 0) && (index <= 3)) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "volt");
		return true;
	}

	// not supported
	return false;
}

bool ADS1115::prop_attr(int index, char *attr) {
	if ((index >= 0) && (index <= 3)) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool ADS1115::prop_read(int index, char *value) {
	if ((index >= 0) && (index <= 3)) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", volts[index]);
		return true;
	}

	// not supported
	return false;
}

bool ADS1115::prop_write(int index, char *value) {
	// not supported
	return false;
}

void ADS1115::process(Driver *drv) {
	I2CDev *i2c = (I2CDev *)drv;
	uint8_t addr_ptr, data[4];
	int i;

	switch (state) {
		case s_detect:
			// stamp polling tickcnt
			polling_tickcnt = get_tickcnt();
			// detect i2c device
			if (i2c->detect(channel, address) == ESP_OK) {
				// clear error flag
				error = false;
				// init conversion channel
				conv_channel = 0;
				state = s_start_conv;
			}
			else {
				state = s_error;
			}
			break;

		case s_start_conv:
			// [Config Register : 0x01]
			// Single Conversion, PGA Full Scale = +-2.048v
			// 1xxx 0101 1000 0011
			//
			// single-end input xxx
			//	100 : AINP = AIN0 and AINN = GND
			//	101 : AINP = AIN1 and AINN = GND
			//	110 : AINP = AIN2 and AINN = GND
			//	111 : AINP = AIN3 and AINN = GND
			data[0] = 0x01; // address pointer 0x01 for config register
			data[1] = 0xc5 | ((conv_channel & 0x03) << 4);
			data[2] = 0x83;
			if (i2c->write(channel, address, data, 3) == ESP_OK) {
				// get current tickcnt
				tickcnt = get_tickcnt();
				state = s_get_volt;
			}
			else {
				state = s_error;
			}
			break;

		case s_get_volt:
			if (is_tickcnt_elapsed(tickcnt, 20)) {
				data[0] = 0x00; // address pointer 0x00 for conversion register
				if (i2c->write(channel, address, data, 1) == ESP_OK) {
					// read conversion register
					// 0 - 2.048v, 2-complement single-end input
					// step voltage = 2.048 / 0x8000 = 0.0000625 volt
					if (i2c->read(channel, address, NULL, 0, data, 2) == ESP_OK) {
						// calculate voltage
						volts[conv_channel] = (double )((((uint16_t)((data[0] << 8) | data[1])) * 2.048) / 0x8000);
						// advance channel
						if (conv_channel < 3) {
							conv_channel++;
							state = s_start_conv;
						}
						else {
							// set initialized flag
							initialized = true;
							state = s_wait;
						}
					}
					else {
						state = s_error;
					}

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
			// init volts
			for (i = 0; i < 4; i++) {
				volts[i] = 0;
			}
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


double ADS1115::get_volt(int ain) {
	if ((ain >= 0) && (ain <= 3)) {
		return volts[ain];
	}

	return 0;
}
