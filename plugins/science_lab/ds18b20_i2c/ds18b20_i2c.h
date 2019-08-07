#ifndef __DS18B20_I2C_H__
#define __DS18B20_I2C_H__

#include "driver.h"
#include "device.h"
#include "i2c-dev.h"

#define DS18B20_I2C_POLLING_MS					1000

class DS18B20_I2C : public Device {
	private:
		enum {
			 s_detect, s_1wire_rst, s_convert_t, s_1wire_rst_read, s_read, s_error, s_wait
		} state;
		TickType_t tickcnt, polling_tickcnt;
		double temperature;
		// method
		void delay_us(int us);
		bool ds2482_read_status(I2CDev *i2c, uint8_t *stat);
		bool ds2482_read_data(I2CDev *i2c, uint8_t *data);

	public:
		// constructor
		DS18B20_I2C(int bus_ch, int dev_addr);
		// override
		void init(void);
		void process(Driver *drv);
		int prop_count(void);
		bool prop_name(int index, char *name);
		bool prop_unit(int index, char *unit);
		bool prop_attr(int index, char *attr);
		bool prop_read(int index, char *value);
		bool prop_write(int index, char *value);
		// method
		double get_temperature(void);
};

#endif
