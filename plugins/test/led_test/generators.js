Blockly.JavaScript['led_test.start'] = function(block) {
	return 'DEV_IO.LED_TEST().start();\n';
};

Blockly.JavaScript['led_test.stop'] = function(block) {
	return 'DEV_IO.LED_TEST().stop();\n';
};

Blockly.JavaScript['led_test_all.start'] = function(block) {
	return 'DEV_IO.LED_TEST().start_all();\n';
};

Blockly.JavaScript['led_test_all.stop'] = function(block) {
	return 'DEV_IO.LED_TEST().stop_all();\n';
};

Blockly.JavaScript['led_test_run.start'] = function(block) {
	return 'DEV_IO.LED_TEST().start_run();\n';
};

Blockly.JavaScript['led_test_run.stop'] = function(block) {
	return 'DEV_IO.LED_TEST().stop_run();\n';
};
