Blockly.JavaScript['mcp23s17_16out.write'] = function(block) {
	return 'DEV_SPI.MCP23S17_16OUT(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ')' + '.write(' + block.getFieldValue('OUTPUT') + ', ' + block.getFieldValue('STATUS') + ');\n';
};

Blockly.JavaScript['mcp23s17_16out.write_output'] = function(block) {
	var output = Blockly.JavaScript.valueToCode(block, 'OUTPUT', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var status = Blockly.JavaScript.valueToCode(block, 'STATUS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return 'DEV_SPI.MCP23S17_16OUT(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ')' + '.write(' + output + ', ' + status + ');\n';
};

Blockly.JavaScript["mcp23s17_16out.output_number"] = function(block) {
	var code = parseFloat(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
};

Blockly.JavaScript["mcp23s17_16out.status_number"] = function(block) {
	return Blockly.JavaScript["mcp23s17_16out.output_number"](block);
};
