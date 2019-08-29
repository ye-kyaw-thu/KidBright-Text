#ifndef __PULSE_GEN_H__
#define __PULSE_GEN_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"
#include "driver/rmt.h"

class PULSE_GEN : public Device {
	private:
		gpio_num_t pulse_gpio;
		rmt_channel_t rmt_channel;

	public:
		// constructor
		PULSE_GEN(int dev_addr);
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
		void write(gpio_int_type_t edge_type, uint32_t width, bool wait);
};

#endif
