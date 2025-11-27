Blockly.JavaScript['kbnet2_pms9103m.getpm2_5'] = function (block) {
	return [
		'DEV_IO.KBNET2_PMS9103M().get_pm2_5()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_pms9103m.getpm10'] = function (block) {
	return [
		'DEV_IO.KBNET2_PMS9103M().get_pm10()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_pms9103m.is_error'] = function (block) {
	return [
		'DEV_IO.KBNET2_PMS9103M().is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['kbnet2_pms9103m.power_off'] = function (block) {
	return 'DEV_IO.KBNET2_PMS9103M().power_off();\n';
};
