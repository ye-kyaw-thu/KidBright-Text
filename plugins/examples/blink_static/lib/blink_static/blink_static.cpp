#include "esp_system.h"
#include "kidbright32.h"
#include "blink_static.h"

#undef __DEBUG__
//#define __DEBUG__

#ifdef __DEBUG__
#include "esp_log.h"
const char *TAG = "blink_static";
#endif

BLINK_STATIC::BLINK_STATIC(int dev_addr) {
	address = dev_addr;
	led_gpio = (gpio_num_t)dev_addr;	
}

void BLINK_STATIC::init(void) {
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
	state = s_detect;
}

int BLINK_STATIC::prop_count(void) {
	// not supported
	return 0;
}

bool BLINK_STATIC::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool BLINK_STATIC::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool BLINK_STATIC::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool BLINK_STATIC::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool BLINK_STATIC::prop_write(int index, char *value) {
	// not supported
	return false;
}

void BLINK_STATIC::process(Driver *drv) {
	switch (state) {
		case s_detect:
			// leds init
			gpio_config_t io_conf;
			io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
			io_conf.mode = GPIO_MODE_OUTPUT; // set as output mode
			io_conf.pin_bit_mask = (1ULL << led_gpio); // pin bit mask
			io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
			io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
			gpio_set_level(led_gpio, LED_OFF);
			gpio_config(&io_conf);

			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			// go to blink state
			state = s_blink;
			break;

		case s_blink:
			if (blink_flag) {
				if (is_tickcnt_elapsed(tickcnt, blink_ms)) {
					blink_status ^= 0x01; // toggle status
					gpio_set_level(led_gpio, blink_status);
					// get current tickcnt
					tickcnt = get_tickcnt();

					#ifdef __DEBUG__
						printf("blink_static...\n");
						ESP_LOGI(TAG, "%s", "info");
						ESP_LOGW(TAG, "%s", "warning");
						ESP_LOGE(TAG, "%s", "error");
					#endif
				}
			}
			break;
	}
}

void BLINK_STATIC::start(uint32_t _blink_ms) {
	blink_ms = _blink_ms;
	blink_status = 0;
	gpio_set_level(led_gpio, blink_status); // active low
	// get current tickcnt
	tickcnt = get_tickcnt();
	blink_flag = true;
}

void BLINK_STATIC::stop(void) {
	blink_flag = false;
	blink_status = 1;
	gpio_set_level(led_gpio, blink_status); // active low
}
