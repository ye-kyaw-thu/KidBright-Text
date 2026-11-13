# Source audit — 2026-11-12

## Input archive

- File: `kbide-source-review.zip`
- Archive size: 45,098,847 bytes
- Entries: 725 (713 copied files plus directory entries)
- Total uncompressed content: approximately 77.5 MB
- Source root from manifest: `<LOCAL_KBIDE_ROOT>`
- The audit archive was created by the maintainer's read-only helper; it reported 721 files copied and no sensitive-name files omitted.

## Main contents

- `app/`: original KidBright web application plus KBT integration.
- `app/kbt/`: KBT compiler, registries and 60 examples.
- `app/public/`: Blockly blocks/generators, KBT editor and locale scripts.
- `app/server/`: KBT routes, controller integration, Jade views and localization.
- `plugins/`: 397 source/assets from the KidBright plugin tree.
- `docs/`: original technical documentation, diagrams and schematics.
- `KidBright-Text-CLI-Demo-v0.1.0/`: batch example conversion helper.
- Root Node package metadata and lockfiles.

## Tracked-file changes reported by the local Git status

Modified tracked files included:
- `app/public/blockly/kidbright/app.js`
- `app/public/blockly/kidbright/generators.js`
- `app/public/js/controllers/homeController.js`
- `app/server/routes.js`
- `app/server/views/blockly.jade`
- `app/server/views/home.jade`
- `app/server/views/layout.jade`
- `package-lock.json`

New KBT-specific files included:
- `app/kbt/`
- `app/public/blockly/kidbright/kbt-blockly-adapter.js`
- `app/public/css/kbt-editor.css`
- `app/public/js/kbt-editor.js`
- `app/server/kbt-routes.js`
- `app/server/languages/blockly/{km,lo,my,vi}.js`
- `app/server/views/kbt-editor.jade`
- `KidBright-Text-CLI-Demo-v0.1.0/`
- `hello.kbt`

The status also reported untracked backup folders, generated output and toolchain material. Those are not included in this clean source candidate.

## Cleanup performed in this candidate

Removed:
- `__pycache__` and `.pyc` files.
- Two `home.jade.bak-*` files.
- `REVIEW-MANIFEST.txt` (contained a local Windows path and local Git status).
- `Create-KBT-Debug-ZIP.ps1` (maintainer helper with a hard-coded local default path).
- Empty `.gitmodules`.
- Empty `data/` folder (created by the IDE at runtime).
- Root `hello.kbt` moved to `examples/hello-taxila.kbt`.
- Original README moved to `docs/upstream/README-kbide-original.md`.

The current source candidate retains the app, plugins, docs, CLI demo, root and nested package lockfiles, and original LICENSE.

## KBT compiler validation

Using one Python 3.13 process, all 60 examples passed `load_program()` (parse + semantic validation) and Blockly XML generation:
- Core: 48/48
- Advanced: 5/5
- Plugins: 7/7

This source-level test does not build ESP32 firmware or upload to a physical board.
