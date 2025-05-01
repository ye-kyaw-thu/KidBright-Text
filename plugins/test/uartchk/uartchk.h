#ifndef __UARTCHK_H__
#define __UARTCHK_H__

#include "driver.h"
#include "device.h"
#include "driver/gpio.h"
#include "driver/uart.h"

#define MAX_AT_CHAR_PER_LINE		128
#define MAX_AT_LINE					16

typedef struct at_line_struct {
	char line[MAX_AT_CHAR_PER_LINE];
} at_line_t;

typedef enum { 
    alb_ok,
	alb_wait,
    alb_timeout
} at_line_begin_t;

class UARTCHK : public Device {
	private:
		// properties
		enum {
			s_detect, s_idle
		} state;		
		at_line_begin_t at_line_check(bool match_all_flag, char *str, TickType_t *timeout_tickcnt, TickType_t timeout, char *rx_str);

	public:
		TickType_t tickcnt;
		uart_port_t uart_num;
		int tx_gpio;
		int rx_gpio;
		gpio_num_t pwr_en_gpio;
		at_line_t at_lines[MAX_AT_LINE];
		uint8_t at_line_head_index;
		uint8_t at_line_tail_index;
		// constructor
		UARTCHK(uart_port_t _uart_num, int _tx_gpio, int _rx_gpio, gpio_num_t _pwr_en_gpio);
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
		bool check(void);
};

#endif
