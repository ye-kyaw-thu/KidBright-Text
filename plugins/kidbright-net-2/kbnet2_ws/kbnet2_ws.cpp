#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "driver/gpio.h"
#include "esp_intr_alloc.h"
#include "esp_system.h"
#include "esp_timer.h"
#include "kidbright32.h"
#include "kbnet2_ws.h"

#undef __DEBUG__
//#define __DEBUG__

#define DEBOUNCE_US		5000	// 5 ms debounce for reed bounce

typedef struct {
	uint32_t pulses;
	float freq_hz_avg;
	float wind_avg;
	float wind_instant;
} wind_result_t;

void IRAM_ATTR KBNET2_WS::gpio_isr_handler(void* arg) {
	KBNET2_WS *self = (KBNET2_WS *)(arg);

	int64_t now = esp_timer_get_time();
	int64_t dt = now - self->last_pulse_time;

	if (dt > DEBOUNCE_US) {   // debounce
		self->pulse_count++;
		if (self->last_pulse_time > 0)
			self->last_period = dt;
		self->last_pulse_time = now;
	}
}

void KBNET2_WS::periodic_timer_callback(void* arg) {
	KBNET2_WS *self = (KBNET2_WS *)(arg);

	// Snapshot & reset
	uint32_t count = __atomic_exchange_n(&self->pulse_count, 0, __ATOMIC_SEQ_CST);

	float freq_hz_avg = (float)count / self->capture_window;
	float wind_avg = freq_hz_avg * self->wind_coeff;

	// Instant method from last_period (timeout → 0)
	float instant = 0;
	int64_t now = esp_timer_get_time();
	if (self->last_period > 0 && self->last_pulse_time > 0) {
		int64_t silence = now - self->last_pulse_time;

		// adaptive cutoff but capped
		int64_t cutoff = (self->last_period > 0) ? (3 * self->last_period) : 2000000;
		if (silence < cutoff) {
			float freq_hz = 1e6f / (float)self->last_period;
			instant = freq_hz * self->wind_coeff;
		}
		else {
			instant = 0; // too long silence -> zero
		}
	}

	wind_result_t result = {
		.pulses        = count,
		.freq_hz_avg   = freq_hz_avg,
		.wind_avg      = wind_avg,
		.wind_instant  = instant
	};

	if (self->ws_queue) {
		xQueueOverwrite(self->ws_queue, &result);
	}
}

void KBNET2_WS::wind_task(void* arg) {
	KBNET2_WS *self = (KBNET2_WS *)(arg);

	wind_result_t res;
	float filtered_instant = 0; 
	const float ALPHA = 0.2f;   // smoothing factor

	while (1) {
		if (xQueueReceive(self->ws_queue, &res, portMAX_DELAY)) {
			float chosen_wind;

			// 1) immediate zero when no pulses detected
			//	- in periodic_timer_callback, you’re already setting instant = 0 if silence > cutoff.
			//	- in the consumer task, instead of smoothing towards it slowly, you can drop to zero instantly when you know the rotor has stopped
			/*if (res.wind_instant > 0.01f) {
				// Smooth while spinning
				filtered_instant = (1.0f - ALPHA) * filtered_instant + ALPHA * res.wind_instant;
				chosen_wind = filtered_instant;
			}
			else {
				// Rotor silent -> immediate zero
				chosen_wind = 0; 
				filtered_instant = 0; // reset filter baseline
			}*/
			
			// 2) hybrid: decay faster on stop
			//	- If you like a soft slowdown (not a harsh drop), you can switch to a much bigger ALPHA (like 0.8, i.e. 80% reset per update) when instant == 0, so it decays quickly
			if (res.wind_instant > 0.01f) {
				filtered_instant = (1 - ALPHA) * filtered_instant + ALPHA * res.wind_instant;
				chosen_wind = filtered_instant;
			}
			else {
				//filtered_instant *= 0.2f;   // accelerate toward zero
				filtered_instant *= 0.1f;   // accelerate toward zero
				chosen_wind = filtered_instant;
			}
			
			// 3) average pulses as fallback
			//	- right now, when instant == 0, you take res.wind_avg. but if no pulses in last window, res.pulses == 0, so wind_avg is also 0.
			//	- but because you kept blending with old filtered_instant, you got the slow ramp down. instead, use avg directly
			/*if (res.wind_instant > 0.01f) {
				filtered_instant = (1 - ALPHA) * filtered_instant + ALPHA * res.wind_instant;
				chosen_wind = filtered_instant;
			}
			else {
				chosen_wind = res.wind_avg;  // should be 0 when rotor stopped
				filtered_instant = chosen_wind;
			}*/

			#ifdef __DEBUG__
			printf("Avg=%.2f km/h, Instant=%.2f km/h -> Using=%.2f km/h (pulses=%u)\n", res.wind_avg, res.wind_instant, chosen_wind, res.pulses);
			#endif

			self->wind_speed = (double)chosen_wind;
		}
	}
}
    
KBNET2_WS::KBNET2_WS() {
	// set sensor gpio
	address = GPIO_NUM_34;
	sensor_gpio = (gpio_num_t)GPIO_NUM_34;
	
	wind_coeff = 2.4f; // 1 Hz = 2.4 km/h
	capture_window = 0.5f; // 0.5 second window
}

void KBNET2_WS::init(void) {
	gpio_config_t io_conf = {};

	io_conf.intr_type = GPIO_INTR_POSEDGE;
	io_conf.mode = GPIO_MODE_INPUT;
	io_conf.pin_bit_mask = (1ULL << sensor_gpio);
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE;
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE;
	gpio_config(&io_conf);

	// isr service
	gpio_install_isr_service(0);
	gpio_isr_handler_add(sensor_gpio, gpio_isr_handler, this);

	// queue
	ws_queue = xQueueCreate(1, sizeof(wind_result_t)); // wind speed result

	// timer
	esp_timer_create_args_t timer_args = {
		.callback = &periodic_timer_callback,
		.arg = this,
		.dispatch_method = ESP_TIMER_TASK,
		.name = "ws_timer"
	};
	ESP_ERROR_CHECK(esp_timer_create(&timer_args, &periodic_timer));
	ESP_ERROR_CHECK(esp_timer_start_periodic(
	periodic_timer, (uint64_t)(capture_window * 1e6)));

	// task
	xTaskCreate(&wind_task, "ws_task", 2048, this, 5, NULL);
	
	wind_speed = 0;
	state = s_detect;
}

int KBNET2_WS::prop_count(void) {
	return 1;
}

bool KBNET2_WS::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "wind_speed");
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_WS::prop_unit(int index, char *unit) {
	if (index == 0) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "km/h");
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_WS::prop_attr(int index, char *attr) {
	if (index == 0) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_WS::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", wind_speed);
		return true;
	}

	// not supported
	return false;
}

bool KBNET2_WS::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET2_WS::process(Driver *drv) {
	switch (state) {
		case s_detect:
			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;
			// go to idle state
			state = s_idle;
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
			
		case s_idle:
			break;
	}
}

double KBNET2_WS::get_wind_speed_km_h(void) {
	return wind_speed;
}

char *KBNET2_WS::get_wind_speed_km_h_text(int precision) {
	char fmt[8];

	if (precision < 0) {
		strcpy(fmt, "%.0f");
	}
	else
	if (precision > 6) {
		strcpy(fmt, "%.6f");
	}
	else {
		snprintf(fmt, sizeof(fmt) - 1, "%%.%df", precision);
	}

	snprintf(wind_speed_text, sizeof(wind_speed_text) - 1, fmt, wind_speed);

	return wind_speed_text;
}    
