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

### วิธีติดตั้งสำหรับ Ubuntu 20.04
```
cd /home/$USER
wget https://nodejs.org/dist/v8.17.0/node-v8.17.0-linux-x64.tar.gz
tar xzvf node-v8.17.0-linux-x64.tar.gz
echo 'export PATH=$PATH:/home/$USER/node-v8.17.0-linux-x64/bin' >> /home/$USER/.bashrc

sudo apt install python3-pip
sudo pip3 install pyserial
sudo ln -s /usr/bin/python3 /usr/local/sbin/python
sudo usermod -a -G dialout $USER
sudo shutdown -r now

cd /home/$USER
git clone https://gitlab.com/kidbright/kbide --recursive
npm run build
```

การรันโปรแกรม
```
cd /home/$USER/kbide
npm start
```

เปิด Web Browser แล้วพิมพ์ http://localhost:8000 เพื่อใช้งาน KidBrightIDE

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
