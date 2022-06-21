#include <string.h>
#include "esp_system.h"
#include "kidbright32.h"
#include "ble_uart.h"

//#define DEBUG

const char *TAG = "BLE_UART";

uint8_t char1_str[GATTS_CHAR_VAL_LEN_MAX] = { 0x11, 0x22, 0x33 };
uint8_t char2_str[GATTS_CHAR_VAL_LEN_MAX] = { 0x11, 0x22, 0x33 };
uint8_t descr1_str[GATTS_CHAR_VAL_LEN_MAX] = { 0x00, 0x00 };
uint8_t descr2_str[GATTS_CHAR_VAL_LEN_MAX] = "BLE UART";

esp_attr_value_t gatts_demo_char1_val = {
	.attr_max_len = GATTS_CHAR_VAL_LEN_MAX,
	.attr_len = sizeof(char1_str),
	.attr_value = char1_str
};

esp_attr_value_t gatts_demo_char2_val = {
	.attr_max_len = GATTS_CHAR_VAL_LEN_MAX,
	.attr_len = sizeof(char2_str),
	.attr_value = char2_str
};

esp_attr_value_t gatts_demo_descr1_val = {
	.attr_max_len = GATTS_CHAR_VAL_LEN_MAX,
	.attr_len = sizeof(descr1_str),
	.attr_value = descr1_str
};

esp_attr_value_t gatts_demo_descr2_val = {
	.attr_max_len = GATTS_CHAR_VAL_LEN_MAX,
	.attr_len = 11,
	.attr_value = descr2_str
};

#define BLE_SERVICE_UUID_SIZE ESP_UUID_LEN_128
// add more UUIDs for more then one Service
static uint8_t ble_service_uuid128[BLE_SERVICE_UUID_SIZE];
static uint8_t ble_manufacturer[BLE_MANUFACTURER_DATA_LEN];
static uint32_t ble_add_char_pos;
static esp_ble_adv_data_t ble_adv_data;
static esp_ble_adv_params_t ble_adv_params;

struct gatts_profile_inst {
	uint16_t gatts_if;
	uint16_t app_id;
	uint16_t conn_id;
	uint16_t service_handle;
	esp_gatt_srvc_id_t service_id;
	uint16_t char_handle;
	esp_bt_uuid_t char_uuid;
	esp_gatt_perm_t perm;
	esp_gatt_char_prop_t property;
	uint16_t descr_handle;
	esp_bt_uuid_t descr_uuid;
};
// one gatt-based profile one app_id and one gatts_if, this array will store the gatts_if returned by ESP_GATTS_REG_EVT
static struct gatts_profile_inst gl_profile;

struct gatts_char_inst {
	esp_bt_uuid_t char_uuid;
	esp_gatt_perm_t char_perm;
	esp_gatt_char_prop_t char_property;
	esp_attr_value_t *char_val;
	esp_attr_control_t *char_control;
	uint16_t char_handle;
	esp_gatts_cb_t char_read_callback;
	esp_gatts_cb_t char_write_callback;
	esp_bt_uuid_t descr_uuid;
	esp_gatt_perm_t descr_perm;
	esp_attr_value_t *descr_val;
	esp_attr_control_t *descr_control;
	uint16_t descr_handle;
	esp_gatts_cb_t descr_read_callback;
	esp_gatts_cb_t descr_write_callback;
};
// one gatt-based profile one app_id and one gatts_if, this array will store the gatts_if returned by ESP_GATTS_REG_EVT
static struct gatts_char_inst gl_char[GATTS_CHAR_NUM];

static uint16_t notify_conn_id = 0;
static esp_gatt_if_t notify_gatts_if = 0;
//static uint8_t notify_pos = 0;
static uint8_t is_notify = 0;
static bool bleuart_connected = false;

void char1_read_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "char1_read_handler %d", param->read.handle);

	esp_gatt_rsp_t rsp;
	memset(&rsp, 0, sizeof(esp_gatt_rsp_t));
	rsp.attr_value.handle = param->read.handle;
	if (gl_char[0].char_val != NULL) {
		ESP_LOGI(TAG, "char1_read_handler char_val %d", gl_char[0].char_val->attr_len);
		rsp.attr_value.len = gl_char[0].char_val->attr_len;
		for (uint32_t pos = 0; pos < gl_char[0].char_val->attr_len && pos < gl_char[0].char_val->attr_max_len; pos++) {
			rsp.attr_value.value[pos] = gl_char[0].char_val->attr_value[pos];
		}
	}
	ESP_LOGI(TAG, "char1_read_handler esp_gatt_rsp_t");
	esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id, ESP_GATT_OK, &rsp);
}

