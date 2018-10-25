#ifndef __PORTS_H__
#define __PORTS_H__

#include "driver.h"
#include "device.h"

class PORTS : public Device {
	private:
		 int usbsw_value;
		 int out1_value;
		 int out2_value;

	public:
		// constructor
		PORTS();
		// override
		void init(void);
		void process(Driver *drv);
		// method
		void usbsw_write(int val);
		void usbsw_toggle(void);
		int usbsw_read(void);
		void output1_write(int val);
		void output1_toggle(void);
		int output1_read(void);
		void output2_write(int val);
		void output2_toggle(void);
		int output2_read(void);
		int input1_read(void);
		int input2_read(void);
		int input3_read(void);
		int input4_read(void);
};

#endif
