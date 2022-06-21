#ifndef __JOYSTICK_H__
#define __JOYSTICK_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

class JOYSTICK : public Device {
	private:
		enum {
			s_detect, s_cap_start, s_cap_charge, s_cap_wait_trig, s_cap_idle, s_error, s_wait
		} state;
		gpio_num_t trig_gpio, capture_gpio;

	public:
		TickType_t tickcnt;
		int64_t start_ts, stop_ts;
		double resistance;
		int position;
		int calibrate_release;
		int calibrate_min;
		int calibrate_max;
		// constructor
		JOYSTICK(int trig, int capture);
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
		double get_resistance(void);
		int get_position(void);
		void calibrate_set(int release_value, int min_value, int max_value);
};

#endif