void char2_read_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "char2_read_handler %d", param->read.handle);

	esp_gatt_rsp_t rsp;
	memset(&rsp, 0, sizeof(esp_gatt_rsp_t));
	rsp.attr_value.handle = param->read.handle;
	if (gl_char[1].char_val != NULL) {
		ESP_LOGI(TAG, "char2_read_handler char_val %d",gl_char[1].char_val->attr_len);
		rsp.attr_value.len = gl_char[1].char_val->attr_len;
		for (uint32_t pos = 0; pos < gl_char[1].char_val->attr_len && pos < gl_char[1].char_val->attr_max_len; pos++) {
			rsp.attr_value.value[pos] = gl_char[1].char_val->attr_value[pos];
		}
	}
	ESP_LOGI(TAG, "char2_read_handler esp_gatt_rsp_t");
	esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id, ESP_GATT_OK, &rsp);
}

void descr1_read_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "descr1_read_handler %d", param->read.handle);

	esp_gatt_rsp_t rsp;
	memset(&rsp, 0, sizeof(esp_gatt_rsp_t));
	rsp.attr_value.handle = param->read.handle;
	if (gl_char[0].descr_val != NULL) {
		ESP_LOGI(TAG, "descr1_read_handler descr_val %d", gl_char[0].descr_val->attr_len);
		rsp.attr_value.len = gl_char[0].descr_val->attr_len;
		for (uint32_t pos = 0; pos < gl_char[0].descr_val->attr_len && pos < gl_char[0].descr_val->attr_max_len; pos++) {
			rsp.attr_value.value[pos] = gl_char[0].descr_val->attr_value[pos];
		}
	}
	ESP_LOGI(TAG, "descr1_read_handler esp_gatt_rsp_t");
	esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id, ESP_GATT_OK, &rsp);
}

void descr2_read_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "descr2_read_handler %d", param->read.handle);

	esp_gatt_rsp_t rsp;
	memset(&rsp, 0, sizeof(esp_gatt_rsp_t));
	rsp.attr_value.handle = param->read.handle;
	if (gl_char[1].descr_val != NULL) {
		ESP_LOGI(TAG, "descr2_read_handler descr_val %d",gl_char[1].descr_val->attr_len);
		rsp.attr_value.len = gl_char[1].descr_val->attr_len;
		for (uint32_t pos = 0; pos < gl_char[1].descr_val->attr_len && pos < gl_char[1].descr_val->attr_max_len; pos++) {
			rsp.attr_value.value[pos] = gl_char[1].descr_val->attr_value[pos];
		}
	}
	ESP_LOGI(TAG, "descr2_read_handler esp_gatt_rsp_t");
	esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id, ESP_GATT_OK, &rsp);
}

// UART TX
/*
void char2_notify_handle(esp_gatt_if_t gatts_if, uint16_t conn_id) {
	if (is_notify==1) {
		notify_pos='0';
		for (uint32_t i=0;i<10;i++) {
			ESP_LOGI(TAG, "char2_notify_handle esp_ble_gatts_send_indicate");
			// vTaskDelay(1000 / portTICK_RATE_MS); // delay 1s
			esp_ble_gatts_send_indicate(gatts_if, conn_id, gl_char[1].char_handle,1,&notify_pos,false);
			notify_pos++;
		}
	}
}
*/

// UART RX
void char1_write_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "char1_write_handler %d", param->write.handle);

	if (gl_char[0].char_val != NULL) {
		ESP_LOGI(TAG, "char1_write_handler char_val %d", param->write.len);
		gl_char[0].char_val->attr_len = param->write.len;
		for (uint32_t pos = 0; pos < param->write.len; pos++) {
			gl_char[0].char_val->attr_value[pos] = param->write.value[pos];
		}
		ESP_LOGI(TAG, "char1_write_handler %.*s", gl_char[0].char_val->attr_len, (char*)gl_char[0].char_val->attr_value);
	}
	ESP_LOGI(TAG, "char1_write_handler esp_gatt_rsp_t");

    esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);

	if (on_data_cb) {
		snprintf(data_buffer, sizeof(data_buffer) - 1, "%s", (const char *)gl_char[0].char_val->attr_value);
		on_data_cb();
	}
}

