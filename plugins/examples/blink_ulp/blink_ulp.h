#ifndef __BLINK_ULP_H__
#define __BLINK_ULP_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

class BLINK_ULP : public Device {
	private:
		enum {
			s_detect, s_idle
		} state;
		int blink_status;
		bool blink_flag;

	public:
		TickType_t tickcnt;
		// constructor
		BLINK_ULP(void);
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
		void start(void);
		void stop(void);
};

#endif
