Blockly.Blocks["kbnet2_sleep.deep_wakeup_after"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_AFTER_TITLE);

		this.appendDummyInput('WAKEUP_TIMEOUT_DUMMY')
			.appendField(new Blockly.FieldNumber(1, 1, 86400, 1), 'WAKEUP_TIMEOUT') // default, min, max, step
			.appendField(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_SECONDS);

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_AFTER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_AFTER_HELPURL);
	}
};

Blockly.Blocks["kbnet2_sleep.deep_wakeup_every"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_EVERY_TITLE);

		this.appendDummyInput('WAKEUP_TIMEOUT_DUMMY')
			.appendField(new Blockly.FieldNumber(1, 1, 86400, 1), 'WAKEUP_TIMEOUT') // default, min, max, step
			.appendField(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_SECONDS);

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_EVERY_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_SLEEP_DEEP_WAKEUP_EVERY_HELPURL);
	}
};
