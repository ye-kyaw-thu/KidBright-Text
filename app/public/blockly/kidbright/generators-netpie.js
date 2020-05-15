Blockly.JavaScript['netpie_write_shadow'] = function(block) {
    var value_field = Blockly.JavaScript.valueToCode(block, 'field', Blockly.JavaScript.ORDER_ATOMIC);
    var value_data = Blockly.JavaScript.valueToCode(block, 'data', Blockly.JavaScript.ORDER_ATOMIC);

    var code = `netpie_write_shadow(${value_field}, ${value_data});\n`;
    return code;
};