#ifndef __BLE_UART_H__
#define __BLE_UART_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"
// bluedroid
#include "esp_bt.h"
#include "bta_api.h"
#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#include "esp_bt_defs.h"
#include "esp_bt_main.h"

#define GATTS_CHAR_NUM              2
#define GATTS_NUM_HANDLE            (1 + (3 * GATTS_CHAR_NUM))
#define BLE_MANUFACTURER_DATA_LEN   4
#define GATTS_CHAR_VAL_LEN_MAX      22
#define BLE_PROFILE_APP_ID          0
#define BLE_SERVICE_UUID_SIZE		ESP_UUID_LEN_128

typedef void(*BLE_UART_ON_DATA_CB)();
static BLE_UART_ON_DATA_CB on_data_cb = NULL;
static char data_buffer[256], read_data_buffer[256];

class BLE_UART : public Device {
	private:
		// properties
		enum {
			s_detect, s_blink
		} state;
		int led_status;
	public:		
		TickType_t tickcnt;		
		// constructor
		BLE_UART(void);
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
		bool is_connected(void);		
		void on_data(BLE_UART_ON_DATA_CB callback);
		char *read_text(void);
		double read_number(void);
		void send(char *str);
		void send(double val);
};

#endif
