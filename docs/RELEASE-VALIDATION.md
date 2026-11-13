# v0.4.0 source candidate validation

Validation performed against the uploaded source-review archive and the cleaned GitHub source candidate.

| Check | Result |
|---|---|
| KBT example count | 60 found (48 Core, 5 Advanced, 7 Plugins) |
| Compiler semantic validation | 60/60 passed |
| Blockly XML generation | 60/60 passed |
| Blockly XML parse with Python ElementTree | 60/60 passed |
| Python `unittest` suite | 1 test method covering all 60 examples; passed |
| Principal JavaScript syntax checks | 8 files passed using Node.js v22.16.0 |
| Root and app package JSON | Parsed successfully |
| Lockfile metadata | Updated to match package names/version; lockfileVersion 1 retained |
| Personal local path scan | No hard-coded personal paths remain in text source/docs |
| Simple likely-secret scan | No API-key/token/password assignment pattern detected |

## Not validated

- A clean full IDE build from a fresh clone: requires restored upstream `archive/`, `esp32/` and platform flashing/build inputs.
- Windows PowerShell installer or native Windows installer.
- Native macOS or Linux KidBright application launch.
- Firmware compilation and physical USB upload from a clean install.
- macOS signing/notarization, Windows code signing, Linux AppImage/.deb generation.
- Complete third-party license/SBOM review for all plugins, browser assets and firmware binaries.

The maintainer separately confirmed the Stage 5.4k patch installation on Windows and provided its backup and SHA-256 log. That is not the same as validation of a self-contained student installer.
