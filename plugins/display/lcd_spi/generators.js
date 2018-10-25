const lcd_spi_20x4 = 'DEV_SPI.LCD_SPI(0, 0x00, 20, 4)'; // bus_ch(0-64), bus_addr(0-7), lcd_column, lcd_row

Blockly.JavaScript['lcd_spi_20x4.clear'] = function(block) {
	return lcd_spi_20x4 + '.clear();\n';
};

Blockly.JavaScript['lcd_spi_20x4.backlight'] = function(block) {
	return lcd_spi_20x4 + '.backlight(' + block.getFieldValue('STATUS') + ');\n';
}

Blockly.JavaScript['lcd_spi_20x4.print'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	var column = parseInt(block.getFieldValue('COLUMN')) - 1;
	var row = parseInt(block.getFieldValue('ROW')) - 1;
	return lcd_spi_20x4 + '.print(' + column + ', ' + row + ', ' + argument0 + ');\n';
};
