Blockly.Blocks["ds18b20_i2c.get_temperature"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.DS18B20_I2C_GET_TEMPERATURE_TITLE);

		// i2c channel 0 to 64
		var channel_array = [];
		for (var i = 0;i <= 64; i++) {
			channel_array.push([String(i), String(i)]);
		}
		this.appendDummyInput()
			.appendField(Blockly.Msg.CHANNEL)
			.appendField(new Blockly.FieldDropdown(channel_array), 'CHANNEL');

		// device addess (ds2482 i2c to 1-wire)
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADDRESS)
			.appendField(new Blockly.FieldDropdown([
				["0x18", "24"],
				["0x19", "25"],
				["0x1A", "26"],
				["0x1B", "27"]
			]), 'ADDRESS');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.DS18B20_I2C_GET_TEMPERATURE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.DS18B20_I2C_GET_TEMPERATURE_HELPURL);
	}
};
