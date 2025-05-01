#include "esp_system.h"
#include "kidbright32.h"
#include "led_test.h"

#undef __DEBUG__
//#define __DEBUG__

#ifdef __DEBUG__
#include "esp_log.h"
const char *TAG = "led_test";
#endif


LED_TEST::LED_TEST(void) {
	//
}

void LED_TEST::init(void) {
	gpio_config_t io_conf;

#ifdef __DEBUG__
	esp_log_level_set(TAG, ESP_LOG_VERBOSE);	
#endif

	// outputs init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT; // set as output mode
	io_conf.pin_bit_mask = (1ULL << BT_LED_GPIO); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
	blink_status = 1;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
	gpio_config(&io_conf);

	blink_flag = false;
	blink_all_flag = false;
	blink_run_flag = false;
	state = s_detect;
}

int LED_TEST::prop_count(void) {
	// not supported
	return 0;
}

bool LED_TEST::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool LED_TEST::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool LED_TEST::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool LED_TEST::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool LED_TEST::prop_write(int index, char *value) {
	// not supported
	return false;
}

void LED_TEST::process(Driver *drv) {
	switch (state) {
		case s_detect:
			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			// go to blink state
			state = s_blink;
			break;

		case s_blink:
			if (blink_flag) {
				if (is_tickcnt_elapsed(tickcnt, 500)) {
					// get current tickcnt
					tickcnt = get_tickcnt();

					blink_status ^= 0x01; // toggle status
					gpio_set_level(BT_LED_GPIO, blink_status);

					#ifdef __DEBUG__
						printf("blink...\n");
						ESP_LOGI(TAG, "%s", "info");
						ESP_LOGW(TAG, "%s", "warning");
						ESP_LOGE(TAG, "%s", "error");
					#endif			
				}
			}
			else
			if (blink_all_flag) {
				if (is_tickcnt_elapsed(tickcnt, 500)) {
					// get current tickcnt
					tickcnt = get_tickcnt();

					blink_status ^= 0x01; // toggle status
					gpio_set_level(BT_LED_GPIO, blink_status);
					gpio_set_level(WIFI_LED_GPIO, blink_status);
					gpio_set_level(NTP_LED_GPIO, blink_status);
					gpio_set_level(IOT_LED_GPIO, blink_status);
					gpio_set_level(USBSW_GPIO, blink_status);					

					#ifdef __DEBUG__
						printf("blink_all...\n");
						ESP_LOGI(TAG, "%s", "info");
						ESP_LOGW(TAG, "%s", "warning");
						ESP_LOGE(TAG, "%s", "error");
					#endif			
				}
			}
			else
			if (blink_run_flag) {
				if (is_tickcnt_elapsed(tickcnt, 500)) {
					// get current tickcnt
					tickcnt = get_tickcnt();

					switch (blink_run_cnt) {
						case 0:
							gpio_set_level(BT_LED_GPIO, LED_ON);
							gpio_set_level(WIFI_LED_GPIO, LED_OFF);
							gpio_set_level(NTP_LED_GPIO, LED_OFF);
							gpio_set_level(IOT_LED_GPIO, LED_OFF);
							gpio_set_level(USBSW_GPIO, LED_OFF);
							break;

						case 1:
							gpio_set_level(BT_LED_GPIO, LED_OFF);
							gpio_set_level(WIFI_LED_GPIO, LED_ON);
							gpio_set_level(NTP_LED_GPIO, LED_OFF);
							gpio_set_level(IOT_LED_GPIO, LED_OFF);
							gpio_set_level(USBSW_GPIO, LED_OFF);
							break;

						case 2:
							gpio_set_level(BT_LED_GPIO, LED_OFF);
							gpio_set_level(WIFI_LED_GPIO, LED_OFF);
							gpio_set_level(NTP_LED_GPIO, LED_ON);
							gpio_set_level(IOT_LED_GPIO, LED_OFF);
							gpio_set_level(USBSW_GPIO, LED_OFF);
							break;

						case 3:
							gpio_set_level(BT_LED_GPIO, LED_OFF);
							gpio_set_level(WIFI_LED_GPIO, LED_OFF);
							gpio_set_level(NTP_LED_GPIO, LED_OFF);
							gpio_set_level(IOT_LED_GPIO, LED_ON);
							gpio_set_level(USBSW_GPIO, LED_OFF);
							break;

						case 4:
							gpio_set_level(BT_LED_GPIO, LED_OFF);
							gpio_set_level(WIFI_LED_GPIO, LED_OFF);
							gpio_set_level(NTP_LED_GPIO, LED_OFF);
							gpio_set_level(IOT_LED_GPIO, LED_OFF);
							gpio_set_level(USBSW_GPIO, LED_ON);
							break;
					}

					blink_run_cnt++;
					if (blink_run_cnt > 4) {
						blink_run_cnt = 0;
					}
				}
			}
			break;
	}
}

void LED_TEST::start(void) {
	blink_status = 0;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
	// get current tickcnt
	tickcnt = get_tickcnt();
	blink_flag = true;
}

void LED_TEST::stop(void) {
	blink_flag = false;
	blink_status = 1;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
}

void LED_TEST::start_all(void) {
	blink_status = 0;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
	gpio_set_level(WIFI_LED_GPIO, blink_status);
	gpio_set_level(NTP_LED_GPIO, blink_status);
	gpio_set_level(IOT_LED_GPIO, blink_status);
	gpio_set_level(USBSW_GPIO, blink_status);	
	// get current tickcnt
	tickcnt = get_tickcnt();
	blink_all_flag = true;
}

void LED_TEST::stop_all(void) {
	blink_all_flag = false;
	blink_status = 1;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
	gpio_set_level(WIFI_LED_GPIO, blink_status);
	gpio_set_level(NTP_LED_GPIO, blink_status);
	gpio_set_level(IOT_LED_GPIO, blink_status);
	gpio_set_level(USBSW_GPIO, blink_status);
}

void LED_TEST::start_run(void) {
	blink_status = 0;
	blink_run_cnt = 0;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
	gpio_set_level(WIFI_LED_GPIO, blink_status);
	gpio_set_level(NTP_LED_GPIO, blink_status);
	gpio_set_level(IOT_LED_GPIO, blink_status);
	gpio_set_level(USBSW_GPIO, blink_status);	
	// get current tickcnt
	tickcnt = get_tickcnt();
	blink_run_flag = true;
}

void LED_TEST::stop_run(void) {
	blink_run_flag = false;
	blink_status = 1;
	gpio_set_level(BT_LED_GPIO, blink_status); // active low
	gpio_set_level(WIFI_LED_GPIO, blink_status);
	gpio_set_level(NTP_LED_GPIO, blink_status);
	gpio_set_level(IOT_LED_GPIO, blink_status);
	gpio_set_level(USBSW_GPIO, blink_status);
}
