Blockly.JavaScript['kbnet2_rv.get_rain_volume_mm'] = function(block) {
	return [
		'DEV_IO.KBNET2_RV()' + '.get_rain_volume_mm()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_rv.get_rain_volume_counter'] = function(block) {
	return [
		'DEV_IO.KBNET2_RV()' + '.get_rain_volume_counter()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_rv.reset_rain_volume'] = function(block) {
	return 'DEV_IO.KBNET2_RV().reset_rain_volume();\n';
};
