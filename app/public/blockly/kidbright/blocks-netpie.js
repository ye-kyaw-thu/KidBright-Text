Blockly.Blocks['netpie_connect'] = {
	init: function () {
    this.jsonInit({
        "type": "netpie_connect",
        "message0": Blockly.Msg.NETPIE_CONNECT,
        "args0": [
          {
            "type": "field_image",
            "src": "/icons/netpie-logo.png",
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
            "text": "default"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "field_input",
            "name": "DEVICE_TOKEN",
            "text": "default"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#218c74",
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
            "src": "/icons/netpie-logo.png",
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
        "colour": "#218c74",
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
            "src": "/icons/netpie-logo.png",
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
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#133253",
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
            "src": "/icons/netpie-logo.png",
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
        "colour": "#133253",
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
          "src": "/icons/netpie-logo.png",
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
      "colour": "#218c74",
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
          "src": "/icons/netpie-logo.png",
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
      "colour": "#218c74",
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
          "src": "/icons/netpie-logo.png",
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
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#34ace0",
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
            "src": "/icons/netpie-logo.png",
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
        "colour": "#34ace0",
        "tooltip": Blockly.Msg.NETPIE_RECEIVE_SHADOW_UPDATED_TOOLTIP,
        "helpUrl": ""  
    }
  )}
}

Blockly.Blocks['netpie_shadow_updated_contains'] = {
	init: function () {
    this.jsonInit({
      "type": "netpie_shadow_updated_contains",
      "message0": Blockly.Msg.NETPIE_SHADOW_CONTAIN_FIELD,
      "args0": [
        {
          "type": "field_image",
          "src": "/icons/netpie-logo.png",
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
      "colour": "#34ace0",
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
            "src": "/icons/netpie-logo.png",
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
        "colour": "#34ace0",
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
            "src": "/icons/netpie-logo.png",
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
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#474787",
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
            "src": "/icons/netpie-logo.png",
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
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#474787",
        "tooltip": Blockly.Msg.NETPIE_ON_DISCONNECTED_TOOLTIP,
        "helpUrl": ""
      }    
  )}
}

// Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'] = [];
Blockly.kbide['NETPIE_CONNECTED_BLOCK'] = [];
Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'] = [];
Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'] = [];

Blockly.kbide['CREATE_NETPIE_ON_CONNECTED_EVENT'] = function(ws, blockId){
  if(Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'].length < 1){
    Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'].push(blockId);
  } else {
    ws.undo(false);
  }
}
Blockly.kbide['CREATE_NETPIE_ON_DISCONNECTED_EVENT'] = function(ws, blockId){
  if(Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'].length < 1){
    Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'].push(blockId);
  } else {
    ws.undo(false);
  }
}
Blockly.kbide['CREATE_NETPIE_CONNECTED_EVENT'] = function(ws, blockId){
  if(Blockly.kbide['NETPIE_CONNECTED_BLOCK'].length < 1){
    Blockly.kbide['NETPIE_CONNECTED_BLOCK'].push(blockId);
  } else {
    ws.undo(false);
  }
}
Blockly.kbide['DELETE_NETPIE_ON_CONNECTED_EVENT'] = function(ws, blockId){
  Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'] = Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
  Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'] = Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
  Blockly.kbide['NETPIE_CONNECTED_BLOCK'] = Blockly.kbide['NETPIE_CONNECTED_BLOCK'].filter((obj) => {
    return obj !== blockId
  })
}
Blockly.kbide['SCAN_NETPIE_BLOCK'] = function(blockArray, blockType, ws){
  var blocks = Blockly.kbide.GET_BLOCKS_BY_TYPE(ws, blockType);
  var len = Blockly.kbide[blockArray].length;
  if(blocks.length === 0){
    Blockly.kbide[blockArray] = [];
  }
  else if((blocks.length > 0) && (len < 1)) {
    Blockly.kbide[blockArray].push(blocks[0].id);
  }  
}
Blockly.kbide['SCAN_NETPIE_ON_CONNECTED_EVENT'] = function(ws){
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_ON_CONNECTED_BLOCK', 'netpie_on_connected', ws);
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_ON_DISCONNECTED_BLOCK', 'netpie_on_disconnected', ws);
  Blockly.kbide.SCAN_NETPIE_BLOCK('NETPIE_CONNECTED_BLOCK', 'netpie_connect', ws);

  // var blocks_connected = Blockly.kbide.GET_BLOCKS_BY_TYPE(ws, 'netpie_on_connected');
  // var on_connected_len = Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'].length;
  // if(blocks_connected.length === 0){
  //   Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'] = [];
  // }
  // else if((blocks_connected.length > 0) && (on_connected_len < 1)) {
  //   Blockly.kbide['NETPIE_ON_CONNECTED_BLOCK'].push(blocks_connected[0].id);
  // }

  // var blocks_disconnected = Blockly.kbide.GET_BLOCKS_BY_TYPE(ws, 'netpie_on_disconnected');
  // var on_disconnected_len = Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'].length;
  // if(blocks_disconnected.length === 0){
  //   Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'] = [];
  // }
  // else if((blocks_disconnected.length > 0) && (on_disconnected_len < 1)) {
  //   Blockly.kbide['NETPIE_ON_DISCONNECTED_BLOCK'].push(blocks_disconnected[0].id);
  // }
}

// Blockly.kbide['CREATE_ON_SHADOW_UPDATED_EVENT'] = function(ws, blockId){
//   if(Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].length < 1){
//     Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].push(blockId);
//   } else {
//     ws.undo(false);
//   }
// }
// Blockly.kbide['DELETE_ON_SHADOW_UPDATED_EVENT'] = function(ws, blockId){
//   Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'] = Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].filter((obj) => {
//     return obj !== blockId
//   })
// }
// Blockly.kbide['SCAN_ON_SHADOW_UPDATED_EVENT'] = function(ws){
//   var blocks = Blockly.kbide.GET_BLOCKS_BY_TYPE(ws, 'netpie_on_shadow_updated');
//   var on_shadow_len = Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].length;
//   if(blocks.length === 0){
//     Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'] = [];
//   }
//   else if((blocks.length > 0) && (on_shadow_len < 1)) {
//     Blockly.kbide['ON_SHADOW_UPDATED_BLOCK'].push(blocks[0].id);
//   }
// }

const handle_netpie_on_connected = function(primaryEvent) {
  // Convert event to JSON.  This could then be transmitted across the net.
  var json = primaryEvent.toJson();
  // console.log(json);

  var ws = Blockly.kbide['WORKSPACE'];
  var blockId = json.blockId
  var block = ws.getBlockById(json.blockId);
  switch(json.type){
      case 'delete':
        Blockly.kbide.DELETE_NETPIE_ON_CONNECTED_EVENT(ws, blockId);
        break;
      case 'create':
          if (block.type === 'netpie_on_connected') Blockly.kbide.CREATE_NETPIE_ON_CONNECTED_EVENT(ws, blockId);
          else if (block.type === 'netpie_on_disconnected') Blockly.kbide.CREATE_NETPIE_ON_DISCONNECTED_EVENT(ws, blockId);
          else if (block.type === 'netpie_connect') Blockly.kbide.CREATE_NETPIE_CONNECTED_EVENT(ws, blockId);
          break;
      case 'move':
          Blockly.kbide.SCAN_NETPIE_ON_CONNECTED_EVENT(ws);
          break;
      case 'ui':
          Blockly.kbide.SCAN_NETPIE_ON_CONNECTED_EVENT(ws);
          break;
      default:
        break;
  }
}