# kbide

node application สำหรับ kidbright ide

ความต้องการ
- node.js 8
- python
- pyserial

วิธีติดตั้ง
```
git clone https://gitlab.com/kidbright/kbide --recursive
cd kbide
npm run build
```

การรันโปรแกรมใช้คำสั่ง
```
npm start
```

### KidBright Engine

- รายละเอียดวงจร การต่อขยายฮาร์ดแวร์ การออกแบบซอฟท์แวร์ ของ KidBright

	https://gitlab.com/kidbright/kbide/tree/master/docs

### KidBright Plug-ins

- ตัวอย่างพร้อมคำอธิบายการสร้าง KidBright Plug-ins

	https://gitlab.com/kidbright/kbide/tree/master/plugins/examples/blink/docs

- KidBright Plug-ins

	https://gitlab.com/kidbright/kbide/tree/master/plugins

- I2C Character LCD ใช้ชิพ MCP23017

	https://gitlab.com/kidbright/kbide/tree/master/plugins/display/lcd_i2c


- SPI Character LCD ใช้ชิพ MCP23S17

	https://gitlab.com/kidbright/kbide/tree/master/plugins/display/lcd_spi

- 16-Input SPI GPIO ใช้ชิพ MCP23S17

	https://gitlab.com/kidbright/kbide/tree/master/plugins/gpio/mcp23s17_16in

- 16-Output SPI GPIO ใช้ชิพ MCP23S17

	https://gitlab.com/kidbright/kbide/tree/master/plugins/gpio/mcp23s17_16out

- Temperature/Humidity Sensor ใช้ชิพ SHT31

	https://gitlab.com/kidbright/kbide/tree/master/plugins/weather_sensors/sht31

- Temperature/Humidity Sensor ใช้ชิพ si7021

	https://gitlab.com/kidbright/kbide/tree/master/plugins/weather_sensors/si7021

- Light Sensor ใช้ชิพ TSL2561

	https://gitlab.com/kidbright/kbide/tree/master/plugins/weather_sensors/tsl2561

- Anemometer (Wind Speed) โมดูล ADS-WS1

	https://gitlab.com/kidbright/kbide/tree/master/plugins/weather_sensors/adsws1_ws
