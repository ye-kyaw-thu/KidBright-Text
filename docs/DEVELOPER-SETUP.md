# Developer setup

This document describes the legacy v0.4.0 development environment. It is not the future student installer.

## Required versions

- Node.js 8.17.x
- npm 6.x (maintainer used 6.13.4)
- Python 3.10 or newer for KBT
- Git
- For firmware flashing through the legacy Python esptool path: `pyserial` from `requirements-hardware.txt`
- Matching KidBright ESP32 SDK and platform toolchains

Node.js 8 is end-of-life. The v0.4.0 source keeps the runtime required by the tested legacy IDE, but a future release should migrate to a supported Node.js LTS and update the native serial dependency.

## KBT compiler only

The KBT compiler does not need Node or pip packages. Run it directly:

```bash
python3.10 app/kbt/compiler/kbtc.py version
python3.10 app/kbt/compiler/kbtc.py check app/kbt/examples/core/01_hello_world.kbt --profile core
python3.10 app/kbt/compiler/kbtc.py blockly app/kbt/examples/core/01_hello_world.kbt --profile core -o hello.xml
```

## Full IDE

The full IDE includes two npm package roots: the repository root and `app/`. Both lockfiles use lockfileVersion 1, matching the legacy npm 6 toolchain.

The original root Gulp build script does more than install npm dependencies: it reads `archive/kidbright32.json` and fetches platform-specific build tools. This review source candidate omits the `archive/` and firmware SDK/toolchain directories. Restore the exact upstream build inputs first; see [Missing upstream build inputs](MISSING-BUILD-INPUTS.md).

When a complete worktree has been restored, use the original upstream build process documented by the base project. Do not replace the dependency tree with a modern `npm install` or `npm audit fix` without a deliberate compatibility migration.

## Launch

From the complete repository root:

```bash
npm start
```

Then open:

<http://localhost:8000>

The IDE is a local HTTP server with a browser-based UI. The current application listens on the configured port 8000.
