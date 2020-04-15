#ifndef __ADSWS1_WD_H__
#define __ADSWS1_WD_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

// ads-ws1 wind vane (wind direction)
class ADSWS1_WD : public Device {
	private:
		enum {
			s_detect, s_cap_start, s_cap_charge, s_cap_wait_trig, s_cap_idle, s_error, s_wait
		} state;
		gpio_num_t trig_gpio, capture_gpio;

	public:
		const char *TAG = "adsws1_wd";
		TickType_t tickcnt;
		int64_t start_ts, stop_ts;
		double wind_direction;
		// constructor
		ADSWS1_WD(int trig, int capture);
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
		double get_wind_direction_degrees(void);
};

#endif
