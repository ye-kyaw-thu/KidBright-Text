#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "ws2812b_rmt.h"

WS2812B_RMT::WS2812B_RMT(int dev_addr) {
	address = dev_addr;
	ws2812b_gpio = (gpio_num_t)dev_addr;
	// setup rmt channel
	if (dev_addr == int(OUT1_GPIO)) {
		rmt_channel = RMT_CHANNEL_0;
	}
	else
	if (dev_addr == int(OUT2_GPIO)) {
		rmt_channel = RMT_CHANNEL_1;
	}
	else {
		rmt_channel = RMT_CHANNEL_0;
	}
}

void rmt_tx_end(rmt_channel_t channel, void *arg) {
	WS2812B_RMT *ws2812b_rmt = (WS2812B_RMT *)arg;

	// draw from current video ram
	rmt_write_items(ws2812b_rmt->rmt_channel, ws2812b_rmt->vram[ws2812b_rmt->vram_index], ws2812b_rmt->numbits, false); // wait_tx_done = false
}

void WS2812B_RMT::init(void) {
	flag = 0;
	state = s_detect;

	vram_index = 0;

	// the clk_div is 8, so we are working with 100ns units in duration
	highbit.duration0 = 8; // should be 0.8 us
	highbit.level0 = 1;
	highbit.duration1 = 5; // shouod be .45 us, but we have .15 wiggle room
	highbit.level1 = 0;

	lowbit.duration0 = 2;	// should be 0.4 us
	lowbit.level0 = 1;
	lowbit.duration1 = 10; // should be 0.85 us, but we have .15 us wiggle room
	lowbit.level1 = 0;

	latchbit.duration0 = 250;
	latchbit.level0 = 0;
	latchbit.duration1 = 250;
	latchbit.level1 = 0;

	termbit.val = 0;

	rmt_config_t config;
	config.rmt_mode = RMT_MODE_TX;
	config.channel = rmt_channel;
	config.gpio_num = ws2812b_gpio;
	// number of memory blocks used for now just take as many as we can get
	config.mem_block_num = 8 - ((int)RMT_CHANNEL_0);
	// range of pulse len generated. Source clock is typically 80Mhz.
	// So div by 8 means each tick is at 100ns
	config.clk_div = 8;
	config.tx_config.loop_en = 0;
	config.tx_config.carrier_en = 0;
	config.tx_config.idle_output_en = 1;
	config.tx_config.idle_level = (rmt_idle_level_t)0;
	// we disabled the carrier, but fill it out anyway
	config.tx_config.carrier_freq_hz = 10000;
	config.tx_config.carrier_level = (rmt_carrier_level_t)1;
	config.tx_config.carrier_duty_percent = 50;

	rmt_config(&config);
	// no rx buf, default flags
	rmt_driver_install(rmt_channel, 0, 0);

	// register rmt tx end callback
	rmt_register_tx_end_callback(rmt_tx_end, this);

	// set default maximum pixel number
	set_pixel_num(WS2812B_RMT_NUM_MAX);
	// clear
	clear();
}

int WS2812B_RMT::prop_count(void) {
	// not supported
	return 0;
}

bool WS2812B_RMT::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool WS2812B_RMT::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool WS2812B_RMT::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool WS2812B_RMT::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool WS2812B_RMT::prop_write(int index, char *value) {
	// not supported
	return false;
}

void WS2812B_RMT::process(Driver *drv) {
	switch (state) {
		case s_detect:
			// get current tickcnt
			tickcnt = get_tickcnt();
			state = s_first_delay;
			break;

		case s_first_delay:
			// delay 100ms before retry detect
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				// first rmt write items
				rmt_write_items(rmt_channel, vram[vram_index], numbits, false); // wait_tx_done = false
				// set initialized flag
				initialized = true;
				// clear error flag
				error = false;
				// goto idle state
				state = s_idle;
			}
			break;

		case s_idle:
			//
			break;
	}
}

void WS2812B_RMT::set_pixel_num(uint16_t num) {
	numpixels = num;
	// re-calculate numbits
	numbits = (numpixels * 24) + 1 + 1; // pixels + latch + terminator
}

uint16_t WS2812B_RMT::get_pixel_num(void) {
	return numpixels;
}

void WS2812B_RMT::clear() {
	int i;

	for (i = 0; i < numpixels; i++) {
		colors[i] = 0x000000; // RGB
	}

	// update to video ram
	update();
}

void WS2812B_RMT::update() {
	rmt_item32_t* cur;
	uint16_t i;
	int bt;
	uint32_t c;
	bool bitset;
	uint32_t mask;
	// double buffering video ram
	int draw_index = vram_index ^ 0x01;

	cur = vram[draw_index];
	for (i = 0; i < numpixels; i++) {
		c = colors[i];
		// swap R <=> G
		c = ((c >> 8) & 0x00ff00) | ((c << 8) & 0xff0000) | (c & 0x0000ff);
		mask = 0x800000;
		for (bt = 23; bt >= 0; bt--) {
			*cur = ((c & mask) != 0) ? highbit : lowbit;
			mask = mask >> 1;
			cur++;
		}
	}
	// latch bit
	*cur = latchbit;
	cur++;
	// terminator bit
	*cur = termbit;

	// update video ram index
	vram_index = draw_index;
}

void WS2812B_RMT::pixel_rgb(uint16_t index, uint8_t red, uint8_t green, uint8_t blue) {
	// index is 1-based
	if ((index > 0) && (index <= numpixels)) {
		index--;
		colors[index] = (red << 16) | (green << 8) | blue; // RGB
		// update to video ram
		update();
	}
}
