// bright pink: #ff69b4
// hot pink: #ff1493
// magenta: #ff00ff
const UART_TEST_BLOCK_COLOR = '#ff00ff';

Blockly.Blocks["uartchk.check"] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.UARTCHK_TITLE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.UARTCHK_UART_NUM)
			.appendField(new Blockly.FieldDropdown([
				["UART_1", "UART_NUM_1"],
				["UART_2", "UART_NUM_2"]
			]), 'UART_NUM');

		this.appendDummyInput()
			.appendField(Blockly.Msg.UARTCHK_TX)
			.appendField(new Blockly.FieldDropdown([
				["GPIO_18", "GPIO_NUM_18"],
				["GPIO_27", "GPIO_NUM_27"]
			]), 'TX');

		this.appendDummyInput()
			.appendField(Blockly.Msg.UARTCHK_RX)
			.appendField(new Blockly.FieldDropdown([
				["GPIO_19", "GPIO_NUM_19"],
				["GPIO_33", "GPIO_NUM_33"]
			]), 'RX');

		this.appendDummyInput()
			.appendField(Blockly.Msg.UARTCHK_PWR_EN)
			.appendField(new Blockly.FieldDropdown([
				["GPIO_26", "GPIO_NUM_26"],
				["GPIO_23", "GPIO_NUM_23"]
			]), 'PWR_EN');

		this.setOutput(true, 'Boolean');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(UART_TEST_BLOCK_COLOR);
		this.setTooltip(Blockly.Msg.UARTCHK_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.UARTCHK_HELPURL);
	}
};
