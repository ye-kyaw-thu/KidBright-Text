const CONNECT_COLOR = "#9A8954";
let SHADOW_COLOR = "#5C83A6";
let MSG_COLOR = "#549A67";

Blockly.Blocks['netpie_connect'] = {
    init: function () {
    this.jsonInit({
        "type": "netpie_connect",
        "message0": Blockly.Msg.NETPIE_CONNECT,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "field_input",
            "name": "DEVICE_ID",
            "text": "your device id"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "field_input",
            "name": "DEVICE_TOKEN",
            "text": "your device token"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": CONNECT_COLOR,
        "tooltip": Blockly.Msg.NETPIE_CONNECT_TOOLTIP,
        "helpUrl": ""
      }
    )}
}

Blockly.Blocks['netpie_write_shadow'] = {
    init: function () {
    this.jsonInit({
        "type": "netpie_write_shadow",
        "message0": Blockly.Msg.NETPIE_WRITE_SHADOW,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
          },
          {
            "type": "field_input",
            "name": "field",
            "text": "home.temp"
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
        "colour": SHADOW_COLOR,
        "tooltip": Blockly.Msg.NETPIE_WRITE_SHADOW_TOOLTIP,
        "helpUrl": ""
    }
    )}
}

Blockly.Blocks['netpie_on_receive_message'] = {
    init: function () {
    this.jsonInit({
        "type": "netpie_on_receive_message",
        "message0": Blockly.Msg.NETPIE_ON_RECEIVE_MESSAGE,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
          },
          {
            "type": "field_input",
            "name": "topic",
            "text": "home/temp"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "on_receive_message"
          }
        ],
        "colour": MSG_COLOR,
        "tooltip": Blockly.Msg.NETPIE_ON_RECEIVE_MESSAGE_TOOLTIP,
        "helpUrl": ""
      } 
    )}
}

Blockly.Blocks['netpie_received_message'] = {
    init: function () {
    this.jsonInit({
        "type": "netpie_received_message",
        "message0": Blockly.Msg.NETPIE_RECEIVE_MESSAGE,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
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
        "output": null,
        "colour": MSG_COLOR,
        "tooltip": Blockly.Msg.NETPIE_RECEIVE_MESSAGE_TOOLTIP,
        "helpUrl": ""
    }
  )}
}

