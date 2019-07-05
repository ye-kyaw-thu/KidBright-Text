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
    //...
};
  
Blockly.JavaScript['list_get_index'] = function(block) {
    //...
};

Blockly.JavaScript['list_set_index'] = function(block) {
    //...
};
  
Blockly.JavaScript['list_insert_first'] = function(block) {
    //...
};
  
Blockly.JavaScript['list_insert_last'] = function(block) {
    //...
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