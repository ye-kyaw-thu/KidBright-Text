Blockly.JavaScript['joystick_1.position'] = function(block) {
	return [
		'DEV_IO.JOYSTICK(OUT1_GPIO, IN1_GPIO)' + '.get_position()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['joystick_2.position'] = function(block) {
	return [
		'DEV_IO.JOYSTICK(OUT2_GPIO, IN2_GPIO)' + '.get_position()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
