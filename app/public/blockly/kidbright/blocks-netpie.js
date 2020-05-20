Blockly.Blocks['netpie_write_shadow'] = {
	init: function () {
    this.jsonInit({
        "type": "netpie_write_shadow",
        "message0": Blockly.Msg.STRING_NETPIE_WRITE_SHADOW,
        "args0": [
          {
            "type": "input_value",
            "name": "field",
            "check": "String"
          },
          {
            "type": "input_value",
            "name": "data",
            "check": [
              "Number",
              "String",
              "Boolean"
            ]
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": Blockly.Msg.STRING_NETPIE_WRITE_SHADOW_TOOLTIP,
        "helpUrl": ""
    }
    )}
}

Blockly.Blocks['netpie_on_receive_message'] = {
	init: function () {
    this.jsonInit({
        "type": "netpie_on_receive_message",
        "message0": "On received message topic %1 %2",
        "args0": [
          {
            "type": "input_value",
            "name": "topic",
            "check": "String"
          },
          {
            "type": "input_statement",
            "name": "on_receive_message"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""   
      } 
    )}
}

Blockly.Blocks['netpie_received_message'] = {
	init: function () {
    this.jsonInit({
        "type": "netpie_received_message",
        "message0": "Received message as  %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "type",
            "options": [
              [
                "String",
                "string"
              ],
              [
                "Number",
                "number"
              ]
            ]
          }
        ],
        "output": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
    }
  )}
}

Blockly.Blocks['netpie_publish_message'] = {
	init: function () {
    this.jsonInit({
      "type": "netpie_publish_message",
      "message0": "Publish to topic  %1 with value  %2",
      "args0": [
        {
          "type": "input_value",
          "name": "topic",
          "check": "String"
        },
        {
          "type": "input_value",
          "name": "data"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    }
  )}
}

Blockly.Blocks['netpie_subscribe'] = {
	init: function () {
    this.jsonInit({
      "type": "netpie_subscribe",
      "message0": "Subscribe to message %1",
      "args0": [
        {
          "type": "input_value",
          "name": "topic",
          "check": "String"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    }
  )}
}

Blockly.Blocks['netpie_on_shadow_updated'] = {
	init: function () {
    this.jsonInit({
      "type": "netpie_on_shadow_updated",
      "message0": "On shadow updated %1 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "shadow_updated"
        }
      ],
      "inputsInline": false,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""     
    }
  )}
}