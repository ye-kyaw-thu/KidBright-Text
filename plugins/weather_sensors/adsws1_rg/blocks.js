Blockly.Blocks["adsws1_rg.get_rain_gauge_mm"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADSWS1_RG_GET_RAIN_GAUGE_MM_TITLE)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'INPUT');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.ADSWS1_RG_GET_RAIN_GAUGE_MM_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.ADSWS1_RG_GET_RAIN_GAUGE_MM_HELPURL);
	}
};
