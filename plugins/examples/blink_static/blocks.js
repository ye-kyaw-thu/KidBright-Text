Blockly.Blocks["blink_static.start"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.BLINK_STATIC_START_TITLE)
			.appendField(new Blockly.FieldDropdown([
				["BT_LED", "BT_LED_GPIO"],												
				["WIFI_LED", "WIFI_LED_GPIO"],
				["NTP_LED", "NTP_LED_GPIO"],
				["IOT_LED", "IOT_LED_GPIO"]
			]), 'LED_GPIO')
			.appendField(new Blockly.FieldDropdown([
				["SLOW", "500"],
				["FAST", "100"]
			]), 'BLINK_MS');
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLINK_STATIC_START_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLINK_STATIC_START_HELPURL);
	}
};

Blockly.Blocks["blink_static.stop"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.BLINK_STATIC_STOP_TITLE)
			.appendField(new Blockly.FieldDropdown([
				["BT_LED", "BT_LED_GPIO"],
				["WIFI_LED", "WIFI_LED_GPIO"],
				["NTP_LED", "NTP_LED_GPIO"],
				["IOT_LED", "IOT_LED_GPIO"]
			]), 'LED_GPIO');
			
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLINK_STATIC_STOP_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLINK_STATIC_STOP_HELPURL);
	}
};
