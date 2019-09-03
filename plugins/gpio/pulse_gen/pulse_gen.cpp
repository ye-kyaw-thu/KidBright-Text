#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "kidbright32.h"
#include "pulse_gen.h"

PULSE_GEN::PULSE_GEN(int dev_addr) {
	address = dev_addr;
	pulse_gpio = (gpio_num_t)dev_addr;
	// setup rmt channel
	if (dev_addr == int(OUT1_GPIO)) {
		rmt_channel = RMT_CHANNEL_2;
	}
	else
	if (dev_addr == int(OUT2_GPIO)) {
		rmt_channel = RMT_CHANNEL_3;
	}
	else {
		rmt_channel = RMT_CHANNEL_2;
	}
}

void pulse_gen_rmt_tx_end(rmt_channel_t rmt_ch, void *arg) {
	//
}

void PULSE_GEN::init(void) {
	rmt_config_t config;

	config.rmt_mode = RMT_MODE_TX;
	config.channel = rmt_channel;
	config.gpio_num = pulse_gpio;
	// number of memory blocks used for now just take as many as we can get
	config.mem_block_num = 8 - ((int)rmt_channel);
	// source clock 80MHz, div 80 = 1uS tick
	config.clk_div = 80;
	config.tx_config.loop_en = 0;
	config.tx_config.carrier_en = 0;
	config.tx_config.idle_output_en = 1;
	config.tx_config.idle_level = RMT_IDLE_LEVEL_HIGH; // *** open drain installed on gpio
	// we disabled the carrier, but fill it out anyway
	config.tx_config.carrier_freq_hz = 10000;
	config.tx_config.carrier_level = (rmt_carrier_level_t)1;
	config.tx_config.carrier_duty_percent = 50;

	rmt_config(&config);
	// no rx buf, default flags
	rmt_driver_install(rmt_channel, 0, 0);

	// register rmt tx end callback
	rmt_register_tx_end_callback(pulse_gen_rmt_tx_end, NULL);

	// clear error flag
	error = false;
	// set initialized flag
	initialized = true;
}

int PULSE_GEN::prop_count(void) {
	// not supported
	return 0;
}

bool PULSE_GEN::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool PULSE_GEN::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool PULSE_GEN::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool PULSE_GEN::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool PULSE_GEN::prop_write(int index, char *value) {
	// not supported
	return false;
}

void PULSE_GEN::process(Driver *drv) {
	//
}

void PULSE_GEN::write(gpio_int_type_t edge_type, uint32_t width, bool wait) {
	rmt_item32_t rmt_items[3];

	if (edge_type == GPIO_INTR_POSEDGE) {
		rmt_set_idle_level(rmt_channel, true, RMT_IDLE_LEVEL_HIGH); // rmt_set_idle_level(rmt_channel_t channel, bool idle_out_en, rmt_idle_level_t level)
		rmt_items[0].duration0 = width;
		rmt_items[0].level0 = 0;
		rmt_items[0].duration1 = 0;
		rmt_items[0].level1 = 1;
		rmt_items[1].val = 0; // terminate
		rmt_write_items(rmt_channel, rmt_items, 2, wait);
	}
	else
	if (edge_type == GPIO_INTR_NEGEDGE) {
		rmt_set_idle_level(rmt_channel, true, RMT_IDLE_LEVEL_LOW); // rmt_set_idle_level(rmt_channel_t channel, bool idle_out_en, rmt_idle_level_t level)
		rmt_items[0].duration0 = width;
		rmt_items[0].level0 = 1;
		rmt_items[0].duration1 = 0;
		rmt_items[0].level1 = 0;
		rmt_items[1].val = 0; // terminate
		rmt_write_items(rmt_channel, rmt_items, 2, wait);

	}
}
