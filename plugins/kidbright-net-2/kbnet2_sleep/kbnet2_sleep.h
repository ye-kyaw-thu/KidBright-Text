#ifndef __KBNET2_KBNET2_SLEEP_H__
#define __KBNET2_KBNET2_SLEEP_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

class KBNET2_SLEEP : public Device {
	private:
		enum {
			s_detect, s_wait_standby_ready, s_wait, s_wait_uart_flush, s_idle
		} state;
		enum {
			st_none, st_deep_wakeup_after, st_deep_wakeup_every
		} sleep_type;
		bool deep_sleep_flag;
		uint32_t sleep_timeout_ms;

	public:
		TickType_t tickcnt;
		// constructor
		KBNET2_SLEEP(void);
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
		void deep_wakeup_after(uint32_t timeout_ms);
		void deep_wakeup_every(uint32_t timeout_ms);
};

#endif
