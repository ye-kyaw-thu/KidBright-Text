# kbide2 beta

node application สำหรับ kidbright ide 2.0 beta
- รองรับ node.js เวอร์ชั่นใหม่
- รองรับการแสดงผล debugging serial port และ compiler error messages ผ่านทาง console developer tools (ที่ Chrome Browser เปิดดูด้วย Ctrl-Shift-J)
- plugins รองรับการใช้ static link library ไฟล์นามสกุล .a

ความต้องการ
- node.js 18
- python
- pyserial

### วิธีติดตั้งสำหรับ Ubuntu
```
cd /home/$USER
wget https://nodejs.org/dist/v18.12.1/node-v18.12.1-linux-x64.tar.gz
tar xzvf node-v18.12.1-linux-x64.tar.gz
echo 'export PATH=$PATH:/home/$USER/node-v18.12.1-linux-x64/bin' >> /home/$USER/.bashrc

sudo apt install python3-pip
sudo pip3 install pyserial
sudo ln -s /usr/bin/python3 /usr/local/sbin/python
sudo usermod -a -G dialout $USER
sudo shutdown -r now

cd /home/$USER
git clone https://gitlab.com/kidbright/kbide kbide
cd kbide
tar xzvf kbide2_beta/kbide2_beta_patch.tgz
npm run build
```

การรันโปรแกรม
```
cd /home/$USER/kbide
npm start
```

เปิด Web Browser แล้วพิมพ์ http://localhost:8000 เพื่อใช้งาน KidBrightIDE

### วิธีติดตั้งสำหรับ Windows
- ดาวน์โหลดและติดตั้ง node.js 18

	https://nodejs.org/dist/v18.12.1/node-v18.12.1-x64.msi

- ดาวน์โหลดและติดตั้ง (unzip) kbide source code

	https://gitlab.com/kidbright/kbide/-/archive/master/kbide-master.zip

- เปิด command prompt รันคำสั่ง
	```	
	tar -xf kbide-master.zip
	cd kbide-master
	tar -xf kbide2_beta\kbide2_beta_patch.tgz
	npm run build
	npm start
	```
