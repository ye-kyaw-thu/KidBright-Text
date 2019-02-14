Blockly.Blocks["mqtt_setup"] = {
	init: function(){
		this.jsonInit({
            "type": "mqtt_setup",
            "message0": Blockly.Msg.MQTT_SET_CLIENT_ID + " %1 " + 
                        Blockly.Msg.MQTT_SERVER + " %2 " + 
                        Blockly.Msg.MQTT_PORT + " %3 " +
                        Blockly.Msg.MQTT_USER + " %4 " + 
                        Blockly.Msg.MQTT_PASSWORD + " %5 " +
                        Blockly.Msg.MQTT_KEEP_ALIVE + " %6 ",
            "args0": [
              {
                "type": "input_value",
                "name": "CLIENT_ID",
                "check": "String"
              },
              {
                "type": "input_value",
                "name": "SERVER",
                "check": "String"
              },
              {
                "type": "input_value",
                "name": "PORT",
                "check": "Number"
              },
              {
                "type": "input_value",
                "name": "USER",
                "check": "String"
              },
              {
                "type": "input_value",
                "name": "PASSWORD",
                "check": "String"
              },
              {
                "type": "input_value",
                "name": "KEEP_ALIVE",
                "check": "Number"
              }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180,
            "tooltip": Blockly.Msg.MQTT_SET_TOOLTIP,
        });
	}
};

Blockly.Blocks["mqtt_subscribe"] = {
	init: function(){
		this.jsonInit({
            "type": "block_type",
            "message0": Blockly.Msg.MQTT_SUBSCRIBE + " %1 %2 %3",
            "args0": [
              {
                "type": "field_input",
                "name": "TOPIC",
                "text": "default"
              },
              {
                "type": "input_dummy"
              },
              {
                "type": "input_statement",
                "name": "SUBSCRIBE"
              }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180,
            "tooltip": Blockly.Msg.MQTT_SUBSCRIBE_TOOLTIP,
            "helpUrl": ""
        });
	}
};

Blockly.Blocks["mqtt_publish"] = {
	init: function(){
		this.jsonInit({
            "type": "mqtt_publish",
            "message0": Blockly.Msg.MQTT_PUBLISH_INIT + " %1 " + Blockly.Msg.MQTT_PUBLISH_TOPIC + " %2",
            "args0": [
              {
                "type": "input_value",
                "name": "PUBLISH"
              },
              {
                "type": "field_input",
                "name": "TOPIC",
                "text": "default"
              }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180,
            "tooltip": Blockly.Msg.MQTT_PUBLISH_TOOLTIP,
            "helpUrl": ""
        });
	}
};

Blockly.Blocks["mqtt_start"] = {
	init: function(){
		this.jsonInit({
            "type": "mqtt_start",
            "message0": Blockly.Msg.MQTT_START,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180,
            "tooltip": Blockly.Msg.MQTT_START_TOOLTIP,
            "helpUrl": ""
        });
	}
};

Blockly.Blocks["mqtt_get_topic_data"] = {
	init: function(){
		this.jsonInit({
            "type": "get_topic_data",
            "message0": Blockly.Msg.MQTT_GET_TOPIC_DATA,
            "output": null,
            "colour": 180,
            "tooltip": Blockly.Msg.MQTT_GET_TOPIC_DATA_TOOLTIP,
            "helpUrl": ""
          });
	}
};
