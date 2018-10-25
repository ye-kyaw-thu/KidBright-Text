const si7021_0x40 = 'DEV_I2C1.SI7021(0, 0x40)'; // bus_ch(0-64), bus_addr(0x40)

Blockly.JavaScript['si7021.get_temperature'] = function(block) {
	return [
		si7021_0x40 + '.get_temperature()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['si7021.get_humidity'] = function(block) {
	return [
		si7021_0x40 + '.get_humidity()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
