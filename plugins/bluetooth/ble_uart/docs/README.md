# BLE UART plugin

### การสื่อสารผ่านบลูทูธแบบ BLE UART
- รับส่งข้อมูลผ่านการสื่อสารแบบบลูทูธ (Bluetooth)
- การรับข้อมูลเมื่อมีข้อมูลเข้ามา (Event Based)
- การส่งข้อมูลเป็นแบบตัวอักษรหรือตัวเลข

### สถานะการเชื่อมต่อบลูทูธใช้แอลอีดีสีฟ้า (BT) บนบอร์ด KidBright
- ไม่มีการเชื่อมต่อ แอลอีดีกระพริบ
- การเชื่อมต่อสำเร็จ แอลอีดีติดค้าง

### บล๊อก
- หมวด Bluetooth
- บล๊อก BLE UART On Data สำหรับกำหนดขอบเขตโปรแกรมที่เขียนเพื่อให้ทำงานเมื่อมีข้อมูลเข้ามา
- บล๊อก BLE UART Read Text สำหรับอ่านค่าข้อมูลที่รับได้
- บล๊อก BLE UART Send สำหรับส่งตัวอักษรหรือตัวเลข

![BLE UART Blocks](images/ble_uart_blocks.png)

### การทดสอบ
- ทดสอบคู่กับแอพพลิเคชั่น nRF Toolbox บนสมาร์ทโฟน

![nRF Toolbox](images/ble_uart_nrf_toolbox.png)

- กดปุ่มเลือก UART

![nRF Toolbox UART Button](images/ble_uart_nrf_toolbox_edit_1.png)

### เพิ่มปุ่มสำหรับส่งตัวอักษรบน nRF Toolbox ไปยังบอร์ด KidBright
- กดปุ่ม EDIT

![nRF Toolbox Edit](images/ble_uart_nrf_toolbox_edit_2.png)

- เลือกกดปุ่มสีส้มเพื่อกำหนดตัวอักษรที่จะส่ง แล้วพิมพ์ตัวอักษรและเลือกรูปไอคอนประจำปุ่ม

![nRF Toolbox Edit](images/ble_uart_nrf_toolbox_edit_3.png)

- กดปุ่ม DONE

![nRF Toolbox Edit](images/ble_uart_nrf_toolbox_edit_5.png)

### ตัวอย่างโปรแกรมแบบที่ 1
- แสดงข้อมูลที่รับเข้ามาเป็นตัวอักษรวิ่งบนจอภาพ
- ส่งข้อมูลตัวอักษร "Hello World!" ออกไปทุกๆ 5 วินาที

![BLE UART Example 1](images/ble_uart_example_1.png)

- การเชื่อมต่อ nRF Toolbox กับบอร์ด KidBright ให้กดปุ่ม Connect แล้วเลือกชื่อบอร์ด KidBright แสดงด้วยตัวอักษร BLEUART แล้วตามด้วยเลขฐานสิบหกของ MAC Address ของบอร์ด 3 ไบท์สุดท้ายบวกด้วย 2

![nRF Toolbox Connect](images/ble_uart_nrf_toolbox_connect.png)

- เปิดหน้าแสดงการรับข้อมูลของ nRF Toolbox โดยสไลด์หน้าจอไปทางขวา

![nRF Toolbox Logs](images/ble_uart_nrf_toolbox_logs_helloworld.png)

- กดปุ่มที่สร้างให้ส่งข้อความใน nRF Toolbox เพื่อส่งข้อความไปแสดงบนหน้าจอบอร์ด KidBright

### ตัวอย่างโปรแกรมแบบที่ 2
- แสดงข้อมูลที่รับเข้ามาเป็นตัวอักษรวิ่งบนจอภาพ
- ส่งข้อมูลเซ็นเซอร์วัดอุณหภูมิบนบอร์ด KidBright ออกไปทุกๆ 5 วินาที

![BLE UART Example 1](images/ble_uart_example_2.png)

- เปิดหน้าแสดงการรับข้อมูลของ nRF Toolbox โดยสไลด์หน้าจอไปทางขวา

![nRF Toolbox Logs](images/ble_uart_nrf_toolbox_logs_temperature.png)

- กดปุ่มที่สร้างให้ส่งข้อความใน nRF Toolbox เพื่อส่งข้อความไปแสดงบนหน้าจอบอร์ด KidBright
