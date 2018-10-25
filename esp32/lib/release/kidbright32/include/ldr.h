#ifndef __LDR_H__
#define __LDR_H__

#include "driver.h"
#include "device.h"

class LDR : public Device {
	private:
		enum {
		   s_read, s_wait
		} state;
		TickType_t polling_tickcnt;
		int light;

	public:
		// constructor
		LDR(void);
		// override
		void init(void);
		void process(Driver *drv);
		// method
		uint8_t get(void);
};

#endif
