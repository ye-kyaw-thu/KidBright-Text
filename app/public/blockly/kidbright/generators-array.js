Blockly.JavaScript['lists_create_with'] = function(block) {
    // Create a list with any number of elements of any type.
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
      elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
          Blockly.JavaScript.ORDER_COMMA) || 'null';
    }
    var code = '';
    for (var j = 0; j < elements.length; j++) {
        code += 'global_num[' + j + '] = ' + elements[j] + ';\n';
    }
    
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

Blockly.JavaScript['list_get_length'] = function(block) {
    // Get length of array
    var code = '((int)(sizeof(global_num) / sizeof(int)))';
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
    //...
};
  
Blockly.JavaScript['list_insert_last'] = function(block) {
    //...
};

Blockly.JavaScript['list_insert_index'] = function(block) {
    //...
};
  
Blockly.JavaScript['list_get_text'] = function(block) {
    //...
};