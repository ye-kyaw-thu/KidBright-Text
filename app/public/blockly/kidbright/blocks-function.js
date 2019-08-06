Blockly.list_func_block = [['', '']];
Blockly.kbide = {};
// func_detail {
// 	name: "foo",
// 	blockId: "1234",
// 	call_blockIds: ["1234", "5678"]
// }

Blockly.kbide['FUNCTIONS_DETAIL'] = [];
Blockly.kbide['DROPDOWN_FUNCTION'] = [['', '']];

Blockly.Blocks['function'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("function")
            .appendField(new Blockly.FieldTextInput("foo"), "NAME");
        this.appendStatementInput("CODE")
            .setCheck(null);
        this.setColour(advance_colour);
        this.setTooltip("");
        this.setHelpUrl("");
    },
};
Blockly.Blocks['call_function'] = {
    init: function() {
        this.appendDummyInput("CALL_INPUT")
            .appendField("call function ")
            .appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), "NAME")
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(advance_colour);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setDropDown();
    },
    setDropDown: function(){
        var funcs = Blockly.kbide.GET_DROPDOWN_FUNCTIONS(Blockly.kbide['WORKSPACE']);
        var dropdown_list = [['', '']];

        for(i in funcs){
            dropdown_list.push([funcs[i], funcs[i]])
        }
        // console.log('setDropDown: ', dropdown_list);
        Blockly.kbide['DROPDOWN_FUNCTION'] = dropdown_list;
    }
};

Blockly.kbide['GET_BLOCKS_BY_TYPE'] = function(ws, type){
    var all_block = ws.getAllBlocks(true);
    var block_type = all_block.filter(function(item){
        return item.type === type
    });
    return block_type;
}

Blockly.kbide['GET_FUNCTION_NAME'] = function(array, key, value) {
    return array.filter(function (object) {
        return object[key] === value;
    });
};

