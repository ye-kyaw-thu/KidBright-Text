# v0.4.0 release checklist

## Source repository

- [ ] Restore the exact upstream source base and missing `archive/`, `esp32/`, and esptool inputs.
- [ ] Review `git status` and staged file list.
- [ ] Confirm no `node_modules`, local data, secrets, personal paths, backups or toolchain downloads are committed.
- [ ] Confirm package metadata, lockfiles and README agree.
- [ ] Review `LICENSE`, `NOTICE`, plugin notices, browser assets and all bundled binaries.
- [ ] Run KBT tests: `python -m unittest discover -s tests -v`.
- [ ] Run legacy IDE build and launch on a clean Windows machine.
- [ ] Test examples, Blockly conversion, language switching, C++ preview, compile and physical USB upload.

## Student installers

- [ ] Bundle runtime and production dependencies; students must not need npm or Python installed.
- [ ] Build and test on native Windows, macOS and Linux runners.
- [ ] Test USB serial detection and flash on each platform.
- [ ] Test Windows install/uninstall and non-admin install.
- [ ] Sign Windows artifacts.
- [ ] Sign and notarize macOS packages; test Intel and Apple Silicon separately.
- [ ] Test Linux AppImage / .deb and serial permissions.
- [ ] Include third-party notices and SHA-256 checksums.
- [ ] Record exact OS, architecture, Node/Python/toolchain versions used.

## GitHub release

- [ ] Tag `v0.4.0`.
- [ ] Publish source archive separately from platform installers.
- [ ] Upload installer artifacts only after their tests pass.
- [ ] Include checksums and accurate validation status.
