Blockly.JavaScript['ble_uart.on_data'] = function(block) {
	var code = 'DEV_IO.BLE_UART().on_data([]() { // callback\n' + Blockly.JavaScript.statementToCode(block, 'ON_DATA') + '\n});\n';
	return code;
};

Blockly.JavaScript['ble_uart.read_text'] = function(block) {
	return [
		'DEV_IO.BLE_UART().read_text()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['ble_uart.read_number'] = function(block) {
	return [
		'DEV_IO.BLE_UART().read_number()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['ble_uart.send'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return 'DEV_IO.BLE_UART().send(' + argument0 + ');\n';
};

Blockly.JavaScript["ble_uart.text_number"] = function(block) {
	return [
		'(char *)"' + block.getFieldValue('VALUE') + '"',
		Blockly.JavaScript.ORDER_ATOMIC
	];
}
