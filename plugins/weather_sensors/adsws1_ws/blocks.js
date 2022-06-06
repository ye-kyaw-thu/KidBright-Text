Blockly.Blocks["adsws1_ws.get_wind_speed_km_h"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADSWS1_WS_GET_WIND_SPEED_KM_H_TITLE)
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
		this.setTooltip(Blockly.Msg.ADSWS1_WS_GET_WIND_SPEED_KM_H_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.ADSWS1_WS_GET_WIND_SPEED_KM_H_HELPURL);
	}
};

Blockly.Blocks["adsws1_ws.get_wind_speed_km_h_text"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADSWS1_WS_GET_WIND_SPEED_KM_H_TEXT_TITLE)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'INPUT')		
			.appendField(Blockly.Msg.PRECISION_TITLE)
			.appendField(new Blockly.FieldNumber(1, 0, 6, 1), 'PREC');

		this.setOutput(true, 'String');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.ADSWS1_WS_GET_WIND_SPEED_KM_H_TEXT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.ADSWS1_WS_GET_WIND_SPEED_KM_H_TEXT_HELPURL);
	}
};
