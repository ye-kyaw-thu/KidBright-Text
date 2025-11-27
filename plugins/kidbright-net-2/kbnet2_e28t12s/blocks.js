const DEFAULT_KBNET2_E28T12S_NWKSKEY = 'B5A6E1B6C840146389C4ABB4835CB5BA';

Blockly.Blocks["kbnet2_e28t12s.send_01"] = {
	init: function() {		
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_SEND_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_TXPOWER)		
			.appendField(new Blockly.FieldDropdown([
				["12", "12"],
				["10", "10"],
				["7", "7"],
				["4", "4"]
			]), 'TX_POWER_INDEX')
			.appendField(Blockly.Msg.KBNET2_E28T12S_DBM);
			
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_FREQUENCY)
			.appendField(new Blockly.FieldDropdown([
				["2477", "77"],
				["2478", "78"],
				["2479", "79"],
				["2480", "80"],
				["2481", "81"],
				["2482", "82"],
				["2483", "83"],
				["2484", "84"],
				["2485", "85"],
				["2486", "86"],
				["2487", "87"],
				["2488", "88"],
				["2489", "89"],
				["2490", "90"],
				["2491", "91"],
				["2492", "92"],
				["2493", "93"],
				["2494", "94"],
				["2495", "95"],
				["2496", "96"]
			]), 'RF_FREQUENCY')
			.appendField("MHz");
		
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_NWKSKEY)
			.appendField(new Blockly.FieldTextInput(DEFAULT_KBNET2_E28T12S_NWKSKEY, nwkskey_validator), 'NWKSKEY');
		
		this.appendValueInput("VALUE_1")
			.appendField(Blockly.Msg.KBNET2_E28T12S_TEMPERATURE)
			.setCheck("Number");
		this.appendValueInput("VALUE_2")
			.appendField(Blockly.Msg.KBNET2_E28T12S_HUMIDITY)
			.setCheck("Number");
		this.appendValueInput("VALUE_3")
			.appendField(Blockly.Msg.KBNET2_E28T12S_WIND_SPEED)
			.setCheck("Number");
		this.appendValueInput("VALUE_4")
		.appendField(Blockly.Msg.KBNET2_E28T12S_WIND_DIRECTION)
			.setCheck("Number");
		this.appendValueInput("VALUE_5")
		.appendField(Blockly.Msg.KBNET2_E28T12S_RAIN_VOLUME)
			.setCheck("Number");
		this.appendValueInput("VALUE_6")
		.appendField(Blockly.Msg.KBNET2_E28T12S_PM25)
			.setCheck("Number");
		this.appendValueInput("VALUE_7")
		.appendField(Blockly.Msg.KBNET2_E28T12S_PM10)
			.setCheck("Number");
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_E28T12S_SEND_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_E28T12S_SEND_HELPURL);
		
		this.setFieldValue("82", "RF_FREQUENCY"); // set default frequency 2482 MHz
	},
	// onchange
	onchange: function(ev) {		
		if (ev.blockId === this.id) {			
			if (!this.isInFlyout) {
				//console.log(this.type);
				//console.log(this.workspace.getBlockById(ev.blockId));

				// on block change
				if (ev.type == Blockly.Events.BLOCK_CHANGE) {				
					//console.log(ev.name, ev.blockId, ev.type);

					// on tx power dropdown changed
					if (ev.name == 'TX_POWER') {
						//console.log(this.getField('TX_POWER').text_, this.getField('TX_POWER').value_);
											
						for (var blockID in this.workspace.blockDB_) {								
							if (this.workspace.blockDB_[blockID].type == this.type) {
								// skip current block
								if (blockID != ev.blockId) {									
									// copy new tx power option to all other blocks on workspace
									this.workspace.blockDB_[blockID].setFieldValue(this.getField('TX_POWER').value_, 'TX_POWER');
								}
							}
						}
					}
					else
					// on channel change
					if (ev.name == 'CHANNEL') {

						for (var blockID in this.workspace.blockDB_) {								
							if (this.workspace.blockDB_[blockID].type == this.type) {
								// skip current block
								if (blockID != ev.blockId) {									
									// copy new tx power option to all other blocks on workspace
									this.workspace.blockDB_[blockID].setFieldValue(this.getField('CHANNEL').value_, 'CHANNEL');
								}
							}
						}
					}
					else
					// on network key change 
					if (ev.name == 'NWKSKEY') {						
						for (var blockID in this.workspace.blockDB_) {								
							if (this.workspace.blockDB_[blockID].type == this.type) {
								// skip current block
								if (blockID != ev.blockId) {									
									// copy new nwkskey option to all other blocks on workspace
									this.workspace.blockDB_[blockID].setFieldValue(this.getField('NWKSKEY').text_, 'NWKSKEY');
								}
							}
						}
					}
				}

				// on block create
				if (ev.type == Blockly.Events.BLOCK_CREATE) {
					for (var blockID in this.workspace.blockDB_) {
						if (this.workspace.blockDB_[blockID].type == this.type) {
							// skip current block
							if (blockID != ev.blockId) {								
								// copy current tx power value on workspace to this new block								
								this.setFieldValue(this.workspace.blockDB_[blockID].getField('TX_POWER').value_, 'TX_POWER');
								// copy new channel option to all other blocks on workspace
								this.setFieldValue(this.workspace.blockDB_[blockID].getField('CHANNEL').value_, 'CHANNEL');
								// copy new nwkskey option to all other blocks on workspace
								this.setFieldValue(this.workspace.blockDB_[blockID].getField('NWKSKEY').text_, 'NWKSKEY');
								break;
							}
						}
					}

				}
			}
		}
	}
};

/*Blockly.Blocks["kbnet2_e28t12s.is_error"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_IS_ERROR_TITLE);

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(230);
		this.setTooltip(Blockly.Msg.KBNET2_E28T12S_IS_ERROR_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_E28T12S_IS_ERROR_HELPURL);
	}
};*/

var appskey_validator = function(val) {
	var re = /[0-9A-Fa-f]{32}/g;

	if ((val.length == 32) && (re.test(val))) {
		return val.toUpperCase();
	}
	else {
		// default
		return DEFAULT_KBNET2_E28T12S_APPSKEY;
	}
};

var nwkskey_validator = function(val) {
	var re = /[0-9A-Fa-f]{32}/g;

	if ((val.length == 32) && (re.test(val))) {
		return val.toUpperCase();
	}
	else {
		// default
		return DEFAULT_KBNET2_E28T12S_NWKSKEY;
	}
};
