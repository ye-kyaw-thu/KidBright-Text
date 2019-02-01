Blockly.JavaScript['mqtt_subscribe'] = function(block) {
    var text_topic = block.getFieldValue('TOPIC');
    var subscribe_statement = Blockly.JavaScript.statementToCode(block, 'SUBSCRIBE');
    // TODO: Assemble JavaScript into code variable.
    var code = `// ${text_topic} { ${subscribe_statement} // };\n`;
    return code;
};

Blockly.JavaScript['mqtt_publish'] = function(block) {
    var value_publish = Blockly.JavaScript.valueToCode(block, 'PUBLISH', Blockly.JavaScript.ORDER_ATOMIC);
    var topic = block.getFieldValue('TOPIC');
    // TODO: Assemble JavaScript into code variable.
    var code = `// ${value_publish}, ${topic} = mqtt_publish;\n`;
    return code;
};

Blockly.JavaScript['mqtt_start'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = '// mqtt_start;\n';
    return code;
  };

  Blockly.JavaScript['mqtt_setup'] = function(block) {
    var client_id = Blockly.JavaScript.valueToCode(block, 'CLIENT_ID', Blockly.JavaScript.ORDER_ATOMIC);
    var server = Blockly.JavaScript.valueToCode(block, 'SERVER', Blockly.JavaScript.ORDER_ATOMIC);
    var port = Blockly.JavaScript.valueToCode(block, 'PORT', Blockly.JavaScript.ORDER_ATOMIC);
    var user = Blockly.JavaScript.valueToCode(block, 'USER', Blockly.JavaScript.ORDER_ATOMIC);
    var password = Blockly.JavaScript.valueToCode(block, 'PASSWORD', Blockly.JavaScript.ORDER_ATOMIC);
    var keep_alive = Blockly.JavaScript.valueToCode(block, 'KEEP_ALIVE', Blockly.JavaScript.ORDER_ATOMIC);

    var code = `// ${client_id}, ${server}, ${port}, ${user}, ${password}, ${keep_alive} = mqtt_setup;\n`;

    return code;
};

Blockly.JavaScript['mqtt_get_topic_data'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = '\"get_topic_data\"';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
};
