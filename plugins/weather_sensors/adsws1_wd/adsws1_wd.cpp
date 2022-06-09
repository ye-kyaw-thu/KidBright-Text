#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "adsws1_wd.h"

#undef __DEBUG__
//#define __DEBUG__

#ifdef __DEBUG__
#include "esp_log.h"
#endif

#define ESP_INTR_FLAG_DEFAULT 	0
#define	R_SERIE					1000
#define MATCHING_ERROR_PERCENT	10

#define R_MIN(x)				((x * (100 - MATCHING_ERROR_PERCENT)) / 100)
#define R_MAX(x)				((x * (100 + MATCHING_ERROR_PERCENT)) / 100)
#define R_MIN_5(x)				((x * (100 - 5)) / 100)
#define R_MAX_5(x)				((x * (100 + 5)) / 100)

typedef struct wd_tab_struct {
	double r_min;
	double r_max;
	double degrees;
} wd_tab_t;

const wd_tab_t wd_tab[] = {
	{ R_MIN(688), R_MAX(688), 112.5 },
	{ R_MIN(891), R_MAX_5(891), 67.5 },
	{ R_MIN_5(1000), R_MAX(1000), 90 },
	{ R_MIN(1410), R_MAX(1410), 157.5 },
	{ R_MIN(2200), R_MAX(2200), 135 },
	{ R_MIN(3140), R_MAX(3140), 202.5 },
	{ R_MIN(3900), R_MAX(3900), 180 },
	{ R_MIN(6570), R_MAX(6570), 22.5 },
	{ R_MIN(8200), R_MAX(8200), 45 },
	{ R_MIN(14120), R_MAX_5(14120), 247.5 },
	{ R_MIN_5(16000), R_MAX(16000), 225 },
	{ R_MIN(21880), R_MAX(21880), 337.5 },
	{ R_MIN(33000), R_MAX(33000), 0 },
	{ R_MIN(42120), R_MAX(42120), 292.5 },
	{ R_MIN(64900), R_MAX(64900), 315 },
	{ R_MIN(120000), R_MAX(120000), 270 },
	{0, 0, 0}
};

static void IRAM_ATTR adsws1_wd_gpio_isr_handler(void* arg) {
	ADSWS1_WD *adsws1_wd = (ADSWS1_WD *)arg;

	adsws1_wd->stop_ts = esp_timer_get_time();
}

ADSWS1_WD::ADSWS1_WD(int trig, int capture) {
	address = capture;
	trig_gpio = (gpio_num_t)trig;
	capture_gpio = (gpio_num_t)capture;
}

void ADSWS1_WD::init(void) {
#ifdef __DEBUG__
	esp_log_level_set(TAG, ESP_LOG_VERBOSE);
	
	// print out resistance table
	int i = 0;
	while (wd_tab[i].r_min != 0) {
		printf("%f - %f\n", wd_tab[i].r_min, wd_tab[i].r_max);
		i++;
	}
#endif

	wind_direction = 0;
	state = s_detect;
}

int ADSWS1_WD::prop_count(void) {
	return 1;
}

bool ADSWS1_WD::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "wind_direction");
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_WD::prop_unit(int index, char *unit) {
	if (index == 0) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "degrees");
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_WD::prop_attr(int index, char *attr) {
	if (index == 0) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_WD::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", wind_direction);
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_WD::prop_write(int index, char *value) {
	// not supported
	return false;
}

void ADSWS1_WD::process(Driver *drv) {
	gpio_config_t io_conf;
	double res;
	int i;

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
			gpio_isr_handler_add(capture_gpio, adsws1_wd_gpio_isr_handler, (void *)this);

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
				res = ((stop_ts - start_ts) * 9.788075945) - R_SERIE;
				// sensor vcc = 3.3V
				//res = ((stop_ts - start_ts) * 5.367351153) - R_SERIE;

#ifdef __DEBUG__
				ESP_LOGI(TAG, "stop_ts - start_ts = %lld", stop_ts - start_ts);
				ESP_LOGI(TAG, "resistance = %f", res);
#endif
				i = 0;
				while (wd_tab[i].r_min != 0) {
					if ((res >= wd_tab[i].r_min) && (res <= wd_tab[i].r_max)) {
						wind_direction = wd_tab[i].degrees;
#ifdef __DEBUG__
						ESP_LOGI(TAG, "wind_direction = %f", wind_direction);
#endif
						break;
					}
					else {
						i++;
					}
				}

				// check resistance matched in table
				if (wd_tab[i].r_min == 0) {
					state = s_error;
				}
				else {
					// clear error flag
					error = false;
					// set initialized flag
					initialized = true;

					tickcnt = get_tickcnt();
					state = s_cap_idle;
				}
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

double ADSWS1_WD::get_wind_direction_degrees(void) {
	// just return current wind direction value
	return wind_direction;
}
