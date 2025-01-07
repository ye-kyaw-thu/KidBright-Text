#ifndef __KBNET_RV_H__
#define __KBNET_RV_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

// ads-ws1 rain volume
class KBNET_RV : public Device {
	private:
		enum {
			s_detect, s_wait_rtc, s_idle, s_error, s_wait
		} state;
		gpio_num_t sensor_gpio;
		char current_year_month_day_str[16];
		TickType_t chkrtc_tickcnt;

	public:
		TickType_t tickcnt;
		float rain_volume;
		uint32_t rain_volume_counter;
		// constructor
		KBNET_RV(void);
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
