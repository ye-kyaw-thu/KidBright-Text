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

### วิธีติดตั้งสำหรับ Windows
- ดาวน์โหลดและติดตั้ง node.js 8

	https://nodejs.org/dist/v8.17.0/node-v8.17.0-x64.msi

- ดาวน์โหลดและติดตั้ง (unzip) kbide source code

	https://gitlab.com/kidbright/kbide/-/archive/master/kbide-master.zip

- เปิด command prompt รันคำสั่ง
	```
	cd kbide-master
	npm run build
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

- Anemometer (Wind Speed) โมดูล ADS-WS1 (ตัวอย่างการใช้งาน [GPIO Interrupt](https://gitlab.com/kidbright/kbide/-/blob/master/plugins/weather_sensors/adsws1_ws/adsws1_ws.cpp#L9))

	https://gitlab.com/kidbright/kbide/tree/master/plugins/weather_sensors/adsws1_ws

- Bluetooth BLE UART (ตัวอย่างการสร้างบล็อกแบบ [Event-Driven](https://gitlab.com/kidbright/kbide/-/tree/master/plugins/bluetooth/ble_uart/docs#%E0%B8%9A%E0%B8%A5%E0%B9%8A%E0%B8%AD%E0%B8%81) โดยใช้ [C++ Lambda Expression](https://gitlab.com/kidbright/kbide/-/blob/master/plugins/bluetooth/ble_uart/generators.js#L2))

	https://gitlab.com/kidbright/kbide/-/tree/master/plugins/bluetooth/ble_uart

- I2C Character LCD ใช้ชิพ MCP23017 (ตัวอย่างการสร้าง [Shadow Block](https://developers.google.com/blockly/guides/configure/web/toolbox#shadow_blocks) - [Custom xmlToolbox](https://gitlab.com/kidbright/kbide/-/blob/master/plugins/display/lcd_i2c/blocks.js#L92) - [Shadow Type Generator](https://gitlab.com/kidbright/kbide/-/blob/master/plugins/display/lcd_i2c/generators.js#L33))

	https://gitlab.com/kidbright/kbide/tree/master/plugins/display/lcd_i2c

### Plug-ins Debugging

- ใช้คำสั่ง printf หรือ ESP32 Logging Library
- คำสั่ง printf ต้องมี "\n" ลงท้ายในแต่ละคำสั่งด้วย เพื่อสั่งให้ตัวอักษรถูก flush ออกไปทาง serial port
- ผลลัพธ์ส่งออกทาง serial port ของ usb to serial ที่ใช้ต่อเพื่อโปรแกรมบอร์ด KidBright
- *** ข้อควรระวัง ต้องไม่เปิดโปรแกรม Serial Terminal ค้างไว้ ระหว่างการโหลดโปรแกรมเข้าบอร์ด KidBright ซึ่งจะทำให้โปรแกรม kbide ที่ด้วยคำสั่ง npm start จาก command prompt ปิดไป แก้ไขด้วยการพิมพ์คำสั่งให้รันใหม่อีกครั้ง

