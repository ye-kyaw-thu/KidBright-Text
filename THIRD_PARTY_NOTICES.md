# Third-party notices

KidBright Text combines project-specific contributions with the upstream KidBright IDE, its plugin ecosystem, browser assets, firmware SDK and external build tools. Preserve original copyright notices and license files in every source and binary distribution.

## Upstream KidBright IDE

- Project: <https://gitlab.com/kidbright/kbide>
- The original source tree includes an Apache License 2.0 license file; this repository retains the upstream license and attribution materials.
- The original upstream README is retained under `docs/upstream/README-kbide-original.md`.
- The complete `esp32/` SDK/runtime directory is restored from the maintainer's original working KBIDE tree in the source-completion update. Its component-level vendor notices and license provenance must be reviewed before packaging a binary installer.

## npm dependencies

The legacy IDE uses dependencies declared in:

- `package.json` / `package-lock.json`
- `app/package.json` / `app/package-lock.json`

Direct dependencies include Gulp tooling, Express, Jade, body-parser, cookie-parser, md5, Moment, QRCode and `serialport`. Each package retains its own license and notice terms. Do not treat the repository's root license as changing the licenses of npm dependencies.

## Blockly, browser libraries and plugins

The application includes Blockly-related source, browser libraries and KidBright plugins. Retain all original license headers and notices. Generate and review a complete third-party software bill of materials (SBOM) for the exact installer payload before redistribution.

## ESP32 SDK and hardware tools

- The ESP32 SDK/runtime files under `esp32/` are restored from the original working upstream-derived tree. Preserve every included vendor license/notice file.
- Expanded Xtensa compiler and ESP32 ULP binutils directories are downloaded separately for the host OS and are not committed as ordinary source.
- `esptool.exe` and platform esptool packages are downloaded separately and are not committed as ordinary source.
- Verify the license and redistribution terms of each toolchain package and esptool build before bundling them in a public installer.

## Static libraries and documents

Plugin directories may contain prebuilt static libraries (`.a`), PDFs, schematics, images, fonts and vendor assets. Their individual provenance and licensing must be checked. Do not assume the top-level Apache-2.0 license overrides third-party terms.

## KBT contributions

KidBright Text-specific contributions are identified in `NOTICE`. Preserve `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md` and all third-party notices in source and binary distributions.
