Blockly.JavaScript['hpma115s0.getpm2_5'] = function(block) {
	return [
		'DEV_IO.HPMA115S0(' + block.getFieldValue('TX') + ', ' + block.getFieldValue('RX') + ').get_pm2_5()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['hpma115s0.getpm10'] = function(block) {
	return [
		'DEV_IO.HPMA115S0(' + block.getFieldValue('TX') + ', ' + block.getFieldValue('RX') + ').get_pm10()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['hpma115s0.is_error'] = function(block) {
	return [
		'DEV_IO.HPMA115S0(' + block.getFieldValue('TX') + ', ' + block.getFieldValue('RX') + ').is_error()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
