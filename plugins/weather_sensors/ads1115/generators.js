Blockly.JavaScript['ads1115.get_volt'] = function(block) {
	return [
		'DEV_I2C1.ADS1115(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ').get_volt(' + block.getFieldValue('AIN') + ')',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
