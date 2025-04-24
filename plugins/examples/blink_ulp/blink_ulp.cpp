#include "esp_system.h"
#include "kidbright32.h"
#include "blink_ulp.h"

#include "driver/rtc_io.h"
#include "esp32/ulp.h"
#include "ulp_main.h"
extern const uint8_t ulp_main_bin_start[] asm("_binary_ulp_main_bin_start");
extern const uint8_t ulp_main_bin_end[] asm("_binary_ulp_main_bin_end");

BLINK_ULP::BLINK_ULP(void) {
	//
}

void BLINK_ULP::init(void) {
	// init rtc gpio
	rtc_gpio_init(GPIO_NUM_2);
	rtc_gpio_set_direction(GPIO_NUM_2, RTC_GPIO_MODE_OUTPUT_ONLY);
	//rtc_gpio_hold_dis(GPIO_NUM_2);
	rtc_gpio_set_level(GPIO_NUM_2, 1); // active low

	// ulp load binary	
	esp_err_t err = ulp_load_binary(0, ulp_main_bin_start, (ulp_main_bin_end - ulp_main_bin_start) / sizeof(uint32_t));
	if (err != ESP_OK) {
		printf("Failed to load ULP binary: %d\n", err);        
	}
	else {
		// Set ULP wakeup period to ~1 second (in RTC slow clock cycles: 150,000 = ~1s at 150kHz)
		ulp_set_wakeup_period(0, 100 * 1000); // 100ms

		// Start ULP program
		ulp_run(&ulp_entry - RTC_SLOW_MEM);
	}

	blink_flag = false;
	state = s_detect;
}

int BLINK_ULP::prop_count(void) {
	// not supported
	return 0;
}

bool BLINK_ULP::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool BLINK_ULP::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool BLINK_ULP::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool BLINK_ULP::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool BLINK_ULP::prop_write(int index, char *value) {
	// not supported
	return false;
}

void BLINK_ULP::process(Driver *drv) {
	switch (state) {
		case s_detect:
			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			// go to idle state
			state = s_idle;
			break;

		case s_idle:
			break;
	}
}

void BLINK_ULP::start(void) {
/*	blink_status = 0;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
	// get current tickcnt
	tickcnt = get_tickcnt();
	blink_flag = true;*/
}

void BLINK_ULP::stop(void) {
/*	blink_flag = false;
	blink_status = 1;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low*/
}

