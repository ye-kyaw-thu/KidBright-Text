Blockly.kbide = {};

 /**
  * Blockly.kbide['FUNCTIONS_DETAIL']
  * type           array that collect json data
  * name:           function name
  * blockId:        block function id
  */
Blockly.kbide['FUNCTIONS_DETAIL'] = [];
Blockly.kbide['DROPDOWN_FUNCTION'] = [['', '']];
Blockly.kbide['LATEST_CHANGED_FUNCTION'] = {name: undefined, newName: undefined, id: undefined};

Blockly.Blocks['function'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Msg.FUNCTION_TITLE)
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
            .appendField(Blockly.Msg.CALL_FUNCTION_TITLE)
            .appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), "NAME")
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(advance_colour);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setDropDown();
    },
    setDropDown: function(){
        var dropdown_list = Blockly.kbide.GET_DROPDOWN_FUNCTIONS(Blockly.kbide['WORKSPACE']);
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

Blockly.kbide['GET_VALUE_ARRAY'] = function(array, key, value) {
    return array.filter(function (object) {
        return object[key] === value;
    });
};

Blockly.kbide['GEN_FUNCTION_NAME'] = function(value){ // generate unique function name
    var num = 0;
    var base_name = value;
    var names = Blockly.kbide.GET_VALUE_ARRAY(
            Blockly.kbide['FUNCTIONS_DETAIL'], 'name', value
        );

    while(names.length !== 0){
        names = Blockly.kbide.GET_VALUE_ARRAY(
            Blockly.kbide['FUNCTIONS_DETAIL'], 'name', value
        );
        if(names.length === 0){ // not found duplicate name.
            if(num !== 0) {
                base_name = base_name + num.toString();
                break;
            }
            break;
        }
        num++;
        value = base_name + num.toString();
    }
    
    return base_name;
}

Blockly.kbide['GET_DROPDOWN_FUNCTIONS'] = function(workspace, extend_value = undefined){
    // scan workspace to collect all function name
    var result = [];

    var func_list = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'function');
    for(i in func_list){
        result.push(func_list[i].getFieldValue('NAME'));
    }
    if(extend_value !== undefined) result.push(extend_value);

    result = [...new Set(result)];
    var dropdown = [['', '']];
    for(i in result){
        dropdown.push([result[i], result[i]]);
    }

    return dropdown;
}

Blockly.kbide['CREATE_FUNCTION_EVENT'] = function(workspace, block){
    // console.log('CREATE_FUNCTION_EVENT');
    var block_name = block.getFieldValue('NAME')
    // check name is not duplicate then get unique name
    var name = Blockly.kbide.GEN_FUNCTION_NAME(block_name);

    block.setFieldValue(name, 'NAME');
    Blockly.kbide['FUNCTIONS_DETAIL'].push({name: name, id: block.id});

    // update dropdown list in workspace
    var new_dropdown = Blockly.kbide['DROPDOWN_FUNCTION'].filter(function(item){
        return item[0] === name;
    })
    if(new_dropdown.length === 0) Blockly.kbide['DROPDOWN_FUNCTION'].push([name, name]);

    var call_blocks = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'call_function');
    for(i in call_blocks){
        var block_input = call_blocks[i].getInput('CALL_INPUT');
        var block_value = call_blocks[i].getFieldValue('NAME');

        // remove old selector field then create new selector field with updated dropdown list.
        block_input.removeField('NAME');
        block_input.appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), 'NAME');
        call_blocks[i].setFieldValue(block_value, 'NAME');
    }		
}

