Blockly.Blocks['lists_create_with'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this Blockly.Block
     */
    init: function() {
      // this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
      // this.setStyle('list_blocks');
      this.setColour(230);
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(false, 'Array');
      // this.setOutput(true, 'Array');
      this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
    },
    /**
     * Create XML to represent list inputs.
     * @return {!Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('items', this.itemCount_);
      // console.log('mutationToDom: ', container);
      return container;
    },
    //
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
          var input = this.appendValueInput('ADD' + i).setCheck(['Number']);
          if (i == 0) {
            input.appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
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

Blockly.Blocks['list_get_length'] = {
	init: function () {
    this.jsonInit({
          "type": "list_get_length",
          "message0": Blockly.Msg.LIST_GET_LENGTH,
          "output": "Number",
          "colour": 230,
          "tooltip": Blockly.Msg.LIST_GET_LENGTH_TOOLTIP,
          "helpUrl": ""
        }
    )}
}

Blockly.Blocks['list_get_index'] = {
	init: function () {
    this.jsonInit({
      "type": "list_get_index",
      "message0": Blockly.Msg.LIST_GET_INDEX + " %1",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": 230,
      "tooltip": Blockly.Msg.LIST_GET_INDEX_TOOLTIP,
      "helpUrl": ""
    }
    )}
}

Blockly.Blocks['list_set_index'] = {
	init: function () {
    this.jsonInit({
      "type": "list_set_index",
      "message0": Blockly.Msg.LIST_SET_INDEX_VALUE + " %1 " + Blockly.Msg.LIST_SET_INDEX_AT + " %2",
      "args0": [
        {
          "type": "input_value",
          "name": "val",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "index",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": Blockly.Msg.LIST_SET_INDEX_TOOLTIP,
      "helpUrl": ""
    }
    )}
}

Blockly.Blocks['list_insert_first'] = {
	init: function () {
		this.jsonInit({
      "type": "list_insert_first",
      "message0": Blockly.Msg.LIST_INSERT_FIRST,
      "args0": [
        {
          "type": "input_value",
          "name": "input",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": Blockly.Msg.LIST_INSERT_FIRST_TOOLTIP,
      "helpUrl": ""
		}
    )}
}

Blockly.Blocks['list_insert_last'] = {
	init: function () {
		this.jsonInit({
      "type": "list_insert_first",
      "message0": Blockly.Msg.LIST_INSERT_LAST,
      "args0": [
        {
          "type": "input_value",
          "name": "input",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": Blockly.Msg.LIST_INSERT_LAST_TOOLTIP,
      "helpUrl": ""
		}
    )}
}

Blockly.Blocks['list_insert_index'] = {
	init: function () {
		this.jsonInit({
			"type": "list_insert_index",
			"message0": Blockly.Msg.LIST_INSERT_INDEX_VALUE + " %1" + Blockly.Msg.LIST_INSERT_INDEX_AT + " %2",
			"args0": [
			  {
				"type": "input_value",
				"name": "number",
				"check": "Number"
			  },
			  {
				"type": "input_value",
				"name": "index",
				"check": "Number"
			  }
			],
			"inputsInline": true,
			"previousStatement": null,
			"nextStatement": null,
			"colour": 230,
			"tooltip": Blockly.Msg.LIST_INSERT_INDEX_TOOLTIP,
			"helpUrl": ""
		}
    )}
}

Blockly.Blocks['list_get_text'] = {
	init: function () {
		this.jsonInit({
			"type": "list_get_text",
			"message0": Blockly.Msg.LIST_GET_TEXT,
			"args0": [
			  {
				"type": "field_number",
				"name": "index_from",
				"value": 0
			  },
			  {
				"type": "field_number",
				"name": "index_to",
				"value": 10
			  }
			],
			"inputsInline": false,
			"output": "String",
			"colour": 230,
			"tooltip": Blockly.Msg.LIST_GET_TEXT_TOOLTIP,
			"helpUrl": ""
		}
    )}
}