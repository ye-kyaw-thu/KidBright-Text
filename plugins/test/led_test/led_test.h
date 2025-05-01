#ifndef __LED_TEST_H__
#define __LED_TEST_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

class LED_TEST : public Device {
	private:
		enum {
			s_detect, s_blink
		} state;
		int blink_status;
		bool blink_flag;
		bool blink_all_flag;
		bool blink_run_flag;
		int blink_run_cnt;

	public:
		TickType_t tickcnt;
		// constructor
		LED_TEST(void);
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
		void start_all(void);
		void stop_all(void);
		void start_run(void);
		void stop_run(void);
};

#endif
