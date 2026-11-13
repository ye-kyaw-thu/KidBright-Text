/*
 * KBT-MODIFICATION-NOTICE: Modified by Ye Kyaw Thu for KidBright Text v0.4.0 on 2026-11-13. Original upstream notices are retained.
 * This file adapts upstream KidBright IDE code.
 * Original upstream copyright and attribution notices are retained.
 */
function getCookie(c_name) {
	if (document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + '=');
		if (c_start != -1) {
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(';', c_start);
			if (c_end == -1) {
				c_end = document.cookie.length;
			}
			return unescape(document.cookie.substring(c_start, c_end));
		}
	}

	return null;
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function renderToolbox(res) {
	// construct the toolbox XML.
	var toolboxText = document.getElementById('toolbox').outerHTML;
	var toolboxXml = Blockly.Xml.textToDom(toolboxText);

//	console.log(res);

	// check plug-ins category
	if (res.categories.length > 0) {
		var plugin_str = 'Plugins';
		if (getCookie('lang') == 'th') {
			plugin_str = 'ปลั๊กอิน';
		}

		// create sperator node
		var sep_node = $(document.createElement('sep'));
		// create plugins xml node
		var plugin_node = $(document.createElement('category')).attr({
			name: plugin_str,
			colour: '290'
		});

		// add category nodes
		for (var i = 0; i < res.categories.length; i++) {
			if (res.categories[i].category != null) {
				var cat_name = res.categories[i].category.name.en;
				if (getCookie('lang') == 'th') {
					cat_name = res.categories[i].category.name.th;
				}

				var category_node = $(document.createElement('category')).attr({
					name: cat_name,
					colour: res.categories[i].category.color
				});
				// add block nodes
				for (var j = 0; j < res.categories[i].plugins.length; j++) {
					var driver = res.categories[i].plugins[j];
					for (var k = 0; k < driver.blocks.length; k++) {
						// check if plugin has defined custom xmlToolbox
						if (typeof(Blockly.Blocks[driver.blocks[k]].xmlToolbox) != 'undefined') {
							// check if not a hidden one
							if (Blockly.Blocks[driver.blocks[k]].xmlToolbox != null) {
								$(category_node).append(Blockly.Blocks[driver.blocks[k]].xmlToolbox());
							}
						}
						else {
							$(category_node).append($(document.createElement('block')).attr({
								type: driver.blocks[k]
							}));
						}
					}
				}
				$(plugin_node).append(category_node);
			}
			else {
				console.error('plugins error: file ' + res.categories[i].directory + '.json not found!');
			}
		}

		// append plug-ins xml node
		$(toolboxXml).append(sep_node);
		$(toolboxXml).append(plugin_node);
	}

	// blockly render
	var workspace = Blockly.inject('blockly', {
		//collapse: false,
		grid: {
			spacing: 25,
			length: 3,
			colour: '#ccc',
			snap: true
		},
		media: 'blockly/media/',
		//rtl: rtl,
		toolbox: toolboxXml,
		zoom: {
			controls: true,
			wheel: true,
			startScale: 1,
			maxScale: 2,
			minScale: 0.3,
			scaleSpeed: 1.2
			//scrollbars: false
		}
	});

	Blockly.kbide['WORKSPACE'] = workspace;
	workspace.addChangeListener(handle_function);
	workspace.addChangeListener(handle_kbnetpie);

if (!Blockly.kbide) Blockly.kbide = {};
// KBT_STAGE54K_SESSION_RESTORE: prefer the verified workspace snapshot written
// immediately before locale navigation. Fall back to the legacy localStorage key.
var kbtPendingWorkspaceText = null;
var kbtWorkspaceRestoreSource = 'localStorage';
var kbtPageLanguage = 'en';
var kbtLocaleQuery = /(?:^|[?&])lang=([^&]+)/.exec(window.location.search || '');
var kbtHasQueryLanguage = false;
if (kbtLocaleQuery) {
    try {
        var kbtQueryLanguage = decodeURIComponent(kbtLocaleQuery[1].replace(/\+/g, ' '));
        if (['en', 'th', 'my', 'km', 'lo', 'vi'].indexOf(kbtQueryLanguage) !== -1) { kbtPageLanguage = kbtQueryLanguage; kbtHasQueryLanguage = true; }
    } catch (kbtQueryError) { /* use rendered locale */ }
}
if (!kbtHasQueryLanguage) {
    var kbtCookieMatch = /(?:^|;\s*)lang=([^;]+)/.exec(document.cookie || '');
    if (kbtCookieMatch) {
        try {
            var kbtCookieLanguage = decodeURIComponent(kbtCookieMatch[1]);
            if (['en', 'th', 'my', 'km', 'lo', 'vi'].indexOf(kbtCookieLanguage) !== -1) {
                kbtPageLanguage = kbtCookieLanguage;
                kbtHasQueryLanguage = true;
            }
        } catch (kbtCookieError) { /* use server-rendered selector */ }
    }
}
if (!kbtHasQueryLanguage) {
    var kbtLanguagePicker = document.getElementById('language-select');
    var kbtRenderedLanguage = kbtLanguagePicker && kbtLanguagePicker.getAttribute('data-selected-language');
    if (['en', 'th', 'my', 'km', 'lo', 'vi'].indexOf(kbtRenderedLanguage) !== -1) kbtPageLanguage = kbtRenderedLanguage;
}
try {
    var kbtSnapshotText = sessionStorage.getItem('KBT_LANGUAGE_SWITCH_SNAPSHOT_V1');
    if (kbtSnapshotText) {
        var kbtSnapshot = JSON.parse(kbtSnapshotText);
        if (kbtSnapshot && kbtSnapshot.version === 1 &&
                kbtSnapshot.targetLanguage === kbtPageLanguage &&
                typeof kbtSnapshot.xml === 'string' && kbtSnapshot.xml.length > 0) {
            kbtPendingWorkspaceText = kbtSnapshot.xml;
            kbtWorkspaceRestoreSource = 'session-language-switch';
            console.info('KBT language-switch snapshot selected for restore.', {
                sourceLanguage: kbtSnapshot.sourceLanguage,
                targetLanguage: kbtSnapshot.targetLanguage,
                liveBlockCount: kbtSnapshot.liveBlockCount,
                topBlockCount: kbtSnapshot.topBlockCount,
                xmlLength: kbtSnapshot.xml.length
            });
        } else {
            console.warn('KBT session snapshot did not match the current locale; using legacy workspace storage.');
        }
    }
} catch (kbtSnapshotReadError) {
    console.warn('Could not read KBT session workspace snapshot; using legacy workspace storage.', kbtSnapshotReadError);
}
if (!kbtPendingWorkspaceText) kbtPendingWorkspaceText = localStorage.getItem('KidBrightLastWorkspace');
Blockly.kbide['KBT_PENDING_WORKSPACE_TEXT'] = kbtPendingWorkspaceText;
Blockly.kbide['KBT_WORKSPACE_RESTORE_SOURCE'] = kbtWorkspaceRestoreSource;
Blockly.kbide['KBT_WORKSPACE_RESTORE_STARTED'] = false;

// Stage 5.4h: publish the restore callback on window because the Blockly
// initializer and document-ready resize callback have different scopes.
window.kbtRestoreWorkspaceAfterLayout = function () {
    var appState = Blockly.kbide || {};
    if (appState['KBT_WORKSPACE_RESTORE_STARTED'] ||
            appState['KBT_WORKSPACE_RESTORE_SCHEDULED'] ||
            !appState['KBT_PENDING_WORKSPACE_TEXT']) return;
    appState['KBT_WORKSPACE_RESTORE_SCHEDULED'] = true;
    var attempts = 0;
    var maxAttempts = 200;

    function showVisualProgrammingWorkspace(div) {
        if (window.jQuery) {
            var $ = window.jQuery;
            $(div).closest('table').show();
            $('#kbt-text-panel').hide();
            $('#kbt-language-picker').show();
            $('#kbt-mode-text').removeClass('active');
            $('#kbt-mode-visual').addClass('active');
            $('#btn-new, #btn-open, #btn-save, #btn-build').closest('li').show();
        }
        if (div && div.parentNode) {
            var parent = div.parentNode;
            var width = parent.clientWidth || parent.offsetWidth || 0;
            var height = parent.clientHeight || parent.offsetHeight || 0;
            if (width > 2) div.style.width = (width - 2) + 'px';
            if (height > 2) div.style.height = (height - 2) + 'px';
        }
    }

    function retryRestore(reason) {
        attempts++;
        if (attempts <= maxAttempts) {
            window.setTimeout(waitForLayout, 50);
        } else {
            appState['KBT_WORKSPACE_RESTORE_SCHEDULED'] = false;
            console.error('Blockly workspace restore could not become ready; saved XML remains available.', reason);
        }
    }

    function waitForLayout() {
        var div = document.getElementById('blockly');
        if (!div) return retryRestore('Blockly container was not found.');
        showVisualProgrammingWorkspace(div);
        if (div.offsetWidth < 20 || div.offsetHeight < 20) {
            return retryRestore('Visual Programming container has no usable dimensions.');
        }

        // The original IDE injects Blockly from the asynchronous /plugins AJAX
        // callback. Do not mistake a visible DIV for an initialized workspace.
        var targetWorkspace = (Blockly.kbide && Blockly.kbide['WORKSPACE']) || Blockly.mainWorkspace;
        if (!targetWorkspace || typeof targetWorkspace.getAllBlocks !== 'function' ||
                typeof targetWorkspace.getTopBlocks !== 'function') {
            return retryRestore('Blockly.inject() has not produced a live workspace yet.');
        }

        var restoreAfterFonts = function () {
            var raf = window.requestAnimationFrame || function (callback) { return window.setTimeout(callback, 16); };
            raf(function () {
                raf(function () {
                    if (appState['KBT_WORKSPACE_RESTORE_STARTED']) {
                        appState['KBT_WORKSPACE_RESTORE_SCHEDULED'] = false;
                        return;
                    }
                    var latestWorkspace = (Blockly.kbide && Blockly.kbide['WORKSPACE']) || Blockly.mainWorkspace;
                    if (!latestWorkspace || typeof latestWorkspace.getAllBlocks !== 'function') {
                        return retryRestore('Blockly workspace was not ready after layout frames.');
                    }
                    try {
                        showVisualProgrammingWorkspace(div);
                        if (div.offsetWidth < 20 || div.offsetHeight < 20) {
                            return retryRestore('Visual Programming container became hidden before XML import.');
                        }
                        if (typeof latestWorkspace.setVisible === 'function') latestWorkspace.setVisible(true);
                        if (typeof Blockly.svgResize === 'function') Blockly.svgResize(latestWorkspace);

                        var loadResult = null;
                        if (window.KBTBlockly && typeof window.KBTBlockly.loadXml === 'function') {
                            // Reuse the same importer as KBT-to-Blockly. It also rebuilds
                            // dynamic function-call dropdowns after declarations are loaded.
                            loadResult = window.KBTBlockly.loadXml(appState['KBT_PENDING_WORKSPACE_TEXT'], {
                                clear: false,
                                workspace: latestWorkspace
                            });
                        } else {
                            var xml = Blockly.Xml.textToDom(appState['KBT_PENDING_WORKSPACE_TEXT']);
                            Blockly.Xml.domToWorkspace(xml, latestWorkspace);
                        }
                        var restoredBlocks = latestWorkspace.getAllBlocks(false);
                        if (window.KBTBlockly && typeof window.KBTBlockly.refreshWorkspaceLayout === 'function') {
                            window.KBTBlockly.refreshWorkspaceLayout(latestWorkspace, { cleanUp: true });
                        } else {
                            for (var i = 0; i < restoredBlocks.length; i++) {
                                if (restoredBlocks[i] && typeof restoredBlocks[i].render === 'function') restoredBlocks[i].render();
                            }
                            if (typeof latestWorkspace.cleanUp === 'function') latestWorkspace.cleanUp();
                            if (typeof Blockly.resizeSvgContents === 'function') Blockly.resizeSvgContents(latestWorkspace);
                            if (typeof Blockly.svgResize === 'function') Blockly.svgResize(latestWorkspace);
                        }

                        // Only consume the session snapshot after a successful import.
                        try {
                            localStorage.setItem('KidBrightLastWorkspace', appState['KBT_PENDING_WORKSPACE_TEXT']);
                        } catch (legacySaveError) {
                            console.warn('Restored workspace is live, but legacy localStorage could not be refreshed.', legacySaveError);
                        }
                        if (appState['KBT_WORKSPACE_RESTORE_SOURCE'] === 'session-language-switch') {
                            try { sessionStorage.removeItem('KBT_LANGUAGE_SWITCH_SNAPSHOT_V1'); }
                            catch (sessionRemoveError) { console.warn('Could not remove consumed session snapshot.', sessionRemoveError); }
                        }
                        appState['KBT_WORKSPACE_RESTORE_STARTED'] = true;
                        appState['KBT_WORKSPACE_RESTORE_SCHEDULED'] = false;
                        console.info('KidBright Blockly workspace restored.', {
                            source: appState['KBT_WORKSPACE_RESTORE_SOURCE'],
                            totalBlocks: restoredBlocks.length,
                            topBlocks: latestWorkspace.getTopBlocks(false).length,
                            functionCallsRefreshed: loadResult ? loadResult.functionCallsRefreshed : null
                        });
                    } catch (restoreError) {
                        appState['KBT_WORKSPACE_RESTORE_SCHEDULED'] = false;
                        console.error('Could not restore KidBright Blockly workspace; saved XML was retained.', restoreError);
                    }
                });
            });
        };
        if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
            document.fonts.ready.then(restoreAfterFonts, restoreAfterFonts);
        } else {
            restoreAfterFonts();
        }
    }
    waitForLayout();
};
// Handle either script-initialization order: Blockly may initialize before or
// after jQuery's ready callback depending on the legacy IDE startup path.
if (window.kbtBlocklyContainerReady) window.kbtRestoreWorkspaceAfterLayout();
}

