#include "esp_system.h"
#include "esp_sleep.h"
#include "esp32/ulp.h"
#include "soc/rtc_cntl_reg.h"
#include "kbnet2_sleep.h"
#include "kidbright32.h"
#include "devman.h"

//#undef __DEBUG__
#define __DEBUG__

KBNET2_SLEEP::KBNET2_SLEEP(void) {
	//
}

void KBNET2_SLEEP::init(void) {
	sleep_type = st_none;
	deep_sleep_flag = false;
	state = s_detect;
}

int KBNET2_SLEEP::prop_count(void) {
	// not supported
	return 0;
}

bool KBNET2_SLEEP::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool KBNET2_SLEEP::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool KBNET2_SLEEP::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool KBNET2_SLEEP::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool KBNET2_SLEEP::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET2_SLEEP::process(Driver *drv) {
	esp_err_t err;
	int32_t timeout_left_ms;

	switch (state) {
		case s_detect:
			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			// go to idle state
			state = s_idle;
			break;
			
		case s_wait_standby_ready:		
			if (devman_standby_ready()) {
				#ifdef __DEBUG__
				printf("*** enter deep sleep...\n");				
				#endif

				// go to wait uart flush state
				state = s_wait_uart_flush;
			}
			else {
				#ifdef __DEBUG__
				printf("device manager not ready to standby\n");
				#endif

				// go to wait state
				state = s_wait;
			}
			
			// get tick count
			tickcnt = get_tickcnt();
			break;
			
		case s_wait:
			if (is_tickcnt_elapsed(tickcnt, 500)) {
				// go back to wait standy ready state
				state = s_wait_standby_ready;
			}
			break;
			
		case s_wait_uart_flush:
			if (is_tickcnt_elapsed(tickcnt, 500)) {
				// check sleep type
				switch (sleep_type) {
					case st_deep_wakeup_after:
						// always enable wakeup from ulp
						if ((err = esp_sleep_enable_ulp_wakeup()) != ESP_OK) {
							#ifdef __DEBUG__
							printf("esp_sleep_enable_ulp_wakeup() failed! (%s)\n", esp_err_to_name(err));		
							#endif
						}

						// esp_err_t esp_sleep_enable_timer_wakeup(uint64_t time_in_us);
						if (esp_sleep_enable_timer_wakeup(sleep_timeout_ms * 1000) != ESP_OK) {
							#ifdef __DEBUG__
							printf("esp_sleep_enable_timer_wakeup after %d ms failed!", sleep_timeout_ms);
							#endif
						}
						else {
							// start deep sleep
							esp_deep_sleep_start();
						}
						break;
					
					case st_deep_wakeup_every:
						// always enable wakeup from ulp
						if ((err = esp_sleep_enable_ulp_wakeup()) != ESP_OK) {
							#ifdef __DEBUG__
							printf("esp_sleep_enable_ulp_wakeup() failed! (%s)\n", esp_err_to_name(err));		
							#endif
						}

						// esp_timer_get_time time (int64_t) in microseconds since boot
						timeout_left_ms = sleep_timeout_ms - (esp_timer_get_time() / 1000);
						// check and compensate with boot and run time
						if (timeout_left_ms > 0) {
							sleep_timeout_ms = timeout_left_ms;
						}

						if (esp_sleep_enable_timer_wakeup(sleep_timeout_ms * 1000) != ESP_OK) {
							#ifdef __DEBUG__
							printf("esp_sleep_enable_timer_wakeup every %d ms failed!", sleep_timeout_ms);
							#endif
						}
						else {
							// start deep sleep
							esp_deep_sleep_start();
						}
						break;
						
					case st_none:
						break;
				}

				// go to idle state
				state = s_idle;
			}
			break;			

		case s_idle:
			//			
			break;
	}
}

void KBNET2_SLEEP::deep_wakeup_after(uint32_t timeout_ms) {
	// check duplicate sleep	
	if (deep_sleep_flag) {
		return;
	}
	
	// set deep sleep flag
	deep_sleep_flag = true;
	// save sleep timeout
	sleep_timeout_ms = timeout_ms;
	
	// set sleep type
	sleep_type = st_deep_wakeup_after;
	// request device manager standby
	devman_standby();
	// go to wait standby ready state
	state = s_wait_standby_ready;
}

void KBNET2_SLEEP::deep_wakeup_every(uint32_t timeout_ms) {
	// check duplicate sleep
	if (deep_sleep_flag) {
		return;
	}
	
	// set deep sleep flag
	deep_sleep_flag = true;
	// save sleep timeout
	sleep_timeout_ms = timeout_ms;
	
	// set sleep type
	sleep_type = st_deep_wakeup_every;
	// request device manager standby
	devman_standby();
	// go to wait standby ready state
	state = s_wait_standby_ready;
}
