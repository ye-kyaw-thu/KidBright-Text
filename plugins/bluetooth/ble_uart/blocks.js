Blockly.Blocks['ble_uart.on_data'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.BLE_UART_ON_DATA_TITLE);
		this.appendStatementInput("ON_DATA")
		  .setCheck(null);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLE_UART_ON_DATA_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLE_UART_ON_DATA_HELPURL);
	}
};

Blockly.Blocks["ble_uart.read_text"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.BLE_UART_READ_TEXT_TITLE);
		this.setOutput(true, 'String');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLE_UART_READ_TEXT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLE_UART_READ_TEXT_HELPURL);
	}
};

Blockly.Blocks["ble_uart.read_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.BLE_UART_READ_NUMBER_TITLE);
		this.setOutput(true, 'Number');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLE_UART_READ_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLE_UART_READ_NUMBER_HELPURL);
	}
};

Blockly.Blocks["ble_uart.send"] = {
	init: function() {
		this.appendValueInput("VALUE")        
        	.appendField(Blockly.Msg.BLE_UART_SEND_TITLE);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLE_UART_SEND_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLE_UART_SEND_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return $(document.createElement('block')).attr({
			type: 'ble_uart.send'
		}).append('\
		   <value name="VALUE">\
			  <shadow type="ble_uart.text_number">\
			  </shadow>\
		  </value>'
	   );
   }
};

Blockly.Blocks["ble_uart.text_number"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC', 12, 12, '*'))
			.appendField(new Blockly.FieldTextInput('Hello World!'), 'VALUE')
			.appendField(new Blockly.FieldImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==', 12, 12, '*'));
		this.setOutput(true, 'String');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(160);
		this.setTooltip(Blockly.Msg.BLE_UART_TEXT_NUMBER_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BLE_UART_TEXT_NUMBER_HELPURL);
	},
	// custom xmlToolbox
	xmlToolbox: function() {
		return null; // hidden block
	}
};
