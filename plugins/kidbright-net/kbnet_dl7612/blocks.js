const DEFAULT_APPSKEY = 'EF6EBE0953DFF17AA7B89E64FB8A2ADD';
const DEFAULT_NWKSKEY = 'B5A6E1B6C840146389C4ABB4835CB5BA';

Blockly.Blocks["kbnet_dl7612.send_01"] = {
	init: function() {		
		this.appendDummyInput()
			.appendField(Blockly.Msg.DL7612_SEND_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.DL7612_TXPOWER)		
			.appendField(new Blockly.FieldDropdown([
				["2", "5"],
				["5", "4"],
				["8", "3"],
				["11", "2"],
				["14", "1"],
				//["20", "0"]
			]), 'TX_POWER')
			.appendField(Blockly.Msg.DL7612_DBM);

		this.appendDummyInput()
			.appendField(Blockly.Msg.DL7612_APPSKEY)
			.appendField(new Blockly.FieldTextInput(DEFAULT_APPSKEY, appskey_validator), 'APPSKEY');
		
		this.appendDummyInput()
			.appendField(Blockly.Msg.DL7612_NWKSKEY)
			.appendField(new Blockly.FieldTextInput(DEFAULT_NWKSKEY, nwkskey_validator), 'NWKSKEY');
		
		this.appendValueInput("VALUE_1")
			.appendField(Blockly.Msg.DL7612_TEMPERATURE)
			.setCheck("Number");
		this.appendValueInput("VALUE_2")
			.appendField(Blockly.Msg.DL7612_HUMIDITY)
			.setCheck("Number");
		this.appendValueInput("VALUE_3")
			.appendField(Blockly.Msg.DL7612_WIND_SPEED)
			.setCheck("Number");
		this.appendValueInput("VALUE_4")
		.appendField(Blockly.Msg.DL7612_WIND_DIRECTION)
			.setCheck("Number");
		this.appendValueInput("VALUE_5")
		.appendField(Blockly.Msg.DL7612_RAIN_VOLUME)
			.setCheck("Number");
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour('#a15873');
		this.setTooltip(Blockly.Msg.DL7612_SEND_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.DL7612_SEND_HELPURL);
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
					// on application key change
					if (ev.name == 'APPSKEY') {						
						for (var blockID in this.workspace.blockDB_) {								
							if (this.workspace.blockDB_[blockID].type == this.type) {
								// skip current block
								if (blockID != ev.blockId) {									
									// copy new appskey option to all other blocks on workspace
									this.workspace.blockDB_[blockID].setFieldValue(this.getField('APPSKEY').text_, 'APPSKEY');
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
								// copy new appskey option to all other blocks on workspace
								this.setFieldValue(this.workspace.blockDB_[blockID].getField('APPSKEY').text_, 'APPSKEY');
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

var appskey_validator = function(val) {
	var re = /[0-9A-Fa-f]{32}/g;

	if ((val.length == 32) && (re.test(val))) {
		return val.toUpperCase();
	}
	else {
		// default
		return DEFAULT_APPSKEY;
	}
};

var nwkskey_validator = function(val) {
	var re = /[0-9A-Fa-f]{32}/g;

	if ((val.length == 32) && (re.test(val))) {
		return val.toUpperCase();
	}
	else {
		// default
		return DEFAULT_NWKSKEY;
	}
};