void char2_write_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "char2_write_handler %d", param->write.handle);

	if (gl_char[1].char_val != NULL) {
		ESP_LOGI(TAG, "char2_write_handler char_val %d", param->write.len);
		gl_char[1].char_val->attr_len = param->write.len;
		for (uint32_t pos = 0; pos < param->write.len; pos++) {
			gl_char[1].char_val->attr_value[pos] = param->write.value[pos];
		}
	}
	ESP_LOGI(TAG, "char2_write_handler esp_gatt_rsp_t");
    esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
}

void descr1_write_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "descr1_write_handler %d", param->write.handle);

	if (gl_char[0].descr_val != NULL) {
		ESP_LOGI(TAG, "descr1_write_handler descr_val %d",param->write.len);
		gl_char[0].descr_val->attr_len = param->write.len;
		for (uint32_t pos = 0; pos < param->write.len; pos++) {
			gl_char[0].descr_val->attr_value[pos] = param->write.value[pos];
		}
	}
	ESP_LOGI(TAG, "descr1_write_handler esp_gatt_rsp_t");
    esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
}

void descr2_write_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	ESP_LOGI(TAG, "descr2_write_handler %d", param->write.handle);

	if (gl_char[1].descr_val != NULL) {
		ESP_LOGI(TAG, "descr2_write_handler descr_val %d", param->write.len);
		gl_char[1].descr_val->attr_len = param->write.len;
		for (uint32_t pos = 0; pos < param->write.len; pos++) {
			gl_char[1].descr_val->attr_value[pos] = param->write.value[pos];
		}
		is_notify = gl_char[1].descr_val->attr_value[0];
		ESP_LOGI(TAG, "descr1_write_handler is_notify %d", is_notify);
	}
	ESP_LOGI(TAG, "descr2_write_handler esp_gatt_rsp_t");
    esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
}

void gatts_add_char(void) {
	ESP_LOGI(TAG, "gatts_add_char %d", GATTS_CHAR_NUM);
	for (uint32_t pos = 0; pos < GATTS_CHAR_NUM; pos++) {
		if (gl_char[pos].char_handle == 0) {
			ESP_LOGI(TAG, "ADD pos %d handle %d service %d", pos, gl_char[pos].char_handle, gl_profile.service_handle);
			ble_add_char_pos = pos;
			esp_ble_gatts_add_char(
				gl_profile.service_handle,
				&gl_char[pos].char_uuid,
				gl_char[pos].char_perm,
				gl_char[pos].char_property,
				gl_char[pos].char_val,
				gl_char[pos].char_control
			);
			break;
		}
	}
}

void gatts_check_add_char(esp_bt_uuid_t char_uuid, uint16_t attr_handle) {

	ESP_LOGI(TAG, "gatts_check_add_char %d", attr_handle);
	if (attr_handle != 0) {
		if (char_uuid.len == ESP_UUID_LEN_16) {
			ESP_LOGI(TAG, "Char UUID16: %x", char_uuid.uuid.uuid16);
		} else if (char_uuid.len == ESP_UUID_LEN_32) {
			ESP_LOGI(TAG, "Char UUID32: %x", char_uuid.uuid.uuid32);
		} else if (char_uuid.len == ESP_UUID_LEN_128) {
			ESP_LOGI(TAG, "Char UUID128: %x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x", char_uuid.uuid.uuid128[0],
					 char_uuid.uuid.uuid128[1], char_uuid.uuid.uuid128[2], char_uuid.uuid.uuid128[3],
					 char_uuid.uuid.uuid128[4], char_uuid.uuid.uuid128[5], char_uuid.uuid.uuid128[6],
					 char_uuid.uuid.uuid128[7], char_uuid.uuid.uuid128[8], char_uuid.uuid.uuid128[9],
					 char_uuid.uuid.uuid128[10], char_uuid.uuid.uuid128[11], char_uuid.uuid.uuid128[12],
					 char_uuid.uuid.uuid128[13], char_uuid.uuid.uuid128[14], char_uuid.uuid.uuid128[15]);
		} else {
			ESP_LOGE(TAG, "Char UNKNOWN LEN %d", char_uuid.len);
		}

		ESP_LOGI(TAG, "FOUND Char pos %d handle %d", ble_add_char_pos, attr_handle);
		gl_char[ble_add_char_pos].char_handle = attr_handle;

		// is there a descriptor to add ?
		if (gl_char[ble_add_char_pos].descr_uuid.len!=0 && gl_char[ble_add_char_pos].descr_handle == 0) {
			ESP_LOGI(TAG, "ADD Descr pos %d handle %d service %d", ble_add_char_pos, gl_char[ble_add_char_pos].descr_handle, gl_profile.service_handle);
			esp_ble_gatts_add_char_descr(
				gl_profile.service_handle,
				&gl_char[ble_add_char_pos].descr_uuid,
				gl_char[ble_add_char_pos].descr_perm,
				gl_char[ble_add_char_pos].descr_val,
				gl_char[ble_add_char_pos].descr_control
			);
		} else {
			gatts_add_char();
		}
	}
}

