const DEFAULT_KBNET2_E28T12S_SNDSTR_MSG = 'UUUUUUUUUUUUUUUU';

Blockly.Blocks["kbnet2_e28t12s_sndstr.send_01"] = {
	init: function() {		
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_SNDSTR_SEND_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_SNDSTR_TXPOWER)		
			.appendField(new Blockly.FieldDropdown([
				["12", "12"],
				["10", "10"],
				["7", "7"],
				["4", "4"]
			]), 'TX_POWER_INDEX')
			.appendField(Blockly.Msg.KBNET2_E28T12S_SNDSTR_DBM);
			
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_SNDSTR_FREQUENCY)
			.appendField(new Blockly.FieldDropdown([
				["2475", "75"],
				["2476", "76"],
				["2477", "77"],
				["2478", "78"],
				["2479", "79"],
				["2480", "80"],
				["2481", "81"],
				["2482", "82"]
			]), 'RF_FREQUENCY')
			.appendField("MHz");
		
		this.appendDummyInput()
			.appendField(Blockly.Msg.KBNET2_E28T12S_SNDSTR_MSG)
			.appendField(new Blockly.FieldTextInput(DEFAULT_KBNET2_E28T12S_SNDSTR_MSG), 'MSG');

		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour('#ff00ff');
		this.setTooltip(Blockly.Msg.KBNET2_E28T12S_SNDSTR_SEND_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.KBNET2_E28T12S_SNDSTR_SEND_HELPURL);
		
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
								this.setFieldValue(this.workspace.blockDB_[blockID].getField('MSG').text_, 'MSG');
								break;
							}
						}
					}

				}
			}
		}
	}
};
