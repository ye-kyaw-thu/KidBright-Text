Blockly.JavaScript['kbnet_ws.get_wind_speed_km_h'] = function(block) {
	return [
		'DEV_IO.KBNET_WS()' + '.get_wind_speed_km_h()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet_ws.get_wind_speed_km_h_text'] = function(block) {
	var prec = parseInt(block.getFieldValue('PREC'));

	return [
		'DEV_IO.KBNET_WS()' + '.get_wind_speed_km_h_text(' + prec + ')',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
