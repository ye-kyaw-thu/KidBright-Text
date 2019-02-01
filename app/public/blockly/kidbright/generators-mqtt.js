Blockly.JavaScript['mqtt_setup'] = function(block) {
    var client_id = block.getFieldValue("CLIENT_ID");
    var server = block.getFieldValue("SERVER");
    var port = block.getFieldValue("PORT") || '0';
    var user = block.getFieldValue("USER");
    var input_value = block.getFieldValue("input_value");
    var password = block.getFieldValue("PASSWORD");
    var keep_alive = block.getFieldValue("KEEP_ALIVE") || '0';

    var code = `${client_id}, ${server}, ${port}, ${user}, ${input_value}, ${password}, ${keep_alive} => mqtt_setup;\n`;

    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['mqtt_subscribe'] = function(block) {
    var text_topic = block.getFieldValue('TOPIC');
    var subscribe = Blockly.JavaScript.statementToCode(block, 'SUBSCRIBE');
    // TODO: Assemble JavaScript into code variable.
    var code = `${text_topic}, ${subscribe} => mqtt_subscribe;\n`;
    return code;
};

Blockly.JavaScript['mqtt_publish'] = function(block) {
    var value_publish = Blockly.JavaScript.valueToCode(block, 'PUBLISH', Blockly.JavaScript.ORDER_ATOMIC);
    var topic = block.getFieldValue('TOPIC');
    // TODO: Assemble JavaScript into code variable.
    var code = `${value_publish}, ${topic} => mqtt_publish;\n`;
    return code;
};

Blockly.JavaScript['mqtt_start'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = 'mqtt_start;\n';
    return code;
  };