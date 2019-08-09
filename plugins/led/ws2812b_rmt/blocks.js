Blockly.Blocks["ws2812b_rmt.set_pixel_num"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'OUTPUT')
			.appendField(Blockly.Msg.WS2812B_SET_PIXEL_NUM_TITLE)
			.appendField(new Blockly.FieldNumber(64, 1, 64, 1), 'VALUE'); // default, min, max, step
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.WS2812B_SET_PIXEL_NUM_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.WS2812B_SET_PIXEL_NUM_HELPURL);
	}
};

Blockly.Blocks["ws2812b_rmt.get_pixel_num"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'OUTPUT')
			.appendField(Blockly.Msg.WS2812B_GET_PIXEL_NUM_TITLE);
		this.setOutput(true, 'Number');
		this.setColour(160);
		this.setTooltip(Blockly.Msg.WS2812B_GET_PIXEL_NUM_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.WS2812B_GET_PIXEL_NUM_HELPURL);
	}
};

Blockly.Blocks["ws2812b_rmt.pixel_rgb"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'OUTPUT');

		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B_POSITION);
		this.appendValueInput("POS")
			.setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B_RED);
		this.appendValueInput("RED")
			.setCheck("Number");
		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B_GREEN);
		this.appendValueInput("GREEN")
			.setCheck("Number");
		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B_BLUE);
		this.appendValueInput("BLUE")
			.setCheck("Number");

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.WS2812B_PIXEL_RGB_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.WS2812B_PIXEL_RGB_HELPURL);
	}
};

Blockly.Blocks["ws2812b_rmt.pixel_color_picker"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'OUTPUT');

		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B_POSITION);
		this.appendValueInput("POS")
			.setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.WS2812B_COLOR);
		this.appendDummyInput()
			.appendField(new Blockly.FieldColour("#ff0000"), "COLOR");

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.WS2812B_PIXEL_COLOR_PICKER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.WS2812B_PIXEL_COLOR_PICKER_HELPURL);
	}
};
