'use strict';

/* Local KBT compiler API for the original KidBright Node/Express IDE.
 * Only fixed compiler commands are exposed. User source is written to a unique
 * temporary .kbt file and passed to Python with execFile (never a shell).
 */
var fs = require('fs');
var path = require('path');
var os = require('os');
var crypto = require('crypto');
var childProcess = require('child_process');

module.exports = function registerKbtRoutes(app, options) {
  options = options || {};
  var kbtRoot = path.resolve(options.kbtRoot || path.join(__dirname, '..', 'kbt'));
  var compilerScript = path.join(kbtRoot, 'compiler', 'kbtc.py');
  var pluginModule = path.join(kbtRoot, 'compiler', 'kbt_plugins.py');
  var pluginRegistry = path.join(kbtRoot, 'KBT-Plugin-API-Registry-v0.1.csv');
  var examplesRoot = path.join(kbtRoot, 'examples');
  var maxSourceBytes = options.maxSourceBytes || 256 * 1024;
  var timeoutMs = options.timeoutMs || 20000;
  var maxBuffer = options.maxBuffer || 2 * 1024 * 1024;

  function sendJson(res, status, payload) {
    return res.status(status).json(payload);
  }

  function pythonCommand() {
    if (process.env.KBT_PYTHON) return { command: process.env.KBT_PYTHON, prefix: [] };
    return process.platform === 'win32'
      ? { command: 'py', prefix: ['-3'] }
      : { command: 'python3', prefix: [] };
  }

  function safeProfile(value) {
    if (value == null || value === 'core') return 'core';
    if (value === 'advanced') return 'advanced';
    if (value === 'plugins') return 'plugins';
    return null;
  }

  function safeExampleId(value) {
    if (typeof value !== 'string') return null;
    return /^(core|advanced|plugins)\/[A-Za-z0-9_-]+\.kbt$/.test(value) ? value : null;
  }

  function getExamples() {
    var result = [];
    ['core', 'advanced', 'plugins'].forEach(function (profile) {
      var dir = path.join(examplesRoot, profile);
      if (!fs.existsSync(dir)) return;
      fs.readdirSync(dir).sort().forEach(function (name) {
        if (!/^[A-Za-z0-9_-]+\.kbt$/.test(name)) return;
        var full = path.join(dir, name);
        if (!fs.statSync(full).isFile()) return;
        result.push({
          id: profile + '/' + name,
          name: name.replace(/\.kbt$/i, '').replace(/^[0-9]+_/, '').replace(/_/g, ' '),
          profile: profile
        });
      });
    });
    return result;
  }

  app.get('/kbt/status', function (req, res) {
    var ok = fs.existsSync(compilerScript) && fs.existsSync(pluginModule) &&
      fs.existsSync(pluginRegistry) && fs.existsSync(path.join(kbtRoot, 'KBT-API-Registry-v0.5.csv'));
    return sendJson(res, ok ? 200 : 503, {
      ok: ok,
      compiler: fs.existsSync(compilerScript),
      registry: fs.existsSync(path.join(kbtRoot, 'KBT-API-Registry-v0.5.csv')),
      pluginModule: fs.existsSync(pluginModule),
      pluginRegistry: fs.existsSync(pluginRegistry),
      python: process.env.KBT_PYTHON || (process.platform === 'win32' ? 'py -3' : 'python3'),
      requiredPython: '3.10+'
    });
  });

  app.get('/kbt/examples', function (req, res) {
    try { return sendJson(res, 200, { ok: true, examples: getExamples() }); }
    catch (error) { return sendJson(res, 500, { ok: false, error: 'Could not list KBT examples: ' + error.message }); }
  });

  app.post('/kbt/example', function (req, res) {
    var id = safeExampleId(req.body && req.body.id);
    if (!id) return sendJson(res, 400, { ok: false, error: 'Invalid example identifier.' });
    var full = path.resolve(examplesRoot, id);
    var rootPrefix = path.resolve(examplesRoot) + path.sep;
    if (full.indexOf(rootPrefix) !== 0 || !fs.existsSync(full)) {
      return sendJson(res, 404, { ok: false, error: 'KBT example was not found.' });
    }
    try { return sendJson(res, 200, { ok: true, id: id, source: fs.readFileSync(full, 'utf8') }); }
    catch (error) { return sendJson(res, 500, { ok: false, error: 'Could not read KBT example: ' + error.message }); }
  });

  app.post('/kbt/compile', function (req, res) {
    var body = req.body || {};
    var source = body.source;
    var action = body.action || 'check';
    var profile = safeProfile(body.profile);

    if (typeof source !== 'string' || !source.trim()) return sendJson(res, 400, { ok: false, error: 'KBT source is empty.' });
    if (Buffer.byteLength(source, 'utf8') > maxSourceBytes) return sendJson(res, 413, { ok: false, error: 'KBT source exceeds the ' + maxSourceBytes + ' byte limit.' });
    if (action !== 'check' && action !== 'blockly') return sendJson(res, 400, { ok: false, error: 'Unsupported KBT action.' });
    if (!profile) return sendJson(res, 400, { ok: false, error: 'Profile must be core, advanced, or plugins.' });
    if (!fs.existsSync(compilerScript) || !fs.existsSync(pluginModule) || !fs.existsSync(pluginRegistry) ||
        !fs.existsSync(path.join(kbtRoot, 'KBT-API-Registry-v0.5.csv'))) {
      return sendJson(res, 503, { ok: false, error: 'KBT compiler or plugin registry files are missing. Reinstall the KBT Stage 5 integration.' });
    }

    var tempPath = path.join(os.tmpdir(), 'kidbright-kbt-' + process.pid + '-' + crypto.randomBytes(8).toString('hex') + '.kbt');
    try { fs.writeFileSync(tempPath, source, 'utf8'); }
    catch (error) { return sendJson(res, 500, { ok: false, error: 'Could not create temporary KBT source: ' + error.message }); }

    var py = pythonCommand();
    var args = py.prefix.concat([compilerScript, action, tempPath, '--profile', profile]);
    childProcess.execFile(py.command, args, {
      timeout: timeoutMs,
      maxBuffer: maxBuffer,
      windowsHide: true
    }, function (error, stdout, stderr) {
      try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (ignore) { /* best effort */ }
      if (error) {
        var missingPython = error.code === 'ENOENT';
        var timedOut = error.killed || error.code === 'ETIMEDOUT';
        return sendJson(res, missingPython ? 503 : (timedOut ? 504 : 422), {
          ok: false,
          action: action,
          profile: profile,
          stdout: stdout || '',
          stderr: stderr || '',
          error: missingPython
            ? 'Python was not found. Install Python 3.10+ and ensure the Windows py launcher or python3 command is available.'
            : (timedOut ? 'KBT compilation timed out.' : (stderr || stdout || error.message || 'KBT validation failed.'))
        });
      }
      if (action === 'blockly') {
        if (!stdout || !/<xml[\s>]/i.test(stdout)) {
          return sendJson(res, 500, { ok: false, error: 'KBT compiler did not return a Blockly XML workspace.', stdout: stdout || '', stderr: stderr || '' });
        }
        return sendJson(res, 200, { ok: true, action: action, profile: profile, xml: stdout, stdout: 'Blockly workspace generated.' });
      }
      return sendJson(res, 200, { ok: true, action: action, profile: profile, stdout: stdout || 'KBT source is valid.', stderr: stderr || '' });
    });
  });
};
