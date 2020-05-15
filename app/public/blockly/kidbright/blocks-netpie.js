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