Blockly.kbide['GEN_FUNCTION_NAME'] = function(value){
    var isNewName = false;
    var num = 0;
    var base_name = value;
    var names = Blockly.kbide.GET_FUNCTION_NAME(
            Blockly.kbide['FUNCTIONS_DETAIL'], 'name', value
        );

    while(names.length !== 0){
        names = Blockly.kbide.GET_FUNCTION_NAME(
            Blockly.kbide['FUNCTIONS_DETAIL'], 'name', value
        );
        if(names.length === 0){ // not found duplicate name.
            if(num !== 0) {
                base_name = base_name + num.toString();
                isNewName = true;
                break;
            }
            break;
        }
        isNewName = false;
        num++;
        value = base_name + num.toString();
    }
    
    return {name: base_name, isNewName: isNewName};
}
Blockly.kbide['GET_DROPDOWN_FUNCTIONS'] = function(workspace){
    // scan workspace to collect all function name
    var result = [];

    // var func_list = workspace.getBlocksByType('function');
    var func_list = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'function');
    for(i in func_list){
        result.push(func_list[i].getFieldValue('NAME'));
        // console.log(func_list[i].inputList[0].fieldRow[1].text_);
    }
    return [...new Set(result)];
}
Blockly.kbide['GET_CALL_FUNCTION'] = function(workspace, block){
    console.log('GET_CALL_FUNCTION');
    // return all call function id by function id
}
Blockly.kbide['CREATE_FUNCTION_EVENT'] = function(workspace, block){
    console.log('CREATE_FUNCTION_EVENT');
    var block_name = block.getFieldValue('NAME')
    // check name is not duplicate then get unique name
    var name = Blockly.kbide.GEN_FUNCTION_NAME(block_name).name;

    block.setFieldValue(name, 'NAME');
    Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'field', 'NAME', '', name));
    Blockly.kbide['FUNCTIONS_DETAIL'].push({name: name, editable: false, id: block.id, call_ids: []});
    // console.log('FUNCTIONS_DETAIL: ', Blockly.kbide['FUNCTIONS_DETAIL']);

    // update dropdown list in workspace
    Blockly.kbide['DROPDOWN_FUNCTION'].push([name, name]);
    // var call_blocks = workspace.getBlocksByType('call_function');
    var call_blocks = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'call_function');
    for(i in call_blocks){
        var block_input = call_blocks[i].getInput('CALL_INPUT');
        var block_value = call_blocks[i].getFieldValue('NAME');
        block_input.removeField('NAME');
        block_input.appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), 'NAME');
        call_blocks[i].setFieldValue(block_value, 'NAME');
    }		
}
Blockly.kbide['CHANGE_FUNCTION_EVENT'] = function(workspace, block){
    console.log('CHANGE_FUNCTION_EVENT');
    // check name is not duplicate
    var func_detail = Blockly.kbide['FUNCTIONS_DETAIL'];
    var changed_block = Blockly.kbide.GET_FUNCTION_NAME(func_detail, 'id', block.id);
    if(changed_block[0].editable === true){
        var name = Blockly.kbide.GEN_FUNCTION_NAME(block.getFieldValue('NAME'));
        var func = Blockly.kbide.GET_FUNCTION_NAME(func_detail, 'name', changed_block[0].name);

        // var call_func = workspace.getBlocksByType('call_function');
        var call_func = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'call_function');
        for(i in call_func){ // update dropdown list that select changed function
            var call_func_block = call_func[i];
            Blockly.kbide['DROPDOWN_FUNCTION'] = Blockly.kbide['DROPDOWN_FUNCTION'].filter(
                function(item){
                    return item[0] !== changed_block[0].name
                }
            )
            Blockly.kbide['DROPDOWN_FUNCTION'].push([name.name, name.name]);
            var block_input = call_func_block.getInput('CALL_INPUT');
            block_input.removeField('NAME');
            block_input.appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), 'NAME');
            call_func_block.setFieldValue('', 'NAME');
        }

        if(name.isNewName === true) {
            block.setFieldValue(name.name, 'NAME');
        } else {
            if(func.length !== 0){
                func[0].name = name.name; // update function name
            }
        }
        console.log(name, func_detail);
    } else {
        changed_block[0].editable = true;
    }
}
Blockly.kbide['DELETE_FUNCTION_EVENT'] = function(workspace, blockId){
    console.log('DELETE_FUNCTION_EVENT ', blockId);
    var func_detail = Blockly.kbide['FUNCTIONS_DETAIL'];
    var del_block = Blockly.kbide.GET_FUNCTION_NAME(func_detail, 'id', blockId);
    if(del_block.length > 0){ // get deleted block id
        // console.log(del_block);

        // update unused call function workspace to select null value.
        // var call_func = del_block[0].call_ids;
        var call_func = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'call_function');
        for(i in call_func){
            var call_func_block = call_func[i];
            var block_value = call_func_block.getFieldValue('NAME');

            Blockly.kbide['DROPDOWN_FUNCTION'] = Blockly.kbide['DROPDOWN_FUNCTION'].filter(
                function(item){
                    return item[0] !== del_block[0].name
                }
            )

            try {
                var block_input = call_func_block.getInput('CALL_INPUT');
                block_input.removeField('NAME');
                block_input.appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), 'NAME');
                
                if(del_block[0].name === block_value) call_func_block.setFieldValue('', 'NAME');
                else call_func_block.setFieldValue(block_value, 'NAME');   
            } catch (err) {
                throw err
            }
        }
        // update call function dropdown in workspace
        Blockly.kbide['FUNCTIONS_DETAIL'] = func_detail.filter(function(item){
            return item.id !== blockId
        })
    }
}
Blockly.kbide['CREATE_CALL_FUNCTION_EVENT'] = function(workspace, block){
    console.log('CREATE_CALL_FUNCTION_EVENT ', block.id);
    func_name = block.getFieldValue('NAME');
    if(func_name !== ''){
        var names = Blockly.kbide.GET_FUNCTION_NAME(
            Blockly.kbide['FUNCTIONS_DETAIL'], 'name', func_name
        );
        if(names.length !== 0){
            names[0].call_ids.push(block.id); // save call function dropdown value
        }
    }
}
Blockly.kbide['CHANGE_CALL_FUNCTION_EVENT'] = function(workspace, block){
    console.log('CHANGE_CALL_FUNCTION_EVENT');
    func_name = block.getFieldValue('NAME');
    if(func_name !== ''){
        // remove from old call function
        var func_detail = Blockly.kbide['FUNCTIONS_DETAIL'];
        for(i in func_detail){
            func_detail[i].call_ids = func_detail[i].call_ids.filter(function(item){
                return item !== block.id;
            });
        }
        Blockly.kbide['FUNCTIONS_DETAIL'] = func_detail;
        var names = Blockly.kbide.GET_FUNCTION_NAME(
            Blockly.kbide['FUNCTIONS_DETAIL'], 'name', func_name
        );
        if(names.length !== 0){
            names[0].call_ids.push(block.id); // move to call new function
        }
    }
    // console.log('change call ', Blockly.kbide['FUNCTIONS_DETAIL']);
}
Blockly.kbide['DELETE_CALL_FUNCTION_EVENT'] = function(workspace, blockId){
    console.log('DELETE_CALL_FUNCTION_EVENT');
    // delete call function dropdown value
    var func_detail = Blockly.kbide['FUNCTIONS_DETAIL'];
    for(i in func_detail){
        func_detail[i].call_ids = func_detail[i].call_ids.filter(function(item){
            return item !== blockId;
        });
    }
    Blockly.kbide['FUNCTIONS_DETAIL'] = func_detail;
    // console.log('delete call ', Blockly.kbide['FUNCTIONS_DETAIL']);
}

const handle_function = function(primaryEvent) {
    // Convert event to JSON.  This could then be transmitted across the net.
    var json = primaryEvent.toJson();
    console.log(json);

    var ws = Blockly.kbide['WORKSPACE'];
    var blockId = json.blockId
    var block = ws.getBlockById(json.blockId);
    switch(json.type){
        case 'delete':
        	Blockly.kbide.DELETE_FUNCTION_EVENT(ws, blockId);
        	Blockly.kbide.DELETE_CALL_FUNCTION_EVENT(ws, blockId);
        	break;
        case 'create':
            if (block.type === 'function') Blockly.kbide.CREATE_FUNCTION_EVENT(ws, block);
            else if (block.type === 'call_function') Blockly.kbide.CREATE_CALL_FUNCTION_EVENT(ws, block);
            break;
        case 'change':
        	if (block.type === 'function') Blockly.kbide.CHANGE_FUNCTION_EVENT(ws, block);
        	else if (block.type === 'call_function') Blockly.kbide.CHANGE_CALL_FUNCTION_EVENT(ws, block);
        	break;
        default:
        	break;
    }
}