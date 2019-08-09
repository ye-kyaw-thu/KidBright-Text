#ifndef __WS2812B_RMT_H__
#define __WS2812B_RMT_H__

#include "driver.h"
#include "device.h"
#include "driver/rmt.h"

#define WS2812B_RMT_NUM_MAX			64

class WS2812B_RMT : public Device {
	private:
		enum {
			s_detect, s_first_delay, s_idle
		} state;
		gpio_num_t ws2812b_gpio;
		TickType_t tickcnt;
		uint8_t flag;

		uint16_t numpixels;
		uint32_t colors[WS2812B_RMT_NUM_MAX];
		rmt_item32_t highbit;
		rmt_item32_t lowbit;
		rmt_item32_t latchbit;
		rmt_item32_t termbit;

	public:
		// constructor
		WS2812B_RMT(int dev_addr);
		// override
		void init(void);
		void process(Driver *drv);
		int prop_count(void);
		bool prop_name(int index, char *name);
		bool prop_unit(int index, char *unit);
		bool prop_attr(int index, char *attr);
		bool prop_read(int index, char *value);
		bool prop_write(int index, char *value);
		// properties
		rmt_channel_t rmt_channel;
		uint16_t numbits;
		int vram_index;
		rmt_item32_t vram[2][(WS2812B_RMT_NUM_MAX * 24) + 1 + 1];
		// method
		void set_pixel_num(uint16_t num);
		uint16_t get_pixel_num(void);
		void clear();
		void update();
		void pixel_rgb(uint16_t index, uint8_t red, uint8_t green, uint8_t blue);
};

#endif
