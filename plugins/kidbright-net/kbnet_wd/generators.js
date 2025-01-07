Blockly.JavaScript['kbnet_wd.get_wind_direction_degrees'] = function(block) {
	return [
		'DEV_IO.KBNET_WD()' + '.get_wind_direction_degrees()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet_wd.is_error'] = function(block) {
	return [
		'DEV_IO.KBNET_WD()' + '.is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
