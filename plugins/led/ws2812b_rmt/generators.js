Blockly.JavaScript['ws2812b_rmt.get_pixel_num'] = function(block) {
	return [
		'DEV_IO.WS2812B_RMT(' + block.getFieldValue('OUTPUT') + ').get_pixel_num()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['ws2812b_rmt.set_pixel_num'] = function(block) {
	return 'DEV_IO.WS2812B_RMT(' + block.getFieldValue('OUTPUT') + ')' + '.set_pixel_num(' + block.getFieldValue('VALUE') + ');\n';
};

Blockly.JavaScript['ws2812b_rmt.pixel_rgb'] = function(block) {
	var pos = Blockly.JavaScript.valueToCode(block, 'POS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var red = Blockly.JavaScript.valueToCode(block, 'RED', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var green = Blockly.JavaScript.valueToCode(block, 'GREEN', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var blue = Blockly.JavaScript.valueToCode(block, 'BLUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	return 'DEV_IO.WS2812B_RMT(' + block.getFieldValue('OUTPUT') + ')' + '.pixel_rgb(' + pos + ', ' + red + ', ' + green + ', ' + blue + ');\n';
};

Blockly.JavaScript['ws2812b_rmt.pixel_color_picker'] = function(block) {
	var pos = Blockly.JavaScript.valueToCode(block, 'POS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	var color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(block.getFieldValue('COLOR'));
	if (color) {
		var red = parseInt(color[1], 16);
		var green = parseInt(color[2], 16);
		var blue = parseInt(color[3], 16);
		return 'DEV_IO.WS2812B_RMT(' + block.getFieldValue('OUTPUT') + ')' + '.pixel_rgb(' + pos + ', ' + red + ', ' + green + ', ' + blue + ');\n';
	}

	return '\n';
};

Blockly.JavaScript['ws2812b_rmt.position_number'] = function(block) {
	// Numeric value.
	var code = parseFloat(block.getFieldValue('VALUE'));
	var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
	return [code, order];
};

Blockly.JavaScript['ws2812b_rmt.color_number'] = function(block) {
	return Blockly.JavaScript['ws2812b_rmt.position_number'](block);
};
