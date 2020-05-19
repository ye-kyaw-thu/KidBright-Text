#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "kidbright32.h"
#include "devman.h"
#include "ports.h"
#include "button12.h"
#include "ldr.h"
#include "sound.h"
#include "ht16k33.h"
#include "lm73.h"
#include "mcp7940n.h"
#include <math.h>

#include "nvs_flash.h"
#include "wificontroller.h"
#include "kbstring.h"
#include "kblist.h"
#include "ArduinoJson.h"
#include "netpieclient.h"
#include "kbiot.h"

#define KBSERIAL "30AEA432DB08"
#define CLIENTID "30AEA432DB08"
#define USERNAME "1d41463674ece3c1d44fa78bf1911246"
#define PASSWORD ""
#define CONFIG_WIFI_SSID "dookpahoo_2.4G"
#define CONFIG_WIFI_PASSWORD "26072527"

#define PI 3.14159265
// ==================================================================================
// on-board devices
// ==================================================================================
// i/o devices
PORTS ports = PORTS();
BUTTON12 button12 = BUTTON12();
LDR ldr = LDR();
SOUND sound = SOUND();
// i2c devices
HT16K33 ht16k33 = HT16K33(0, HT16K33_ONBOARD_ADDR);
LM73 lm73 = LM73(0, LM73_1_ONBOARD_ADDR);
MCP7940N mcp7940n = MCP7940N(0, MCP7940N_ONBOARD_ADDR);

// ==================================================================================
// plug-ins devices
// ==================================================================================

Kbstring kb_string;
Kblist kb_list;
char global_str[100];
double global_num[100];
void iotTask(void *pvParameters) {
  ESP_ERROR_CHECK( nvs_flash_erase() );
  ESP_ERROR_CHECK( nvs_flash_init() );
  wifi_sta_start(CONFIG_WIFI_SSID, CONFIG_WIFI_PASSWORD);
  netpie_subscribe("@msg/#");
//  netpie_connect("mqtt://mqtt.netpie.io:1883", "708acf2a-e97a-4dd7-85ca-599edb68faae", "HtksdKDsyrD1NuAQnmMnVJY1ZFdGzqwi");
  netpie_connect("mqtt://mqtt.netpie.io:1883", "2814fbf4-3dcd-4ccf-ba2a-2f1d67bb80d6", "yQzt7NVWaDvrnTRZAfq4KSESyDhtjPqh");
  vTaskDelay(500 / portTICK_RATE_MS);
    vTaskDelete(NULL);
}

void user_app(void) {
xTaskCreatePinnedToCore(iotTask, "iotTask", 4096, NULL, USERAPP_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);
srand(mcp7940n.get(5));
  // setup
  vTaskDelay(30000 / portTICK_RATE_MS);
  netpie_write_shadow((char *)"room.temp.double", (double)25.2);
  netpie_write_shadow((char *)"room.temp.string", (char *)"25.5 C");

  on_shadow_updated([](JsonVariant shadow) {
      printf("watt = %f \n ",  getShadowValueAsNumber(shadow["data"]["watt"]));
      printf("home.bedroom.humid = %f \n ", getShadowValueAsNumber(shadow["data"]["home"]["bedroom"]["humid"]) );
      printf("shadow updated has field voltage == %d\n", ifJsonFieldAvailable(shadow["data"]["voltage"]));
  });

  while(1) {
    ht16k33.scroll((char *)"Hello World!", true);
    vTaskDelay(5000 / portTICK_RATE_MS);
  }
  
  // create tasks
}

void vUserAppTask(void *pvParameters) {
  // init device manager
  devman_init();

  // ================================================================================
  // add on-board devices
  // ================================================================================
  // i/o devices
  devman_add((char *)"ports", DEV_IO, &ports);
  devman_add((char *)"button12", DEV_IO, &button12);
  devman_add((char *)"ldr", DEV_IO, &ldr);
  devman_add((char *)"sound", DEV_IO, &sound);
  // i2c0 devices
  devman_add((char *)"ht16k33", DEV_I2C0, &ht16k33);
  // i2c1 devices
  devman_add((char *)"lm73", DEV_I2C1, &lm73);
  devman_add((char *)"mcp7940n", DEV_I2C1, &mcp7940n);

  // ================================================================================
  // add plug-ins devices
  // ================================================================================

  // start device manager
  devman_start();

  // wait all devices initialized or error
  while (!devman_ready()) {
    vTaskDelay(100 / portTICK_RATE_MS);
  }

  // real user app
  user_app();

  // kill itself
  vTaskDelete(NULL);
}

void UartParser(char *line, char list[][MAX_UART_LINE_CHAR_COUNT], int len) {
  //
}