Blockly.Blocks['netpie_publish_message'] = {
    init: function () {
    this.jsonInit({
      "type": "netpie_publish_message",
      "message0": Blockly.Msg.NETPIE_PUBLISH_MESSAGE,
      "args0": [
        {
          "type": "field_image",
          "src": "/icons/netpie-block.png",
          "width": 20,
          "height": 20,
          "alt": "*"
        },
        {
          "type": "field_input",
          "name": "topic",
          "text": "home/temp"
        },
        {
          "type": "input_value",
          "name": "data"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": MSG_COLOR,
      "tooltip": Blockly.Msg.NETPIE_PUBLISH_MESSAGE_TOOLTIP,
      "helpUrl": ""
    }
  )}
}

Blockly.Blocks['netpie_subscribe'] = {
    init: function () {
    this.jsonInit({
      "type": "netpie_subscribe",
      "message0": Blockly.Msg.NETPIE_SUBSCRIBE,
      "args0": [
        {
          "type": "field_image",
          "src": "/icons/netpie-block.png",
          "width": 20,
          "height": 20,
          "alt": "*"
        },
        {
          "type": "field_input",
          "name": "topic",
          "text": "home/temp"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": MSG_COLOR,
      "tooltip": Blockly.Msg.NETPIE_SUBSCRIBE_TOOLTIP,
      "helpUrl": ""
    }
  )}
}

Blockly.Blocks['netpie_on_shadow_updated'] = {
    init: function () {
    this.jsonInit({
      "type": "netpie_on_shadow_updated",
      "message0": Blockly.Msg.NETPIE_ON_SHADOW_UPDATED,
      "args0": [
        {
          "type": "field_image",
          "src": "/icons/netpie-block.png",
          "width": 20,
          "height": 20,
          "alt": "*"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "shadow_updated"
        }
      ],
      "inputsInline": false,
      "colour": SHADOW_COLOR,
      "tooltip": Blockly.Msg.NETPIE_ON_SHADOW_UPDATED_TOOLTIP,
      "helpUrl": ""     
    }
  )}
}

Blockly.Blocks['netpie_received_shadow_updated'] = {
    init: function () {
    this.jsonInit({
        "type": "netpie_received_shadow_updated",
        "message0": Blockly.Msg.NETPIE_RECEIVE_SHADOW_UPDATED,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
          },
          {
            "type": "field_input",
            "name": "field",
            "text": "home.temp"
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
        "colour": SHADOW_COLOR,
        "tooltip": Blockly.Msg.NETPIE_RECEIVE_SHADOW_UPDATED_TOOLTIP,
        "helpUrl": ""  
    }
  )}
}

Blockly.Blocks['netpie_shadow_variable_defined'] = {
	init: function () {
    this.jsonInit({
      "type": "netpie_shadow_variable_defined",
      "message0": Blockly.Msg.NETPIE_SHADOW_CONTAIN_FIELD,
      "args0": [
        {
          "type": "field_image",
          "src": "/icons/netpie-block.png",
          "width": 20,
          "height": 20,
          "alt": "*"
        },
        {
          "type": "input_value",
          "name": "field",
          "check": "String"
        }
      ],
      "inputsInline": true,
      "output": null,
      "colour": SHADOW_COLOR,
      "tooltip": Blockly.Msg.NETPIE_SHADOW_CONTAIN_FIELD_TOOLTIP,
      "helpUrl": ""
    }
  )}
}

Blockly.Blocks['netpie_read_entire_shadow'] = {
    init: function () {
    this.jsonInit(
      {
        "type": "netpie_read_entire_shadow",
        "message0": Blockly.Msg.NETPIE_READ_ENTITE_SHADOW,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "on_read_shadow"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": SHADOW_COLOR,
        "tooltip": Blockly.Msg.NETPIE_READ_ENTITE_SHADOW_TOOLTIP,
        "helpUrl": ""
      }
  )}
}

Blockly.Blocks['netpie_on_connected'] = {
    init: function () {
    this.jsonInit(
      {
        "type": "netpie_on_connected",
        "message0": Blockly.Msg.NETPIE_ON_CONNECTED,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "NAME"
          }
        ],
        "colour": CONNECT_COLOR,
        "tooltip": Blockly.Msg.NETPIE_ON_CONNECTED_TOOLTIP,
        "helpUrl": ""
      }    
  )}
}

Blockly.Blocks['netpie_on_disconnected'] = {
    init: function () {
    this.jsonInit(
      {
        "type": "netpie_on_disconnected",
        "message0": Blockly.Msg.NETPIE_ON_DISCONNECTED,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-block.png",
            "width": 20,
            "height": 20,
            "alt": "*"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "NAME"
          }
        ],
        "colour": CONNECT_COLOR,
        "tooltip": Blockly.Msg.NETPIE_ON_DISCONNECTED_TOOLTIP,
        "helpUrl": ""
      }    
  )}
}

Blockly.kbide['NETPIE_CONNECT_BLOCK'] = [];
Blockly.kbide['NETPIE_CONNECT_BLOCK_MAX'] = 1;

Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'] = [];
Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK_MAX'] = 1;

Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'] = [];
Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK_MAX'] = 1;

Blockly.kbide['NETPIE_ON_RECEIVE_MSG_BLOCK'] = [];
Blockly.kbide['NETPIE_ON_RECEIVE_MSG_BLOCK_MAX'] = 10;

Blockly.kbide['NETPIE_ON_SHADOW_UPDATED_BLOCK'] = [];
Blockly.kbide['NETPIE_ON_SHADOW_UPDATED_BLOCK_MAX'] = 1;

Blockly.kbide['NETPIE_READ_SHADOW_BLOCK'] = [];
Blockly.kbide['NETPIE_READ_SHADOW_BLOCK_MAX'] = 4;

Blockly.kbide['CONTROL_NETPIE_BLOCK_CREATED'] = function(ws, blockId, targetBlock){
  if (Blockly.kbide[targetBlock].indexOf(blockId) === -1) {
    if(Blockly.kbide[targetBlock].length < Blockly.kbide[`${targetBlock}_MAX`]){
      Blockly.kbide[targetBlock].push(blockId);
   } else {
     ws.undo(false);
   }
  }
}

