Blockly.JavaScript['adsws1_wd.get_wind_direction_degrees'] = function(block) {
	return [
		// input = IN1(gpio 32), IN2(gpio 33), IN3(gpio 34), IN4(gpio 35)
		'DEV_IO.ADSWS1_WD(' + block.getFieldValue('OUTPUT') + ', ' + block.getFieldValue('INPUT') + ')' + '.get_wind_direction_degrees()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['adsws1_wd.is_error'] = function(block) {
	return [
		'DEV_IO.ADSWS1_WD(' + block.getFieldValue('OUTPUT') + ', ' + block.getFieldValue('INPUT') + ')' + '.is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