void gatts_check_add_descr(esp_bt_uuid_t descr_uuid, uint16_t attr_handle) {
	ESP_LOGI(TAG, "gatts_check_add_descr %d", attr_handle);

	if (attr_handle != 0) {
		if (descr_uuid.len == ESP_UUID_LEN_16) {
			ESP_LOGI(TAG, "Char UUID16: %x", descr_uuid.uuid.uuid16);
		} else if (descr_uuid.len == ESP_UUID_LEN_32) {
			ESP_LOGI(TAG, "Char UUID32: %x", descr_uuid.uuid.uuid32);
		} else if (descr_uuid.len == ESP_UUID_LEN_128) {
			ESP_LOGI(TAG, "Char UUID128: %x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x,%x", descr_uuid.uuid.uuid128[0],
					 descr_uuid.uuid.uuid128[1], descr_uuid.uuid.uuid128[2], descr_uuid.uuid.uuid128[3],
					 descr_uuid.uuid.uuid128[4], descr_uuid.uuid.uuid128[5], descr_uuid.uuid.uuid128[6],
					 descr_uuid.uuid.uuid128[7], descr_uuid.uuid.uuid128[8], descr_uuid.uuid.uuid128[9],
					 descr_uuid.uuid.uuid128[10], descr_uuid.uuid.uuid128[11], descr_uuid.uuid.uuid128[12],
					 descr_uuid.uuid.uuid128[13], descr_uuid.uuid.uuid128[14], descr_uuid.uuid.uuid128[15]);
		} else {
			ESP_LOGE(TAG, "Descriptor UNKNOWN LEN %d", descr_uuid.len);
		}
		ESP_LOGI(TAG, "FOUND Descriptor pos %d handle %d", ble_add_char_pos, attr_handle);
		gl_char[ble_add_char_pos].descr_handle = attr_handle;
	}
	gatts_add_char();
}

void gatts_check_callback(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	uint16_t handle = 0;
	uint8_t read = 1;

    switch (event) {
		case ESP_GATTS_READ_EVT: {
			read = 1;
			handle = param->read.handle;
			break;
		}
		case ESP_GATTS_WRITE_EVT: {
			read = 0;
			handle = param->write.handle;
		}
		default:
			break;
    }

	ESP_LOGI(TAG, "gatts_check_callback read %d num %d handle %d", read, GATTS_CHAR_NUM, handle);
	for (uint32_t pos = 0; pos < GATTS_CHAR_NUM; pos++) {
		if (gl_char[pos].char_handle == handle) {
			if (read == 1) {
				if (gl_char[pos].char_read_callback != NULL) {
					gl_char[pos].char_read_callback(event, gatts_if, param);
				}
			} else {
				if (gl_char[pos].char_write_callback != NULL) {
					gl_char[pos].char_write_callback(event, gatts_if, param);
				}
			}
			break;
		}
		if (gl_char[pos].descr_handle == handle) {
			if (read == 1) {
				if (gl_char[pos].descr_read_callback != NULL) {
					gl_char[pos].descr_read_callback(event, gatts_if, param);
				}
			} else {
				if (gl_char[pos].descr_write_callback != NULL) {
					gl_char[pos].descr_write_callback(event, gatts_if, param);
				}
			}
			break;
		}
	}
}

void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param) {
	switch (event) {
		case ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT:
			esp_ble_gap_start_advertising(&ble_adv_params);
			break;
		default:
			break;
    }
}

