#include <stdio.h>
#include <string.h>
#include "esp_system.h"
//#include "esp_attr.h"
//#include "soc/rtc.h"
#include "mcpwm.h"
//#include "soc/mcpwm_periph.h"
#include "kidbright32.h"
#include "drv8833.h"

// drv8833 gpio assignment
#define GPIO_NSLEEP				GPIO_NUM_23
#define GPIO_A1					GPIO_NUM_18
#define GPIO_A2					GPIO_NUM_26 // OUT1
#define GPIO_B1					GPIO_NUM_19
#define GPIO_B2					GPIO_NUM_27 // OUT2

// pwm unit (MCPWM_UNIT_0 reserved for buzzer output)
#define DRV8833_MCPWM_UNIT		MCPWM_UNIT_1
// minimum driving duty cycle
#define DUTY_MIN				30

DRV8833::DRV8833(void) {
	//
}

// GPIO_PULLUP_DISABLE
// GPIO_PULLUP_ENABLE
// GPIO_PULLDOWN_DISABLE
// GPIO_PULLDOWN_ENABLE

void DRV8833::init_gpio(gpio_num_t gpio, int val) {
	gpio_config_t io_conf;

	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT; //set as output mode
	io_conf.pin_bit_mask = (1ULL << gpio); // bit mask of the pins that you want to set
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
	gpio_set_level(gpio, val); // load gpio value
	gpio_config(&io_conf);
}

void DRV8833::drv8833_nsleep(bool sleep) {
	if (sleep) {
		gpio_set_level(GPIO_NSLEEP, 0); // enable sleep
	}
	else {
		gpio_set_level(GPIO_NSLEEP, 1); // disable sleep
	}
}

void DRV8833::drv8833_stop_a(void) {
	// stop motor A1=1, A2=1
	 init_gpio(GPIO_A1, 1); // brake/slow decay
	 init_gpio(GPIO_A2, 0); // OUT is invert
}

void DRV8833::drv8833_stop_b(void) {
	// stop motor B1=1, B2=1
	init_gpio(GPIO_B1, 1); // brake/slow decay
	init_gpio(GPIO_B2, 0); // OUT is invert
}

int DRV8833::cmpr_calc(int duty) {
	if (duty < 0) {
		duty = (-1 * duty);
	}

	if (duty < DUTY_MIN) {
		duty = DUTY_MIN;
	}

	if (duty > 100) {
		duty = 100;
	}

	return (100 - duty);
}

void DRV8833::drv8833_pwm_ab(int da, int db) {
	mcpwm_pin_config_t pin_config;
	mcpwm_config_t pwm_config;
	bool a_flag, b_flag;

	a_flag = false;
	b_flag = false;

	// mcpwm gpio initialization
	memset(&pin_config, 0, sizeof(mcpwm_pin_config_t));

	// fixed missing output update
	//if (da != duty_a) {
		if (da != 0) {
			pin_config.mcpwm0a_out_num = (da > 0 ? GPIO_A1 : GPIO_A2);
			a_flag = true;
		}
		else {
			// da = 0, stop motor
			drv8833_stop_a();
			// update new duty cycle
			duty_a = da;
		}
	//}

	// fixed missing output update
	//if (db != duty_b) {
		if (db != 0) {
			//pin_config.mcpwm0b_out_num = (db > 0 ? GPIO_B1 : GPIO_B2);
			pin_config.mcpwm1a_out_num = (db > 0 ? GPIO_B1 : GPIO_B2);
			b_flag = true;
		}
		else {
			// db = 0, stop motor
			drv8833_stop_b();
			// update new duty cycle
			duty_b = db;
		}
	//}

	// if at least one duty cycle change
	if (a_flag || b_flag) {
		mcpwm_set_pin(DRV8833_MCPWM_UNIT, &pin_config);

		if (a_flag) {
			// mcpwm config initialization
			memset(&pwm_config, 0, sizeof(mcpwm_config_t));
			// initialize mcpwm configuration
			pwm_config.frequency = 1000; // frequency = 1000Hz
			pwm_config.cmpr_a = cmpr_calc(da); // calc compare value for specific duty cycle of PWM0A
			pwm_config.counter_mode = MCPWM_UP_COUNTER;
			pwm_config.duty_mode = (pin_config.mcpwm0a_out_num == GPIO_A1 ? MCPWM_DUTY_MODE_0 : MCPWM_DUTY_MODE_1); // set duty cycle phrase to normal or inverted
			mcpwm_init(DRV8833_MCPWM_UNIT, MCPWM_TIMER_0, &pwm_config);   // configure PWM0A above settings

			// update new duty cycle
			duty_a = da;
		}

		if (b_flag) {
			// mcpwm config initialization
			memset(&pwm_config, 0, sizeof(mcpwm_config_t));
			// initialize mcpwm configuration
			pwm_config.frequency = 1000; // frequency = 1000Hz
			pwm_config.cmpr_a = cmpr_calc(db); // calc compare value for specific duty cycle of PWM0B
			pwm_config.counter_mode = MCPWM_UP_COUNTER;
			pwm_config.duty_mode = (pin_config.mcpwm1a_out_num == GPIO_B1 ? MCPWM_DUTY_MODE_0 : MCPWM_DUTY_MODE_1); // set duty cycle phrase to normal or inverted
			mcpwm_init(DRV8833_MCPWM_UNIT, MCPWM_TIMER_1, &pwm_config);   // configure PWM0A above settings

			// update new duty cycle
			duty_b = db;
		}
	}
}

void DRV8833::init(void) {
	// init and enable nsleep gpio
	init_gpio(GPIO_NSLEEP, 0);
	drv8833_stop_a();
	drv8833_stop_b();
	// disable nsleep
	drv8833_nsleep(false);

	duty_a = 0;
	duty_b = 0;
	state = s_detect;
}

int DRV8833::prop_count(void) {
	// not supported
	return 0;
}

bool DRV8833::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool DRV8833::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool DRV8833::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool DRV8833::prop_read(int index, char *value) {
	// not supported			pwm_config.duty_// mcpwm gpio initialization
	return false;
}

bool DRV8833::prop_write(int index, char *value) {
	// not supported
	return false;
}

void DRV8833::process(Driver *drv) {

	switch (state) {
		case s_detect:
			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			state = s_idle;
			break;

		case s_idle:
			//
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

void DRV8833::move(int direction, int speed) {
	// absolute speed value
	if (speed < 0) {
		speed = (-1) * speed;
	}

	// movement at specific direction and speed
	switch (direction) {
		case 0: // forward
			drv8833_pwm_ab(speed, speed);

//			drv8833_pwm_ab(speed, 0);
//			drv8833_pwm_ab(0, speed);
//			drv8833_pwm_ab(speed, speed);

//			drv8833_pwm_ab(-1 * speed, 0);
//			drv8833_pwm_ab(0, -1 * speed);
//			drv8833_pwm_ab(-1 * speed, -1 * speed);

//			drv8833_pwm_ab(speed, -1 * speed);
//			drv8833_pwm_ab(-1 * speed, speed);

//			drv8833_pwm_ab(speed + 20, -1 * speed);
//			drv8833_pwm_ab(-1 * speed, speed + 20);

			break;

		case 1: // backward
			drv8833_pwm_ab(-1 * speed, -1 * speed);
			break;

		case 2: // left
			drv8833_pwm_ab(speed, -1 * speed);
			break;

		case 3: // right
			drv8833_pwm_ab(-1 * speed, speed);
			break;
	}

}

void DRV8833::stop(void) {
	// stop motor drive
	drv8833_stop_a();
	drv8833_stop_b();
}
