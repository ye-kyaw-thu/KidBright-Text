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

		// set default field dropdown
		this.inputList[0].fieldRow[1].setValue('IN2_GPIO');
	}
};

Blockly.Blocks["adsws1_rg.get_rain_gauge_counter"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADSWS1_RG_GET_RAIN_GAUGE_COUNTER_TITLE)
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
		this.setTooltip(Blockly.Msg.ADSWS1_RG_GET_RAIN_GAUGE_COUNTER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.ADSWS1_RG_GET_RAIN_GAUGE_COUNTER_HELPURL);

		// set default field dropdown
		this.inputList[0].fieldRow[1].setValue('IN2_GPIO');
	}
};

Blockly.Blocks["adsws1_rg.reset_rain_gauge"] = {
	init: function() {	
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADSWS1_RG_RESET_RAIN_GAUGE_TITLE)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'INPUT');

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(58);
		this.setTooltip(Blockly.ADSWS1_RG_RESET_RAIN_GAUGE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.ADSWS1_RG_RESET_RAIN_GAUGE_HELPURL);

		// set default field dropdown
		this.inputList[0].fieldRow[1].setValue('IN2_GPIO');
	}
};
