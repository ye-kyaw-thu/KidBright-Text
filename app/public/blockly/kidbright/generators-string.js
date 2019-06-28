Blockly.JavaScript['string_variables_set'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var varName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return 'STRING_' + varName + ' = ' + argument0 + ';\n';
};

Blockly.JavaScript['string_length'] = function(block) {
	var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
	var code = '(double)strlen(' + value_name + ')';
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
			result += 'kb_string.kb_concat(global_str,' + element + ')';
		} else if(element !== 'null'){
			result = 'kb_string.kb_concat(' + result + ',' + element + ')';			
		}
	}
	var code = result;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};