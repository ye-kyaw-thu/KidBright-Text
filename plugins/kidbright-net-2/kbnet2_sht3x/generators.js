Blockly.JavaScript['kbnet2_sht3x.get_temperature'] = function(block) {
	return [
		'DEV_I2C1.KBNET2_SHT3X().get_temperature()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_sht3x.get_humidity'] = function(block) {
	return [
		'DEV_I2C1.KBNET2_SHT3X().get_humidity()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_sht3x.is_error'] = function(block) {
	return [
		'DEV_I2C1.KBNET2_SHT3X().is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
