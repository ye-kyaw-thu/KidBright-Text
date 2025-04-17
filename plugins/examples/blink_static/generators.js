Blockly.JavaScript['blink_static.start'] = function(block) {
	return 'DEV_IO.BLINK_STATIC(' + block.getFieldValue('LED_GPIO') + ').start('+ parseInt(block.getFieldValue('BLINK_MS')) + ');\n';
};

Blockly.JavaScript['blink_static.stop'] = function(block) {
	return 'DEV_IO.BLINK_STATIC(' + block.getFieldValue('LED_GPIO') + ').stop();\n';
};
