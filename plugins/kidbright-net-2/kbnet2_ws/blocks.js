Blockly.Blocks["kbnet2_ws.get_wind_speed_km_h"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_WS_GET_WIND_SPEED_KM_H_TITLE);

		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_WS_GET_WIND_SPEED_KM_H_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_WS_GET_WIND_SPEED_KM_H_HELPURL);
	}
};
/*
Blockly.Blocks["kbnet2_ws.get_wind_speed_km_h_text"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_WS_GET_WIND_SPEED_KM_H_TEXT_TITLE)
			.appendField(Blockly.Msg.PRECISION_TITLE)
			.appendField(new Blockly.FieldNumber(1, 0, 6, 1), 'PREC');

		this.setOutput(true, 'String');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_WS_GET_WIND_SPEED_KM_H_TEXT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_WS_GET_WIND_SPEED_KM_H_TEXT_HELPURL);
	}
};
*/
