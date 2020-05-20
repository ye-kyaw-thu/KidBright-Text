Blockly.JavaScript['netpie_write_shadow'] = function(block) {
    var value_field = Blockly.JavaScript.valueToCode(block, 'field', Blockly.JavaScript.ORDER_ATOMIC);
    var value_data = Blockly.JavaScript.valueToCode(block, 'data', Blockly.JavaScript.ORDER_ATOMIC);

    var code = `netpie_write_shadow(${value_field}, ${value_data});\n`;
    return code;
};
Blockly.JavaScript['netpie_on_receive_message'] = function(block) {
    var value_topic = Blockly.JavaScript.valueToCode(block, 'topic', Blockly.JavaScript.ORDER_ATOMIC);
    var statements_on_receive_message = Blockly.JavaScript.statementToCode(block, 'on_receive_message');
    var code = 'on_message_topic("@msg/' + value_topic.split('(char *)')[1].split('"')[1] + '", [](char* payload, size_t len) {\n' + 
        statements_on_receive_message + '});\n';
    return code;
};
Blockly.JavaScript['netpie_received_message'] = function(block) {
    var dropdown_type = block.getFieldValue('type');
    var code = '';
    if(dropdown_type === 'number'){
        code = 'strtod(payload,NULL)';
    } else if(dropdown_type === 'string'){
        code = 'payload';
    }

    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.JavaScript['netpie_publish_message'] = function(block) {
    var value_topic = Blockly.JavaScript.valueToCode(block, 'topic', Blockly.JavaScript.ORDER_ATOMIC);
    var value_data = Blockly.JavaScript.valueToCode(block, 'data', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'netpie_publish("@msg/' + value_topic.split('(char *)')[1].split('"')[1] + '", '+ value_data +');\n';
    return code;
};
Blockly.JavaScript['netpie_subscribe'] = function(block) {
    var value_topic = Blockly.JavaScript.valueToCode(block, 'topic', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'netpie_subscribe("@msg/' + value_topic.split('(char *)')[1].split('"')[1] + '");\n';
    return code;
};
Blockly.JavaScript['netpie_on_shadow_updated'] = function(block) {
    var statements_shadow_updated = Blockly.JavaScript.statementToCode(block, 'shadow_updated');
    var code = 'on_shadow_updated([](JsonVariant shadow) {' + statements_shadow_updated + '});\n';
    return code;
  };