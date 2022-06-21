#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "joystick.h"

#undef __DEBUG__
//#define __DEBUG__

#ifdef __DEBUG__
#include "esp_log.h"
#endif

const char *TAG = "joystick";

#define ESP_INTR_FLAG_DEFAULT 	0
#define	R_SERIE					1000
#define MATCHING_ERROR_PERCENT	10


static void IRAM_ATTR joystick_gpio_isr_handler(void* arg) {
	JOYSTICK *joystick = (JOYSTICK *)arg;

	joystick->stop_ts = esp_timer_get_time();
}

JOYSTICK::JOYSTICK(int trig, int capture) {
	trig_gpio = (gpio_num_t)trig;
	capture_gpio = (gpio_num_t)capture;
}

void JOYSTICK::init(void) {
#ifdef __DEBUG__
	esp_log_level_set(TAG, ESP_LOG_VERBOSE);
#endif

	resistance = 0;
	position = 0;
	calibrate_release = 0;
	calibrate_min = -100;
	calibrate_max = 100;
	state = s_detect;
}

int JOYSTICK::prop_count(void) {
	return 2;
}

bool JOYSTICK::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "position");
		return true;
	}

	if (index == 1) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "resistance");
		return true;
	}

	// not supported
	return false;
}

bool JOYSTICK::prop_unit(int index, char *unit) {
	if (index == 0) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "%");
		return true;
	}

	if (index == 1) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "ohm");
		return true;
	}

	// not supported
	return false;
}

bool JOYSTICK::prop_attr(int index, char *attr) {
	if ((index == 0) || (index == 1)) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool JOYSTICK::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%d", position);
		return true;
	}

	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", resistance);
		return true;
	}

	// not supported
	return false;
}

bool JOYSTICK::prop_write(int index, char *value) {
	// not supported
	return false;
}

void JOYSTICK::process(Driver *drv) {
	gpio_config_t io_conf;
	int i, cal;

	switch (state) {
		case s_detect:
			// trig gpio init
			io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
			io_conf.mode = GPIO_MODE_OUTPUT; // set GPIO_MODE_OUTPUT as output mode or GPIO_MODE_INPUT_OUTPUT if want to read back
			io_conf.pin_bit_mask = (1ULL << trig_gpio); // pin bit mask
			io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
			io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
			gpio_set_level(trig_gpio, 1); // cap discharge
			gpio_config(&io_conf);

			// capture gpio init
			io_conf.intr_type = GPIO_INTR_POSEDGE; // rising edge interrupt (GPIO_INTR_DISABLE | GPIO_INTR_POSEDGE | GPIO_INTR_NEGEDGE | GPIO_INTR_ANYEDGE | GPIO_INTR_LOW_LEVEL | GPIO_INTR_HIGH_LEVEL)
			io_conf.mode = GPIO_MODE_INPUT; // set as input mode
			io_conf.pin_bit_mask = (1ULL << capture_gpio); // pin bit mask
			io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
			io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // enable pull-up mode
			gpio_config(&io_conf);

			// install gpio isr service
			gpio_install_isr_service(ESP_INTR_FLAG_DEFAULT);
			// hook isr handler for specific gpio pin
			gpio_isr_handler_add(capture_gpio, joystick_gpio_isr_handler, (void *)this);

			// go to capture start state
			state = s_cap_start;
			break;

		case s_cap_start:
			gpio_intr_disable(capture_gpio); // disable cap interrupt
			gpio_set_level(trig_gpio, 1); // cap discharge
			tickcnt = get_tickcnt();
			state = s_cap_charge;
			break;

		case s_cap_charge:
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				stop_ts = 0;
				start_ts = esp_timer_get_time();
				gpio_intr_enable(capture_gpio); // enable cap interrupt
				gpio_set_level(trig_gpio, 0); // cap charge
				tickcnt = get_tickcnt();
				state = s_cap_wait_trig;
			}
			break;

		case s_cap_wait_trig:
			if (stop_ts != 0) {
				gpio_intr_disable(capture_gpio); // disable cap interrupt

				// sensor vcc = 5.0V
				resistance = ((stop_ts - start_ts) * 9.788075945) - R_SERIE;
				// sensor vcc = 3.3V
				//res = ((stop_ts - start_ts) * 5.367351153) - R_SERIE;
				position = (int)((resistance * 200) / 10000) - 100;

				// calibrate origin
				position = position - calibrate_release;
				// calibrate min
				if (position < 0) {
					cal = calibrate_min - calibrate_release;
					position = (position * 100) / (cal < 0 ? (-1 * cal) : cal);
				}
				else
				if (position > 0) {
					cal = calibrate_max - calibrate_release;
					position = (position * 100) / (cal < 0 ? (-1 * cal) : cal);
				}

				// positive position cap
				if (position > 100) {
					position = 100;
				}
				// negative position cap
				if (position < -100) {
					position = -100;
				}

				// clear error flag
				error = false;
				// set initialized flag
				initialized = true;

			#ifdef __DEBUG__
				//printf("%s: R = %f, %d\n", name, resistance, position);
				ESP_LOGI(TAG, "%s: R = %f, %d", name, resistance, position);
			#endif

				state = s_cap_start;
			}
			else {
				// check trig timeout
				if (is_tickcnt_elapsed(tickcnt, 500)) {
					state = s_error;
				}
			}
			break;

		case s_cap_idle:
			if (is_tickcnt_elapsed(tickcnt, 500)) {
				state = s_cap_start;
			}
			break;

		case s_error:
			// set error flag
			error = true;
			// clear initialized flag
			initialized = false;

			#ifdef __DEBUG__
				ESP_LOGI(TAG, "capture timeout (no sensor connected)!");
			#endif

			// get current tickcnt
			tickcnt = get_tickcnt();
			// goto wait and retry with detect state
			state = s_wait;
			break;

		case s_wait:
			// delay 1000ms before retry detect
			if (is_tickcnt_elapsed(tickcnt, 1000)) {
				state = s_cap_start;
			}
			break;
	}
}

double JOYSTICK::get_resistance(void) {
	return resistance;
}

int JOYSTICK::get_position(void) {
	return position;
}

void JOYSTICK::calibrate_set(int release_value, int min_value, int max_value) {
	calibrate_release = release_value;
	calibrate_min = min_value;
	calibrate_max = max_value;
}
