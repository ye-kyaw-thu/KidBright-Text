Blockly.JavaScript['kbnet_rv.get_rain_volume_mm'] = function(block) {
	return [
		'DEV_IO.KBNET_RV()' + '.get_rain_volume_mm()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet_rv.get_rain_volume_counter'] = function(block) {
	return [
		'DEV_IO.KBNET_RV()' + '.get_rain_volume_counter()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet_rv.reset_rain_volume'] = function(block) {
	return 'DEV_IO.KBNET_RV().reset_rain_volume();\n';
};
