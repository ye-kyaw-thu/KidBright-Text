#ifndef __SPIDEV_H__
#define __SPIDEV_H__

#include "driver/spi_master.h"
#include "driver.h"

//#define I2C_CMD_TIMEOUT_MS					50

class SPIDev : public Driver {
	private:
		gpio_num_t miso, mosi, clk, cs;
		int max_transfer_sz;
		int speed;
		spi_device_handle_t spi;
		esp_err_t ch_sw(int ch, bool on_off);

	public:
		SPIDev(gpio_num_t _miso, gpio_num_t _mosi, gpio_num_t _clk, gpio_num_t _cs, int _max_transfer_sz, int _speed);
		esp_err_t init(void);
		esp_err_t detect(int ch, int addr);
		esp_err_t write(int ch, int addr, uint8_t *data, size_t data_size);
		esp_err_t read(int ch, int addr, uint8_t *pointer, size_t pointer_size, uint8_t *data, size_t data_size);
};

#endif
