Blockly.Blocks["kbnet2_pms9103m.getpm2_5"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_PMS9103M_GET_PM2_5_TITLE);

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_PMS9103M_GET_PM2_5_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_PMS9103M_GET_PM2_5_HELPURL);
	}
};

Blockly.Blocks["kbnet2_pms9103m.getpm10"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_PMS9103M_GET_PM10_TITLE);

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_PMS9103M_GET_PM10_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_PMS9103M_GET_PM10_HELPURL);
	}
};

Blockly.Blocks["kbnet2_pms9103m.is_error"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_PMS9103M_IS_ERROR_TITLE);

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_PMS9103M_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_PMS9103M_IS_ERROR_HELPURL);
	}
};

Blockly.Blocks["kbnet2_pms9103m.power_off"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_PMS9103M_POWER_OFF_TITLE);

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_PMS9103M_POWER_OFF_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_PMS9103M_POWER_OFF_HELPURL);
	}
};
