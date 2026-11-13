# Third-party notices

This repository combines KidBright Text contributions with source and assets from the upstream KidBright IDE and third-party packages.

## Upstream KidBright IDE

- Project: <https://gitlab.com/kidbright/kbide>
- The supplied source tree contains an Apache License 2.0 `LICENSE` file, which is retained here.
- Original source headers, author notices and attributions must be preserved.
- The original upstream README is retained at `docs/upstream/README-kbide-original.md`.

## npm dependencies

The legacy IDE uses dependencies declared in:

- `package.json` / `package-lock.json`
- `app/package.json` / `app/package-lock.json`

Direct dependencies include Gulp tooling, Express, Jade, body-parser, cookie-parser, md5, Moment, QRCode and `serialport`. The package lockfiles record the resolved dependency tree. Each npm package retains its own license and notice terms; do not treat the repository's root LICENSE as changing those terms.

## Blockly, browser libraries and plugins

The application includes Blockly-related source, browser-side libraries and KidBright plugins. Retain all original license headers and notices in those components. Before making a binary installer, generate and review a complete third-party software bill of materials (SBOM) from the exact packaged runtime.

## Firmware and toolchain components

The source-review bundle did not include the ESP32 SDK, Xtensa compiler, ULP binutils or esptool binaries. These must be restored or downloaded from their original publishers. Their licenses and redistribution rules must be checked independently before bundling them in installers.

## Static libraries and documents

Some upstream plugin directories contain prebuilt static libraries (`.a`) and PDF documentation/schematics. Their provenance should be checked against the upstream project and any vendor notices before redistribution outside the source repository.

## Project contributions

KidBright Text-specific contributions are identified in `NOTICE` and are intended to be distributed under Apache License 2.0, subject to the third-party exceptions described above.
