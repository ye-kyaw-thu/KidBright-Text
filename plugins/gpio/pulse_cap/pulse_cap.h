#ifndef __PULSE_CAP_H__
#define __PULSE_CAP_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

class PULSE_CAP : public Device {
	private:
		gpio_num_t start_gpio, stop_gpio;

	public:
		int64_t capture_ts;
		// constructor
		PULSE_CAP(int start_input, int stop_input);
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
		double read(gpio_int_type_t start_intr_type, gpio_int_type_t stop_intr_type, uint32_t timeout_ms);
};

#endif