void gatts_profile_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
	esp_err_t ret;
	switch (event) {
		case ESP_GATTS_REG_EVT: {
				ESP_LOGI(TAG, "REGISTER_APP_EVT, status %d, app_id %d", param->reg.status, param->reg.app_id);
				gl_profile.service_id.is_primary = true;
				gl_profile.service_id.id.inst_id = 0x00;
				gl_profile.service_id.id.uuid.len = ESP_UUID_LEN_128;
				for (uint8_t pos = 0; pos < ESP_UUID_LEN_128; pos++) {
					gl_profile.service_id.id.uuid.uuid.uuid128[pos] = ble_service_uuid128[pos];
				}
				
				// set device name
				unsigned char bt_mac[6] = { 0 };
				char dev_name[32];
				// default ble uart name
				esp_read_mac(bt_mac, ESP_MAC_BT);
				snprintf(dev_name, sizeof(dev_name) - 1, "BLEUART_%2.2X%2.2X%2.2X", bt_mac[3], bt_mac[4], bt_mac[5]);
				esp_ble_gap_set_device_name(dev_name);

				ret = esp_ble_gap_config_adv_data(&ble_adv_data);
				ESP_LOGI(TAG, "esp_ble_gap_config_adv_data %d", ret);

				esp_ble_gatts_create_service(gatts_if, &gl_profile.service_id, GATTS_NUM_HANDLE);
			}
			break;

		case ESP_GATTS_READ_EVT:
			ESP_LOGI(TAG, "GATT_READ_EVT, conn_id %d, trans_id %d, handle %d", param->read.conn_id, param->read.trans_id, param->read.handle);
	//        esp_gatt_rsp_t rsp;
	//        memset(&rsp, 0, sizeof(esp_gatt_rsp_t));
	//        rsp.attr_value.handle = param->read.handle;
	//        rsp.attr_value.len = 4;
	//        rsp.attr_value.value[0] = 0x0A;
	//        rsp.attr_value.value[1] = 0x0B;
	//        rsp.attr_value.value[2] = 0x0C;
	//        rsp.attr_value.value[3] = 0x0D;
	//        esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id, ESP_GATT_OK, &rsp);
			gatts_check_callback(event, gatts_if, param);
			break;		

		case ESP_GATTS_WRITE_EVT: {
			ESP_LOGI(TAG, "GATT_WRITE_EVT, conn_id %d, trans_id %d, handle %d", param->write.conn_id, param->write.trans_id, param->write.handle);
			ESP_LOGI(TAG, "GATT_WRITE_EVT, value len %d, value %08x", param->write.len, *(uint32_t *)param->write.value);
	//       esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
			gatts_check_callback(event, gatts_if, param);
			break;
		}

		case ESP_GATTS_EXEC_WRITE_EVT:
			break;

		case ESP_GATTS_MTU_EVT:
			break;

		case ESP_GATTS_CONF_EVT:
			break;

		case ESP_GATTS_UNREG_EVT:
			break;

		case ESP_GATTS_CREATE_EVT:
			ESP_LOGI(TAG, "CREATE_SERVICE_EVT, status %d,  service_handle %d", param->create.status, param->create.service_handle);
			gl_profile.service_handle = param->create.service_handle;
			gl_profile.char_uuid.len = gl_char[0].char_uuid.len;
			gl_profile.char_uuid.uuid.uuid16 = gl_char[0].char_uuid.uuid.uuid16;

			esp_ble_gatts_start_service(gl_profile.service_handle);
			gatts_add_char();	
			// esp_ble_gatts_add_char(
			// 	gl_profile.service_handle,
			// 	&gl_profile.char_uuid,
			// 	ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
			// 	ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_WRITE | ESP_GATT_CHAR_PROP_BIT_NOTIFY,
			// 	&gatts_demo_char1_val, NULL
			// );
			break;

		case ESP_GATTS_ADD_INCL_SRVC_EVT:
			break;

		case ESP_GATTS_ADD_CHAR_EVT: {
	//	    uint16_t length = 0;
	//        const uint8_t *prf_char;

			ESP_LOGI(TAG, "ADD_CHAR_EVT, status 0x%X,  attr_handle %d, service_handle %d", param->add_char.status, param->add_char.attr_handle, param->add_char.service_handle);
			gl_profile.char_handle = param->add_char.attr_handle;
	//        gl_profile.descr_uuid.len = ESP_UUID_LEN_16;
	//        gl_profile.descr_uuid.uuid.uuid16 = ESP_GATT_UUID_CHAR_CLIENT_CONFIG;
	//        esp_ble_gatts_get_attr_value(param->add_char.attr_handle,  &length, &prf_char);

	//        ESP_LOGI(TAG, "the gatts demo char length = %x", length);
	//        for(int i = 0; i < length; i++){
	//            ESP_LOGI(TAG, "prf_char[%x] =%x",i,prf_char[i]);
	//        }
	//        esp_ble_gatts_add_char_descr(gl_profile.service_handle, &gl_profile.descr_uuid,
	//                                     ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE, NULL, NULL);
			if (param->add_char.status == ESP_GATT_OK) {
				gatts_check_add_char(param->add_char.char_uuid, param->add_char.attr_handle);
			}
			break;
		}

		case ESP_GATTS_ADD_CHAR_DESCR_EVT:
			ESP_LOGI(TAG,
				"ADD_DESCR_EVT char, status %d, attr_handle %d, service_handle %d",
				param->add_char.status,
				param->add_char.attr_handle,
				param->add_char.service_handle
			);
			ESP_LOGI(TAG,
				"ADD_DESCR_EVT desc, status %d, attr_handle %d, service_handle %d",
				param->add_char_descr.status,
				param->add_char_descr.attr_handle,
				param->add_char_descr.service_handle
			);
			if (param->add_char_descr.status == ESP_GATT_OK) {
				gatts_check_add_descr(param->add_char.char_uuid, param->add_char.attr_handle);
			}
			break;

		case ESP_GATTS_DELETE_EVT:
			break;

		case ESP_GATTS_START_EVT:
			ESP_LOGI(TAG,
				"SERVICE_START_EVT, status %d, service_handle %d",
				param->start.status,
				param->start.service_handle
			);
			break;

		case ESP_GATTS_STOP_EVT:
			break;

		case ESP_GATTS_CONNECT_EVT:
			ESP_LOGI(TAG,
				"SERVICE_START_EVT, conn_id %d, remote %02x:%02x:%02x:%02x:%02x:%02x: ",
				param->connect.conn_id,
				param->connect.remote_bda[0], param->connect.remote_bda[1], param->connect.remote_bda[2],
				param->connect.remote_bda[3], param->connect.remote_bda[4], param->connect.remote_bda[5]
			);

			// save current connection id
			notify_gatts_if = gatts_if;
			notify_conn_id = param->connect.conn_id;			

			bleuart_connected = true;
			break;

		case ESP_GATTS_DISCONNECT_EVT:
			esp_ble_gap_start_advertising(&ble_adv_params);
			bleuart_connected = false;
			// clear current connection id
			notify_gatts_if = 0;
			notify_conn_id = 0;	
			break;

		case ESP_GATTS_OPEN_EVT:
		case ESP_GATTS_CANCEL_OPEN_EVT:
		case ESP_GATTS_CLOSE_EVT:
		case ESP_GATTS_LISTEN_EVT:
		case ESP_GATTS_CONGEST_EVT:
		default:
			break;
    }
}

