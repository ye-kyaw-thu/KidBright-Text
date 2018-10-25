const lcd_i2c_20x4 = 'DEV_I2C1.LCD_I2C(57, 0x20, 20, 4)'; // bus_ch(0-64), bus_addr(0x20-0x27), lcd_column, lcd_row

Blockly.JavaScript['lcd_i2c_20x4.clear'] = function(block) {
	return lcd_i2c_20x4 + '.clear();\n';
};

Blockly.JavaScript['lcd_i2c_20x4.backlight'] = function(block) {
	return lcd_i2c_20x4 + '.backlight(' + block.getFieldValue('STATUS') + ');\n';
}

Blockly.JavaScript['lcd_i2c_20x4.print'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	var column = parseInt(block.getFieldValue('COLUMN')) - 1;
	var row = parseInt(block.getFieldValue('ROW')) - 1;
	return lcd_i2c_20x4 + '.print(' + column + ', ' + row + ', ' + argument0 + ');\n';
};
