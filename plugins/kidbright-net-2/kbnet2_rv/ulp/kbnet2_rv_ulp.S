#include "soc/rtc_cntl_reg.h"
#include "soc/rtc_io_reg.h"
#include "soc/soc_ulp.h"

// ==============================================================
// define variables, go into .bss section (zero-initialized data)
// ==============================================================
	.bss
	// next input signal edge expected: 0 (negative) or 1 (positive)
	.global next_edge
next_edge:			.long 0

	// counter started when signal value changes, edge is debounced when the counter reaches zero
	.global debounce_counter
debounce_counter:	.long 0

	// value to which debounce_counter gets reset, set by the main program
	.global debounce_max_count
debounce_max_count:	.long 0

	// total number of signal edges acquired
	.global edge_count
edge_count:			.long 0

	// RTC IO number used to sample the input signal, set by main program
	.global io_number
io_number:			.long 0

	// last rain volume day of month, set by main program
	.global last_dom_stamp
last_dom_stamp:		.long 0

// ==============================================================
// code goes into .text section
// ==============================================================
	.text
	.global entry
entry:
	move r3, io_number
	ld r3, r3, 0
	
	move r0, r3
	jumpr read_io_high, 16, ge

	// read the value of lower 16 RTC IOs into R0
	READ_RTC_REG(RTC_GPIO_IN_REG, RTC_GPIO_IN_NEXT_S, 16)
	rsh r0, r0, r3
	jump read_done

	// read the value of RTC IOs 16-17, into R0
read_io_high:
	READ_RTC_REG(RTC_GPIO_IN_REG, RTC_GPIO_IN_NEXT_S + 16, 2)
	sub r3, r3, 16
	rsh r0, r0, r3

read_done:
	and r0, r0, 1
	// state of input changed?
	move r3, next_edge
	ld r3, r3, 0
	add r3, r0, r3
	and r3, r3, 1
	jump changed, eq
	// not changed, reset debounce_counter to debounce_max_count
	move r3, debounce_max_count
	move r2, debounce_counter
	ld r3, r3, 0
	st r3, r2, 0
	// end program
	halt

	.global changed
changed:
	// input state changed, has debounce_counter reached zero?
	move r3, debounce_counter
	ld r2, r3, 0
	// dummy ADD to use "jump if ALU result is zero"
	add r2, r2, 0
	jump edge_detected, eq
	// not yet, decrement debounce_counter
	sub r2, r2, 1
	st r2, r3, 0
	// end program
	halt

	.global edge_detected
edge_detected:
	// reset debounce_counter to debounce_max_count
	move r3, debounce_max_count
	move r2, debounce_counter
	ld r3, r3, 0
	st r3, r2, 0
	// flip next_edge
	move r3, next_edge
	ld r2, r3, 0
	add r2, r2, 1
	and r2, r2, 1
	st r2, r3, 0
	// increment edge_count
	move r3, edge_count
	ld r2, r3, 0
	add r2, r2, 1
	st r2, r3, 0
	//end program
	halt
