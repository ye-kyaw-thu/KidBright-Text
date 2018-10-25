const sht31_0x44 = 'DEV_I2C1.SHT31(0, 0x44)'; // bus_ch(0-64), bus_addr(0x44-0x45)

Blockly.JavaScript['sht31.get_temperature'] = function(block) {
	return [
		sht31_0x44 + '.get_temperature()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['sht31.get_humidity'] = function(block) {
	return [
		sht31_0x44 + '.get_humidity()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
