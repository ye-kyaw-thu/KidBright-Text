Blockly.Blocks["si7021.get_temperature"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.SI7021_GET_TEMPERATURE_TITLE);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.SI7021_GET_TEMPERATURE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.SI7021_GET_TEMPERATURE_HELPURL);
	}
};

Blockly.Blocks["si7021.get_humidity"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.SI7021_GET_HUMIDITY_TITLE);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.SI7021_GET_HUMIDITY_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.SI7021_GET_HUMIDITY_HELPURL);
	}
};
