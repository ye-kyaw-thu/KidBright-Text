#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "mcp7940n.h"
#include "adsws1_rg.h"

#define ESP_INTR_FLAG_DEFAULT 	0

extern MCP7940N mcp7940n;

static void IRAM_ATTR adsws1_rg_gpio_isr_handler(void* arg) {
	ADSWS1_RG *adsws1_rg = (ADSWS1_RG *)arg;

	// accumulated rain gauge for 0.2794 mm. per tick
	adsws1_rg->rain_gauge += 0.2794;
	// increment rain gauge counter
	adsws1_rg->rain_gauge_counter++;
}

void ADSWS1_RG::reset_rain_gauge(void) {
	rain_gauge = 0;
	rain_gauge_counter = 0;
}

ADSWS1_RG::ADSWS1_RG(int dev_addr) {
	address = dev_addr;
	sensor_gpio = (gpio_num_t)dev_addr;
}

void ADSWS1_RG::init(void) {
	reset_rain_gauge();
	state = s_detect;
}

int ADSWS1_RG::prop_count(void) {
	return 2;
}

bool ADSWS1_RG::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "rain_gauge");
		return true;
	}
	else
	if (index == 1) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "rain_gauge_counter");
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_RG::prop_unit(int index, char *unit) {
	if (index == 0) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "mm");
		return true;
	}
	else
	if (index == 1) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "count");
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_RG::prop_attr(int index, char *attr) {
	if (index == 0) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}
	else
	if (index == 1) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_RG::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", rain_gauge);
		return true;
	}
	else
	if (index == 1) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%d", rain_gauge_counter);
		return true;
	}

	// not supported
	return false;
}

bool ADSWS1_RG::prop_write(int index, char *value) {
	// not supported
	return false;
}

void ADSWS1_RG::process(Driver *drv) {
	gpio_config_t io_conf;

	switch (state) {
		case s_detect:
			// disable in1 interrupt
			gpio_intr_disable(sensor_gpio);

			// gpio event init
			io_conf.intr_type = GPIO_INTR_POSEDGE; // rising edge interrupt (GPIO_INTR_DISABLE | GPIO_INTR_POSEDGE | GPIO_INTR_NEGEDGE | GPIO_INTR_ANYEDGE | GPIO_INTR_LOW_LEVEL | GPIO_INTR_HIGH_LEVEL)
			io_conf.mode = GPIO_MODE_INPUT; // set as input mode
			io_conf.pin_bit_mask = (1ULL << sensor_gpio); // pin bit mask
			io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
			io_conf.pull_up_en = GPIO_PULLUP_ENABLE; // enable pull-up mode
			gpio_config(&io_conf);

			// install gpio isr service
			gpio_install_isr_service(ESP_INTR_FLAG_DEFAULT);
			// hook isr handler for specific gpio pin
			gpio_isr_handler_add(sensor_gpio, adsws1_rg_gpio_isr_handler, (void *)this);
			// remove isr handler for gpio number
			//gpio_isr_handler_remove(sensor_gpio);

			// reset rain gauge
			reset_rain_gauge();
			// enable in1 interrupt
			gpio_intr_enable(sensor_gpio);

			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			// go to wait rtc state
			state = s_wait_rtc;
			break;

		case s_wait_rtc:
			if (mcp7940n.is_initialized()) {
				// save current year,month,day string
				strcpy(current_year_month_day_str, mcp7940n.get_date());
				// init check rtc tick count
				chkrtc_tickcnt = get_tickcnt();
				state = s_idle;
			}
			break;

		case s_idle:
			if (is_tickcnt_elapsed(chkrtc_tickcnt, 1000)) {
				// re-init check rtc tick count
				chkrtc_tickcnt = get_tickcnt();
				// check if up to 24hrs passed
				if (strcmp(current_year_month_day_str, mcp7940n.get_date()) != 0) {
					// save current year,month,day string
					strcpy(current_year_month_day_str, mcp7940n.get_date());
					// reset rain gauge for 24hrs.
					reset_rain_gauge();
				}
			}
			break;

		case s_error:
			// set error flag
			error = true;
			// clear initialized flag
			initialized = false;
			// get current tickcnt
			tickcnt = get_tickcnt();
			// goto wait and retry with detect state
			state = s_wait;
			break;

		case s_wait:
			// delay 1000ms before retry detect
			if (is_tickcnt_elapsed(tickcnt, 1000)) {
				state = s_detect;
			}
			break;
	}
}

double ADSWS1_RG::get_rain_gauge_mm(void) {
	double val;

	// atomic read
	gpio_intr_disable(sensor_gpio);
	val = rain_gauge;
	gpio_intr_enable(sensor_gpio);

	return val;
}

int ADSWS1_RG::get_rain_gauge_counter(void) {
	int val;

	// atomic read
	gpio_intr_disable(sensor_gpio);
	val = rain_gauge_counter;
	gpio_intr_enable(sensor_gpio);

	return val;
}
