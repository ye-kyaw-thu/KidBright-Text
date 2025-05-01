Blockly.JavaScript['kbnet_dl7612.send_01'] = function(block) {
	var value_1 = Blockly.JavaScript.valueToCode(block, 'VALUE_1', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_2 = Blockly.JavaScript.valueToCode(block, 'VALUE_2', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_3 = Blockly.JavaScript.valueToCode(block, 'VALUE_3', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_4 = Blockly.JavaScript.valueToCode(block, 'VALUE_4', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var value_5 = Blockly.JavaScript.valueToCode(block, 'VALUE_5', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';	

	var appskey = block.getFieldValue('APPSKEY'); //Blockly.JavaScript.valueToCode(block, 'APPSKEY', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var nwkskey = block.getFieldValue('NWKSKEY'); //Blockly.JavaScript.valueToCode(block, 'NWKSKEY', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var tx_power_index = parseInt(block.getFieldValue('TX_POWER'));

	return 'DEV_IO.KBNET_DL7612("' + appskey.toLowerCase() + '", "' + nwkskey.toLowerCase() + '", ' + tx_power_index + ').send_01(' + value_1 + ', ' + value_2 + ', ' + value_3 + ', ' + value_4 + ', ' + value_5 + ');\n';
};
