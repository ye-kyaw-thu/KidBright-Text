Blockly.JavaScript['kbnet2_e28t12s_sndstr.send_01'] = function(block) {
	var msg = block.getFieldValue('MSG');
	var tx_power_index = parseInt(block.getFieldValue('TX_POWER_INDEX'));
	var rf_frequency = parseInt(block.getFieldValue('RF_FREQUENCY'));

	return 'DEV_IO.KBNET2_E28T12S_SNDSTR(' + tx_power_index + ', ' + rf_frequency + ').send_01("' + msg + '");\n';
};
