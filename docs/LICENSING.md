# Licensing notes for maintainers

## Files included in the review

The uploaded source review contains a root `LICENSE` file whose text is the Apache License 2.0. The source candidate retains that file unchanged. The KidBright official download page also describes its open-source KidBright IDE sources as Apache-licensed. Verify the exact upstream revision's LICENSE/NOTICE before creating a public release.

## KBT contributions

`NOTICE` identifies the KidBright Text-specific contributions as intended for Apache License 2.0 and records the stated copyright attribution. Keep this scope explicit. Do not use the project LICENSE to override a third-party component's own license.

## Metadata discrepancy

The uploaded upstream `package.json` and `app/package.json` declared `"license": "ISC"` even though the repository root LICENSE is Apache 2.0. This candidate aligns both package metadata values to `Apache-2.0` for the repository release. Before publishing, confirm this is consistent with the exact source provenance and retain all upstream copyright/attribution notices. The npm dependencies themselves retain their individual licenses.

## Items requiring a separate check

- Blockly and browser-side libraries in `app/public/`.
- All 397 plugin source/assets, particularly prebuilt static libraries and copied vendor code.
- ESP32 SDK, Xtensa compiler, ULP binutils and esptool downloads.
- Plugin PDFs, schematics, images, fonts and other media.
- Any additional datasets or files added after the source-review snapshot.

Before building student installers, generate a license/SBOM report from the exact production package and include all required LICENSE/NOTICE files. Do not bundle large toolchains until redistribution rights, attribution and checksum are known.
