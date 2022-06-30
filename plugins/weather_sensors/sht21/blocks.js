Blockly.Blocks["sht21.get_temperature"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.SHT21_GET_TEMPERATURE_TITLE);

		// i2c channel 0 to 64
		var channel_array = [];
		for (var i = 0;i <= 64; i++) {
			channel_array.push([String(i), String(i)]);
		}
		this.appendDummyInput()
			.appendField(Blockly.Msg.CHANNEL)
			.appendField(new Blockly.FieldDropdown(channel_array), 'CHANNEL');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.SHT21_GET_TEMPERATURE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.SHT21_GET_TEMPERATURE_HELPURL);
	}
};

Blockly.Blocks["sht21.get_humidity"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.SHT21_GET_HUMIDITY_TITLE);

		// i2c channel 0 to 64
		var channel_array = [];
		for (var i = 0;i <= 64; i++) {
			channel_array.push([String(i), String(i)]);
		}
		this.appendDummyInput()
			.appendField(Blockly.Msg.CHANNEL)
			.appendField(new Blockly.FieldDropdown(channel_array), 'CHANNEL');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.SHT21_GET_HUMIDITY_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.SHT21_GET_HUMIDITY_HELPURL);
	}
};

Blockly.Blocks["sht21.is_error"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.SHT21_IS_ERROR_TITLE);

		// i2c channel 0 to 64
		var channel_array = [];
		for (var i = 0;i <= 64; i++) {
			channel_array.push([String(i), String(i)]);
		}
		this.appendDummyInput()
			.appendField(Blockly.Msg.CHANNEL)
			.appendField(new Blockly.FieldDropdown(channel_array), 'CHANNEL');

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.SHT21_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.SHT21_IS_ERROR_HELPURL);
	}
};
