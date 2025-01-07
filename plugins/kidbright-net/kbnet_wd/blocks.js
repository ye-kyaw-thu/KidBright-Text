Blockly.Blocks["kbnet_wd.get_wind_direction_degrees"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET_WD_GET_WIND_DIRECTION_DEGREES_TITLE);

		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour('#a15873');
		this.setTooltip(Blockly.Msg.KBNET_WD_GET_WIND_DIRECTION_DEGREES_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET_WD_GET_WIND_DIRECTION_DEGREES_HELPURL);
	}
};

Blockly.Blocks["kbnet_wd.is_error"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET_WD_IS_ERROR_TITLE);

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour('#a15873');
		this.setTooltip(Blockly.Msg.KBNET_WD_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET_WD_IS_ERROR_HELPURL);
	}
};
