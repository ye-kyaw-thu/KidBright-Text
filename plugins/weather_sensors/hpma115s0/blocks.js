Blockly.Blocks["hpma115s0.getpm2_5"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_GET_PM2_5_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_TX)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'TX');

		// device addess
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_RX)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'RX');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.HPMA115S0_GET_PM2_5_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.HPMA115S0_GET_PM2_5_HELPURL);
	}
};

Blockly.Blocks["hpma115s0.getpm10"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_GET_PM10_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_TX)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'TX');

		// device addess
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_RX)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'RX');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.HPMA115S0_GET_PM10_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.HPMA115S0_GET_PM10_HELPURL);
	}
};

Blockly.Blocks["hpma115s0.is_error"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_IS_ERROR_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_TX)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'TX');

		// device addess
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_RX)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'RX');

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.HPMA115S0_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.HPMA115S0_IS_ERROR_HELPURL);
	}
};

Blockly.Blocks["hpma115s0.get_error_count"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_GET_ERROR_COUNT_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_TX)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'TX');

		// device addess
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_RX)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'RX');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.HPMA115S0_GET_ERROR_COUNT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.HPMA115S0_GET_ERROR_COUNT_HELPURL);
	}
};

Blockly.Blocks["hpma115s0.get_error_clear_count"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_GET_ERROR_CLEAR_COUNT_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_TX)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'TX');

		// device addess
		this.appendDummyInput()
			.appendField(Blockly.Msg.HPMA115S0_PM_RX)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'RX');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.HPMA115S0_GET_ERROR_CLEAR_COUNT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.HPMA115S0_GET_ERROR_CLEAR_COUNT_HELPURL);
	}
};
