#ifndef __ADS1115_H__
#define __ADS1115_H__

#include "driver.h"
#include "device.h"
#include "i2c-dev.h"

#define ADS1115_POLLING_MS					500

class ADS1115 : public Device {
	private:
		enum {
			 s_detect, s_start_conv, s_get_volt, s_error, s_wait
		} state;
		TickType_t tickcnt, polling_tickcnt;
		uint8_t conv_channel;
		double volts[4];

	public:
		// constructor
		ADS1115(int bus_ch, int dev_addr);
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
		double get_volt(int ain);
};

#endif
