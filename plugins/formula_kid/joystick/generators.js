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

Blockly.JavaScript['joystick_1.calibrate_set'] = function(block) {
	var release_value = Blockly.JavaScript.valueToCode(block, 'RELEASE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var downmost_value = Blockly.JavaScript.valueToCode(block, 'DOWNMOST', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var upmost_value = Blockly.JavaScript.valueToCode(block, 'UPMOST', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return 'DEV_IO.JOYSTICK(OUT1_GPIO, IN1_GPIO).calibrate_set(' + release_value + ', ' + downmost_value + ', ' + upmost_value + ');\n';
}

Blockly.JavaScript['joystick_2.calibrate_set'] = function(block) {
	var release_value = Blockly.JavaScript.valueToCode(block, 'RELEASE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var leftmost_value = Blockly.JavaScript.valueToCode(block, 'LEFTMOST', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var rightmost_value = Blockly.JavaScript.valueToCode(block, 'RIGHTMOST', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return 'DEV_IO.JOYSTICK(OUT2_GPIO, IN2_GPIO).calibrate_set(' + release_value + ', ' + leftmost_value + ', ' + rightmost_value + ');\n';
}

function Joystick_GetValue_Code(block) {
	// Numeric value.
	var code = parseInt(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
}

Blockly.JavaScript["joystick.release_default"] = function(block) {
	return Joystick_GetValue_Code(block);
};

Blockly.JavaScript["joystick.downmost_default"] = function(block) {
	return Joystick_GetValue_Code(block);
};

Blockly.JavaScript["joystick.upmost_default"] = function(block) {
	return Joystick_GetValue_Code(block);
};

Blockly.JavaScript["joystick.leftmost_default"] = function(block) {
	return Joystick_GetValue_Code(block);
};

Blockly.JavaScript["joystick.rightmost_default"] = function(block) {
	return Joystick_GetValue_Code(block);
};
