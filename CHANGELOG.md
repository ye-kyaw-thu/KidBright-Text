# Changelog

## v0.4.0 — 2026-11-12

- Integrated the Python-inspired KidBright Text editor into the legacy KidBright IDE.
- Added KBT syntax parsing, semantic validation and Blockly XML translation.
- Added the KBT-to-Blockly adapter and local compiler API routes.
- Added 60 KBT examples across Core, Advanced and Plugins profiles.
- Added English, Thai, Myanmar, Khmer, Lao and Vietnamese localization support.
- Added verified Blockly workspace snapshots across language changes.
- Fixed restoration ordering, visible workspace layout, rendering, cleanup and SVG resizing.
- Fixed locale selection initialization and preservation through full-page language navigation.
- Prepared source-level regression tests and developer documentation.

### Validation note

The maintainer confirmed the Windows installation of the v0.4.0k snapshot patch. In this review environment, all 60 KBT examples passed compiler semantic checks and generated parseable Blockly XML. Hardware firmware compilation/upload and native macOS/Linux application testing are separate acceptance tests.
