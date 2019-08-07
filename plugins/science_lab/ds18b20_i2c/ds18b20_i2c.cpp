#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "ds18b20_i2c.h"

#define DS2482_DEVICE_RESET							0xf0
#define DS2482_SET_READ_POINTER						0xe1
#define DS2482_WRITE_CONFIGURATION					0xd2
#define DS2482_1WIRE_RESET							0xb4
#define DS2482_1WIRE_WRITE_BYTE						0xa5
#define DS2482_1WIRE_READ_BYTE						0x96

#define DS2482_STATUS_REGISTER_PTR					0xf0
#define DS2482_READ_DATA_REG_PTR					0xe1
#define DS2482_CONFIGURATION_REG_PTR				0xc3

#define DS2482_STAT_1WIRE_BUSY_MASK					0x01
#define DS2482_STAT_PRESENCE_PULSE_DETECT_MASK		0x02
#define DS2482_STAT_SHORT_DETECED_MASK				0x04
#define DS2482_STAT_LOGIC_LEVEL_MASK				0x08
#define DS2482_STAT_DEVICE_RESET_MASK				0x10
#define DS2482_STAT_SINGLE_BIT_RESULT_MASK			0x20
#define DS2482_STAT_TRIPLET_SECOND_MASK				0x40
#define DS2482_STAT_BRANCH_DIRECTION_TAKEN_MASK		0x80

#define DS18B20_SKIP_ROM							0xcc
#define DS18B20_CONVERT_T							0x44
#define DS18B20_READ_SCRATCHPAD						0xbe

DS18B20_I2C::DS18B20_I2C(int bus_ch, int dev_addr) {
	channel = bus_ch;
	address = dev_addr;
	polling_ms = DS18B20_I2C_POLLING_MS;
}

void DS18B20_I2C::init(void) {
	temperature = 0;
	state = s_detect;
}

int DS18B20_I2C::prop_count(void) {
	return 1;
}

bool DS18B20_I2C::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "temperature");
		return true;
	}

	// not supported
	return false;
}

bool DS18B20_I2C::prop_unit(int index, char *unit) {
	if (index == 0) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%sC", "\xc2\xb0");
		return true;
	}

	// not supported
	return false;
}

bool DS18B20_I2C::prop_attr(int index, char *attr) {
	if (index == 0) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool DS18B20_I2C::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", temperature);
		return true;
	}

	// not supported
	return false;
}

bool DS18B20_I2C::prop_write(int index, char *value) {
	// not supported
	return false;
}

void DS18B20_I2C::delay_us(int us) {
	int64_t curr_us = esp_timer_get_time();

	while ((esp_timer_get_time() - curr_us) < (us)) {
		//
	}
}

bool DS18B20_I2C::ds2482_read_status(I2CDev *i2c, uint8_t *stat) {
	uint8_t buf[2];

	// set ds2482 read pointer
	buf[0] = DS2482_SET_READ_POINTER;
	buf[1] = DS2482_STATUS_REGISTER_PTR;
	if (i2c->write(channel, address, buf, 2) == ESP_OK) {
		// read ds2482 status register
		if (i2c->read(channel, address, NULL, 0, buf, 1) == ESP_OK) {
			*stat = buf[0];
			return true;
		}
	}

	return false;
}

bool DS18B20_I2C::ds2482_read_data(I2CDev *i2c, uint8_t *data) {
	uint8_t buf[2];

	// set ds2482 read pointer
	buf[0] = DS2482_SET_READ_POINTER;
	buf[1] = DS2482_READ_DATA_REG_PTR;
	if (i2c->write(channel, address, buf, 2) == ESP_OK) {
		// read ds2482 status register
		if (i2c->read(channel, address, NULL, 0, buf, 1) == ESP_OK) {
			*data = buf[0];
			return true;
		}
	}

	return false;
}

