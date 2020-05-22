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

Blockly.Blocks['netpie_received_shadow_updated'] = {
	init: function () {
    this.jsonInit({
        "type": "netpie_received_shadow_updated",
        "message0": "Received shadow updated field %1 as %2",
        "args0": [
          {
            "type": "input_value",
            "name": "field",
            "check": "String"
          },
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
        "inputsInline": true,
        "output": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""  
    }
  )}
}

Blockly.Blocks['netpie_shadow_updated_contains'] = {
	init: function () {
    this.jsonInit({
      "type": "netpie_shadow_updated_contains",
      "message0": "Shadow updated contains field %1",
      "args0": [
        {
          "type": "input_value",
          "name": "field",
          "check": "String"
        }
      ],
      "inputsInline": true,
      "output": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    }
  )}
}

Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'] = [];
Blockly.kbide['CREATE_ON_SHADOW_UPDATED_EVENT'] = function(ws, blockId){
  if(Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].length < 1){
    Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].push(blockId);
  } else {
    ws.undo(false);
  }
}
Blockly.kbide['DELETE_ON_SHADOW_UPDATED_EVENT'] = function(ws, blockId){
  Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'] = Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
}
Blockly.kbide['SCAN_ON_SHADOW_UPDATED_EVENT'] = function(ws){
  var blocks = Blockly.kbide.GET_BLOCKS_BY_TYPE(ws, 'netpie_on_shadow_updated');
  var on_shadow_len = Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].length;
  if(blocks.length === 0){
    Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'] = [];
  }
  else if((blocks.length > 0) && (on_shadow_len < 1)) {
    Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].push(blocks[0].id);
  }
}

const handle_on_shadow_updated = function(primaryEvent) {
  // Convert event to JSON.  This could then be transmitted across the net.
  var json = primaryEvent.toJson();
  // console.log(json);

  var ws = Blockly.kbide['WORKSPACE'];
  var blockId = json.blockId
  var block = ws.getBlockById(json.blockId);
  switch(json.type){
      case 'delete':
        Blockly.kbide.DELETE_ON_SHADOW_UPDATED_EVENT(ws, blockId);
        break;
      case 'create':
          if (block.type === 'netpie_on_shadow_updated') Blockly.kbide.CREATE_ON_SHADOW_UPDATED_EVENT(ws, blockId);
          break;
      case 'move':
          Blockly.kbide.SCAN_ON_SHADOW_UPDATED_EVENT(ws);
          break;
      case 'ui':
          Blockly.kbide.SCAN_ON_SHADOW_UPDATED_EVENT(ws);
          break;
      default:
        break;
  }
}