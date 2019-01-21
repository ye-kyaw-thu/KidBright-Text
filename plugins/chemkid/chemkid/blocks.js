/*Blockly.Blocks["chemkid.get_illuminance"] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.CHEMKID_GET_LUX_TITLE);
		// i2c channel 0 to 64
		var channel_array = [];
		for (var i = 0;i <= 64; i++) {
			channel_array.push([String(i), String(i)]);
		}
		this.appendDummyInput()
			.appendField(Blockly.Msg.CHANNEL)
			.appendField(new Blockly.FieldDropdown(channel_array), 'CHANNEL');

		// device addess
		this.appendDummyInput()
			.appendField(Blockly.Msg.ADDRESS)
			.appendField(new Blockly.FieldDropdown([["0x38", "56"],["0x39", "57"],["0x49", "73"]]), 'ADDRESS');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setColour(58);
		this.setTooltip(Blockly.Msg.CHEMKID_GET_LUX_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.CHEMKID_GET_LUX_HELPURL);
	}
};
*/
Blockly.Blocks['chemkid.get_illuminance'] = {
  init: function() {
		this.appendDummyInput()
        .appendField("ChemKid Education");
		this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("A) Light Source");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        //.appendField(new Blockly.FieldColour("#ff0000"), "RGBLED");
				//.appendField(new Blockly.FieldTextInput("255"), "RGBLED");
				//.appendField(new Blockly.FieldDropdown([["0","0"], ["128","128"], ["255","255"]]), "RGBLED");
        ///.appendField("PIN")
        ///.appendField(new Blockly.FieldDropdown([["GPIO18 (SPIBUS_CLK_GPIO)","18"], ["GPIO19 (SPIBUS_MISO_GPIO)","19"], ["GPIO23 (SPIBUS_MOSI_GPIO)","23"], ["GPIO25 (USBSW_GPIO)","25"], ["GPIO4 (CHAIN_SDA_GPIO)","4"], ["GPIO5 (CHAIN_SCL_GPIO)","5"], ["GPIO26 (OUT1_GPIO)","26"], ["GPIO27 (OUT2_GPIO)","27"]]), "LEDPIN")
				.appendField("       Red")
        .appendField(new Blockly.FieldDropdown([["0","0"], ["8","8"], ["16","16"], ["32","32"], ["64","64"], ["128","128"], ["192","192"], ["255","255"]]), "REDLED")
        .appendField("    Green")
        .appendField(new Blockly.FieldDropdown([["0","0"], ["8","8"], ["16","16"], ["32","32"], ["64","64"], ["128","128"], ["192","192"], ["255","255"]]), "GREENLED")
        .appendField("    Blue")
        .appendField(new Blockly.FieldDropdown([["0","0"], ["8","8"], ["16","16"], ["32","32"], ["64","64"], ["128","128"], ["192","192"], ["255","255"]]), "BLUELED");
    //////this.appendDummyInput()
        //////.setAlign(Blockly.ALIGN_CENTER)
        //////.appendField("_________________________________");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("B) Sensor");
    /////this.appendDummyInput()
        /////.setAlign(Blockly.ALIGN_RIGHT)
        /////.appendField("   Channel")
        /////.appendField(new Blockly.FieldDropdown([["0","0"], ["1","1"], ["2","2"], ["3","3"], ["4","4"], ["5","5"]]), "CHANNEL")
        /////.appendField("   Address")
        /////.appendField(new Blockly.FieldDropdown([["0x38","56"], ["0x39","57"]]), "ADDRESS");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("       Gain")
        .appendField(new Blockly.FieldDropdown([["x1","0x10"], ["x2","0x11"], ["x16","0x12"]]), "GAIN")
        .appendField("    Exposure")
        //////.appendField(new Blockly.FieldDropdown([["160 ms","0x00"], ["320 ms","0x01"], ["640 ms","0x02"], ["1280 ms","0x03"], ["2560 ms","0x04"], ["5120 ms","0x05"]]), "EXPOSURE_TIME")
        .appendField(new Blockly.FieldDropdown([["160 ms","0x00"], ["320 ms","0x01"], ["640 ms","0x02"]]), "EXPOSURE_TIME")
        ////.appendField("   ResponseTime")
				////.appendField(new Blockly.FieldDropdown([["160 ms","160"], ["320 ms","320"], ["640 ms","640"], ["1280 ms","1280"], ["2560 ms","2560"], ["5120 ms","5120"], ["10240 ms","10240"]]), "RESPONSE_TIME");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("       ColorValue")
        .appendField(new Blockly.FieldDropdown([["Red","0"], ["Green","1"], ["Blue","2"], ["White", "3"]]), "OUTPUT1");
    this.setInputsInline(false);
    //this.setOutput(true, null);
		this.setOutput(true, 'Number');
    this.setColour(210);
 this.setTooltip("CHEMKID_GET_LUX_TOOLTIP");
 this.setHelpUrl("CHEMKID_GET_LUX_HELPURL");
  }
};
