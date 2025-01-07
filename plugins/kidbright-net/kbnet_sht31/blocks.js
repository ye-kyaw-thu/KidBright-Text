Blockly.Blocks["kbnet_sht31.get_temperature"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET_SHT31_GET_TEMPERATURE_TITLE);

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour('#a15873');
		this.setTooltip(Blockly.Msg.KBNET_SHT31_GET_TEMPERATURE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET_SHT31_GET_TEMPERATURE_HELPURL);
	}
};

Blockly.Blocks["kbnet_sht31.get_humidity"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET_SHT31_GET_HUMIDITY_TITLE);

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour('#a15873');
		this.setTooltip(Blockly.Msg.KBNET_SHT31_GET_HUMIDITY_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET_SHT31_GET_HUMIDITY_HELPURL);
	}
};

Blockly.Blocks["kbnet_sht31.is_error"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET_SHT31_IS_ERROR_TITLE);

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour('#a15873');
		this.setTooltip(Blockly.Msg.KBNET_SHT31_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET_SHT31_IS_ERROR_HELPURL);
	}
};
