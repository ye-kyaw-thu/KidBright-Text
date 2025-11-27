#ifndef __KBNET2_RV_H__
#define __KBNET2_RV_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

class KBNET2_RV : public Device {
	private:
		enum {
			s_detect, s_wait_rtc, s_idle
		} state;
		TickType_t tickcnt;

	public:
		// constructor
		KBNET2_RV(void);
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
		double get_rain_volume_mm(void);
		int get_rain_volume_counter(void);
		void reset_rain_volume(void);
};

#endif
