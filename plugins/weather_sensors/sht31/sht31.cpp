#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "sht31.h"

#undef __DEBUG__

#ifdef __DEBUG__
#include "esp_log.h"
static const char *TAG = "sht31";
#endif

// sht31 registers
#define SHT31_MEAS_HIGHREP         0x2400

SHT31::SHT31(int bus_ch, int dev_addr) {
	channel = bus_ch;
	address = dev_addr;
	polling_ms = SHT31_POLLING_MS;
}

void SHT31::init(void) {
	temperature = 0;
	humidity = 0;
	state = s_detect;
}

uint8_t SHT31::crc8(const uint8_t *data, int size) {
	// CRC-8 formula from page 14 of SHT spec pdf
	// test data 0xbe, 0xef => 0x92
	// initialization data 0xff
	// polynomial = 0x31 (x8 + x5 +x4 +1)
	// final xor = 0x00

  	uint8_t crc = 0xff;

	for (int j = size; j; --j) {
		crc ^= *data++;

		for (int i = 8; i; --i) {
			crc = (crc & 0x80) ? (crc << 1) ^ 0x31 : (crc << 1);
		}
	}

	return crc;
}

void SHT31::process(Driver *drv) {
	I2CDev *i2c = (I2CDev *)drv;
	uint8_t data[6];
	uint16_t temp, humid;
	double dtemp, dhumid;

	switch (state) {
		case s_detect:
			// stamp polling tickcnt
			polling_tickcnt = get_tickcnt();
			// detect i2c device
			if (i2c->detect(channel, address) == ESP_OK) {
				// periodic high repetitive measurement
				data[0] = SHT31_MEAS_HIGHREP >> 8;
				data[1] = SHT31_MEAS_HIGHREP & 0xff;
				if (i2c->write(channel, address, data, 2) == ESP_OK) {
					// clear error flag
					error = false;
					// get current tickcnt
					tickcnt = get_tickcnt();
					state = s_read;
				}
				else {
					state = s_error;
				}
			}
			else {
				state = s_error;
			}
			break;

		case s_read:
			// read delay for 40ms
			if (is_tickcnt_elapsed(tickcnt, 40)) {
				if (i2c->read(channel, address, NULL, 0, data, 6) == ESP_OK) {
					temp = (data[0] << 8) | data[1];
					if (data[2] == crc8(data, 2)) {
						dtemp = temp;
						dtemp *= 175;
						dtemp /= 0xffff;
						dtemp = -45 + dtemp;
						temperature = dtemp;
						#ifdef __DEBUG__
							ESP_LOGI(TAG, "temp = %f", temperature);
						#endif
					}

					humid = (data[3] << 8) | data[4];
					if (data[5] == crc8(data + 3, 2)) {
						dhumid = humid;
						dhumid *= 100;
						dhumid /= 0xFFFF;
						humidity = dhumid;
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

double SHT31::get_temperature(void) {
	return temperature;
}

double SHT31::get_humidity(void) {
	return humidity;
}
