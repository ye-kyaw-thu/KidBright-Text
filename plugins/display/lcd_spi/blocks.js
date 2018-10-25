Blockly.Blocks["lcd_spi_20x4.clear"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.LCD_SPI_20X4_CLR_TITLE);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.LCD_SPI_20X4_CLR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_SPI_20X4_CLR_HELPURL);
	}
};

Blockly.Blocks["lcd_spi_20x4.backlight"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.LCD_SPI_20X4_BACKLIGHT_TITLE)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.STATUS_OFF, "0"],
				[Blockly.Msg.STATUS_ON, "1"]
			]), 'STATUS');
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.LCD_SPI_20X4_BACKLIGHT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_SPI_20X4_BACKLIGHT_HELPURL);
	}
};

Blockly.Blocks["lcd_spi_20x4.print"] = {
	init: function() {
		this.appendValueInput('VALUE')
			.appendField(Blockly.Msg.LCD_SPI_20X4_PRINT_TITLE)
			.appendField('(')
			.appendField(new Blockly.FieldNumber(1, 1, 20, 1), 'COLUMN')
			.appendField(',')
			.appendField(new Blockly.FieldNumber(1, 1, 4, 1), 'ROW')
			.appendField(')');
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.LCD_SPI_20X4_PRINT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_SPI_20X4_PRINT_HELPURL);
	}
};
