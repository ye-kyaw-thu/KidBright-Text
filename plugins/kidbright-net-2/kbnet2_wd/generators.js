Blockly.JavaScript['kbnet2_wd.get_wind_direction_degrees'] = function(block) {
	return [
		'DEV_IO.KBNET2_WD()' + '.get_wind_direction_degrees()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_wd.is_error'] = function(block) {
	return [
		'DEV_IO.KBNET2_WD()' + '.is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
