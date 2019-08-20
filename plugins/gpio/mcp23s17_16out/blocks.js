function mcp23s17_16out_init(_this) {
	_this.appendDummyInput()
		.appendField(Blockly.Msg.MCP23S17_16OUT_WRITE_TITLE);

	// spi channel 0 to 64
	var channel_array = [];
	for (var i = 0;i <= 64; i++) {
		channel_array.push([String(i), String(i)]);
	}
	_this.appendDummyInput()
		.appendField(Blockly.Msg.CHANNEL)
		.appendField(
			new Blockly.FieldDropdown(channel_array, function(selectedIndex) {
				// if address item index > 3 for selected index 0, set address item index to 0
				if (selectedIndex == 0) {
					if (Blockly.mcp23s17_get_address_item_index(selectedIndex, _this.sourceBlock_.inputList[2].fieldRow[1].value_) > 3) {
						_this.sourceBlock_.inputList[2].fieldRow[1].setValue(Blockly.mcp23s17_address_dropdown_menu(0)[0][1]);
					}
				}
				return selectedIndex;
			}),
			'CHANNEL'
		);

	// device addess 0 to 3 for channel 0, addess 0 to 7 for channel 1 to 64
	_this.appendDummyInput()
		.appendField(Blockly.Msg.ADDRESS)
		.appendField(new Blockly.FieldDropdown(function() {
			try {
				if ((typeof(_this.sourceBlock_) != "undefined") && (typeof(_this.sourceBlock_.inputList) != "undefined")) {
					var selected_channel = parseInt(_this.sourceBlock_.inputList[1].fieldRow[1].value_);
					return Blockly.mcp23s17_address_dropdown_menu(selected_channel);
				}
			} catch (e) {

			}
			// default
			return Blockly.mcp23s17_address_dropdown_menu(0);
		}), 'ADDRESS');
}

Blockly.Blocks["mcp23s17_16out.write"] = {
	init: function() {
		// init
		mcp23s17_16out_init(this);

		// mcp23s17 gpio
		this.appendDummyInput()
			.appendField(Blockly.Msg.OUTPUT)
			.appendField(new Blockly.FieldDropdown([
				["0", "0"],
				["1", "1"],
				["2", "2"],
				["3", "3"],
				["4", "4"],
				["5", "5"],
				["6", "6"],
				["7", "7"],
				["8", "8"],
				["9", "9"],
				["10", "10"],
				["11", "11"],
				["12", "12"],
				["13", "13"],
				["14", "14"],
				["15", "15"]
			]), 'OUTPUT')
			.appendField(Blockly.Msg.STATUS)
			.appendField(new Blockly.FieldDropdown([
				["0", "0"],
				["1", "1"]
			]), 'STATUS');

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.MCP23S17_16OUT_WRITE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.MCP23S17_16OUT_WRITE_HELPURL);
	}
};

Blockly.Blocks["mcp23s17_16out.write_output"] = {
	init: function() {
		// init
		mcp23s17_16out_init(this);

		this.appendDummyInput()
			.appendField(Blockly.Msg.OUTPUT);

		// mcp23s17 gpio
		this.appendValueInput("OUTPUT")
			.setCheck("Number");
		this.appendDummyInput()
			.appendField(Blockly.Msg.STATUS);
		this.appendValueInput("STATUS")
			.setCheck("Number");

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.MCP23S17_16OUT_WRITE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.MCP23S17_16OUT_WRITE_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'mcp23s17_16out.write_output'
		}).append('\
		   <value name="OUTPUT">\
			   <shadow type="mcp23s17_16out.output_number">\
			   </shadow>\
		   </value>\
		   <value name="STATUS">\
			   <shadow type="mcp23s17_16out.status_number">\
			   </shadow>\
		   </value>'
	   );
   }
};

// hidden block (no generator defined), temporary used for shadow block
Blockly.Blocks["mcp23s17_16out.output_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(0, 0, 15, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.MCP23S17_16OUT_OUTPUT_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.MCP23S17_16OUT_OUTPUT_NUMBER_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};

Blockly.Blocks["mcp23s17_16out.status_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(0, 0, 1, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.MCP23S17_16OUT_STATUS_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.MCP23S17_16OUT_STATUS_NUMBER_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};
