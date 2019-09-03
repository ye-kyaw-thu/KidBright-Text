Blockly.Blocks["pulse_cap.read"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.PULSE_CAP_READ_TITLE)
			.appendField(Blockly.Msg.PULSE_CAP_READ_START)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'START')
			.appendField(new Blockly.FieldDropdown([[{
					'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAdCAYAAADoxT9SAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE4SURBVFiF7ZcxbsIwFIY/MAwgtd1YyglQr8A9ELTAXdm7gKCljOEAnSuVLolqRKxnxy8JRHzSU5zISv4vsZ0EZBLgVHMlUsi2h8hN0BiRTmD/H2BTRpAcXoCu5gntOSKO1bqu25ih5SPScrSvCh+RvtXulRUkFkmkCzxY+48oT0AtJJE3wFj7Jj12Uxhgz+Vb9kD4sl0EtdVyifuTYREV0Q8VEQN84hap4qmoiMxxS2Q1j00qEC1igA9kkS/KfSrRIq/IElnN4vM6iRIxwA5/kT3ny7MmUSJT/CWymmqkzqGwSBtYEy6ypZyPz8IiE8IlsproZD8jSKRlbVfAKKfPE/93/Bf4zumzBcbpRbVIgOe0fQSGGie8/1hVxV3k2ugA70KfQRVBBAbIOYOW2bomu1iNGVqNEfkDJN/f5afRxdEAAAAASUVORK5CYII=',
					'width': 24,
					'height': 12,
					'alt': 'One Shot'
				}, "GPIO_INTR_POSEDGE"], [{
					'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAdCAYAAADoxT9SAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE/SURBVFiF7ZhNbsIwEIU/CKzZIfUKiCtwDyQQlwG13Kt7NiB+u2TdBUiwKC1dOEheOIxtEsdEPCmSk4w98/Q84x+QsQeuJT97Kci6BZGnQGWINBztf4BFEYEY0AWaeQ6o54g4V8vyW5mp9SISG1yTPW/UgE+gY/jX0tpvwLfBZgn0UHkkouhk7+O/UPZdHBVNpA7McSexREuNGHLkD/jw6DdJ+1ojxDqSACvs1dimfZwQakEcYk9k4OMgFJEEWCOT2OFZbUNuUUbIREa+g4ckkgAbskl8kaFGDFVLxy/3K9gYuPgOHnr3m6CqkrUaEJ8ioFSZGr6/84AaUM55pIkK+ub3gnDIilERUCfRo/Z+SL9lIlYiACetfZaMYyZyzWgbETMRJzSAmWDTDhGIgDZynPne+OUIpxvOykytyhD5B1Oq0iwC5VqWAAAAAElFTkSuQmCC',
					'width': 24,
					'height': 12,
					'alt': 'One Shot Negative'
				}, "GPIO_INTR_NEGEDGE"]]
			), 'START_TYPE')
			.appendField(" " + Blockly.Msg.PULSE_CAP_READ_STOP)
			.appendField(new Blockly.FieldDropdown([
				["IN1", "IN1_GPIO"],
				["IN2", "IN2_GPIO"],
				["IN3", "IN3_GPIO"],
				["IN4", "IN4_GPIO"]
			]), 'STOP')
			.appendField(new Blockly.FieldDropdown([[{
					'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAdCAYAAADoxT9SAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE4SURBVFiF7ZcxbsIwFIY/MAwgtd1YyglQr8A9ELTAXdm7gKCljOEAnSuVLolqRKxnxy8JRHzSU5zISv4vsZ0EZBLgVHMlUsi2h8hN0BiRTmD/H2BTRpAcXoCu5gntOSKO1bqu25ih5SPScrSvCh+RvtXulRUkFkmkCzxY+48oT0AtJJE3wFj7Jj12Uxhgz+Vb9kD4sl0EtdVyifuTYREV0Q8VEQN84hap4qmoiMxxS2Q1j00qEC1igA9kkS/KfSrRIq/IElnN4vM6iRIxwA5/kT3ny7MmUSJT/CWymmqkzqGwSBtYEy6ypZyPz8IiE8IlsproZD8jSKRlbVfAKKfPE/93/Bf4zumzBcbpRbVIgOe0fQSGGie8/1hVxV3k2ugA70KfQRVBBAbIOYOW2bomu1iNGVqNEfkDJN/f5afRxdEAAAAASUVORK5CYII=',
					'width': 24,
					'height': 12,
					'alt': 'One Shot'
				}, "GPIO_INTR_POSEDGE"], [{
					'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAdCAYAAADoxT9SAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE/SURBVFiF7ZhNbsIwEIU/CKzZIfUKiCtwDyQQlwG13Kt7NiB+u2TdBUiwKC1dOEheOIxtEsdEPCmSk4w98/Q84x+QsQeuJT97Kci6BZGnQGWINBztf4BFEYEY0AWaeQ6o54g4V8vyW5mp9SISG1yTPW/UgE+gY/jX0tpvwLfBZgn0UHkkouhk7+O/UPZdHBVNpA7McSexREuNGHLkD/jw6DdJ+1ojxDqSACvs1dimfZwQakEcYk9k4OMgFJEEWCOT2OFZbUNuUUbIREa+g4ckkgAbskl8kaFGDFVLxy/3K9gYuPgOHnr3m6CqkrUaEJ8ioFSZGr6/84AaUM55pIkK+ub3gnDIilERUCfRo/Z+SL9lIlYiACetfZaMYyZyzWgbETMRJzSAmWDTDhGIgDZynPne+OUIpxvOykytyhD5B1Oq0iwC5VqWAAAAAElFTkSuQmCC',
					'width': 24,
					'height': 12,
					'alt': 'One Shot Negative'
				}, "GPIO_INTR_NEGEDGE"]]
			), 'STOP_TYPE');

		this.appendDummyInput()
			.appendField(" " + Blockly.Msg.PULSE_CAP_READ_TIMEOUT);
		this.appendValueInput("TIMEOUT_MS")
			.setCheck("Number");

		this.appendDummyInput()
			.appendField(Blockly.Msg.PULSE_CAP_READ_MILLISECOND);

		this.setInputsInline(true);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(Blockly.Msg.SENSOR_HUE);
		this.setTooltip(Blockly.Msg.PULSE_CAP_READ_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.PULSE_CAP_READ_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'pulse_cap.read'
		}).append('\
		   <value name="TIMEOUT_MS">\
			   <shadow type="pulse_cap.timeout_ms_number">\
			   </shadow>\
		   </value>'
	   );
   }
};

// hidden block (no generator defined), temporary used for shadow block
Blockly.Blocks["pulse_cap.timeout_ms_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(1000, 20, 1000000, 1), 'VALUE');
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.PULSE_CAP_TIMEOUT_MS_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.PULSE_CAP_TIMEOUT_MS_NUMBER_HELPURL);
	},
	// custom xmlToolboxcolumn
	xmlToolbox: function() {
		return null; // hidden block
	}
};
