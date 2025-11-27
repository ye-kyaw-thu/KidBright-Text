Blockly.Blocks["kbnet2_oled.clear"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_CLR_TITLE);

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_CLR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_CLR_HELPURL);
	}
};

Blockly.Blocks["kbnet2_oled.putstr"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_PRINT_TITLE + ' (');
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
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_PRINT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_PRINT_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'kbnet2_oled.putstr'
		}).append('\
		   <value name="COLUMN">\
			   <shadow type="kbnet2_oled.column_number">\
			   </shadow>\
		   </value>\
		   <value name="ROW">\
			   <shadow type="kbnet2_oled.row_number">\
			   </shadow>\
		   </value>\
		   <value name="VALUE">\
			  <shadow type="kbnet2_oled.string_number">\
			  </shadow>\
		  </value>'
	   );
   }
};

Blockly.Blocks["kbnet2_oled.putstr_prec"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_PRINT_PREC_TITLE + ' (');
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
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_PRINT_PREC_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_PRINT_PREC_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'kbnet2_oled.putstr_prec'
		}).append('\
		   <value name="COLUMN">\
			   <shadow type="kbnet2_oled.column_number">\
			   </shadow>\
		   </value>\
		   <value name="ROW">\
			   <shadow type="kbnet2_oled.row_number">\
			   </shadow>\
		   </value>\
		   <value name="VALUE">\
			  <shadow type="kbnet2_oled.number">\
			  </shadow>\
		  </value>'
	   );
   }
};

Blockly.Blocks["kbnet2_oled.putstr_big"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_PRINT_BIG_TITLE + ' (');
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
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_PRINT_BIG_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_PRINT_BIG_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'kbnet2_oled.putstr_big'
		}).append('\
		   <value name="COLUMN">\
			   <shadow type="kbnet2_oled.column_number">\
			   </shadow>\
		   </value>\
		   <value name="ROW">\
			   <shadow type="kbnet2_oled.row_number">\
			   </shadow>\
		   </value>\
		   <value name="VALUE">\
			  <shadow type="kbnet2_oled.string_number">\
			  </shadow>\
		  </value>'
	   );
   }
};

Blockly.Blocks["kbnet2_oled.putstr_big_prec"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_OLED_PRINT_BIG_PREC_TITLE + ' (');
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
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_PRINT_BIG_PREC_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_PRINT_BIG_PREC_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'kbnet2_oled.putstr_big_prec'
		}).append('\
		   <value name="COLUMN">\
			   <shadow type="kbnet2_oled.column_number">\
			   </shadow>\
		   </value>\
		   <value name="ROW">\
			   <shadow type="kbnet2_oled.row_number">\
			   </shadow>\
		   </value>\
		   <value name="VALUE">\
			  <shadow type="kbnet2_oled.number">\
			  </shadow>\
		  </value>'
	   );
   }
};

// hidden block (no generator defined), temporary used for shadow block
Blockly.Blocks["kbnet2_oled.column_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(1, 1, 21, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_COLUMN_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_COLUMN_NUMBER_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["kbnet2_oled.row_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(1, 1, 8, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_ROW_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_ROW_NUMBER_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["kbnet2_oled.string_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC', 12, 12, '*'))
			.appendField(new Blockly.FieldTextInput('Hello World!'), 'VALUE')
			.appendField(new Blockly.FieldImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==', 12, 12, '*'));
		this.setOutput(true, 'String');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(basic_colour);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_STRING_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_STRING_NUMBER_TOOLTIP);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["kbnet2_oled.number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(0, -9999999, 9999999, 0.01), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.KBNET2_OLED_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_OLED_NUMBER_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return null; // hidden block
	}
};
