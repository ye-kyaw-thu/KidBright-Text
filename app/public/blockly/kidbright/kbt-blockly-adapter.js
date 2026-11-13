/* KidBright Text -> existing KidBright Blockly workspace bridge.
 * Install this after the KidBright Blockly generators have been loaded.
 * This bridge does not replace or fork Blockly's C++ generators.
 */
(function (global) {
  'use strict';

  function requireBlockly() {
    if (!global.Blockly || !global.Blockly.Xml || !global.Blockly.JavaScript) {
      throw new Error('KidBright Blockly and JavaScript generators must be loaded first.');
    }
  }

  /* KidBright's original math_number FieldNumber has a 0.01 step and silently
   * rounds literals such as 3.14159 to 3.14. KBT uses its own Number-output
   * block with a text field so decimal precision survives Blockly XML import. */
  function installPreciseNumberBlock() {
    requireBlockly();
    var Blockly = global.Blockly;
    if (!Blockly.Blocks.kbt_number) {
      Blockly.Blocks.kbt_number = {
        init: function () {
          var validator = function (value) {
            var text = String(value == null ? '' : value).trim();
            return /^(?:-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|0[xX][0-9a-fA-F]+|0[bB][01]+)$/.test(text) ? text : null;
          };
          this.appendDummyInput().appendField(new Blockly.FieldTextInput('0', validator), 'VALUE');
          this.setOutput(true, 'Number');
          this.setPreviousStatement(false);
          this.setNextStatement(false);
          this.setColour((Blockly.Msg && Blockly.Msg.MATH_HUE) || 230);
          this.setTooltip('KBT numeric literal (keeps decimal precision).');
          this.setHelpUrl('');
        }
      };
    }
    Blockly.JavaScript.kbt_number = function (block) {
      var value = String(block.getFieldValue('VALUE') || '0').trim();
      if (!/^(?:-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|0[xX][0-9a-fA-F]+|0[bB][01]+)$/.test(value)) {
        throw new Error('Invalid KBT numeric literal in Blockly workspace: ' + value);
      }
      return ['(double)' + value, Blockly.JavaScript.ORDER_ATOMIC];
    };
  }

  function validateBlockTypes(dom) {
    var nodes = [];
    var blocks = dom.getElementsByTagName('block');
    var shadows = dom.getElementsByTagName('shadow');
    for (var i = 0; i < blocks.length; i++) nodes.push(blocks[i]);
    for (var j = 0; j < shadows.length; j++) nodes.push(shadows[j]);
    nodes.forEach(function (node) {
      var type = node.getAttribute('type');
      if (type && !global.Blockly.Blocks[type]) {
        throw new Error('Blockly block type "' + type + '" is not registered. Check that its KidBright plugin is installed and enabled, then restart the IDE.');
      }
    });
  }

  function refreshWorkspaceLayout(workspace, options) {
    options = options || {};
    workspace = resolveWorkspace(workspace);
    var blocks = workspace.getAllBlocks(false);
    // Force a fresh measurement of block labels, fields, and mutator shapes.
    blocks.forEach(function (block) {
      if (block && typeof block.render === 'function') block.render();
    });
    // The source Blockly's cleanup stacks all independent top-level programs.
    if (options.cleanUp !== false && typeof workspace.cleanUp === 'function') {
      workspace.cleanUp();
    }
    if (typeof global.Blockly.resizeSvgContents === 'function') {
      global.Blockly.resizeSvgContents(workspace);
    }
    if (typeof global.Blockly.svgResize === 'function') {
      global.Blockly.svgResize(workspace);
    }
    return { blocks: blocks.length, topBlocks: workspace.getTopBlocks(false).length };
  }

  function resolveWorkspace(workspace) {
    requireBlockly();
    var target = workspace || global.Blockly.mainWorkspace;
    if (!target) throw new Error('No Blockly workspace is available.');
    return target;
  }

  function parseXml(xmlText) {
    requireBlockly();
    if (typeof xmlText !== 'string' || !xmlText.trim()) {
      throw new Error('Blockly XML text is empty.');
    }
    var dom = global.Blockly.Xml.textToDom(xmlText);
    installPreciseNumberBlock();
    validateBlockTypes(dom);
    return dom;
  }

  function captureFunctionRegistry(kb) {
    if (!kb) return null;
    return {
      WORKSPACE: kb.WORKSPACE,
      FUNCTIONS_DETAIL: kb.FUNCTIONS_DETAIL,
      DROPDOWN_FUNCTION: kb.DROPDOWN_FUNCTION,
      LATEST_CHANGED_FUNCTION: kb.LATEST_CHANGED_FUNCTION
    };
  }

  function resetFunctionRegistry(workspace) {
    var kb = global.Blockly && global.Blockly.kbide;
    if (!kb) return;
    kb.WORKSPACE = workspace;
    kb.FUNCTIONS_DETAIL = [];
    kb.DROPDOWN_FUNCTION = [['', '']];
    kb.LATEST_CHANGED_FUNCTION = { name: undefined, newName: undefined, id: undefined };
  }

  function restoreFunctionRegistry(kb, snapshot) {
    if (!kb || !snapshot) return;
    kb.WORKSPACE = snapshot.WORKSPACE;
    kb.FUNCTIONS_DETAIL = snapshot.FUNCTIONS_DETAIL;
    kb.DROPDOWN_FUNCTION = snapshot.DROPDOWN_FUNCTION;
    kb.LATEST_CHANGED_FUNCTION = snapshot.LATEST_CHANGED_FUNCTION;
  }

  function readKbtFunctionMetadata(block) {
    if (!block || typeof block.data !== 'string' || !block.data) return null;
    try {
      var data = JSON.parse(block.data);
      if (data && data.kbt === 'function' && (data.kind === 'definition' || data.kind === 'call') &&
          typeof data.name === 'string') return data;
    } catch (ignore) { /* Non-KBT Blockly data belongs to the original IDE. */ }
    return null;
  }

  /* The original Blockly function block can rename a declaration when its
   * global function registry contains stale entries. KBT records the source
   * function identity in the supported Blockly <data> element. After import,
   * bind every call block to the actual NAME selected by the original block.
   */
  function refreshFunctionDropdowns(workspace) {
    var kb = global.Blockly.kbide;
    var all = workspace.getAllBlocks(false);
    var hasKbtFunctionBlocks = all.some(function (block) {
      return block.type === 'function' || block.type === 'call_function';
    });
    if (!kb || !kb.GET_DROPDOWN_FUNCTIONS) {
      if (hasKbtFunctionBlocks) {
        throw new Error('Original KidBright function support is not initialized. Check that blocks-function.js and its dropdown helpers are loaded.');
      }
      return 0;
    }

    var declarations = all.filter(function (block) { return block.type === 'function'; });
    var calls = all.filter(function (block) { return block.type === 'call_function'; });

    // Set the complete declaration registry BEFORE deriving dropdown options.
    kb.WORKSPACE = workspace;
    kb.FUNCTIONS_DETAIL = declarations.map(function (block) {
      return { name: block.getFieldValue('NAME'), id: block.id };
    });
    kb.LATEST_CHANGED_FUNCTION = { name: undefined, newName: undefined, id: undefined };
    var options = kb.GET_DROPDOWN_FUNCTIONS(workspace);
    kb.DROPDOWN_FUNCTION = options;

    var sourceToActual = Object.create(null);
    declarations.forEach(function (block) {
      var metadata = readKbtFunctionMetadata(block);
      if (!metadata) return;
      var actualName = block.getFieldValue('NAME') || '';
      if (!actualName) throw new Error('KBT function "' + metadata.name + '" has an empty Blockly definition name.');
      if (Object.prototype.hasOwnProperty.call(sourceToActual, metadata.name)) {
        throw new Error('Duplicate KBT function identity "' + metadata.name + '" in imported Blockly XML.');
      }
      sourceToActual[metadata.name] = actualName;
    });

    calls.forEach(function (block) {
      var oldValue = block.getFieldValue('NAME') || '';
      var metadata = readKbtFunctionMetadata(block);
      var desired = oldValue;
      if (metadata && metadata.kind === 'call') {
        if (!Object.prototype.hasOwnProperty.call(sourceToActual, metadata.name)) {
          throw new Error('KBT function call "' + metadata.name + '()" has no matching function definition in the imported workspace.');
        }
        desired = sourceToActual[metadata.name];
      }
      var valid = options.some(function (entry) { return entry[1] === desired; });
      if (metadata && !valid) {
        throw new Error('KBT function call "' + metadata.name + '()" could not be matched to Blockly function "' + desired + '".');
      }
      var input = block.getInput('CALL_INPUT');
      if (!input) throw new Error('KidBright call_function block is missing its CALL_INPUT field.');
      input.removeField('NAME');
      input.appendField(new global.Blockly.FieldDropdown(options), 'NAME');
      block.setFieldValue(valid ? desired : '', 'NAME');
      if (metadata && !block.getFieldValue('NAME')) {
        throw new Error('KidBright function dropdown rejected the name "' + desired + '".');
      }
    });
    return calls.length;
  }

  function loadXml(xmlText, options) {
    options = options || {};
    var workspace = resolveWorkspace(options.workspace);
    var dom = parseXml(xmlText);
    var kb = global.Blockly.kbide;
    var previousRegistry = captureFunctionRegistry(kb);
    var isMainWorkspace = workspace === global.Blockly.mainWorkspace;
    if (kb) resetFunctionRegistry(workspace);
    try {
      // Clear only after isolating the function registry from any old workspace.
      if (options.clear !== false) workspace.clear();
      if (kb) resetFunctionRegistry(workspace);
      var created = global.Blockly.Xml.domToWorkspace(dom, workspace);
      var refreshedCalls = refreshFunctionDropdowns(workspace);
      var layout = options.refreshLayout ? refreshWorkspaceLayout(workspace, options.layoutOptions) : null;
      return {
        workspace: workspace,
        created: Array.isArray(created) ? created.length : null,
        topBlocks: workspace.getTopBlocks(false).length,
        functionCallsRefreshed: refreshedCalls,
        layout: layout
      };
    } finally {
      if (kb) {
        if (isMainWorkspace) kb.WORKSPACE = workspace;
        else restoreFunctionRegistry(kb, previousRegistry);
      }
    }
  }

  function generateCpp(workspace) {
    installPreciseNumberBlock();
    workspace = resolveWorkspace(workspace);
    if (global.Blockly.kbide) global.Blockly.kbide.WORKSPACE = workspace;
    refreshFunctionDropdowns(workspace);
    if (typeof global.Blockly.JavaScript.resetTaskNumber === 'function') {
      global.Blockly.JavaScript.resetTaskNumber();
    }
    return global.Blockly.JavaScript.workspaceToCode(workspace);
  }

  function generateCppFromXml(xmlText) {
    requireBlockly();
    installPreciseNumberBlock();
    var workspace = new global.Blockly.Workspace();
    var kb = global.Blockly.kbide;
    var previousRegistry = captureFunctionRegistry(kb);
    if (kb) resetFunctionRegistry(workspace);
    try {
      global.Blockly.Xml.domToWorkspace(parseXml(xmlText), workspace);
      refreshFunctionDropdowns(workspace);
      return generateCpp(workspace);
    } finally {
      if (typeof workspace.dispose === 'function') workspace.dispose();
      restoreFunctionRegistry(kb, previousRegistry);
    }
  }

  /* Invoke the original KidBright Program Build workflow. In the audited IDE,
   * #btn-build performs serial-port discovery, board identity lookup, POST /build,
   * and then POST /program (esptool flashing). This is intentionally explicit:
   * calling this method may program the connected physical board.
   */
  function buildAndUploadWorkspace(workspace) {
    workspace = resolveWorkspace(workspace);
    var cpp = generateCpp(workspace);
    if (typeof cpp !== 'string' || !cpp.trim()) {
      throw new Error('The KidBright generator returned an empty C++ program.');
    }
    var button = global.document && global.document.getElementById('btn-build');
    if (!button) throw new Error('The original KidBright Program Build button (#btn-build) was not found.');
    if (button.disabled) {
      throw new Error('Program Build is disabled. Connect a supported KidBright board and wait until the IDE enables Program Build.');
    }
    button.click();
    return {
      triggered: true,
      topBlocks: workspace.getTopBlocks(false).length,
      cpp: cpp,
      action: 'Original KidBright Program Build workflow; this includes firmware build and board flashing.'
    };
  }

  function buildAndUploadXml(xmlText, options) {
    options = options || {};
    var loaded = loadXml(xmlText, options);
    var result = buildAndUploadWorkspace(loaded.workspace);
    result.import = {
      topBlocks: loaded.topBlocks,
      functionCallsRefreshed: loaded.functionCallsRefreshed
    };
    return result;
  }

  function importFile(file, options) {
    if (!file) return Promise.reject(new Error('Select a Blockly XML file first.'));
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read the selected XML file.')); };
      reader.onload = function () {
        try { resolve(loadXml(String(reader.result || ''), options)); }
        catch (err) { reject(err); }
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  global.KBTBlockly = {
    version: '0.5.1-alpha',
    loadXml: loadXml,
    importFile: importFile,
    generateCpp: generateCpp,
    generateCppFromXml: generateCppFromXml,
    buildAndUploadWorkspace: buildAndUploadWorkspace,
    buildAndUploadXml: buildAndUploadXml,
    refreshFunctionDropdowns: refreshFunctionDropdowns,
    refreshWorkspaceLayout: refreshWorkspaceLayout,
    installPreciseNumberBlock: installPreciseNumberBlock
  };
}(window));
