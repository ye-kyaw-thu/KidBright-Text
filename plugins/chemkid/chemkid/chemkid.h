#ifndef __CHEMKID_H__
#define __CHEMKID_H__

#include "driver.h"
#include "device.h"
#include "i2c-dev.h"
#include "driver/gpio.h" ///

#define CHEMKID_POLLING_MS		1000

class CHEMKID : public Device {
	private:
		enum {
			 s_led_on, s_detect, s_get_lux, s_error, s_wait
		} state;
		TickType_t tickcnt, polling_tickcnt;
		bool first_read;
		double illuminance;
		///int ck_ledpin;// chemkid rgb
		int ck_redled;// chemkid rgb
		int ck_greenled;// chemkid rgb
		int ck_blueled;// chemkid rgb
		int ck_gain;// chemkid gain
		int ck_exposure_time;// chemkid exposute_time
		////int ck_response_time;// chemkid response_time
		int ck_output1;// chemkid output
		double calc_lux(unsigned int ch0, unsigned int ch1);
		//double calc_lux(0, 0x38);

	public:
		// constructor
		//CHEMKID(int bus_ch, int dev_addr);
		//CHEMKID(int bus_ch, int dev_addr, int det_gain, int det_exposure_time, int det_response_time);
		//CHEMKID(int det_ledpin, int det_redled, int det_greenled, int det_blueled, int bus_ch, int dev_addr, int det_gain, int det_exposure_time, int det_response_time);
		//CHEMKID(int det_ledpin, int det_redled, int det_greenled, int det_blueled, 0, 0x38, int det_gain, int det_exposure_time, int det_response_time, int det_output1);
		///CHEMKID(int det_ledpin, int det_redled, int det_greenled, int det_blueled, int bus_ch, int dev_addr, int det_gain, int det_exposure_time, int det_response_time, int det_output1);
		////CHEMKID(int det_redled, int det_greenled, int det_blueled, int bus_ch, int dev_addr, int det_gain, int det_exposure_time, int det_response_time, int det_output1);
		/////CHEMKID(int det_redled, int det_greenled, int det_blueled, int bus_ch, int dev_addr, int det_gain, int det_exposure_time, int det_output1);
		CHEMKID(int det_redled, int det_greenled, int det_blueled, int det_gain, int det_exposure_time, int det_output1);

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
		double get_illuminance(void);
};

#endif
