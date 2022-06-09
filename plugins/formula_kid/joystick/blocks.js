Blockly.Blocks["joystick_1.position"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.JOYSTICK_1_POSITION_TITLE)
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
			.appendField(Blockly.Msg.JOYSTICK_2_POSITION_TITLE)
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.JOYSTICK_2_POSITION_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.JOYSTICK_2_POSITION_HELPURL);
	}
};
