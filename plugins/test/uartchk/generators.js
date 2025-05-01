Blockly.JavaScript['uartchk.check'] = function (block) {
	return [
		'DEV_IO.UARTCHK(' + block.getFieldValue('UART_NUM') + ', ' + block.getFieldValue('TX') + ', ' +block.getFieldValue('RX') + ', ' + block.getFieldValue('PWR_EN') + ').check()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
