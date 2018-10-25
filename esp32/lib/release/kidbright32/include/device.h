#ifndef __DEVICE_H__
#define __DEVICE_H__

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver.h"

#define IS_FLAG_SET(x, b)					(x & b)
#define FLAG_SET(x, b)						(x |= b)
#define FLAG_CLR(x, b)						(x &= (~b))

#define DEVICE_ERROR_FLAG					0x01
#define DEVICE_INITIALIZED_FLAG				0x02

class Device {
	public:
		int channel = 0;
		int address = -1;
		bool error = false;
		bool initialized = false;
		uint32_t polling_ms;
		// method
		virtual void init(void);
		virtual void process(Driver *drv);
		bool is_error(void);
		bool is_initialized(void);
		uint32_t get_polling_ms(void);
		void set_polling_ms(uint32_t ms);
		TickType_t get_tickcnt(void);
		bool is_tickcnt_elapsed(TickType_t tickcnt, uint32_t tickcnt_ms);
};

#endif
