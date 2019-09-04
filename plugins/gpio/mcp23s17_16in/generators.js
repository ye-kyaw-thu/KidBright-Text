Blockly.JavaScript['mcp23s17_16in.read'] = function(block) {
	return [
		'DEV_SPI.MCP23S17_16IN(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ')' + '.read(' + block.getFieldValue('INPUT') + ')',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['mcp23s17_16in.read_input'] = function(block) {
	var input = Blockly.JavaScript.valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return [
		'DEV_SPI.MCP23S17_16IN(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ')' + '.read(' + input + ')',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript["mcp23s17_16in.input_number"] = function(block) {
	var code = parseFloat(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
};
