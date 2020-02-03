Blockly.JavaScript['string_variables_set'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var varName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return 'STRING_' + varName + ' = ' + argument0.replace(/\\/g, '\\\\') + ';\n';
};

Blockly.JavaScript['string_length'] = function(block) {
	var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
	var code = '(double)strlen(' + value_name.replace(/\\/g, '\\\\') + ')';
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['string_join'] = function(block) {
    // Create a list with any number of elements of any type.
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
      elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
          Blockly.JavaScript.ORDER_COMMA) || 'null';
	}
	var result = '';
	for(var i=0; i<elements.length; i++){
		var element = elements[i];
		if((i === 0) && (element !== 'null')){
			result += 'kb_string.concat(global_str,' + element.replace(/\\/g, '\\\\') + ')';
		} else if(element !== 'null'){
			result = 'kb_string.concat(' + result + ',' + element.replace(/\\/g, '\\\\') + ')';			
		}
	}
	var code = result;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['string_substring'] = function(block) {
	var value_input = Blockly.JavaScript.valueToCode(block, 'input', Blockly.JavaScript.ORDER_ATOMIC);
	var value_from = Blockly.JavaScript.valueToCode(block, 'from', Blockly.JavaScript.ORDER_ATOMIC);
	var value_to = Blockly.JavaScript.valueToCode(block, 'to', Blockly.JavaScript.ORDER_ATOMIC);

	var code = `kb_string.substring((char*)${value_input.replace(/\\/g, '\\\\')}, ${value_from}, ${value_to})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
  };

Blockly.JavaScript['string_with_number'] = function (block) { 
	var text_text = block.getFieldValue('TEXT'); 
	var argument0 = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC); 
	
	var code = 'kb_string.concat((char *)"' + text_text.replace(/\\/g, '\\\\') + '",' + argument0 + ')';
	return [code, Blockly.JavaScript.ORDER_NONE]; 
}

Blockly.JavaScript['string_charAt'] = function(block) {
	var value_input = Blockly.JavaScript.valueToCode(block, 'input', Blockly.JavaScript.ORDER_ATOMIC);
	var value_index = Blockly.JavaScript.valueToCode(block, 'index', Blockly.JavaScript.ORDER_ATOMIC);

	var code = `kb_string.charat(${value_input.replace(/\\/g, '\\\\')}, ${value_index})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['string_compare'] = function (block) {
	var value_text1 = Blockly.JavaScript.valueToCode(block, 'TEXT1', Blockly.JavaScript.ORDER_ATOMIC);
	var value_text2 = Blockly.JavaScript.valueToCode(block, 'TEXT2', Blockly.JavaScript.ORDER_ATOMIC);

	var code = 'kb_string.string_compare(' + value_text1.replace(/\\/g, '\\\\') + ', ' + value_text2.replace(/\\/g, '\\\\') + ')';
	return [code, Blockly.JavaScript.ORDER_NONE];
};