Blockly.JavaScript['kbnet2_oled.clear'] = function(block) {
	return 'DEV_I2C1.KBNET2_OLED().clear();\n';
};

Blockly.JavaScript['kbnet2_oled.putstr'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var column = Blockly.JavaScript.valueToCode(block, 'COLUMN', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var row = Blockly.JavaScript.valueToCode(block, 'ROW', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return 'DEV_I2C1.KBNET2_OLED().putstr(' + column + ', ' + row + ', ' + argument0 + ');\n';
};

Blockly.JavaScript['kbnet2_oled.putstr_prec'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var column = Blockly.JavaScript.valueToCode(block, 'COLUMN', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var row = Blockly.JavaScript.valueToCode(block, 'ROW', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var prec = parseInt(block.getFieldValue('PREC'));
	if (prec < 0) {
		prec = 0;
	}
	if (prec > 4) {
		prec = 4;
	}

	return 'DEV_I2C1.KBNET2_OLED().putstr(' + column + ', ' + row + ', ' + argument0 + ', ' + prec + ');\n';
};

Blockly.JavaScript['kbnet2_oled.putstr_big'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var column = Blockly.JavaScript.valueToCode(block, 'COLUMN', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var row = Blockly.JavaScript.valueToCode(block, 'ROW', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return 'DEV_I2C1.KBNET2_OLED().putstr_big(' + column + ', ' + row + ', ' + argument0 + ');\n';
};

Blockly.JavaScript['kbnet2_oled.putstr_big_prec'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var column = Blockly.JavaScript.valueToCode(block, 'COLUMN', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var row = Blockly.JavaScript.valueToCode(block, 'ROW', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var prec = parseInt(block.getFieldValue('PREC'));

	if (prec < 0) {
		prec = 0;
	}
	if (prec > 4) {
		prec = 4;
	}

	return 'DEV_I2C1.KBNET2_OLED().putstr_big(' + column + ', ' + row + ', ' + argument0 + ', ' + prec + ');\n';
};

Blockly.JavaScript["kbnet2_oled.column_number"] = function(block) {
	// Numeric value.
	var code = parseFloat(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
};

Blockly.JavaScript["kbnet2_oled.row_number"] = function(block) {
	return Blockly.JavaScript["kbnet2_oled.column_number"](block);
};

Blockly.JavaScript["kbnet2_oled.string_number"] = function(block) {
	return [
		'(char *)"' + block.getFieldValue('VALUE') + '"',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript["kbnet2_oled.number"] = function(block) {
	return Blockly.JavaScript["kbnet2_oled.column_number"](block);
};
