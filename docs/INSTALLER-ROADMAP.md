# Student-friendly installer roadmap

## Goal

Students and teachers should download one installer for their operating system, complete installation, and launch KidBright Text without separately installing Node.js, npm, Python, or ESP32 toolchains.

This is a separate deliverable from the developer source repository.

## Runtime components to bundle

1. KidBright IDE and KBT source/assets.
2. A compatible Node runtime.
3. Production dependencies for both package roots.
4. The native `serialport` module built for the target operating system and architecture.
5. KBT compiler runtime. The current server supports `KBT_PYTHON`, so a bundled Python interpreter can be selected without asking students to install Python.
6. ESP32 SDK libraries, Xtensa compiler, ULP tools, and platform-specific esptool.
7. Launch shortcut and a local-only application startup wrapper.
8. Third-party notices and uninstall instructions.

## Why packages must be built per operating system

The current IDE depends on `serialport` 6.x, which includes native code. A Windows native module cannot be copied into a macOS or Linux package. Each OS and CPU architecture needs a compatible build and hardware test.

The original IDE is a Node/Express local server, not a native Electron application. Packaging it as Electron is possible, but Electron's Node ABI differs from the standalone Node runtime; native modules must be rebuilt for the embedded Electron version. Do not add Electron only as a wrapper without testing serial communication and USB upload.

## Recommended staged approach

### Stage A — reproduce the legacy environment

- Restore all upstream source/build inputs.
- Pin exact Node/npm and Python versions.
- Test `npm ci` (or the validated legacy install path) in both package roots.
- Test the KBT compiler and all 60 examples.
- Test Blockly generation, C++ preview, compile and real board upload.

### Stage B — bundle the server application

For each platform, assemble an application directory containing the Node runtime, application source, production `node_modules`, KBT compiler/runtime and hardware tools. A small launcher can start the local server and open the browser to `http://localhost:8000`.

This approach can avoid asking students to install npm or Python. npm is a build-time tool; it is not needed merely to start a correctly bundled Node application.

### Stage C — create native installers

- Windows x64: installer such as NSIS or Inno Setup.
- macOS: signed/notarized `.dmg` or `.pkg`; test Intel and Apple Silicon separately.
- Linux x64: AppImage and/or `.deb`; validate USB serial permissions and supported distributions.

Build each package on its native CI runner. Attach checksums and third-party notices to every release.

### Stage D — security and maintenance

Node.js 8.17 is end-of-life. It reached end-of-life on 2019-12-17. The current application should be migrated to a supported LTS runtime before the student installer is broadly distributed or exposed to untrusted networks. That migration will require testing/updating Gulp 3 and `serialport` 6 native bindings.

## Status

- Windows: maintainer confirmed the v0.4.0k patch installer ran and hash-verified both modified files. The current source archive does not contain the full firmware toolchain needed for a fresh setup.
- macOS: no native installation or board-upload acceptance evidence in this project snapshot.
- Linux: no native KidBright IDE installation or board-upload acceptance evidence in this project snapshot.
- No single-file student installers (`.exe`, `.dmg`, `.AppImage`, `.deb`) are included in this source candidate.
