Blockly.Blocks["kbnet2_sht3x.get_temperature"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_SHT3X_GET_TEMPERATURE_TITLE);

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_SHT3X_GET_TEMPERATURE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_SHT3X_GET_TEMPERATURE_HELPURL);
	}
};

Blockly.Blocks["kbnet2_sht3x.get_humidity"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_SHT3X_GET_HUMIDITY_TITLE);

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_SHT3X_GET_HUMIDITY_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_SHT3X_GET_HUMIDITY_HELPURL);
	}
};

Blockly.Blocks["kbnet2_sht3x.is_error"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_SHT3X_IS_ERROR_TITLE);

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_SHT3X_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_SHT3X_IS_ERROR_HELPURL);
	}
};