void gatts_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
    // if event is register event, store the gatts_if for each profile
    if (event == ESP_GATTS_REG_EVT) {
        if (param->reg.status == ESP_GATT_OK) {
        	gl_profile.gatts_if = gatts_if;
        } else {
            ESP_LOGI(TAG, "Reg app failed, app_id %04x, status %d", param->reg.app_id, param->reg.status);
            return;
        }
    }

    gatts_profile_event_handler(event, gatts_if, param);
}

BLE_UART::BLE_UART(void) {
	/*
	https://infocenter.nordicsemi.com/index.jsp?topic=%2Fcom.nordic.infocenter.sdk5.v14.0.0%2Fble_sdk_app_nus_eval.html

	[Nordic UART Service]
	6E400001-B5A3-F393-E0A9-E50E24DCCA9E

	[RX Characteristic]
	6E400002-B5A3-F393-E0A9-E50E24DCCA9E

	[TX Characteristic]
	6E400003-B5A3-F393-E0A9-E50E24DCCA9E
	*/

	// init ble_service_uuid128
	memcpy(ble_service_uuid128, "\x9E\xCA\xDC\x24\x0E\xE5\xA9\xE0\x93\xF3\xA3\xB5\x01\x00\x40\x6E", sizeof(ble_service_uuid128));

	// init ble_manufacturer
	memcpy(ble_manufacturer, "\x12\x23\x45\x56", sizeof(ble_manufacturer));
	// init descr2_str
	strcpy((char *)descr2_str, "BLE_UART");
	// ble_adv_data
	ble_adv_data.set_scan_rsp = false;
	ble_adv_data.include_name = true;
	ble_adv_data.include_txpower = true;
	ble_adv_data.min_interval = 0x20;
	ble_adv_data.max_interval = 0x40;
	ble_adv_data.appearance = 0x00;
	ble_adv_data.manufacturer_len = BLE_MANUFACTURER_DATA_LEN;
	ble_adv_data.p_manufacturer_data =  (uint8_t *)ble_manufacturer;
	ble_adv_data.service_data_len = 0;
	ble_adv_data.p_service_data = NULL;
	ble_adv_data.service_uuid_len = BLE_SERVICE_UUID_SIZE;
	ble_adv_data.p_service_uuid = ble_service_uuid128;
	ble_adv_data.flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT);
	// ble_adv_params
	ble_adv_params.adv_int_min = 0x20;
	ble_adv_params.adv_int_max = 0x40;
	ble_adv_params.adv_type = ADV_TYPE_IND;
	ble_adv_params.own_addr_type = BLE_ADDR_TYPE_PUBLIC;	
	memset(&ble_adv_params.peer_addr, 0, sizeof(ble_adv_params.peer_addr));
	ble_adv_params.peer_addr_type = BLE_ADDR_TYPE_PUBLIC;
	ble_adv_params.channel_map = ADV_CHNL_ALL;
	ble_adv_params.adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY;

	// init gl_profile
	memset(&gl_profile, 0, sizeof(gl_profile));
	gl_profile.gatts_if = ESP_GATT_IF_NONE;

	// init gl_char
	gl_char[0].char_uuid.len = ESP_UUID_LEN_128; // RX
	memcpy(&gl_char[0].char_uuid.uuid.uuid128, "\x9E\xCA\xDC\x24\x0E\xE5\xA9\xE0\x93\xF3\xA3\xB5\x02\x00\x40\x6E", sizeof(gl_char[0].char_uuid.uuid.uuid128));
	gl_char[0].char_perm = ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE;
	gl_char[0].char_property = ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_WRITE | ESP_GATT_CHAR_PROP_BIT_NOTIFY;
	gl_char[0].char_val = &gatts_demo_char1_val;
	gl_char[0].char_control = NULL;
	gl_char[0].char_handle = 0;

	gl_char[0].char_read_callback = char1_read_handler;

	gl_char[0].char_write_callback = char1_write_handler;
	gl_char[0].descr_uuid.len = ESP_UUID_LEN_16;
	gl_char[0].descr_uuid.uuid.uuid16 = ESP_GATT_UUID_CHAR_CLIENT_CONFIG;
	gl_char[0].descr_perm = ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE;
	gl_char[0].descr_val = &gatts_demo_descr1_val;
	gl_char[0].descr_control = NULL;
	gl_char[0].descr_handle = 0;
	gl_char[0].descr_read_callback = descr1_read_handler;
	gl_char[0].descr_write_callback = descr1_write_handler;

	gl_char[1].char_uuid.len = ESP_UUID_LEN_128;  // TX
	memcpy(&gl_char[1].char_uuid.uuid.uuid128, "\x9E\xCA\xDC\x24\x0E\xE5\xA9\xE0\x93\xF3\xA3\xB5\x03\x00\x40\x6E", sizeof(gl_char[1].char_uuid.uuid.uuid128));
	gl_char[1].char_perm = ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE;
	gl_char[1].char_property = ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_WRITE | ESP_GATT_CHAR_PROP_BIT_NOTIFY;
	gl_char[1].char_val = &gatts_demo_char2_val;
	gl_char[1].char_control = NULL;
	gl_char[1].char_handle = 0;
	gl_char[1].char_read_callback = char2_read_handler;
	gl_char[1].char_write_callback = char2_write_handler;
	gl_char[1].descr_uuid.len = ESP_UUID_LEN_16;
	gl_char[1].descr_uuid.uuid.uuid16 = ESP_GATT_UUID_CHAR_CLIENT_CONFIG; // ESP_GATT_UUID_CHAR_DESCRIPTION,
	gl_char[1].descr_perm = ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE;
	gl_char[1].descr_val = &gatts_demo_descr2_val;
	gl_char[1].descr_control = NULL;
	gl_char[1].descr_handle = 0;
	gl_char[1].descr_read_callback = descr2_read_handler;
	gl_char[1].descr_write_callback = descr2_write_handler;

	notify_conn_id = 0;
	notify_gatts_if = 0;
