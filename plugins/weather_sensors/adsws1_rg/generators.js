Blockly.JavaScript['adsws1_rg.get_rain_gauge_mm'] = function(block) {
	return [
		// input = IN1(gpio 32), IN2(gpio 33), IN3(gpio 34), IN4(gpio 35)
		'DEV_IO.ADSWS1_RG(' + block.getFieldValue('INPUT')  + ')' + '.get_rain_gauge_mm()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['adsws1_rg.get_rain_gauge_counter'] = function(block) {
	return [
		// input = IN1(gpio 32), IN2(gpio 33), IN3(gpio 34), IN4(gpio 35)
		'DEV_IO.ADSWS1_RG(' + block.getFieldValue('INPUT')  + ')' + '.get_rain_gauge_counter()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['adsws1_rg.reset_rain_gauge'] = function(block) {
	return 'DEV_IO.ADSWS1_RG(' + block.getFieldValue('INPUT') + ').reset_rain_gauge();\n';
};
