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

Blockly.JavaScript['kbnet_dl7612.send_02'] = function(block) {
	var values = [];
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_1', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_2', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_3', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_4', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_5', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_6', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_7', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	values.push(Blockly.JavaScript.valueToCode(block, 'VALUE_8', Blockly.JavaScript.ORDER_ASSIGNMENT) || null);
	
	var appskey = block.getFieldValue('APPSKEY');
	var nwkskey = block.getFieldValue('NWKSKEY');
	var tx_power_index = parseInt(block.getFieldValue('TX_POWER'));
	
	var str = '';
	var flags = 0x00000000;	
	for (var i = 0; i < values.length; i++) {		
		if (values[i] != null) {
			flags |= (1 << i);
		}
		else {
			values[i] = 0;
		}
		str += ', ' + values[i];
	}
	str = '0x' + flags.toString(16).padStart(8, '0') + str;	

	//return 'DEV_IO.KBNET_DL7612("' + appskey.toLowerCase() + '", "' + nwkskey.toLowerCase() + '", ' + tx_power_index + ').send_02(0x' + flags.toString(16) + ', ' + values[0] + ', ' + values[1] + ', ' + values[2] + ', ' + values[3] + ', ' + values[4] + ', ' + values[5] + ', ' + values[6] + ', ' + values[7] + ');\n';
	return 'DEV_IO.KBNET_DL7612("' + appskey.toLowerCase() + '", "' + nwkskey.toLowerCase() + '", ' + tx_power_index + ').send_02(' + str + ');\n';
};
