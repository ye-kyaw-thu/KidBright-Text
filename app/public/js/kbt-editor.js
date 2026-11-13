/* KidBright Text editor. Uses a native textarea for reliable editing and browser
 * clipboard/selection/undo behavior. Optional File System Access API is used
 * when available; older browsers fall back to file input + download.
 */
(function (global, $) {
  'use strict';
  if (!$) return;

  var state = {
    filename: 'untitled.kbt',
    fileHandle: null,
    currentExample: '',
    dirty: false,
    lastCpp: '',
    busy: false,
    allowLanguageReload: false,
    examples: [],
    pendingLanguageSwitchDraft: null
  };

  var starterSource = '# New KidBright Text program\n';
  var indentUnit = '    ';

  function el(id) { return global.document.getElementById(id); }
  function source() { return el('kbt-source').value; }
  function profile() { return el('kbt-profile').value || 'core'; }

  function setStatus(label, kind) {
    var node = el('kbt-status');
    node.textContent = label;
    node.className = 'kbt-status' + (kind ? ' ' + kind : '');
  }

  function output(text) {
    el('kbt-output').textContent = String(text == null ? '' : text);
  }

  function cppOutput(text) {
    el('kbt-cpp-output').textContent = String(text || 'No C++ generated yet.');
  }

  function updateFilename() {
    el('kbt-filename').textContent = state.filename;
    if (el('kbt-dirty')) {
      el('kbt-dirty').textContent = state.dirty ? '● Unsaved changes' : 'Saved';
      el('kbt-dirty').className = state.dirty ? 'kbt-dirty is-dirty' : 'kbt-dirty';
    }
  }

  function markDirty(value) {
    state.dirty = !!value;
    updateFilename();
  }

  function setBusy(value, label) {
    state.busy = !!value;
    ['kbt-check', 'kbt-to-blocks', 'kbt-preview-cpp', 'kbt-build-upload'].forEach(function (id) {
      var node = el(id);
      if (node) node.disabled = state.busy;
    });
    /* Deliberately do not disable the source textarea. The user can continue
       editing while a request runs; compilation uses the click-time snapshot. */
    if (label) setStatus(label, value ? 'busy' : '');
  }

  function updateCursor() {
    var ta = el('kbt-source');
    var value = ta.value;
    var pos = ta.selectionStart || 0;
    var before = value.slice(0, pos).split('\n');
    el('kbt-cursor').textContent = 'Line ' + before.length + ', column ' + (before[before.length - 1].length + 1);
  }

  function syncEditor() {
    updateCursor();
  }

  function requestCompile(action, sourceSnapshot) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: '/kbt/compile',
        method: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
          action: action,
          profile: profile(),
          source: sourceSnapshot === undefined ? source() : sourceSnapshot
        })
      }).done(function (reply) {
        if (!reply || reply.ok !== true) {
          reject(new Error((reply && reply.error) || 'KBT compiler returned an invalid response.'));
          return;
        }
        resolve(reply);
      }).fail(function (xhr) {
        var data = xhr && xhr.responseJSON;
        var detail = data && (data.error || data.stderr || data.stdout);
        if (!detail && xhr && xhr.status === 0) {
          detail = 'Cannot reach the local KBT compiler service. Restart KidBright IDE and check the integration.';
        }
        reject(new Error(detail || ('KBT compiler request failed (HTTP ' + (xhr ? xhr.status : 'unknown') + ').')));
      });
    });
  }

  function waitForLayoutFrames(count) {
    count = count || 2;
    return new Promise(function (resolve) {
      var raf = global.requestAnimationFrame || function (callback) { global.setTimeout(callback, 16); };
      function tick() {
        count -= 1;
        if (count <= 0) resolve(); else raf(tick);
      }
      raf(tick);
    });
  }

  function sizeVisibleBlocklyWorkspace() {
    var blocklyDiv = el('blockly');
    if (!blocklyDiv || !blocklyDiv.parentNode) return;
    var parent = blocklyDiv.parentNode;
    var width = parent.clientWidth || parent.offsetWidth || 0;
    var height = parent.clientHeight || parent.offsetHeight || 0;
    if (width > 2) blocklyDiv.style.width = (width - 2) + 'px';
    if (height > 2) blocklyDiv.style.height = (height - 2) + 'px';
    if (global.Blockly && global.Blockly.mainWorkspace && typeof global.Blockly.svgResize === 'function') {
      global.Blockly.svgResize(global.Blockly.mainWorkspace);
    }
  }

  function showVisualMode() {
    /* Important: make Blockly visible BEFORE importing KBT XML. The legacy
       Blockly renderer measures fields while importing; importing into a
       display:none table gives blocks zero/stale dimensions until dragged. */
    $('#kbt-text-panel').hide();
    $('#kbt-language-picker').show();
    $('#blockly').closest('table').show();
    $('#kbt-mode-text').removeClass('active');
    $('#kbt-mode-visual').addClass('active');
    $('#btn-new, #btn-open, #btn-save, #btn-build').closest('li').show();
    sizeVisibleBlocklyWorkspace();
    return waitForLayoutFrames(2).then(function () {
      sizeVisibleBlocklyWorkspace();
    });
  }

  function refreshImportedBlocklyWorkspace() {
    var workspace = global.Blockly && global.Blockly.mainWorkspace;
    if (!workspace) return null;
    if (global.KBTBlockly && typeof global.KBTBlockly.refreshWorkspaceLayout === 'function') {
      return global.KBTBlockly.refreshWorkspaceLayout(workspace, { cleanUp: true });
    }
    if (global.Blockly.svgResize) global.Blockly.svgResize(workspace);
    if (global.Blockly.resizeSvgContents) global.Blockly.resizeSvgContents(workspace);
    return { topBlocks: workspace.getTopBlocks(false).length };
  }

  function showTextMode() {
    $('#blockly').closest('table').hide();
    $('#kbt-language-picker').hide();
    $('#kbt-text-panel').show();
    $('#kbt-mode-visual').removeClass('active');
    $('#kbt-mode-text').addClass('active');
    $('#btn-new, #btn-open, #btn-save, #btn-build').closest('li').hide();
    el('kbt-source').focus();
    syncEditor();
  }

  function loadGeneratedXml(xml, options) {
    options = options || {};
    if (!global.KBTBlockly) throw new Error('KBT Blockly adapter is not loaded.');
    var ws = global.Blockly && global.Blockly.mainWorkspace;
    if (!ws) throw new Error('The KidBright Blockly workspace is not ready.');
    var topBlocks = ws.getTopBlocks(false);
    if (topBlocks.length > 0 && !options.confirmed) {
      if (!global.confirm('The Visual Programming workspace contains a program. Replace it with the KBT program?')) {
        throw new Error('Import cancelled. Your Visual Programming workspace was not changed.');
      }
    }
    try {
      var backup = global.Blockly.Xml.domToText(global.Blockly.Xml.workspaceToDom(ws));
      global.sessionStorage.setItem('KBTVisualWorkspaceBackup', backup);
    } catch (ignore) { /* workspace backup is best effort */ }
    var result = global.KBTBlockly.loadXml(xml, { clear: true, workspace: ws });
    state.xml = xml;
    return result;
  }

  function checkSource() {
    if (state.busy) return;
    var snapshot = source();
    setBusy(true, 'Checking');
    output('Checking KBT source snapshot...');
    requestCompile('check', snapshot).then(function (reply) {
      setStatus('Valid KBT', 'ok');
      output((reply.stdout || 'KBT source is valid.') + (snapshot !== source() ? '\nNote: the editor has changed since this check started.' : ''));
    }).catch(function (error) {
      setStatus('Check failed', 'error');
      output(error.message);
    }).then(function () { setBusy(false); });
  }

  function translateToBlocks() {
    if (state.busy) return;
    var snapshot = source();
    setBusy(true, 'Translating');
    output('Translating KBT source snapshot into a Blockly workspace...');
    requestCompile('blockly', snapshot).then(function (reply) {
      return showVisualMode().then(function () {
        var imported = loadGeneratedXml(reply.xml);
        return waitForLayoutFrames(2).then(function () {
          var layout = refreshImportedBlocklyWorkspace();
          return { imported: imported, layout: layout };
        });
      });
    }).then(function (result) {
      var imported = result.imported;
      cppOutput('Workspace imported. Use Preview C++ to inspect generated code.');
      output('Blockly workspace generated and imported.\nTop-level blocks: ' + imported.topBlocks +
        '\nFunction dropdowns refreshed: ' + imported.functionCallsRefreshed +
        '\nWorkspace rendered and arranged: ' + (result.layout ? 'yes' : 'no') +
        (snapshot !== source() ? '\nNote: the editor has changed since this translation started.' : ''));
      setStatus('Blocks imported', 'ok');
    }).catch(function (error) {
      setStatus('Translation failed', 'error');
      output(error.message);
    }).then(function () { setBusy(false); });
  }

  function previewCpp() {
    if (state.busy) return;
    var snapshot = source();
    setBusy(true, 'Generating C++');
    output('Generating Blockly XML and invoking the original KidBright C++ generators...');
    requestCompile('blockly', snapshot).then(function (reply) {
      if (!global.KBTBlockly || typeof global.KBTBlockly.generateCppFromXml !== 'function') {
        throw new Error('KBTBlockly.generateCppFromXml is unavailable. Check the bridge installation.');
      }
      var cpp = global.KBTBlockly.generateCppFromXml(reply.xml);
      if (typeof cpp !== 'string' || !cpp.trim()) throw new Error('The original KidBright generator returned empty C++ code.');
      state.xml = reply.xml;
      state.lastCpp = cpp;
      cppOutput(cpp);
      setStatus('C++ generated', 'ok');
      output('C++ preview generated by the original KidBright Blockly JavaScript generators.\nNo firmware was built and no board was flashed.' +
        (snapshot !== source() ? '\nNote: the editor has changed since this preview started.' : ''));
    }).catch(function (error) {
      setStatus('C++ preview failed', 'error');
      output(error.message);
    }).then(function () { setBusy(false); });
  }

  function buildUpload() {
    if (state.busy) return;
    if (!global.confirm('Build and upload this KBT program using the original KidBright workflow?\n\nThis replaces the Visual Programming workspace and may flash the connected KidBright board.')) return;
    var snapshot = source();
    setBusy(true, 'Preparing upload');
    output('Validating and translating the selected KBT source before the original Build & Upload workflow...');
    requestCompile('blockly', snapshot).then(function (reply) {
      return showVisualMode().then(function () {
        var imported = loadGeneratedXml(reply.xml, { confirmed: true });
        return waitForLayoutFrames(2).then(function () {
          refreshImportedBlocklyWorkspace();
          if (!global.KBTBlockly || typeof global.KBTBlockly.buildAndUploadWorkspace !== 'function') {
            throw new Error('KBT Blockly build/upload bridge is unavailable.');
          }
          return global.KBTBlockly.buildAndUploadWorkspace(imported.workspace);
        });
      }).then(function (result) {
        state.xml = reply.xml;
        state.lastCpp = result.cpp || '';
        cppOutput(state.lastCpp);
        setStatus('Build started', 'busy');
        output('The original KidBright Program Build workflow has been triggered. Follow its build and upload dialog for serial-port, board-identification, compilation and flashing results.');
      });
    }).catch(function (error) {
      setStatus('Build not started', 'error');
      output(error.message);
    }).then(function () { setBusy(false); });
  }

  function normalizeFilename(name) {
    name = String(name || 'untitled.kbt').replace(/\\/g, '/').split('/').pop();
    name = name.replace(/[<>:"|?*\x00-\x1f]/g, '_').replace(/^\.+$/, 'untitled').trim();
    if (!name) name = 'untitled';
    if (!/\.kbt$/i.test(name)) name += '.kbt';
    return name;
  }

  function downloadSource(name) {
    var filename = normalizeFilename(name || state.filename);
    var blob = new Blob([source()], { type: 'text/plain;charset=utf-8' });
    var url = global.URL.createObjectURL(blob);
    var link = global.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    global.document.body.appendChild(link);
    link.click();
    global.document.body.removeChild(link);
    global.setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
    state.filename = filename;
    markDirty(false);
    setStatus('Downloaded', 'ok');
    output('Downloaded ' + filename + '. Your browser may ask where to save it.');
  }

  function saveCurrent() {
    /* A bundled example or new document has no writable handle yet. Route its
       first Save through Save As instead of silently downloading another copy. */
    if (!state.fileHandle || typeof state.fileHandle.createWritable !== 'function') {
      return saveAs();
    }
    return state.fileHandle.createWritable().then(function (writable) {
      return writable.write(source()).then(function () { return writable.close(); });
    }).then(function () {
      markDirty(false);
      setStatus('Saved', 'ok');
      output('Saved changes to ' + state.filename + '.');
    }).catch(function (error) {
      setStatus('Save failed', 'error');
      output('Could not save the file in place: ' + error.message + '\nUse Save As to download a copy.');
    });
  }

  function saveAs() {
    if (typeof global.showSaveFilePicker === 'function') {
      return global.showSaveFilePicker({
        suggestedName: state.filename || 'untitled.kbt',
        types: [{ description: 'KidBright Text source', accept: { 'text/plain': ['.kbt'] } }]
      }).then(function (handle) {
        state.fileHandle = handle;
        state.filename = normalizeFilename(handle.name || state.filename);
        updateFilename();
        return saveCurrent();
      }).catch(function (error) {
        if (error && error.name !== 'AbortError') {
          setStatus('Save As unavailable', 'error');
          output(error.message || 'Save As was not available in this browser.');
        }
      });
    }
    var chosen = global.prompt('Save KBT file as:', state.filename || 'untitled.kbt');
    if (chosen === null) return;
    state.fileHandle = null;
    state.filename = normalizeFilename(chosen);
    downloadSource(state.filename);
  }

  function confirmDiscard() {
    return !state.dirty || global.confirm('This KBT document has unsaved changes. Discard them?');
  }

  function newDocument() {
    if (!confirmDiscard()) return;
    state.filename = 'untitled.kbt';
    state.fileHandle = null;
    state.currentExample = '';
    el('kbt-example').value = '';
    el('kbt-profile').value = 'core';
    el('kbt-source').value = starterSource;
    state.lastCpp = '';
    cppOutput('No C++ generated yet.');
    markDirty(false);
    setStatus('New document', 'ok');
    output('Created a new untitled KBT document. Edit the source and use Save or Save As.');
    /* A global shortcut can be invoked while the visual workspace has focus.
       Switch to the text editor so the newly created document is immediately visible. */
    showTextMode();
  }

  function acceptOpenedFile(file, handle) {
    if (!file) return;
    if (!/\.kbt$/i.test(file.name)) {
      setStatus('Invalid file', 'error');
      output('Please select a .kbt file.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      state.filename = normalizeFilename(file.name);
      state.fileHandle = handle || null;
      state.currentExample = '';
      el('kbt-example').value = '';
      el('kbt-source').value = String(reader.result || '');
      state.lastCpp = '';
      cppOutput('No C++ generated yet.');
      markDirty(false);
      setStatus('File opened', 'ok');
      output('Opened ' + state.filename + '. You can now edit it. Click Check to validate.');
      el('kbt-source').focus();
      syncEditor();
    };
    reader.onerror = function () {
      setStatus('Open failed', 'error');
      output('Could not read the selected .kbt file.');
    };
    reader.readAsText(file, 'UTF-8');
  }

  function openDocument() {
    if (typeof global.showOpenFilePicker === 'function') {
      if (!confirmDiscard()) return;
      global.showOpenFilePicker({
        multiple: false,
        types: [{ description: 'KidBright Text source', accept: { 'text/plain': ['.kbt'] } }]
      }).then(function (handles) {
        if (!handles || !handles.length) return;
        state.fileHandle = handles[0];
        return handles[0].getFile().then(function (file) { acceptOpenedFile(file, handles[0]); });
      }).catch(function (error) {
        if (error && error.name !== 'AbortError') {
          setStatus('Open failed', 'error');
          output(error.message || 'Could not open the selected KBT file.');
        }
      });
      return;
    }
    el('kbt-open-file').click();
  }

  function loadExamples() {
    $.getJSON('/kbt/examples').done(function (reply) {
      try {
        if (!reply || !reply.ok) throw new Error('KBT examples endpoint returned an invalid response.');
        state.examples = reply.examples || [];
        state.examples.forEach(function (item) {
          var option = global.document.createElement('option');
          option.value = item.id;
          option.textContent = '[' + item.profile + '] ' + item.name;
          el('kbt-example').appendChild(option);
        });
        // A language switch reloads the page. Restore the previous editor
        // document only AFTER the example list exists, and do not load the
        // default Hello World example over the restored source.
        if (state.pendingLanguageSwitchDraft) {
          var previousExample = state.pendingLanguageSwitchDraft.currentExample || '';
          var exampleExists = state.examples.some(function (item) { return item.id === previousExample; });
          el('kbt-example').value = exampleExists ? previousExample : '';
          try { global.localStorage.removeItem('KBTLanguageSwitchDraft'); }
          catch (ignoreDraftRemove) { /* restored text remains usable */ }
          state.pendingLanguageSwitchDraft = null;
          output('Restored the previous KBT document after changing Blockly language.');
        } else {
          var defaultExample = 'core/01_hello_world.kbt';
          el('kbt-example').value = defaultExample;
          loadExample(defaultExample, true);
        }
      } catch (error) {
        setStatus('Examples unavailable', 'error');
        output(error.message);
      }
    }).fail(function () {
      setStatus('Examples unavailable', 'error');
      output('Could not load bundled examples. Check the KBT installation and restart the IDE.');
    });
  }

  function loadExample(id, initialLoad) {
    if (!id) return;
    if (!initialLoad && !confirmDiscard()) {
      el('kbt-example').value = state.currentExample;
      return;
    }
    $.ajax({
      url: '/kbt/example',
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({ id: id })
    }).done(function (reply) {
      if (!reply || !reply.ok) {
        setStatus('Example load failed', 'error');
        output('Invalid example response.');
        el('kbt-example').value = state.currentExample;
        return;
      }
      if (state.dirty && !confirmDiscard()) {
        el('kbt-example').value = state.currentExample;
        return;
      }
      state.filename = id.split('/').pop();
      state.fileHandle = null;
      state.currentExample = id;
      el('kbt-filename').textContent = state.filename;
      el('kbt-source').value = reply.source || '';
      el('kbt-profile').value = id.split('/')[0];
      state.lastCpp = '';
      cppOutput('No C++ generated yet.');
      markDirty(false);
      setStatus('Example loaded', 'ok');
      output('Loaded the bundled example into the editable editor. You can change it and use Save or Save As to create your own .kbt file.');
      syncEditor();
    }).fail(function (xhr) {
      setStatus('Example load failed', 'error');
      output((xhr.responseJSON && xhr.responseJSON.error) || 'Could not load selected example.');
      el('kbt-example').value = state.currentExample;
    });
  }

  function indentSelection(textarea, outdent) {
    var value = textarea.value;
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;

    if (start === end && !outdent) {
      textarea.setRangeText(indentUnit, start, end, 'end');
      markDirty(true);
      syncEditor();
      return;
    }

    var firstLineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    var endProbe = end > start ? end - 1 : end;
    var lastLineStart = value.lastIndexOf('\n', Math.max(0, endProbe - 1)) + 1;
    var lastLineEnd = value.indexOf('\n', lastLineStart);
    if (lastLineEnd < 0) lastLineEnd = value.length;
    var original = value.slice(firstLineStart, lastLineEnd);
    var lines = original.split('\n');
    var removedBeforeStart = 0;
    var removedInSelection = 0;
    var transformed = lines.map(function (line, index) {
      if (!outdent) return indentUnit + line;
      var match = line.match(/^(?: {1,4}|\t)/);
      var removeCount = match ? match[0].length : 0;
      if (index === 0 && start > firstLineStart) {
        removedBeforeStart = Math.min(removeCount, start - firstLineStart);
      }
      removedInSelection += removeCount;
      return line.slice(removeCount);
    }).join('\n');

    textarea.setRangeText(transformed, firstLineStart, lastLineEnd, 'select');
    if (outdent) {
      var newStart = Math.max(firstLineStart, start - removedBeforeStart);
      var newEnd = Math.max(newStart, end - removedInSelection);
      textarea.setSelectionRange(newStart, newEnd);
    } else {
      textarea.setSelectionRange(start + indentUnit.length, end + lines.length * indentUnit.length);
    }
    markDirty(true);
    syncEditor();
  }

  function handleGlobalKeydown(event) {
    if (!event) return;
    var key = String(event.key || '').toLowerCase();
    var command = event.ctrlKey || event.metaKey;

    /* Register at document capture phase so this works from the text editor,
       Blockly workspace, toolbar, dropdowns and other IDE controls. Blockly's
       own keyboard handler may stop bubbling events, so capture is important. */
    if (event.defaultPrevented || event.repeat || !command ||
        !event.altKey || event.shiftKey || key !== 'n') return;
    event.preventDefault();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    } else if (typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    newDocument();
  }

  function handleEditorKeydown(event) {
    var ta = this;
    var key = String(event.key || '').toLowerCase();
    var command = event.ctrlKey || event.metaKey;

    if (command && key === 's') {
      event.preventDefault();
      if (event.shiftKey) saveAs(); else saveCurrent();
      return;
    }
    /* Ctrl+Alt+N is handled globally in document capture phase. */
    if (command && key === 'o') {
      event.preventDefault();
      openDocument();
      return;
    }
    if (command && key === 'enter') {
      event.preventDefault();
      checkSource();
      return;
    }
    /* Ctrl+A/C/V/X/Z/Y are intentionally left to the browser's native textarea
       implementation: selection, copy, paste, cut, undo and redo work natively. */
    if (key === 'tab') {
      event.preventDefault();
      indentSelection(ta, event.shiftKey);
      return;
    }
    if (key === 'enter') {
      var start = ta.selectionStart;
      var end = ta.selectionEnd;
      var lineStart = ta.value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
      var before = ta.value.slice(lineStart, start);
      var indent = (before.match(/^[ \t]*/) || [''])[0];
      var trimmed = before.replace(/[ \t]+$/, '');
      if (/:[ \t]*$/.test(trimmed)) indent += indentUnit;
      event.preventDefault();
      ta.setRangeText('\n' + indent, start, end, 'end');
      markDirty(true);
      syncEditor();
    }
  }

  function prepareForLanguageSwitch() {
    try {
      var draft = {
        source: source(),
        filename: state.filename,
        currentExample: state.currentExample,
        profile: profile(),
        dirty: state.dirty
      };
      global.localStorage.setItem('KBTLanguageSwitchDraft', JSON.stringify(draft));
      state.allowLanguageReload = true;
      return true;
    } catch (error) {
      if (global.console && global.console.warn) {
        global.console.warn('Could not preserve the KBT text draft before changing language:', error);
      }
      return false;
    }
  }

  function restoreLanguageSwitchDraft() {
    var raw;
    try { raw = global.localStorage.getItem('KBTLanguageSwitchDraft'); }
    catch (ignore) { return false; }
    if (!raw) return false;
    try {
      var draft = JSON.parse(raw);
      if (!draft || typeof draft.source !== 'string') {
        if (global.console && global.console.warn) global.console.warn('KBT language-switch draft is invalid; original storage entry retained.');
        return false;
      }
      el('kbt-source').value = draft.source;
      if (draft.profile && el('kbt-profile')) el('kbt-profile').value = draft.profile;
      state.filename = draft.filename || 'untitled.kbt';
      state.currentExample = draft.currentExample || '';
      state.pendingLanguageSwitchDraft = draft;
      markDirty(!!draft.dirty);
      setStatus(draft.dirty ? 'Unsaved draft restored after language change' : 'Document restored after language change', 'ok');
      // Keep the stored snapshot until the example list is populated and its
      // selection can be restored. This prevents async loadExamples() from
      // overwriting a restored document with Hello World.
      return true;
    } catch (error) {
      if (global.console && global.console.warn) {
        global.console.warn('Could not restore the KBT text draft after changing language; snapshot retained:', error);
      }
      return false;
    }
  }

  // Expose only the intentional language-switch preparation hook to the IDE shell.
  global.KBTEditor = global.KBTEditor || {};
  global.KBTEditor.prepareForLanguageSwitch = prepareForLanguageSwitch;

  function init() {
    if (!el('kbt-source')) return;
    el('kbt-source').value = starterSource;
    if (!restoreLanguageSwitchDraft()) markDirty(false);
    syncEditor();

    $('#kbt-mode-visual').on('click', showVisualMode);
    $('#kbt-mode-text').on('click', showTextMode);
    $('#kbt-new').on('click', newDocument);
    $('#kbt-open').on('click', openDocument);
    $('#kbt-save').on('click', saveCurrent);
    $('#kbt-save-as').on('click', saveAs);
    $('#kbt-check').on('click', checkSource);
    $('#kbt-to-blocks').on('click', translateToBlocks);
    $('#kbt-preview-cpp').on('click', previewCpp);
    $('#kbt-build-upload').on('click', buildUpload);
    $('#kbt-open-file').on('change', function () {
      if (!this.files || !this.files[0]) return;
      if (!confirmDiscard()) { this.value = ''; return; }
      acceptOpenedFile(this.files[0], null);
      this.value = '';
    });
    $('#kbt-example').on('change', function () { loadExample(this.value, false); });
    $('#kbt-source').on('input', function () { markDirty(true); syncEditor(); });
    $('#kbt-source').on('scroll click keyup select', syncEditor);
    $('#kbt-source').on('keydown', handleEditorKeydown);
    /* The page-level capture listener also catches shortcuts when focus is in
       Blockly or a toolbar control rather than the KBT textarea. */
    if (global.document && typeof global.document.addEventListener === 'function') {
      global.document.addEventListener('keydown', handleGlobalKeydown, true);
    }

    global.addEventListener('beforeunload', function (event) {
      if (!state.dirty || state.allowLanguageReload) return;
      event.preventDefault();
      event.returnValue = 'This KBT document has unsaved changes.';
      return event.returnValue;
    });

    $.getJSON('/kbt/status').done(function (reply) {
      if (reply && reply.ok) setStatus('Compiler ready', 'ok');
      else setStatus('Compiler unavailable', 'error');
    }).fail(function () { setStatus('Compiler unavailable', 'error'); });
    loadExamples();
  }

  $(init);
}(window, window.jQuery));
