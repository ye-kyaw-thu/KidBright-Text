#include "soc/rtc_cntl_reg.h"
#include "soc/rtc_io_reg.h"
#include "soc/soc_ulp.h"

	.bss
state:  .long 0

	.text
	.global entry
entry:
	move r1, state
	ld r0, r1, 0			// load current state
	and r0, r0, 1			// mask to bit0
	jump toggle_on, eq		// jump if r0 is zero (state == 0)
toggle_off:
	// https://github.com/espressif/esp-iot-solution/blob/6f505c6a315cc2cf3338bcc61dd22e6b565afbed/examples/ulp_examples/ulp_rtc_gpio/main/ulp/rtcio.S#L47
	// set bit rtc_gpio_12 (GPIO2)
	WRITE_RTC_REG(RTC_GPIO_OUT_W1TS_REG, RTC_GPIO_OUT_DATA_W1TS_S + 12, 1, 1)
	jump store_state

toggle_on:
	// https://github.com/espressif/esp-iot-solution/blob/6f505c6a315cc2cf3338bcc61dd22e6b565afbed/examples/ulp_examples/ulp_rtc_gpio/main/ulp/rtcio.S#L85
	// clear bit rtc_gpio_12 (GPIO2)
	WRITE_RTC_REG(RTC_GPIO_OUT_W1TC_REG, RTC_GPIO_OUT_DATA_W1TC_S + 12, 1, 1)

store_state:
	add r0, r0, 1
	and r0, r0, 1
	st r0, r1, 0
	halt					// ulp end up with halt
