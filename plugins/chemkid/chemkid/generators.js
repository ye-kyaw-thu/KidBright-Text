/*Blockly.JavaScript['chemkid.get_illuminance'] = function(block) {
	return [
		'DEV_I2C1.CHEMKID(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ').get_illuminance()',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};
*/

Blockly.JavaScript['chemkid.get_illuminance'] = function(block) {
	//var dropdown_rgbled = block.getFieldValue('RGBLED');
	///var dropdown_ledpin = block.getFieldValue('LEDPIN');
	var dropdown_redled = block.getFieldValue('REDLED');
  var dropdown_greenled = block.getFieldValue('GREENLED');
  var dropdown_blueled = block.getFieldValue('BLUELED');
  /////var dropdown_channel = block.getFieldValue('CHANNEL');
  /////var dropdown_address = block.getFieldValue('ADDRESS');
  var dropdown_gain = block.getFieldValue('GAIN');
  var dropdown_exposure_time = block.getFieldValue('EXPOSURE_TIME');
	////var dropdown_response_time = block.getFieldValue('RESPONSE_TIME');
	var dropdown_output1 = block.getFieldValue('OUTPUT1');
	return [
		//'DEV_I2C1.CHEMKID(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ').get_illuminance()',
		/*
		'DEV_I2C1.CHEMKID(' + block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ', '
		+ block.getFieldValue('GAIN') + ', ' + block.getFieldValue('EXPOSURE_TIME') + ', '
		+ block.getFieldValue('RESPONSE_TIME') + ').get_illuminance()',
		*/
		/*'DEV_I2C1.CHEMKID(' + block.getFieldValue('RGBLED') + ', '
		+ block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ', ' + block.getFieldValue('GAIN') + ', '
		+ block.getFieldValue('EXPOSURE_TIME') + ', ' + block.getFieldValue('RESPONSE_TIME') + ').get_illuminance()',
		Blockly.JavaScript.ORDER_ATOMIC
		*/



		/*'DEV_I2C1.CHEMKID(' + block.getFieldValue('LEDPIN') + ', '
		+ block.getFieldValue('REDLED') + ', ' + block.getFieldValue('GREENLED') + ', ' + block.getFieldValue('BLUELED') + ', '
		+ block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ', ' + block.getFieldValue('GAIN') + ', '
		+ block.getFieldValue('EXPOSURE_TIME') + ', ' + block.getFieldValue('RESPONSE_TIME')+ ').get_illuminance()',
		*/

		///'DEV_I2C1.CHEMKID(' + block.getFieldValue('LEDPIN') + ', '
		'DEV_I2C1.CHEMKID(' + block.getFieldValue('REDLED') + ', ' + block.getFieldValue('GREENLED') + ', ' + block.getFieldValue('BLUELED') + ', '
		/////+ block.getFieldValue('CHANNEL') + ', ' + block.getFieldValue('ADDRESS') + ', '
		+ block.getFieldValue('GAIN') + ', '
		+ block.getFieldValue('EXPOSURE_TIME') + ', '
		////+ block.getFieldValue('RESPONSE_TIME')+ ', '
		+ block.getFieldValue('OUTPUT1') + ').get_illuminance()',


		Blockly.JavaScript.ORDER_ATOMIC
	];
};
