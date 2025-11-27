#ifndef __KBNET2_PMS9103M_PMS7003_H__
#define __KBNET2_PMS9103M_PMS7003_H__

#include "driver.h"
#include "device.h"

#define KBNET2_PMS9103M_POLLING_MS 1000

class KBNET2_PMS9103M : public Device
{
private:
	enum
	{
		s_detect, s_power_on, s_power_off, s_idle, s_standby
	} state;
	TickType_t tickcnt;
	uint16_t pm1_0;
	uint16_t pm2_5;
	uint16_t pm10;
	int error_count;
	int error_clear_count;
	int retry_count;
	bool standby_flag;

public:
	// constructor
	KBNET2_PMS9103M(void);
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
	void read(uint8_t *data);
	uint16_t get_pm1_0(void);
	uint16_t get_pm2_5(void);
	uint16_t get_pm10(void);
	void power_off(void);
};

#endif
