#ifndef __HPMA115S0_H__
#define __HPMA115S0_H__

#include "driver.h"
#include "device.h"

#define HPMA115S0_POLLING_MS 1000

class HPMA115S0 : public Device
{
private:
	enum
	{
		s_detect,
		s_power_on,
		s_autosend_stop,
		s_cmd_stop,
		s_cmd_start,
		s_cmd_read,
		s_error,
		s_wait,
		s_idle
	} state;
	TickType_t tickcnt;
	int tx_pin;
	int rx_pin;
	int pm2_5;
	int pm10;
	int error_count;
	int error_clear_count;
	int retry_count;

	bool command(const uint8_t *cmd);
	bool read(int *pm2_5_val, int *pm10_val);

public:
	// constructor
	HPMA115S0(int tx_io, int rx_io);
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
	int get_pm2_5(void);
	int get_pm10(void);
	int get_error_count(void);
	int get_error_clear_count(void);
};

#endif
