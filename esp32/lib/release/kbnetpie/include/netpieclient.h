#ifndef _NETPIECLIENT_H
#define _NETPIECLIENT_H

#include <float.h>
#include "ArduinoJson.h"

#define LED_WIFI_GPIO 2
#define LED_NTP_GPIO 15
#define LED_IOT_GPIO 12
#define LED_ON 0
#define LED_OFF 1

#define MAXSUBTOPIC 5
#define MAXONTOPIC 10
#define MAXGETSHADOW 4
#define TOPICLEN 48

#define SHADOW_GET_MIN_WAIT 3000

//#define UNDEFINED -DBL_MAX
#define UNDEFINED 0

int netpie_connect(const char* host, const char* deviceid, const char* devicetoken);
int netpie_subscribe(const char* topic);
int netpie_publish(const char* topic, char* payload);
int netpie_publish(const char* topic, double value );
int netpie_write_shadow(const char* datapath, char* value);
int netpie_write_shadow(const char* datapath, double value);
bool ifJsonFieldAvailable(JsonVariant field);

const char* getShadowValueAsString(JsonVariant field);
double getShadowValueAsNumber(JsonVariant field);

typedef void (*shadow_updated_handler_t)(JsonVariant);
typedef void (*message_handler_t)(char*, char*, size_t);
typedef void (*on_topic_handler_t)(char*, size_t);
typedef void (*on_connected_handler_t)();
typedef void (*on_disconnected_handler_t)();
typedef void (*shadow_get_handler_t)(JsonVariant);

void initiate_global();
void on_connected(on_connected_handler_t _handler);
void on_disconnected(on_disconnected_handler_t _handler);
void on_shadow_updated(shadow_updated_handler_t _handler);
void on_message(message_handler_t _handler);
bool on_message_topic(char* topic, on_topic_handler_t _handler);
bool get_entire_shadow(shadow_get_handler_t _handler);
bool isVariableDefined(char *str);
bool isVariableDefined(double val);

#endif