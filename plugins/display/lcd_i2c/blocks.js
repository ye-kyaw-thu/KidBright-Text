function lcd_i2c_20x4_init(_this) {
	_this.appendDummyInput()
		.appendField(Blockly.Msg.LCD_I2C_20X4_TITLE);

	// i2c channel 0 to 64
	var channel_array = [];
	for (var i = 0;i <= 64; i++) {
		channel_array.push([String(i), String(i)]);
	}
	_this.appendDummyInput()
		.appendField(Blockly.Msg.CHANNEL)
		.appendField(new Blockly.FieldDropdown(channel_array), 'CHANNEL');

	// device addess
	_this.appendDummyInput()
		.appendField(Blockly.Msg.ADDRESS)
		.appendField(new Blockly.FieldDropdown([
			["0x20", "32"],
			["0x21", "33"],
			["0x22", "34"],
			["0x23", "35"],
			["0x24", "36"],
			["0x25", "37"],
			["0x26", "38"],
			["0x27", "39"]
		]), 'ADDRESS');
}

Blockly.Blocks["lcd_i2c_20x4.clear"] = {
	init: function() {
		// init
		lcd_i2c_20x4_init(this);

		this.appendDummyInput()
			.appendField(Blockly.Msg.LCD_I2C_20X4_CLR_TITLE);

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_CLR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_CLR_HELPURL);
	}
};

Blockly.Blocks["lcd_i2c_20x4.backlight"] = {
	init: function() {
		// init
		lcd_i2c_20x4_init(this);

		this.appendDummyInput()
			.appendField(Blockly.Msg.LCD_I2C_20X4_BACKLIGHT_TITLE)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.STATUS_OFF, "0"],
				[Blockly.Msg.STATUS_ON, "1"]
			]), 'STATUS');

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_BACKLIGHT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_BACKLIGHT_HELPURL);
	}
};

Blockly.Blocks["lcd_i2c_20x4.print"] = {
	init: function() {
		// init
		lcd_i2c_20x4_init(this);

		this.appendDummyInput()
			.appendField(Blockly.Msg.LCD_I2C_20X4_PRINT_TITLE + ' (');
		this.appendValueInput("COLUMN")
			.setCheck("Number");
		this.appendDummyInput()
			.appendField(',');
		this.appendValueInput("ROW")
		 	.setCheck("Number");
		this.appendDummyInput()
		 	.appendField(')');
		this.appendValueInput('VALUE');

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_PRINT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_PRINT_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'lcd_i2c_20x4.print'
		}).append('\
		   <value name="COLUMN">\
			   <shadow type="lcd_i2c_20x4.column_number">\
			   </shadow>\
		   </value>\
		   <value name="ROW">\
			   <shadow type="lcd_i2c_20x4.row_number">\
			   </shadow>\
		   </value>\
		   <value name="VALUE">\
			  <shadow type="lcd_i2c_20x4.string_number">\
			  </shadow>\
		  </value>'
	   );
   }
};

Blockly.Blocks["lcd_i2c_20x4.print_prec"] = {
	init: function() {
		// init
		lcd_i2c_20x4_init(this);

		this.appendDummyInput()
			.appendField(Blockly.Msg.LCD_I2C_20X4_PRINT_PREC_TITLE + ' (');
		this.appendValueInput("COLUMN")
			.setCheck("Number");
		this.appendDummyInput()
			.appendField(',');
		this.appendValueInput("ROW")
			.setCheck("Number");
		this.appendDummyInput()
			.appendField(')')
			.appendField(Blockly.Msg.PRECISION_TITLE)
			.appendField(new Blockly.FieldNumber(2, 0, 4, 1), 'PREC')
			.appendField(' ');
		this.appendValueInput('VALUE')
			.setCheck('Number');

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_PRINT_PREC_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_PRINT_PREC_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'lcd_i2c_20x4.print_prec'
		}).append('\
		   <value name="COLUMN">\
			   <shadow type="lcd_i2c_20x4.column_number">\
			   </shadow>\
		   </value>\
		   <value name="ROW">\
			   <shadow type="lcd_i2c_20x4.row_number">\
			   </shadow>\
		   </value>\
		   <value name="VALUE">\
			  <shadow type="lcd_i2c_20x4.number">\
			  </shadow>\
		  </value>'
	   );
   }
};

// hidden block (no generator defined), temporary used for shadow block
Blockly.Blocks["lcd_i2c_20x4.column_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(1, 1, 20, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_COLUMN_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_COLUMN_NUMBER_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["lcd_i2c_20x4.row_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(1, 1, 4, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_ROW_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_ROW_NUMBER_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["lcd_i2c_20x4.string_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC', 12, 12, '*'))
			.appendField(new Blockly.FieldTextInput('Hello World!'), 'VALUE')
			.appendField(new Blockly.FieldImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==', 12, 12, '*'));
		this.setOutput(true, 'String');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(basic_colour);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_STRING_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_STRING_NUMBER_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["lcd_i2c_20x4.number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(0, -9999999, 9999999, 0.01), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.LCD_I2C_20X4_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.LCD_I2C_20X4_NUMBER_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return null; // hidden block
	}
};
