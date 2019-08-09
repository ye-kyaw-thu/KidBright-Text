//---------------------------------------------------------------------
Blockly.JavaScript['function'] = function (block) {
	let funcName = block.getFieldValue('NAME');

	// generate unique function name
	let branch = Blockly.JavaScript.statementToCode(block, 'CODE');
	if (Blockly.JavaScript.STATEMENT_PREFIX) {
		branch = Blockly.JavaScript.prefixLines(
			Blockly.JavaScript.STATEMENT_PREFIX.replace(/%1/g,
				'\'' + block.id + '\''), Blockly.JavaScript.INDENT) + branch;
	}
	if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
		branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
			'\'' + block.id + '\'') + branch;
	}
	let code = '';
	if(funcName !== '') code = 'void func_' + funcName + '(void) {\n' + branch + '\n}';
	code = Blockly.JavaScript.scrub_(block, code);
	// Add % so as not to collide with helper functions in definitions list.
	Blockly.JavaScript.definitions_['%' + funcName] = code;
	return null;
};

Blockly.JavaScript['call_function'] = function (block) {
	var name = block.getFieldValue('NAME');
	// TODO: Assemble JavaScript into code variable.
	let code = `func_${name}();\n`;

	return code;
};
