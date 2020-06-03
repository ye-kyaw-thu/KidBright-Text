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
    var code = 'on_shadow_updated([](JsonVariant shadow) {\n' + statements_shadow_updated + '});\n';
    return code;
};
Blockly.JavaScript['netpie_received_shadow_updated'] = function(block) {
    var value_field = Blockly.JavaScript.valueToCode(block, 'field', Blockly.JavaScript.ORDER_ATOMIC);
    var dropdown_type = block.getFieldValue('type');
    var fields = value_field.split('(char *)')[1].split('"')[1].split('.')

    var code = '';
    var field_code = '["data"]';
    for(i in fields){
        field_code += `["${fields[i]}"]`;
    }
    if(dropdown_type === 'number'){
        code += `getShadowValueAsNumber(shadow${field_code})`;
    } else if(dropdown_type === 'string'){
        code += `(char *)getShadowValueAsString(shadow${field_code})`;
    }

    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.JavaScript['netpie_shadow_updated_contains'] = function(block) {
    var value_field = Blockly.JavaScript.valueToCode(block, 'field', Blockly.JavaScript.ORDER_ATOMIC);
    var fields = value_field.split('(char *)')[1].split('"')[1].split('.')
    var field_code = '';

    for(i in fields){
        field_code += `["${fields[i]}"]`;
    }
    var code = `ifJsonFieldAvailable(shadow["data"]${field_code})`;

    return [code, Blockly.JavaScript.ORDER_NONE];
};
Blockly.JavaScript['netpie_read_entire_shadow'] = function(block) {
    var statements_on_read_shadow = Blockly.JavaScript.statementToCode(block, 'on_read_shadow');
    var code = 'get_entire_shadow([](JsonVariant shadow) {\n' + 
        statements_on_read_shadow + '});\n';
    return code;
};
Blockly.JavaScript['netpie_on_connected'] = function(block) {
    var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
    var code = 'on_connected([]() {\n' + 
        statements_name + '});\n';
    return code;
};
Blockly.JavaScript['netpie_on_disconnected'] = function(block) {
    var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
    var code = 'on_disconnected([]() {\n' + 
        statements_name + '});\n';
    return code;
};
  