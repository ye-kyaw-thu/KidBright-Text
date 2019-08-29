#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "kidbright32.h"
#include "pulse_cap.h"

#define ESP_INTR_FLAG_DEFAULT 	0

static xQueueHandle ic_sem;

static void IRAM_ATTR pulse_cap_gpio_isr_handler(void *arg) {
	PULSE_CAP *pulse_cap = (PULSE_CAP *)arg;
    int64_t ts = esp_timer_get_time(); // int64_t = 2^63÷10^6÷(24×60×60)÷365 = 292471.208677536 years

	if (pulse_cap->capture_ts == 0) {
		pulse_cap->capture_ts = ts;
	}
	else {
		pulse_cap->capture_ts = ts - pulse_cap->capture_ts;
	}

	// give the semaphore, https://github.com/espressif/esp-idf/blob/master/examples/peripherals/spi_slave/sender/main/app_main.c#L76
    BaseType_t yield_flag = false;
    xSemaphoreGiveFromISR(ic_sem, &yield_flag);
    if (yield_flag) {
		portYIELD_FROM_ISR();
	}
}

PULSE_CAP::PULSE_CAP(int start_input, int stop_input) {
	start_gpio = (gpio_num_t)start_input;
	stop_gpio = (gpio_num_t)stop_input;
}

void PULSE_CAP::init(void) {
	gpio_config_t io_conf;

	// disable start/stop input capture interrupt
	gpio_intr_disable(start_gpio);
	gpio_intr_disable(stop_gpio);

	// gpio init
	io_conf.intr_type = GPIO_INTR_DISABLE; // rising edge interrupt (GPIO_INTR_DISABLE | GPIO_INTR_POSEDGE | GPIO_INTR_NEGEDGE | GPIO_INTR_ANYEDGE | GPIO_INTR_LOW_LEVEL | GPIO_INTR_HIGH_LEVEL)
	io_conf.mode = GPIO_MODE_INPUT; // set as input mode
	io_conf.pin_bit_mask = (1ULL << start_gpio) | (1ULL << stop_gpio); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_ENABLE; // enable pull-up mode
	gpio_config(&io_conf);

	// create the semaphore
    ic_sem = xSemaphoreCreateBinary();

	// install gpio isr service
	gpio_install_isr_service(ESP_INTR_FLAG_DEFAULT);
	// hook start input capture isr handler
    gpio_isr_handler_add(start_gpio, pulse_cap_gpio_isr_handler, (void *)this);
	// hook stop input capture isr handler
	if (stop_gpio != start_gpio) {
		gpio_isr_handler_add(stop_gpio, pulse_cap_gpio_isr_handler, (void *)this);
	}

	// clear error flag
	error = false;
	// set initialized flag
	initialized = true;
}

int PULSE_CAP::prop_count(void) {
	// not supported
	return 0;
}

bool PULSE_CAP::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool PULSE_CAP::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool PULSE_CAP::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool PULSE_CAP::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool PULSE_CAP::prop_write(int index, char *value) {
	// not supported
	return false;
}

void PULSE_CAP::process(Driver *drv) {
	//
}

double PULSE_CAP::read(gpio_int_type_t start_intr_type, gpio_int_type_t stop_intr_type, uint32_t timeout_ms) {
	double val = 0;

	// init capture timestamp
	capture_ts = 0;

	// update start gpio interrupt type
	gpio_set_intr_type(start_gpio, start_intr_type);
	// enable start input capture interrupt
	gpio_intr_enable(start_gpio);

	if (xSemaphoreTake(ic_sem, timeout_ms / portTICK_RATE_MS) == pdTRUE) {
		if (stop_gpio == start_gpio) {
			// update start gpio interrupt type
			gpio_set_intr_type(start_gpio, stop_intr_type);
			// https://github.com/espressif/esp-idf/blob/master/examples/peripherals/spi_slave/sender/main/app_main.c#L152
			if (xSemaphoreTake(ic_sem, timeout_ms / portTICK_RATE_MS) == pdTRUE) {
				val = capture_ts;
			}
			// disable start input capture interrupt
			gpio_intr_disable(start_gpio);
		}
		else {
			// disable start input capture interrupt
			gpio_intr_disable(start_gpio);
			// update stop gpio interrupt type
			gpio_set_intr_type(stop_gpio, stop_intr_type);
			// enable stop input capture interrupt
			gpio_intr_enable(stop_gpio);

			if (xSemaphoreTake(ic_sem, timeout_ms / portTICK_RATE_MS) == pdTRUE) {
				val = capture_ts;
			}
			// disable stop input capture interrupt
			gpio_intr_disable(stop_gpio);
		}
	}
	else {
		// disable start input capture interrupt
		gpio_intr_disable(start_gpio);
	}

	return val;
}
