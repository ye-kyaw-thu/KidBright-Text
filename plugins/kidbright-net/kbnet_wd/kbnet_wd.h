#ifndef __KBNET_WD_H__
#define __KBNET_WD_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"
#include "driver/adc.h"

#define MILLIVOLT_SIZE          18

// ads-ws1 wind vane (wind direction) adc
class KBNET_WD : public Device {
	private:
		enum {
			s_detect, s_adc_start, s_adc_sample_delay, s_idle, s_error, s_wait
		} state;
		gpio_num_t trig_gpio, capture_gpio;
		// method
		bool adc_calibration_init(void);
		bool calc_mv_index(uint32_t mv, int *mv_index);

	public:
		TickType_t tickcnt;
		adc1_channel_t adc_channel;
		bool cali_enable_flag;
		int adc_sample_index;
		int mv_index_cnt_arr[MILLIVOLT_SIZE];
		double wind_direction;
		// constructor
		KBNET_WD(void);
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
