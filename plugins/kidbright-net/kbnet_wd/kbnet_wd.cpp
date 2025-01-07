#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "esp_adc_cal.h"
#include "kidbright32.h"
#include "kbnet_wd.h"

#undef __DEBUG__
//#define __DEBUG__

#define MVC(x, y)               ((x + y) / 2)
#define MILLIVOLT_0             0 // short circuit
#define MILLIVOLT_1             210
#define MILLIVOLT_2             265
#define MILLIVOLT_3             294
#define MILLIVOLT_4             397
#define MILLIVOLT_5             573
#define MILLIVOLT_6             750
#define MILLIVOLT_7             874
#define MILLIVOLT_8             1207
#define MILLIVOLT_9             1357
#define MILLIVOLT_10            1718
#define MILLIVOLT_11            1796
#define MILLIVOLT_12            1976
#define MILLIVOLT_13            2177
#define MILLIVOLT_14            2276
#define MILLIVOLT_15            2414
#define MILLIVOLT_16            2546
#define MILLIVOLT_17            2721 // open circuit

esp_adc_cal_characteristics_t adc1_chars;

const uint32_t direction_millivolt_center[MILLIVOLT_SIZE + 1] = {
    MILLIVOLT_0,
    MVC(MILLIVOLT_0, MILLIVOLT_1), MVC(MILLIVOLT_1, MILLIVOLT_2), MVC(MILLIVOLT_2, MILLIVOLT_3), MVC(MILLIVOLT_3, MILLIVOLT_4),
    MVC(MILLIVOLT_4, MILLIVOLT_5), MVC(MILLIVOLT_5, MILLIVOLT_6), MVC(MILLIVOLT_6, MILLIVOLT_7), MVC(MILLIVOLT_7, MILLIVOLT_8),
    MVC(MILLIVOLT_8, MILLIVOLT_9), MVC(MILLIVOLT_9, MILLIVOLT_10), MVC(MILLIVOLT_10, MILLIVOLT_11), MVC(MILLIVOLT_11, MILLIVOLT_12),
    MVC(MILLIVOLT_12, MILLIVOLT_13), MVC(MILLIVOLT_13, MILLIVOLT_14), MVC(MILLIVOLT_14, MILLIVOLT_15), MVC(MILLIVOLT_15, MILLIVOLT_16),
    MVC(MILLIVOLT_16, MILLIVOLT_17), 3300
};

const double direction[MILLIVOLT_SIZE] = {
    -1.0,
    112.5, 67.5, 90.0, 157.5,
    135.0, 202.5, 180.0, 22.5,
    45.0, 247.5, 225.0, 337.5,
    0.0, 292.5, 315.0, 270.0,
    -2.0
};

bool KBNET_WD::adc_calibration_init(void) {
    esp_err_t ret;
    bool cali_enable = false;

    ret = esp_adc_cal_check_efuse(ESP_ADC_CAL_VAL_EFUSE_VREF);
    if (ret == ESP_ERR_NOT_SUPPORTED) {
		#ifdef __DEBUG__
        	printf("Calibration scheme not supported, skip software calibration\n");
		#endif
    }
    else
    if (ret == ESP_ERR_INVALID_VERSION) {
		#ifdef __DEBUG__
        	printf("eFuse not burnt, skip software calibration\n");
		#endif
    }
    else
    if (ret == ESP_OK) {
        cali_enable = true;
        esp_adc_cal_characterize(ADC_UNIT_1, ADC_ATTEN_DB_11, ADC_WIDTH_BIT_12, 0, &adc1_chars);
		#ifdef __DEBUG__
        	printf("ADC calibration ok\n");
		#endif
    }
    else {
		#ifdef __DEBUG__
        	printf("Invalid arg\n");
		#endif
    }

    return cali_enable;
}

bool KBNET_WD::calc_mv_index(uint32_t mv, int *mv_index) {
    int i;

    // millivolt to direction lookup table
    i = 0;
    while (i < MILLIVOLT_SIZE) {
        if ((mv >= direction_millivolt_center[i]) && (mv < direction_millivolt_center[i + 1])) {
            break;
        }

        i++;
    }

    //ESP_LOGI(TAG, "%d <= %d < %d => %d", direction_millivolt_center[i], mv, direction_millivolt_center[i + 1], i);

    if (i < MILLIVOLT_SIZE) {
        *mv_index = i;
        return true;
    }
    
    return false; // out of range
}

KBNET_WD::KBNET_WD(void) {
	// set sensor gpio and adc channel
	address = IN3_GPIO;
	adc_channel = ADC1_CHANNEL_6;

	// adc calibration
    cali_enable_flag = adc_calibration_init();

    // adc1 bit width = 12-bit
    adc1_config_width(ADC_WIDTH_BIT_12);
    // adc1 atten = 11 dB, full-scale 3.9 V (limit to 3.3V following VDD_A value)
    adc1_config_channel_atten(adc_channel, ADC_ATTEN_DB_11);
}

