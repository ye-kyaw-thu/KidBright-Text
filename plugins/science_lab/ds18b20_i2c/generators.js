Blockly.JavaScript['ds18b20_i2c.get_temperature'] = function(block) {
	return [
		'DEV_I2C1.DS18B20_I2C(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ').get_temperature()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
