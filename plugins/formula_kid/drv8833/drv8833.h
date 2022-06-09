#ifndef __DRV8833_H__
#define __DRV8833_H__

#include "driver.h"
#include "device.h"

class DRV8833 : public Device {
	private:
		enum {
			s_detect, s_idle, s_error, s_wait
		} state;
		TickType_t tickcnt;
		int duty_a;
		int duty_b;
		// method
		void init_gpio(gpio_num_t gpio, int val);
		void drv8833_nsleep(bool sleep);
		void drv8833_stop_a(void);
		void drv8833_stop_b(void);
		int cmpr_calc(int duty);
		void drv8833_pwm_ab(int da, int db);

	public:
		const char *TAG = "drv8833";
		// constructor
		DRV8833(void);
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
		void move(int direction, int speed); // movement at specific direction and speed
		void stop(void); // stop motor drive
};

#endif
