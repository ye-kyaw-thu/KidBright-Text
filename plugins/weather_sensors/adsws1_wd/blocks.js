Blockly.Blocks["adsws1_wd.get_wind_direction_degrees"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADSWS1_WD_GET_WIND_DIRECTION_DEGREES_TITLE)
			.appendField(Blockly.Msg.ADSWS1_WD_TRIG)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'OUTPUT')
			.appendField(Blockly.Msg.ADSWS1_WD_CAPTURE)
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
		this.setTooltip(Blockly.Msg.ADSWS1_WD_GET_WIND_DIRECTION_DEGREES_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.ADSWS1_WD_GET_WIND_DIRECTION_DEGREES_HELPURL);

		// set default field dropdown
		this.inputList[0].fieldRow[4].setValue('IN3_GPIO');
	}
};

Blockly.Blocks["adsws1_wd.is_error"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.WIND_DIRECTION_IS_ERROR_TITLE)
			.appendField(Blockly.Msg.ADSWS1_WD_TRIG)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'OUTPUT')
			.appendField(Blockly.Msg.ADSWS1_WD_CAPTURE)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'INPUT');

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.WIND_DIRECTION_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.WIND_DIRECTION_IS_ERROR_HELPURL);

		// set default field dropdown
		this.inputList[0].fieldRow[4].setValue('IN3_GPIO');
	}
};