void KBNET_WD::init(void) {
	wind_direction = 0;
	state = s_detect;
}

int KBNET_WD::prop_count(void) {
	return 1;
}

bool KBNET_WD::prop_name(int index, char *name) {
	if (index == 0) {
		snprintf(name, DEVICE_PROP_NAME_LEN_MAX, "%s", "wind_direction_adc");
		return true;
	}

	// not supported
	return false;
}

bool KBNET_WD::prop_unit(int index, char *unit) {
	if (index == 0) {
		snprintf(unit, DEVICE_PROP_UNIT_LEN_MAX, "%s", "degrees");
		return true;
	}

	// not supported
	return false;
}

bool KBNET_WD::prop_attr(int index, char *attr) {
	if (index == 0) {
		get_attr_str(attr, PROP_ATTR_READ_FLAG | PROP_ATTR_TYPE_NUMBER_FLAG); // read only, number
		return true;
	}

	// not supported
	return false;
}

bool KBNET_WD::prop_read(int index, char *value) {
	if (index == 0) {
		snprintf(value, DEVICE_PROP_VALUE_LEN_MAX, "%f", wind_direction);
		return true;
	}

	// not supported
	return false;
}

bool KBNET_WD::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET_WD::process(Driver *drv) {	
	uint32_t adc_raw, milli_volt;
	int mv_index;
    int mv_index_cnt_max, mv_max_index, i;

	switch (state) {
		case s_detect:
			// init millivolt index count array
			for (i = 0; i < MILLIVOLT_SIZE; i++) {
				mv_index_cnt_arr[i] = 0;
			}
			// reset adc smaple index
			adc_sample_index = 0;

			// go to adc start state
			state = s_adc_start;
			break;

		case s_adc_start:
			if (adc_sample_index < 5) {
				// read adc1
				adc_raw = adc1_get_raw(adc_channel);
				if (cali_enable_flag) {
					milli_volt = esp_adc_cal_raw_to_voltage(adc_raw, &adc1_chars);
				}
				else {
					milli_volt = (adc_raw * 3300) / 4096;
				}
				#ifdef __DEBUG__
        			//printf("adc_raw = %d mV, milli_volt = %d mV\n", adc_raw, milli_volt);
				#endif				

				if (calc_mv_index(milli_volt, &mv_index)) {
					// count millivolt index
					mv_index_cnt_arr[mv_index]++;
				}

				tickcnt = get_tickcnt();
				// goto adc sample delay state
				state = s_adc_sample_delay;
			}
			else {
				mv_index_cnt_max = 0;
				mv_max_index = -1;
				// find maximum mv_index_cnt
				for (i = 0; i < MILLIVOLT_SIZE; i++) {            
					//printf("%d ", mv_index_cnt_arr[i]);

					if (mv_index_cnt_arr[i] > mv_index_cnt_max) {
						mv_index_cnt_max = mv_index_cnt_arr[i];
						// update mv max index
						mv_max_index = i;
					}
				}
				//printf(" = %d\n", mv_max_index);

				if ((mv_max_index > 0) && (mv_max_index < (MILLIVOLT_SIZE - 1))) {
					wind_direction = direction[mv_max_index];

					#ifdef __DEBUG__
						//printf("wind direction = %.1f\n", wind_direction);
					#endif

					// clear error flag
					error = false;
					// set initialized flag
					initialized = true;

					tickcnt = get_tickcnt();
					// go to idle state
					state = s_idle;
				}
				else {					
					// sensor out of range (open or short circuit), go to error state
					state = s_error;
				}				
			}
			break;

		case s_adc_sample_delay:
			if (is_tickcnt_elapsed(tickcnt, 50)) {
				// advance adc sample index
				adc_sample_index++;
				// got back to adc sample
				state = s_adc_start;
			}
			break;		

		case s_idle:
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				// go back to detect state
				state = s_detect;
			}
			break;

		case s_error:
			// set error flag
			error = true;
			// clear initialized flag
			initialized = false;

			#ifdef __DEBUG__
				//printf("sensor out of range!\n");
			#endif

			// get current tickcnt
			tickcnt = get_tickcnt();
			// goto wait and retry with detect state
			state = s_wait;
			break;

		case s_wait:
			// delay 1000ms before retry detect
			if (is_tickcnt_elapsed(tickcnt, 1000)) {
				state = s_detect;
			}
			break;
	}
}

double KBNET_WD::get_wind_direction_degrees(void) {
	// just return current wind direction value
	return wind_direction;
}
