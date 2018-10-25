Blockly.Blocks["sht31.get_temperature"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.SHT31_GET_TEMPERATURE_TITLE);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.SHT31_GET_TEMPERATURE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.SHT31_GET_TEMPERATURE_HELPURL);
	}
};

Blockly.Blocks["sht31.get_humidity"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.SHT31_GET_HUMIDITY_TITLE);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.SHT31_GET_HUMIDITY_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.SHT31_GET_HUMIDITY_HELPURL);
	}
};
