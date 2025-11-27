Blockly.JavaScript['kbnet2_sleep.deep_wakeup_after'] = function(block) {
	var wakeup_timeout_ms = 1000 * parseInt(block.getFieldValue('WAKEUP_TIMEOUT'));

	return 'DEV_IO.KBNET2_SLEEP().deep_wakeup_after(' + wakeup_timeout_ms + ');\n';	
};

Blockly.JavaScript['kbnet2_sleep.deep_wakeup_every'] = function(block) {
	var wakeup_timeout_ms = 1000 * parseInt(block.getFieldValue('WAKEUP_TIMEOUT'));

	return 'DEV_IO.KBNET2_SLEEP().deep_wakeup_every(' + wakeup_timeout_ms + ');\n';	
};
