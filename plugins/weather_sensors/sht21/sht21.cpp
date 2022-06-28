#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "sht21.h"

#undef __DEBUG__
//#define __DEBUG__

#ifdef __DEBUG__
#include "esp_log.h"
static const char *TAG = "sht21";
#endif

#define SHT_CONV_TEMP(val)		(-46.85 + (175.72 / 65536.0 * (double) val))
#define SHT_CONV_HUMID(val)		(-6.0 + (125.0 / 65536.0 * (double) val))

SHT21::SHT21(int bus_ch, int dev_addr) {
	channel = bus_ch;
	address = dev_addr;
	polling_ms = SHT21_POLLING_MS;
}

void SHT21::init(void) {
#ifdef __DEBUG__
	esp_log_level_set(TAG, ESP_LOG_VERBOSE);
#endif

	temperature = 0;
	humidity = 0;
	state = s_detect;
}

int SHT21::prop_count(void) {
	return 2;
}

bool SHT21::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "temperature");
		return true;
	}
	else
	if (index == 1) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "humidity");
		return true;
	}

	// not supported
	return false;
}

bool SHT21::prop_unit(int index, char *unit) {
	if (index == 0) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%sC", "\xc2\xb0");
		return true;
	}
	else
	if (index == 1) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "%RH");
		return true;
	}

	// not supported
	return false;
}

bool SHT21::prop_attr(int index, char *attr) {
	if ((index == 0) || (index == 1)) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool SHT21::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", temperature);
		return true;
	}
	else
	if (index == 1) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", humidity);
		return true;
	}

	// not supported
	return false;
}

bool SHT21::prop_write(int index, char *value) {
	// not supported
	return false;
}

uint8_t SHT21::crc8(const uint8_t *data, int size) {
	const uint16_t POLYNOMIAL = 0x131; // P(x)=x^8+x^5+x^4+1 = 100110001
	uint8_t crc = 0;
	uint8_t i;	

	//c alculates 8-Bit checksum with given polynomial
	for (i = 0; i < size; ++i) {
		crc ^= (data[i]);
		 for (uint8_t bit = 8; bit > 0; --bit) {
			if (crc & 0x80) crc = (crc << 1) ^ POLYNOMIAL;
			else crc = (crc << 1);

		}
	}

	return crc;
}

void SHT21::process(Driver *drv) {
	I2CDev *i2c = (I2CDev *)drv;
	uint8_t data[6];
	uint16_t temp, humid;

	switch (state) {
		case s_detect:
			// stamp polling tickcnt
			polling_tickcnt = get_tickcnt();
			// detect i2c device
			if (i2c->detect(channel, address) == ESP_OK) {
				// trigger t measurement
				data[0] = 0xf3;
				if (i2c->write(channel, address, data, 1) == ESP_OK) {
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
			// read delay for 40ms
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				if (i2c->read(channel, address, NULL, 0, data, 3) == ESP_OK) {					
					temp = (data[0] << 8) | data[1];
					if (data[2] == crc8(data, 2)) {
						temperature = SHT_CONV_TEMP(temp);
						#ifdef __DEBUG__
							ESP_LOGI(TAG, "temp = %f", temperature);
						#endif
					}

					// trigger h measurement
					data[0] = 0xf5;
					if (i2c->write(channel, address, data, 1) == ESP_OK) {
						// clear error flag
						error = false;
						// get current tickcnt
						tickcnt = get_tickcnt();
						state = s_read_humid;
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

		case s_read_humid:
			// read delay for 40ms
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				if (i2c->read(channel, address, NULL, 0, data, 3) == ESP_OK) {
					humid = (data[0] << 8) | data[1];
					if (data[2] == crc8(data, 2)) {
						humidity = SHT_CONV_HUMID(humid);
						#ifdef __DEBUG__
							ESP_LOGI(TAG, "humid = %f", humidity);
						#endif
					}					

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

double SHT21::get_temperature(void) {
	return temperature;
}

double SHT21::get_humidity(void) {
	return humidity;
}
