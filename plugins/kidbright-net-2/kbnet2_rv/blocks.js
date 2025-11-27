Blockly.Blocks["kbnet2_rv.get_rain_volume_mm"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_RV_GET_RAIN_VOLUME_MM_TITLE);

		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_RV_GET_RAIN_VOLUME_MM_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_RV_GET_RAIN_VOLUME_MM_HELPURL);
	}
};
/*
Blockly.Blocks["kbnet2_rv.get_rain_volume_counter"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_RV_GET_RAIN_VOLUME_COUNTER_TITLE);

		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_RV_GET_RAIN_VOLUME_COUNTER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_RV_GET_RAIN_VOLUME_COUNTER_HELPURL);
	}
};

Blockly.Blocks["kbnet2_rv.reset_rain_volume"] = {
	init: function() {	
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_RV_RESET_RAIN_VOLUME_TITLE);

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(230);
		this.setTooltip(Blockly.KBNET2_RV_RESET_RAIN_VOLUME_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_RV_RESET_RAIN_VOLUME_HELPURL);
	}
};
*/
