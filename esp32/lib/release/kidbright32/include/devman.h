#ifndef __DEVMAN_H__
#define __DEVMAN_H__

#include "device.h"

typedef enum {
	DEV_IO,
    DEV_I2C0,
	DEV_I2C1,
	DEV_SPI
} driver_t;

int devman_add(driver_t drv, Device *dev);
int devman_count(driver_t drv);
void devman_start(void);
bool devman_ready(void);
void devman_init(void);

#endif