Blockly.kbide['DELETE_NETPIE_ALL_BLOCK_EVENT'] = function(ws, blockId){
  Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'] = Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
  Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'] = Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
  Blockly.kbide['NETPIE_CONNECT_BLOCK'] = Blockly.kbide['NETPIE_CONNECT_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
  Blockly.kbide['NETPIE_ON_RECEIVE_MSG_BLOCK'] = Blockly.kbide['NETPIE_ON_RECEIVE_MSG_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
  Blockly.kbide['NETPIE_ON_SHADOW_UPDATED_BLOCK'] = Blockly.kbide['NETPIE_ON_SHADOW_UPDATED_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
  Blockly.kbide['NETPIE_READ_SHADOW_BLOCK'] = Blockly.kbide['NETPIE_READ_SHADOW_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
}
Blockly.kbide['SCAN_NETPIE_BLOCK'] = function(blockArray, blockType, ws){
  var blocks = Blockly.kbide.GET_BLOCKS_BY_TYPE(ws, blockType);
  var len = Blockly.kbide[blockArray].length;
  if(blocks[0] !== undefined){
    if(blocks.length === 0){
      Blockly.kbide[blockArray] = [];
    }
    else if((blocks.length > 0) && (len < Blockly.kbide[`${blockArray}_MAX`])) {
      if (Blockly.kbide[blockArray].indexOf(blocks[0].id) === -1) Blockly.kbide[blockArray].push(blocks[0].id);
    }  
  }
}
Blockly.kbide['SCAN_ALL_NETPIE_BLOCK'] = function(ws){
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_ON_CONNECTED_BLOCK', 'netpie_on_connected', ws);
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_ON_DISCONNECTED_BLOCK', 'netpie_on_disconnected', ws);
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_CONNECT_BLOCK', 'netpie_connect', ws);
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_ON_RECEIVE_MSG_BLOCK', 'netpie_on_receive_message', ws);
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_ON_SHADOW_UPDATED_BLOCK', 'netpie_on_shadow_updated', ws);
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_READ_SHADOW_BLOCK', 'netpie_read_entire_shadow', ws);
}

const handle_kbnetpie = function(primaryEvent) {
  // Convert event to JSON.  This could then be transmitted across the net.
  var json = primaryEvent.toJson();
  // console.log(json);

  var ws = Blockly.kbide['WORKSPACE'];
  var blockId = json.blockId
  var block = ws.getBlockById(json.blockId);
  switch(json.type){
      case 'delete':
        Blockly.kbide.DELETE_NETPIE_ALL_BLOCK_EVENT(ws, blockId);
        break;
      case 'create':
          if (block.type === 'netpie_on_connected') Blockly.kbide.CONTROL_NETPIE_BLOCK_CREATED(ws, blockId, 'NETPIE_ON_CONNECTED_BLOCK'); 
          else if (block.type === 'netpie_on_disconnected') Blockly.kbide.CONTROL_NETPIE_BLOCK_CREATED(ws, blockId, 'NETPIE_ON_DISCONNECTED_BLOCK');
          else if (block.type === 'netpie_connect') Blockly.kbide.CONTROL_NETPIE_BLOCK_CREATED(ws, blockId, 'NETPIE_CONNECT_BLOCK');
          else if (block.type === 'netpie_on_receive_message') Blockly.kbide.CONTROL_NETPIE_BLOCK_CREATED(ws, blockId, 'NETPIE_ON_RECEIVE_MSG_BLOCK');
          else if (block.type === 'netpie_on_shadow_updated') Blockly.kbide.CONTROL_NETPIE_BLOCK_CREATED(ws, blockId, 'NETPIE_ON_SHADOW_UPDATED_BLOCK');
          else if (block.type === 'netpie_read_entire_shadow') Blockly.kbide.CONTROL_NETPIE_BLOCK_CREATED(ws, blockId, 'NETPIE_READ_SHADOW_BLOCK');
          break;
      case 'move':
          Blockly.kbide.SCAN_ALL_NETPIE_BLOCK(ws);
          break;
      case 'ui':
          Blockly.kbide.SCAN_ALL_NETPIE_BLOCK(ws);
          break;
      default:
        break;
  }
}