Blockly.Blocks["drv8833.move"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.DRV8833_MOVE_TITLE)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.MOVE_FORWARD, "0"],
				[Blockly.Msg.MOVE_BACKWARD, "1"],
				[Blockly.Msg.TURN_LEFT, "2"],
				[Blockly.Msg.TURN_RIGHT, "3"]
			]), 'DIRECTION');

		this.appendDummyInput()
			.appendField(Blockly.Msg.MOTOR_SPEED)
		this.appendValueInput("SPEED").setCheck("Number");
		this.appendDummyInput()
			.appendField('%');

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.DRV8833_MOVE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.DRV8833_MOVE_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'drv8833.move'
		}).append('\
		   <value name="SPEED">\
			   <shadow type="drv8833.speed_number">\
			   </shadow>\
		   </value>'
	   );
   }
};

Blockly.Blocks["drv8833.stop"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.DRV8833_STOP_TITLE);

		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.DRV8833_STOP_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.DRV8833_STOP_HELPURL);
	}
};

// hidden block (no generator defined), temporary used for shadow block
Blockly.Blocks["drv8833.speed_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(50, -100, 100, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.DRV8833_SPEED_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.DRV8833_SPEED_NUMBER_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};
