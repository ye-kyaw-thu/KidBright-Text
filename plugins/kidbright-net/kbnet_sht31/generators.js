Blockly.JavaScript['kbnet_sht31.get_temperature'] = function(block) {
	return [
		'DEV_I2C1.KBNET_SHT31().get_temperature()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet_sht31.get_humidity'] = function(block) {
	return [
		'DEV_I2C1.KBNET_SHT31().get_humidity()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet_sht31.is_error'] = function(block) {
	return [
		'DEV_I2C1.KBNET_SHT31().is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
