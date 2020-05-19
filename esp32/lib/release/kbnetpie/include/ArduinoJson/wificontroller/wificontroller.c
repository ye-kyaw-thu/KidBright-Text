#include "wificontroller.h"

EventGroupHandle_t wifi_event_group;
static const char *TAG = "WIFI_CONTROLLER";

static esp_err_t wifi_event_handler(void *ctx, system_event_t *event)
{
    switch (event->event_id) {
        case SYSTEM_EVENT_STA_START:
            ESP_LOGI(TAG,"STA Start\n");
            esp_wifi_connect();
            break;
        case SYSTEM_EVENT_STA_STOP:
            ESP_LOGI(TAG,"STA Stop\n");
            esp_wifi_connect();
            break;
        case SYSTEM_EVENT_STA_CONNECTED:
            ESP_LOGI(TAG,"STA Connected\n");
            esp_wifi_connect();
            break;
        case SYSTEM_EVENT_STA_GOT_IP:
            ESP_LOGI(TAG,"Get IP\n");
            xEventGroupSetBits(wifi_event_group, CONNECTED_BIT);

            gpio_pad_select_gpio(LED_WIFI_GPIO);
            gpio_set_direction(LED_WIFI_GPIO, GPIO_MODE_OUTPUT);
            gpio_set_level(LED_WIFI_GPIO, LED_ON);

            break;
        case SYSTEM_EVENT_STA_DISCONNECTED:
            esp_wifi_connect();
            xEventGroupClearBits(wifi_event_group, CONNECTED_BIT);

            gpio_pad_select_gpio(LED_WIFI_GPIO);
            gpio_set_direction(LED_WIFI_GPIO, GPIO_MODE_OUTPUT);
            gpio_set_level(LED_WIFI_GPIO, LED_OFF);

            break;
        default:
            break;
    }
    return ESP_OK;
}

void wifi_sta_start(char *ssid, char *password) {
    tcpip_adapter_init();
    wifi_event_group = xEventGroupCreate();
    ESP_ERROR_CHECK(esp_event_loop_init(wifi_event_handler, NULL));
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = "",
            .password = "",
        },
    };
    strxcpy((char *)(wifi_config.sta.ssid), ssid, sizeof(wifi_config.sta.ssid));
    strxcpy((char *)(wifi_config.sta.password), password, sizeof(wifi_config.sta.password));

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config));
    ESP_LOGI(TAG, "start the WIFI SSID:[%s] password:[%s]", wifi_config.sta.ssid, wifi_config.sta.password);
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_LOGI(TAG, "Waiting for wifi");
}