Blockly.kbide['CHANGE_FUNCTION_EVENT'] = function(workspace, block){
    // console.log('CHANGE_FUNCTION_EVENT');
    // check name is not duplicate
    var func_detail = Blockly.kbide['FUNCTIONS_DETAIL'];
    var changed_block = Blockly.kbide.GET_VALUE_ARRAY(func_detail, 'id', block.id);
    Blockly.kbide.LATEST_CHANGED_FUNCTION = {
        name: changed_block[0].name, 
        newName: block.getFieldValue('NAME'), 
        id: block.id
    }
}
Blockly.kbide['DELETE_FUNCTION_EVENT'] = function(workspace, blockId){
    // console.log('DELETE_FUNCTION_EVENT ', blockId);
    var func_detail = Blockly.kbide['FUNCTIONS_DETAIL'];
    var del_block = Blockly.kbide.GET_VALUE_ARRAY(func_detail, 'id', blockId);
    if(del_block.length > 0){ // get deleted block id
        // update unused call function workspace to select null value.
        var call_func = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'call_function');
        for(i in call_func){
            var call_func_block = call_func[i];
            var block_value = call_func_block.getFieldValue('NAME');

            // delete deleted function name in dropdown list
            Blockly.kbide['DROPDOWN_FUNCTION'] = Blockly.kbide['DROPDOWN_FUNCTION'].filter(
                function(item){
                    return item[0] !== del_block[0].name
                }
            )

            try {
                // update dropdown list by delete old field then create new field with updated dropdown list.
                var block_input = call_func_block.getInput('CALL_INPUT');
                block_input.removeField('NAME');
                block_input.appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), 'NAME');
                
                // let call_function that select deleted function block to select null value.
                if(del_block[0].name === block_value) call_func_block.setFieldValue('', 'NAME');
                else call_func_block.setFieldValue(block_value, 'NAME'); // keep call_function select old value.
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

Blockly.kbide['CHECK_FUNCTION_NAME'] = function(workspace){
    // console.log('CHECK_FUNCTION_NAME');
    var latest_changed =  Blockly.kbide.LATEST_CHANGED_FUNCTION;

    // lastest_changed is a parameter to define that function name is changed.
    if(latest_changed.name !== latest_changed.newName){
        // do check function name. if find duplicated name then rename last updated function.
        var func_detail = Blockly.kbide.FUNCTIONS_DETAIL;
        var name = Blockly.kbide.GEN_FUNCTION_NAME(latest_changed.newName); // get unique function name
        var func = Blockly.kbide.GET_VALUE_ARRAY(func_detail, 'name', latest_changed.name);

        var call_func = Blockly.kbide.GET_BLOCKS_BY_TYPE(workspace, 'call_function');
        for(i in call_func){ // update dropdown list that select changed function
            var call_func_block = call_func[i];
            // remove old function name in dropdown list
            Blockly.kbide['DROPDOWN_FUNCTION'] = Blockly.kbide['DROPDOWN_FUNCTION'].filter(
                function(item){
                    return item[0] !== latest_changed.name
                }
            )
       
            // add new function name to dropdown list
            Blockly.kbide['DROPDOWN_FUNCTION'] = Blockly.kbide.GET_DROPDOWN_FUNCTIONS(Blockly.kbide['WORKSPACE'], name);
            var old_value = call_func_block.getFieldValue('NAME')

            // update dropdown function selector by remove old field then create new field with updated dropdown function.
            var block_input = call_func_block.getInput('CALL_INPUT');
            block_input.removeField('NAME');
            block_input.appendField(new Blockly.FieldDropdown(Blockly.kbide['DROPDOWN_FUNCTION']), 'NAME');
            
             // update call_function block that select renamed function.
            if(old_value === latest_changed.name) call_func_block.setFieldValue(name, 'NAME');
            else call_func_block.setFieldValue(old_value, 'NAME'); // keep select old value in call_function block.
        }

        var block = workspace.getBlockById(latest_changed.id);
        block.setFieldValue(name, 'NAME'); // update new name to function block
        if(func.length !== 0){
            func[0].name = name; // update function name in function detail
        }

        // reset lastest changed function value
        Blockly.kbide.LATEST_CHANGED_FUNCTION = {name: undefined, newName: undefined, id: undefined};
    }
}

const handle_function = function(primaryEvent) {
    // Convert event to JSON.  This could then be transmitted across the net.
    var json = primaryEvent.toJson();
    // console.log(json);

    var ws = Blockly.kbide['WORKSPACE'];
    var blockId = json.blockId
    var block = ws.getBlockById(json.blockId);
    switch(json.type){
        case 'delete':
        	Blockly.kbide.DELETE_FUNCTION_EVENT(ws, blockId);
        	break;
        case 'create':
            if (block.type === 'function') Blockly.kbide.CREATE_FUNCTION_EVENT(ws, block);
            break;
        case 'change':
        	if (block.type === 'function') Blockly.kbide.CHANGE_FUNCTION_EVENT(ws, block);
            break;
        case 'ui':
            Blockly.kbide.CHECK_FUNCTION_NAME(ws);
        default:
        	break;
    }
}