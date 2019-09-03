Blockly.JavaScript['pulse_gen.write'] = function(block) {
	var type = block.getFieldValue('TYPE');
	var width = Blockly.JavaScript.valueToCode(block, 'WIDTH_US', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var wait = block.getFieldValue('WAIT');

	return 'DEV_IO.PULSE_GEN(' + block.getFieldValue('OUTPUT') + ')' + '.write(' + type + ', ' + width + ', ' + wait + ');\n';
};

Blockly.JavaScript["pulse_gen.width_us_number"] = function(block) {
	var code = parseFloat(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
};
