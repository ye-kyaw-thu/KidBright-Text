Blockly.JavaScript['lists_create_with'] = function(block) {
    // Create a list with any number of elements of any type.
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
      elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
          Blockly.JavaScript.ORDER_COMMA) || 'null';
	}
	
	var element_code = '';
	for(var i=0; i<elements.length; i++){
		var element = elements[i];
		if((element !== 'null') && (element.indexOf('(double)') === -1)){ // if sensor then convert to double
			element = `(double)${element}`;
		}
		
		if((i === 0) && (element !== 'null')){
			element_code += element;
		} else if(element !== 'null'){
			element_code +=  `, ${element}`;			
		} else if((i === 0) && (element === 'null')){
			element_code += '0.0';
		} else {
			element_code += `, 0.0`;
		}
	}
	var code = `kb_list.set_multi(global_num, ${elements.length}, 100, ${element_code});\n`;
    return code;
  };

Blockly.JavaScript['list_get_length'] = function(block) {
    // Get length of array
	// var code = '((int)(sizeof(global_num) / sizeof(int)))';
	var code = 'kb_list.get_length(global_num)';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
  
Blockly.JavaScript['list_get_index'] = function(block) {
    // Get index of value
    var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'global_num[(int)' + value_name + ']';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['list_set_index'] = function(block) {
    // Set he new value to specified index
    var value_val = Blockly.JavaScript.valueToCode(block, 'val', Blockly.JavaScript.ORDER_ATOMIC);
    var value_index = Blockly.JavaScript.valueToCode(block, 'index', Blockly.JavaScript.ORDER_ATOMIC);

    var code = 'global_num[(int)' + value_index + '] = ' + value_val + ';\n';
    return code;
};
  
Blockly.JavaScript['list_insert_first'] = function(block) {
	var value_input = Blockly.JavaScript.valueToCode(block, 'input', Blockly.JavaScript.ORDER_ATOMIC);
	var code = `kb_list.insert_first_value(${value_input}, global_num);\n`;

	return code;
};
  
Blockly.JavaScript['list_insert_last'] = function(block) {
	var value_input = Blockly.JavaScript.valueToCode(block, 'input', Blockly.JavaScript.ORDER_ATOMIC);
	var code = `kb_list.insert_last_value(${value_input}, global_num);\n`;
	
	return code;
};

Blockly.JavaScript['list_insert_index'] = function(block) {
	var value_number = Blockly.JavaScript.valueToCode(block, 'number', Blockly.JavaScript.ORDER_ATOMIC);
	var value_index = Blockly.JavaScript.valueToCode(block, 'index', Blockly.JavaScript.ORDER_ATOMIC);

	var code = `kb_list.insert_value_index(${value_number}, ${value_index}, global_num);\n`;
	return code;
};
  
Blockly.JavaScript['list_get_text'] = function(block) {
	var number_index_from = block.getFieldValue('index_from');
	var number_index_to = block.getFieldValue('index_to');

	var code = `kb_list.get_list_text(global_num, ${number_index_from}, ${number_index_to})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
};