//	notify_pos = 0;
	is_notify = 0;
}

void BLE_UART::init(void) {	
	gpio_config_t io_conf;
	esp_err_t ret;

	// debug
#ifdef DEBUG	
	esp_log_level_set(TAG, ESP_LOG_VERBOSE);
#endif	

	// outputs init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT; // set as output mode
	io_conf.pin_bit_mask = (1ULL << BT_LED_GPIO); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
	led_status = 1;
	gpio_set_level(BT_LED_GPIO, led_status); // active low
	gpio_config(&io_conf);

    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    if ((ret = esp_bt_controller_init(&bt_cfg)) != ESP_OK) {
        ESP_LOGE(TAG, "%s initialize controller failed", __func__);        
    }
	else
    if ((ret = esp_bt_controller_enable(ESP_BT_MODE_BTDM)) != ESP_OK) {
        ESP_LOGE(TAG, "%s enable controller failed", __func__);
    }
    else
    if ((ret = esp_bluedroid_init()) != ESP_OK) {
        ESP_LOGE(TAG, "%s init bluetooth failed", __func__);
    }
	else
    if ((ret = esp_bluedroid_enable()) != ESP_OK) {
        ESP_LOGE(TAG, "%s enable bluetooth failed", __func__);
    }
	else {
		ESP_LOGI(TAG, "%s bluedroid successfully initialized.", __func__);
		esp_ble_gatts_register_callback(gatts_event_handler);
    	esp_ble_gap_register_callback(gap_event_handler);
    	esp_ble_gatts_app_register(BLE_PROFILE_APP_ID);
	}

	state = s_detect;	
}

