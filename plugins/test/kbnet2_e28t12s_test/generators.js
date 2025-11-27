Blockly.JavaScript['kbnet2_e28t12s_test.send_01'] = function(block) {
	var value_1 = Blockly.JavaScript.valueToCode(block, 'VALUE_1', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_2 = Blockly.JavaScript.valueToCode(block, 'VALUE_2', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_3 = Blockly.JavaScript.valueToCode(block, 'VALUE_3', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_4 = Blockly.JavaScript.valueToCode(block, 'VALUE_4', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_5 = Blockly.JavaScript.valueToCode(block, 'VALUE_5', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_6 = Blockly.JavaScript.valueToCode(block, 'VALUE_6', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_7 = Blockly.JavaScript.valueToCode(block, 'VALUE_7', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	/*var nwkskey = block.getFieldValue('NWKSKEY'); //Blockly.JavaScript.valueToCode(block, 'NWKSKEY', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var tx_power_index = parseInt(block.getFieldValue('TX_POWER_INDEX'));
	var rf_frequency = parseInt(block.getFieldValue('RF_FREQUENCY'));
	
	return 'DEV_IO.KBNET2_E28T12S(' + tx_power_index + ', ' + rf_frequency + ', ' + '"' + nwkskey.toLowerCase() + '"' + ').send_01(' + value_1 + ', ' + value_2 + ', ' + value_3 + ', ' + value_4 + ', ' + value_5 + ', ' + value_6 + ', ' + value_7 + ');\n';*/

	return 'DEV_IO.KBNET2_E28T12S_TEST().send_01(' + value_1 + ', ' + value_2 + ', ' + value_3 + ', ' + value_4 + ', ' + value_5 + ', ' + value_6 + ', ' + value_7 + ');\n';
};

Blockly.JavaScript['kbnet2_e28t12s_test.is_error'] = function(block) {
	return [
		'DEV_IO.KBNET2_E28T12S_TEST().is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
