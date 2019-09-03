Blockly.JavaScript['pulse_cap.read'] = function(block) {
	var timeout_ms = Blockly.JavaScript.valueToCode(block, 'TIMEOUT_MS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	return [
		'DEV_IO.PULSE_CAP(' + block.getFieldValue('START') + ', ' + block.getFieldValue('STOP') + ')' + '.read(' + block.getFieldValue('START_TYPE') + ', ' + block.getFieldValue('STOP_TYPE') + ', ' + timeout_ms + ')',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript["pulse_cap.timeout_ms_number"] = function(block) {
	var code = parseFloat(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
};
