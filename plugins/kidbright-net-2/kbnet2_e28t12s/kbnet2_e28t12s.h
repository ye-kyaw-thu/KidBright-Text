#ifndef __KBNET2_E28T12S_H__
#define __KBNET2_E28T12S_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"

/*#define MAX_AT_COMMAND_CHAR			32
#define MAX_AT_CHAR_PER_LINE		128
#define MAX_AT_LINE					16
#define MAX_CONFIG_LINE				8*/

#define MAX_ABP_KEY_CHAR			64
#define MAX_CHAR_PER_LINE			64
#define MAX_E28_FRAME_NUM			16
#define DEFAULT_RATE_LIMIT_MS		59000	// 60 seconds rate limit (-1 for tick count compensation)

#define	FRAME_01_SIZE				29
#define	MAX_ASCII_FRAME_SIZE		64 // maximum ascii length for all frame type (> frame size * 2)

typedef struct mac_address_struct {
	uint8_t wifi_sta[6];
    uint8_t wifi_softap[6];
    uint8_t bluetooth[6];
    uint8_t ethernet[6];
} mac_address_t;

typedef enum {
	m_configuration, m_transmission
} e28_mode_t;

typedef struct {
	uint8_t data[MAX_CHAR_PER_LINE];
	int length;
} e28_frame_t;

typedef struct {
    uint8_t data[MAX_ASCII_FRAME_SIZE];
    uint16_t length;
} ascii_frame_t;

class KBNET2_E28T12S : public Device {
	private:
		// properties		
		mac_address_t mac_address;
		char NWKSKEY[MAX_ABP_KEY_CHAR];	
		uint8_t aes_key[16]; // AES-128 key	
		int tx_power;
		int rf_frequency;
		bool standby_flag;
		xQueueHandle send_queue = NULL;
		ascii_frame_t curr_ascii_frame;
		void command(char *cmd);

	public:
		enum {
			s_detect, s_power_on, s_reset, s_read_version, s_read_config, s_write_config, s_transmission_mode, s_operation,
			s_wait_aux, s_wait_uart_reply, s_error, s_wait, s_idle, s_standby
		} state, next_state;	
		TickType_t tickcnt, led_tickcnt, sleep_tickcnt;
		TickType_t rate_limit_tickcnt, current_rate_limit_tickcnt;
		bool first_send_flag;
		bool config_changed_flag;
		uint32_t led_level;

		/*at_line_t at_lines[MAX_AT_LINE];
		uint8_t at_line_head_index;
		uint8_t at_line_tail_index;
		char current_chk_cmd[MAX_AT_CHAR_PER_LINE];
		char current_wait_reply[MAX_AT_CHAR_PER_LINE];
		char current_set_cmd[MAX_AT_CHAR_PER_LINE];		
		char send_buffer[MAX_AT_CHAR_PER_LINE];*/
		
		e28_frame_t e28_frames[MAX_E28_FRAME_NUM];
		e28_frame_t reply_frame;
		int e28_frame_index_head;
		int e28_frame_index_tail;
		uint8_t wait_reply_byte;
		bool wait_reply_flag = false;
		
		void led_set_level(uint32_t lvl);
		// constructor
		KBNET2_E28T12S(int tx_pwr, int rf_freq, char *nwkskey);
		// override
		void init(void);
		void process(Driver *drv);
		int prop_count(void);
		bool prop_name(int index, char *name);
		bool prop_unit(int index, char *unit);
		bool prop_attr(int index, char *attr);
		bool prop_read(int index, char *value);
		bool prop_write(int index, char *value);
		void standby_enable(void) override;
		bool standby_ready(void) override;
		// method		
		//at_line_begin_t at_line_check(bool match_all_flag, char *str, TickType_t *timeout_tickcnt, TickType_t timeout, char *rx_str);
		//char *get_str_at_char(char *str, char ch);
		bool send_01(double temperature, double humidity, double wind_speed, double wind_direction, double rain_volume, uint16_t pm25, uint16_t pm10);
};

#endif