void DS18B20_I2C::process(Driver *drv) {
	I2CDev *i2c = (I2CDev *)drv;
	uint8_t buf[4], stat, data1, data2;

	switch (state) {
		case s_detect:
			if (i2c->detect(channel, address) == ESP_OK) {
				// reset ds2482
				buf[0] = DS2482_DEVICE_RESET;
				if (i2c->write(channel, address, buf, 1) == ESP_OK) {
					// configure ds2482
					buf[0] = DS2482_WRITE_CONFIGURATION;
					buf[1] = 0xe1;
					if (i2c->write(channel, address, buf, 2) == ESP_OK) {
						// clear error flag
						error = false;
						state = s_1wire_rst;
					}
					else {
						state = s_error;
					}
				}
				else {
					state = s_error;
				}
			}
			else {
				state = s_error;
			}
			break;

		case s_1wire_rst:
			// reset 1-wire
			buf[0] = DS2482_1WIRE_RESET;
			if (i2c->write(channel, address, buf, 1) == ESP_OK) {
				state = s_convert_t;
			}
			else {
				state = s_error;
			}
			break;

		case s_convert_t:
			if (ds2482_read_status(i2c, &stat)) {
				// check presence pulse
				if (stat & DS2482_STAT_PRESENCE_PULSE_DETECT_MASK) {
					// ds2482 write byte, ds18b20 skip rom
					buf[0] = DS2482_1WIRE_WRITE_BYTE;
					buf[1] = DS18B20_SKIP_ROM;
					if (i2c->write(channel, address, buf, 2) == ESP_OK) {
						// delay 1ms
						delay_us(1000);
						// ds2482 write byte, ds18b20 read scratchpad
						buf[0] = DS2482_1WIRE_WRITE_BYTE;
						buf[1] = DS18B20_CONVERT_T;
						if (i2c->write(channel, address, buf, 2) == ESP_OK) {

							tickcnt = get_tickcnt();
							state = s_1wire_rst_read;
						}
						else {
							state = s_error;
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
			else {
				state = s_error;
			}
			break;

		case s_1wire_rst_read:
			// delay read 500ms
			if (is_tickcnt_elapsed(tickcnt, 500)) {
				// reset ds2482
				buf[0] = DS2482_1WIRE_RESET;
				if (i2c->write(channel, address, buf, 1) == ESP_OK) {
					state = s_read;
				}
				else {
					state = s_error;
				}
			}
			break;

		case s_read:
			if (ds2482_read_status(i2c, &stat)) {
				// check presence pulse
				if (stat & DS2482_STAT_PRESENCE_PULSE_DETECT_MASK) {
					// ds2482 write byte, ds18b20 skip rom
					buf[0] = DS2482_1WIRE_WRITE_BYTE;
					buf[1] = DS18B20_SKIP_ROM;
					if (i2c->write(channel, address, buf, 2) == ESP_OK) {
						// delay 1ms
						delay_us(1000);
						// ds2482 write byte, ds18b20 read scratchpad
						buf[0] = DS2482_1WIRE_WRITE_BYTE;
						buf[1] = DS18B20_READ_SCRATCHPAD;
						if (i2c->write(channel, address, buf, 2) == ESP_OK) {
							// delay 1ms
							delay_us(1000);
							// ds2482 read byte
							buf[0] = DS2482_1WIRE_READ_BYTE;
							if (i2c->write(channel, address, buf, 1) == ESP_OK) {
								// delay 1ms
								delay_us(1000);
								// read data
								if (ds2482_read_data(i2c, &data1)) {
									// ds2482 read byte
									buf[0] = DS2482_1WIRE_READ_BYTE;
									if (i2c->write(channel, address, buf, 1) == ESP_OK) {
										// delay 1ms
										delay_us(1000);
										// read data
										if (ds2482_read_data(i2c, &data2)) {
											//if (temperature < -55) => DEVICE_DISCONNECTED
											temperature = 0.0625 * ((data2 << 8) | data1);

											// set initialized flag
											initialized = true;
											tickcnt = get_tickcnt();
											state = s_wait;
										}
										else {
											state = s_error;
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
							else {
								state = s_error;
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
				else {
					state = s_error;
				}
			}
			else {
				state = s_error;
			}
			break;

		case s_error:
			// set error flag
			error = true;
			// clear initialized flag
			initialized = false;
			// init temperature
			temperature = 0;
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

double DS18B20_I2C::get_temperature(void) {
	return temperature;
}
