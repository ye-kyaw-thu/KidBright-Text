Blockly.Blocks["joystick_1.position"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_1_POSITION_TITLE);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.JOYSTICK_1_POSITION_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_1_POSITION_HELPURL);
	}
};

Blockly.Blocks["joystick_2.position"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_2_POSITION_TITLE);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.JOYSTICK_2_POSITION_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_2_POSITION_HELPURL);
	}
};

Blockly.Blocks["joystick_1.calibrate_set"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_1_CALIBRATE_SET_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_RELEASE);
		this.appendValueInput("RELEASE").setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_DOWNMOST);
		this.appendValueInput("DOWNMOST").setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_UPMOST);
		this.appendValueInput("UPMOST").setCheck("Number");

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.JOYSTICK_1_CALIBRATE_SET_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_1_CALIBRATE_SET_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'joystick_1.calibrate_set'
		}).append('\
		   <value name="RELEASE">\
			   <shadow type="joystick.release_default">\
			   </shadow>\
		   </value>\
		   <value name="DOWNMOST">\
			  <shadow type="joystick.downmost_default">\
			  </shadow>\
		  </value>\
		  <value name="UPMOST">\
			 <shadow type="joystick.upmost_default">\
			 </shadow>\
		 </value>'
	   );
   }
};

Blockly.Blocks["joystick_2.calibrate_set"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_2_CALIBRATE_SET_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_RELEASE);
		this.appendValueInput("RELEASE").setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_LEFTMOST);
		this.appendValueInput("LEFTMOST").setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_RIGHTMOST);
		this.appendValueInput("RIGHTMOST").setCheck("Number");

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.JOYSTICK_2_CALIBRATE_SET_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_2_CALIBRATE_SET_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'joystick_2.calibrate_set'
		}).append('\
		   <value name="RELEASE">\
			   <shadow type="joystick.release_default">\
			   </shadow>\
		   </value>\
		   <value name="LEFTMOST">\
			  <shadow type="joystick.leftmost_default">\
			  </shadow>\
		  </value>\
		  <value name="RIGHTMOST">\
			 <shadow type="joystick.rightmost_default">\
			 </shadow>\
		 </value>'
	   );
   }
};

// hidden block (no generator defined), temporary used for shadow block
Blockly.Blocks["joystick.release_default"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(0, -100, 100, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.JOYSTICK_RELEASE_DEFAULT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_RELEASE_DEFAULT_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["joystick.downmost_default"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(-100, -100, 100, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.JOYSTICK_DOWNMOST_DEFAULT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_DOWNMOST_DEFAULT_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["joystick.upmost_default"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(100, -100, 100, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.JOYSTICK_UPMOST_DEFAULT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_UPMOST_DEFAULT_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["joystick.leftmost_default"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(-100, -100, 100, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.JOYSTICK_LEFTMOST_DEFAULT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_LEFTMOST_DEFAULT_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["joystick.rightmost_default"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(100, -100, 100, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.JOYSTICK_RIGHTMOST_DEFAULT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_RIGHTMOST_DEFAULT_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};
