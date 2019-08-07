Blockly.Blocks["ads1115.get_volt"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADS1115_GET_LUX_TITLE);

		// i2c channel 0 to 64
		var channel_array = [];
		for (var i = 0;i <= 64; i++) {
			channel_array.push([String(i), String(i)]);
		}
		this.appendDummyInput()
			.appendField(Blockly.Msg.CHANNEL)
			.appendField(new Blockly.FieldDropdown(channel_array), 'CHANNEL');

		// device addess
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADDRESS)
			.appendField(new Blockly.FieldDropdown([
				["0x48", "72"],
				["0x49", "73"],
				["0x4A", "74"],
				["0x4B", "75"]
			]), 'ADDRESS');

		// adc channel
		this.appendDummyInput()
			.appendField(' ')
			.appendField(new Blockly.FieldDropdown([
				["AIN0", "0"],
				["AIN1", "1"],
				["AIN2", "2"],
				["AIN3", "3"]
			]), 'AIN');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.ADS1115_GET_LUX_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.ADS1115_GET_LUX_HELPURL);
	}
};
