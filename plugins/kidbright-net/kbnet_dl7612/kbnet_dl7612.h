#ifndef __KBNET_DL7612_H__
#define __KBNET_DL7612_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"

#define MAX_ABP_KEY_CHAR			64
#define MAX_AT_COMMAND_CHAR			32
#define MAX_AT_CHAR_PER_LINE		128
#define MAX_AT_LINE					16
#define MAX_CONFIG_LINE				8
#define DEFAULT_RATE_LIMIT_MS		59000	// 60 seconds rate limit (-1 for tick count compensation)

typedef struct mac_address_struct {
	uint8_t wifi_sta[6];
    uint8_t wifi_softap[6];
    uint8_t bluetooth[6];
    uint8_t ethernet[6];
} mac_address_t;

typedef struct config_struct {
	char at_command[MAX_AT_COMMAND_CHAR];
	char value[MAX_ABP_KEY_CHAR];
} config_t;

typedef struct at_line_struct {
	char line[MAX_AT_CHAR_PER_LINE];
} at_line_t;

typedef enum { 
    alb_ok,
	alb_wait,
    alb_timeout
} at_line_begin_t;

class KBNET_DL7612 : public Device {
	private:
		// properties
		enum {
			s_detect, s_qc_test, s_power_on, s_at_cmd_chk, s_init, s_reboot_wait, s_config_chk, s_config_wait, s_config_delay_set, s_config_set,
			s_cmd_delay, s_cmd_wait, s_cmd_wait_ok, s_error, s_wait, s_idle
		} state;
		mac_address_t mac_address;
		char APPSKEY[MAX_ABP_KEY_CHAR];
		char NWKSKEY[MAX_ABP_KEY_CHAR];
		config_t configs[MAX_CONFIG_LINE];
		int curr_config_index;
		int tx_power_index;
		bool qc_test_sw_enabled;
		void command(char *cmd);
	public:
		TickType_t tickcnt, led_tickcnt;
		TickType_t rate_limit_tickcnt, current_rate_limit_tickcnt;
		bool first_send_flag;
		bool config_changed_flag;
		uint32_t led_level;
		at_line_t at_lines[MAX_AT_LINE];
		uint8_t at_line_head_index;
		uint8_t at_line_tail_index;
		char current_chk_cmd[MAX_AT_CHAR_PER_LINE];
		char current_wait_reply[MAX_AT_CHAR_PER_LINE];
		char current_set_cmd[MAX_AT_CHAR_PER_LINE];		
		char send_buffer[MAX_AT_CHAR_PER_LINE];
		void led_set_level(uint32_t lvl);
		// constructor
		KBNET_DL7612(char *appskey, char *nwkskey, int _tx_power_index);
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
		at_line_begin_t at_line_check(bool match_all_flag, char *str, TickType_t *timeout_tickcnt, TickType_t timeout, char *rx_str);
		char *get_str_at_char(char *str, char ch);
		bool send_01(double temperature, double humidity, double wind_speed, double wind_direction, double rain_volume);
		bool send_02(uint32_t flags, double temperature, double humidity, double wind_speed, double wind_direction, double rain_volume, double light, double pm2_5, double pm10);
};

#endif
