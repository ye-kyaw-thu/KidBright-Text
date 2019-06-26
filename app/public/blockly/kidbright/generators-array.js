Blockly.JavaScript['lists_create_with'] = function(block) {
    // Create a list with any number of elements of any type.
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
      elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
          Blockly.JavaScript.ORDER_COMMA) || 'null';
    }
    var code = '[' + elements.join(', ') + ']';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };