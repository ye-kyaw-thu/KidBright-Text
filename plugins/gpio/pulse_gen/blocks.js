Blockly.Blocks["pulse_gen.write"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.PULSE_GEN_WRITE_TITLE)
			.appendField(Blockly.Msg.PULSE_GEN_OUTPUT)
			.appendField(new Blockly.FieldDropdown([
				["OUT1", "OUT1_GPIO"],
				["OUT2", "OUT2_GPIO"]
			]), 'OUTPUT')
			.appendField(" " + Blockly.Msg.PULSE_GEN_TYPE)
			.appendField(new Blockly.FieldDropdown([[{
					'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAdCAYAAADoxT9SAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACBSURBVFiF7ZjBCYAwEAQHiS2kCvsvw5cl2IUP/foQzkDU9diB/I5kBzafg5gV2D8+axRyuCHyC9KIlMb5DVieCHLBBIw9Lzz/kbCrX72bploWUcMialhEDYuoYRE1LKKGRdSwiBoWUSONSAHmYKa+ESSgEufsu/HrSNOGM0210ogclHNE5xvEJekAAAAASUVORK5CYII=',
					'width': 24,
					'height': 12,
					'alt': 'One Shot'
				}, "GPIO_INTR_POSEDGE"], [{
					'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAdCAYAAADoxT9SAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACDSURBVFiF7ZOxDYAwDARPCFZgChr23wEaRmALCmhpIFiI8LL+pHRO/Cd9APbAWanHGsnWVAz2KWlEWmAuzAxAVyHLHRuwvH3k3NW//khxb5pqWUQNi6hhETUsooZF1LCIGhZRwyJqWESNNCJtcL4Hpi+CXOx6TFSkA8bgnSqkqVYakQNm0iN6FGb0sQAAAABJRU5ErkJggg==',
					'width': 24,
					'height': 12,
					'alt': 'One Shot Negative'
				}, "GPIO_INTR_NEGEDGE"]]
			), 'TYPE');

		this.appendDummyInput()
			.appendField(" " + Blockly.Msg.PULSE_GEN_WIDTH_US);
		this.appendValueInput("WIDTH_US")
			.setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.PULSE_GEN_MICROSECOND);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([[
          		Blockly.Msg.PULSE_GEN_WAIT, "true"
	        ], [
				Blockly.Msg.PULSE_GEN_NO_WAIT, "false"
			]]), 'WAIT');

		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(Blockly.Msg.SENSOR_HUE);
		this.setTooltip(Blockly.Msg.PULSE_GEN_WRITE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.PULSE_GEN_WRITE_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'pulse_gen.write'
		}).append('\
		   <value name="WIDTH_US">\
			   <shadow type="pulse_gen.width_us_number">\
			   </shadow>\
		   </value>'
	   );
   }
};

// hidden block (no generator defined), temporary used for shadow block
Blockly.Blocks["pulse_gen.width_us_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(1, 1, 1000000, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.PULSE_GEN_WIDTH_US_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.PULSE_GEN_WIDTH_US_NUMBER_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};
