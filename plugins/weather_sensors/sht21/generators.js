Blockly.JavaScript['sht21.get_temperature'] = function(block) {
	return [
		'DEV_I2C1.SHT21(' + block.getFieldValue('CHANNEL') + ', 0x40).get_temperature()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['sht21.get_humidity'] = function(block) {
	return [
		'DEV_I2C1.SHT21(' + block.getFieldValue('CHANNEL') + ', 0x40).get_humidity()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['sht21.is_error'] = function(block) {
	return [
		'DEV_I2C1.SHT21(' + block.getFieldValue('CHANNEL') + ', 0x40).is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