int BLE_UART::prop_count(void) {
	// not supported
	return 0;
}

bool BLE_UART::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool BLE_UART::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool BLE_UART::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool BLE_UART::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool BLE_UART::prop_write(int index, char *value) {
	// not supported
	return false;
}

void BLE_UART::process(Driver *drv) {
	switch (state) {
		case s_detect:
			// clear error flag
			error = false;
			// set initialized flag
			initialized = true;

			// get current tickcnt
			tickcnt = get_tickcnt();			
			// go to blink state
			state = s_blink;
			break;

		case s_blink:
			if (is_tickcnt_elapsed(tickcnt, 250)) {				
				// get current tickcnt
				tickcnt = get_tickcnt();

				if (bleuart_connected) {
					led_status = 0;
					gpio_set_level(BT_LED_GPIO, led_status); // active low
				}
				else {
					led_status ^= 0x01; // toggle status
					gpio_set_level(BT_LED_GPIO, led_status);
					
				}
			}
			break;
	}
}

bool BLE_UART::is_connected(void) {
	return bleuart_connected;
}

void BLE_UART::on_data(BLE_UART_ON_DATA_CB callback) {
	on_data_cb = callback;
}

char *BLE_UART::read_text(void) {
	strcpy(read_data_buffer, data_buffer);
	strcpy(data_buffer, "");

	return read_data_buffer;
}

double BLE_UART::read_number(void) {
	char str[256];

	strcpy(str, data_buffer);
	strcpy(data_buffer, "");

	return atof(str);
}

void BLE_UART::send(char *str) {
	if (bleuart_connected) {
		esp_ble_gatts_send_indicate(notify_gatts_if, notify_conn_id, gl_char[1].char_handle, strlen(str), (uint8_t *)str, false);
	}
}

void BLE_UART::send(double val) {
	char str[256];

	if (bleuart_connected) {
		snprintf(str, sizeof(str) - 1, "%f", val);
		esp_ble_gatts_send_indicate(notify_gatts_if, notify_conn_id, gl_char[1].char_handle, strlen(str), (uint8_t *)str, false);
	}
}