$(document).ready(function() {
	// set default language
	if (getCookie('lang') == null) {
		setCookie('lang', 'en', 365);
	}

	var onresize = function(e) {
		var div;
		if (div = document.getElementById('blockly')) {
			div.style.width = (div.parentNode.offsetWidth - 2) + 'px';
			div.style.height = (div.parentNode.offsetHeight - 2) + 'px';
                        // Keep Blockly's internal SVG metrics synchronized with the resized container.
                        var resizeWorkspace = (window.Blockly && Blockly.kbide && Blockly.kbide['WORKSPACE']) || null;
                        if (resizeWorkspace && typeof Blockly.svgResize === 'function' &&
                                div.offsetWidth > 0 && div.offsetHeight > 0) {
                                Blockly.svgResize(resizeWorkspace);
                        }
		}
	}
	onresize();
	window.kbtBlocklyContainerReady = true;
	if (window.kbtRestoreWorkspaceAfterLayout) window.kbtRestoreWorkspaceAfterLayout();
	window.addEventListener('resize', onresize);
	window.addEventListener('unload', function() {
		saveWorkspaceLocal();
	}, false);

	// override prompt function, fixed electron dialog problem
	Blockly.prompt = function(message, defaultValue, callback) {
		$('.modal-prompt #prompt-btn-ok').text(LANG_OK);
		$('.modal-prompt #prompt-btn-cancel').text(LANG_CANCEL);

		$('.modal-prompt .modal-header h4').text(message);
		$('.modal-prompt #prompt-text').val(defaultValue);
		$('.modal-prompt #prompt-btn-ok').unbind('click').click(function() {
			var new_val = $('#prompt-text').val();
			if ((new_val) && (new_val != '')) {
				callback(new_val);
			} else {
				callback(null);
			}
			$('.modal-prompt').modal('hide');
		});
		$('.modal-prompt').modal('show');
	};

	// check additional plug-ins toolboxs
	$.ajax({
		type: 'POST',
		url: '/plugins',
		error: function(e) {
			renderToolbox();
		},
		success: function(res) {
			renderToolbox(res);
		}
	});
});
