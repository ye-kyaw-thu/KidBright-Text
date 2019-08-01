'use strict';
goog.provide('Blockly.Constants.Variables');

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['string_variables_set'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.VARIABLES_SET_SET)
			.appendField(new Blockly.FieldVariable("text"), "VAR")
			.appendField(Blockly.Msg.VARIABLES_SET_TO);
		this.appendValueInput('VALUE')
			.setCheck('String');
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(math_colour);
		this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
	}
};

Blockly.Blocks['string_length'] = {
	init: function () {
		this.jsonInit({
			"type": "string_length",
			"message0": Blockly.Msg.STRING_LENGTH_MESSAGE +" %1",
			"args0": [
			  {
				"type": "input_value",
				"name": "NAME",
				"check": "String"
			  }
			],
			"inputsInline": true,
			"output": null,
			"colour": 165,
			"tooltip": Blockly.Msg.STRING_LENGTH_TOOLTIP,
			"helpUrl": ""
	})}
}

Blockly.Blocks['string_join'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this Blockly.Block
     */
    init: function() {
      // this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
      // this.setStyle('list_blocks');
      this.setColour(165);
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(true, 'String');
      this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
      this.setTooltip(Blockly.Msg['JOIN_STRING_CREATE_WITH_TOOLTIP']);
    },
    /**
     * Create XML to represent list inputs.
     * @return {!Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('items', this.itemCount_);
      console.log('mutationToDom: ', container);
      return container;
    },
    /**
     * Parse XML to restore the list inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function(xmlElement) {
      this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
      // console.log('domToMutation: ', this.itemCount_);
      this.updateShape_();
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function(workspace) {
      var containerBlock = workspace.newBlock('lists_create_with_container');
      containerBlock.initSvg();
      var connection = containerBlock.getInput('STACK').connection;
      for (var i = 0; i < this.itemCount_; i++) {
        var itemBlock = workspace.newBlock('lists_create_with_item');
        itemBlock.initSvg();
        connection.connect(itemBlock.previousConnection);
        connection = itemBlock.nextConnection;
      }
      // console.log('decompose: ', containerBlock);
      return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function(containerBlock) {
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      // Count number of inputs.
      var connections = [];
      while (itemBlock) {
        connections.push(itemBlock.valueConnection_);
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
      // Disconnect any children that don't belong.
      for (var i = 0; i < this.itemCount_; i++) {
        var connection = this.getInput('ADD' + i).connection.targetConnection;
        if (connection && connections.indexOf(connection) == -1) {
          connection.disconnect();
        }
      }
      this.itemCount_ = connections.length;
      this.updateShape_();
      // Reconnect any child blocks.
      for (var i = 0; i < this.itemCount_; i++) {
        Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
      }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function(containerBlock) {
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      var i = 0;
      while (itemBlock) {
        var input = this.getInput('ADD' + i);
        itemBlock.valueConnection_ = input && input.connection.targetConnection;
        i++;
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @private
     * @this Blockly.Block
     */
    updateShape_: function() {
      if (this.itemCount_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY');
      } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
        this.appendDummyInput('EMPTY')
            .appendField(Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
      }
      // Add new inputs.
      for (var i = 0; i < this.itemCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          var input = this.appendValueInput('ADD' + i).setCheck(['Number', 'String']);
          if (i == 0) {
            input.appendField(Blockly.Msg['JOIN_STRING_CREATE_WITH_INPUT_WITH']);
          }
        }
      }
      // Remove deleted inputs.
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i);
        i++;
      }
    }
  };

Blockly.Blocks['string_substring'] = {
  init: function () {
    this.jsonInit({
      "type": "string_substring",
      "message0": Blockly.Msg.STRING_SUBSTRING_TEXT + "%1" + Blockly.Msg.STRING_SUBSTRING_FROM + "%2" + Blockly.Msg.STRING_SUBSTRING_TO +"%3",
      "args0": [
        {
          "type": "input_value",
          "name": "input",
          "check": "String"
        },
        {
          "type": "input_value",
          "name": "from",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "to",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "String",
      "colour": 165,
      "tooltip": Blockly.Msg.STRING_SUBSTRING_TOOLTIP,
      "helpUrl": ""
  })}
}

Blockly.Blocks['string_with_number'] = {
	init: function () {
		this.jsonInit({
      "type": "string_with_number", 
      "message0": Blockly.Msg.STRING_WITH_NUMBER + " %1" + Blockly.Msg.STRING_WITH_NUMBER_VALUE + " %2",
      "args0": [ 
      { 
      "type": "field_input", 
      "name": "TEXT", 
      "text": "Value is" 
      }, 
      { 
      "type": "input_value", 
      "name": "NAME" 
      } 
      ], 
      "inputsInline": true, 
      "output": "String", 
      "colour": 165, 
      "tooltip": Blockly.Msg.STRING_WITH_NUMBER_TOOLTIP, 
      "helpUrl": "" 
    }
    )}
}

Blockly.Blocks['string_charAt'] = {
	init: function () {
		this.jsonInit({
        "type": "string_charAt",
        "message0": Blockly.Msg.STRING_CHAR_AT_TEXT + "%1" + Blockly.Msg.STRING_CHAR_AT_INDEX + "%2",
        "args0": [
          {
            "type": "input_value",
            "name": "input",
            "check": ["String"]
          },
          {
            "type": "input_value",
            "name": "index",
            "check": "Number"
          }
        ],
        "inputsInline": true,
		"output": "String",
        "colour": 165,
        "tooltip": Blockly.Msg.STRTING_CHAT_AT_TOOLTIP,
        "helpUrl": ""
      }
    )}
}
