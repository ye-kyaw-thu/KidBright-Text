#ifndef __KBNET2_WS_H__
#define __KBNET2_WS_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"

// ads-ws1 anemometer (wind speed)
class KBNET2_WS : public Device {
	private:
		enum {
			s_detect, s_error, s_wait, s_idle
		} state;
		gpio_num_t sensor_gpio;

		float wind_coeff;
		float capture_window;
		volatile uint32_t pulse_count = 0;
		volatile int64_t last_pulse_time = 0;
		volatile int64_t last_period = 0;
		QueueHandle_t ws_queue = nullptr;
		esp_timer_handle_t periodic_timer = nullptr;
		static void IRAM_ATTR gpio_isr_handler(void* arg);
		static void periodic_timer_callback(void* arg);
		static void wind_task(void* arg);

	public:
		TickType_t tickcnt;
		double wind_speed;
		char wind_speed_text[64];
		// constructor
		KBNET2_WS(void);
		// override
		void init(void);
		void process(Driver *drv);
		int prop_count(void);
		bool prop_name(int index, char *name);
		bool prop_unit(int index, char *unit);
		bool prop_attr(int index, char *attr);
		bool prop_read(int index, char *value);
		bool prop_write(int index, char *value);
		// method
		double get_wind_speed_km_h(void);
		char *get_wind_speed_km_h_text(int precision);
};

#endif
