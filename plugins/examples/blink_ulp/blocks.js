Blockly.Blocks["blink_ulp.start"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.BLINK_ULP_START_TITLE);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLINK_ULP_START_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLINK_ULP_START_HELPURL);
	}
};

Blockly.Blocks["blink_ulp.stop"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.BLINK_ULP_STOP_TITLE);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLINK_ULP_STOP_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLINK_ULP_STOP_HELPURL);
	}
};
