Blockly.JavaScript['drv8833.move'] = function(block) {
	var speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	// return [
	// 	'DEV_IO.DRV8833().move(' + block.getFieldValue('DIRECTION') + ', ' + speed + ');\n',
	// 	Blockly.JavaScript.ORDER_ATOMIC
	// ];

	return 'DEV_IO.DRV8833().move(' + block.getFieldValue('DIRECTION') + ', ' + speed + ');\n';
}

Blockly.JavaScript['drv8833.stop'] = function(block) {
	return 'DEV_IO.DRV8833().stop();\n';
}

Blockly.JavaScript["drv8833.speed_number"] = function(block) {
	// Numeric value.
	var code = parseFloat(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
};
