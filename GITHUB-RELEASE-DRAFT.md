# KidBright Text v0.4.0

KidBright Text v0.4.0 adds a Python-inspired text programming workflow to the KidBright IDE and integrates it with the existing Blockly workspace.

## Highlights

- KBT language compiler with syntax and semantic checks.
- KBT-to-Blockly XML translation using the original KidBright block model.
- 60 examples (48 Core, 5 Advanced, 7 Plugins).
- English, Thai, Myanmar, Khmer, Lao and Vietnamese UI/Blockly localization.
- Workspace snapshot preservation across language switches.
- Dynamic function dropdown refresh and workspace layout/render updates.
- Source tests for all 60 examples.

## Downloads

- `KidBright-Text-v0.4.0-GitHub-Source.zip` — cleaned source candidate.
- `KidBright-Text-v0.4.0-GitHub-Source.zip.sha256` — SHA-256 checksum.

## Important platform status

The source release is for developers and is not a one-click desktop installer. The upload review archive intentionally omitted the large tracked SDK/toolchain material; the full repository must preserve the matching upstream `archive/` and `esp32/` folders. Native Windows/macOS/Linux student installers require separate builds and acceptance tests.

The maintainer confirmed installation of the v0.4.0k update on Windows. The source-level validation in this release checked all 60 KBT examples and generated Blockly XML. Firmware upload and native macOS/Linux acceptance testing are not claimed here.

## Requirements

See `README.md`, `requirements.txt`, `requirements-hardware.txt`, and `docs/DEVELOPER-SETUP.md`.

## Licensing

See `LICENSE`, `NOTICE`, and `THIRD_PARTY_NOTICES.md`. The repository includes upstream KidBright IDE source and dependencies that retain their own license and attribution requirements.
