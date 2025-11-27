#include "esp_system.h"
#include "driver/rtc_io.h"
#include "esp32/ulp.h"
#include "ulp_main.h"
#include "kidbright32.h"
#include "mcp7940n.h"
#include "kbnet2_rv.h"

//#undef __DEBUG__
#define __DEBUG__

extern const uint8_t ulp_main_bin_start[] asm("_binary_ulp_main_bin_start");
extern const uint8_t ulp_main_bin_end[] asm("_binary_ulp_main_bin_end");
extern MCP7940N mcp7940n;

KBNET2_RV::KBNET2_RV(void) {
	//
}

void KBNET2_RV::init(void) {	
	// gpio used for pulse counting (IN4: GPIO35, RTC_GPIO5)
    gpio_num_t gpio_num = GPIO_NUM_35;

	// get wake cause
    esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();    
    if (cause != ESP_SLEEP_WAKEUP_TIMER) {
		#ifdef __DEBUG__
        printf("not timer wakeup, initializing ULP\n");
        #endif

		// ulp load binary	
		esp_err_t err = ulp_load_binary(0, ulp_main_bin_start, (ulp_main_bin_end - ulp_main_bin_start) / sizeof(uint32_t));
		if (err != ESP_OK) {
			#ifdef __DEBUG__
			printf("failed to load ULP binary: %s\n", esp_err_to_name(err));
			#endif
		}
		else {
			#ifdef __DEBUG__
			printf("success loaded ULP binary: %s\n", esp_err_to_name(err));
			#endif
			// init ulp variables
			ulp_debounce_counter = 1;
			ulp_debounce_max_count = 1;
			ulp_next_edge = 0;
			ulp_io_number = rtc_gpio_desc[gpio_num].rtc_num; // map from GPIO# to RTC_IO#

			// init rtc gpio
			rtc_gpio_init(gpio_num);
			rtc_gpio_set_direction(gpio_num, RTC_GPIO_MODE_INPUT_ONLY);
			rtc_gpio_pulldown_dis(gpio_num);
			rtc_gpio_pullup_dis(gpio_num);
			rtc_gpio_hold_en(gpio_num);

			// set ULP wakeup period to 20 ms, minimum pulse width has to be 20 * (ulp_debounce_counter + 1) = 40ms
			ulp_set_wakeup_period(0, 20 * 1000);

			// start ULP program
			ulp_run(&ulp_entry - RTC_SLOW_MEM);
		}
    } else {
		#ifdef __DEBUG__
        printf("timer wakeup, skip ULP initialize\n");
        #endif
    }
    
	state = s_detect;
}

int KBNET2_RV::prop_count(void) {
	// not supported
	return 0;
}

bool KBNET2_RV::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool KBNET2_RV::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool KBNET2_RV::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool KBNET2_RV::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool KBNET2_RV::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET2_RV::process(Driver *drv) {
	int dom;

	switch (state) {
		case s_detect:
			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			// go to wait rtc state
			state = s_wait_rtc;
			break;
			
		case s_wait_rtc:
			if (mcp7940n.is_initialized()) {
				// get tick count
				tickcnt = get_tickcnt();

				// go to idle state
				state = s_idle;
			}
			break;

		case s_idle:
			if (is_tickcnt_elapsed(tickcnt, 1000)) {
				// get tick count
				tickcnt = get_tickcnt();

				// check last rain volume day of month stamp and today
				dom = mcp7940n.get(0);
				if (ulp_last_dom_stamp != dom) {
					
					#ifdef __DEBUG__
					printf("=======> new day, reset ulp edge count\n");
					#endif
					
					// update last day of month stamp
					ulp_last_dom_stamp = dom;
					// reset ulp edge count
					ulp_edge_count = 0;
				}
			}
			break;
	}
}

double KBNET2_RV::get_rain_volume_mm(void) {
	double val;

	// calc pulse count
	uint16_t pulse_count = (ulp_edge_count & UINT16_MAX) / 2;
	// in case of an odd number of edges, keep one until next time
	//ulp_edge_count = ulp_edge_count % 2;
	
/*	#ifdef __DEBUG__
	printf("pulse_count = %d\n", pulse_count);
    #endif*/
    
    // tipping count 0.2794 mm.
	val = 0.2794 * pulse_count;
	
	return val;
}

int KBNET2_RV::get_rain_volume_counter(void) {
	// calc pulse count
	uint16_t pulse_count = (ulp_edge_count & UINT16_MAX) / 2;
	
	// return ulp edge count
	return pulse_count;
}

void KBNET2_RV::reset_rain_volume(void) {
	// reset ulp edge count
	ulp_edge_count = 0;
}
