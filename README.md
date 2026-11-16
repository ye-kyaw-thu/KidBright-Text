# KidBright Text v0.4.0

**KidBright Text (KBT)** is a Python-inspired text programming environment integrated with the KidBright IDE. It lets learners write programs as text while using the existing Blockly workspace and KidBright firmware toolchain.

**Project:** <https://github.com/ye-kyaw-thu/KidBright-Text>

## Highlights

- Python-inspired text syntax for KidBright programming.
- KBT-to-Blockly XML translation, with the original KidBright Blockly generators retained for C++ generation.
- Six interface/Blockly locales: English, Thai, Myanmar, Khmer, Lao and Vietnamese.
- 60 examples: 48 Core, 5 Advanced and 7 Plugin examples.
- KBT compiler, API registries, plugin integrations and regression tests.
- Firmware build and upload support using the matching KidBright ESP32 SDK, Xtensa compiler, ULP tools and esptool.

## How it works

```text
KBT source (.kbt)
      |
      v
KBT compiler and semantic checks
      |
      v
Blockly XML and KidBright workspace
      |
      v
Original KidBright C++ generators
      |
      v
ESP32 firmware build
      |
      v
esptool and USB upload
      |
      v
KidBright board
```

The KBT compiler translates KBT source into Blockly XML. Firmware generation, compilation and uploading are performed by the integrated KidBright IDE and its ESP32 build tools.

## Quick start: run the KBT compiler

The KBT compiler uses Python standard-library modules for parsing, semantic validation and Blockly XML generation.

```bash
python app/kbt/compiler/kbtc.py version
python app/kbt/compiler/kbtc.py check app/kbt/examples/core/01_hello_world.kbt --profile core
python -m unittest discover -s tests -v
```

The regression test suite validates the 60 bundled examples and generated Blockly XML. These tests do not replace a firmware build or a physical board upload test.

## Run the complete KidBright IDE

The full IDE requires the matching legacy runtime and the firmware build inputs. Read the platform-specific instructions before installing dependencies:

- [Windows installation and hardware setup](docs/WINDOWS-INSTALLATION.md)
- [Repository file and distribution manifest](docs/REPOSITORY-FILE-MANIFEST.md)
- [Developer setup](docs/DEVELOPER-SETUP.md)
- [Firmware build inputs](docs/MISSING-BUILD-INPUTS.md)
- [Installer roadmap](docs/INSTALLER-ROADMAP.md)

For a prepared Windows installation, the repository includes `start-kidbright.bat` and `start-kidbright.ps1`. These launchers check the legacy Node.js runtime and native npm dependencies before starting the local IDE server. They do not install dependencies or download toolchains.

After starting the server, open <http://localhost:8000> in a desktop browser.

## Runtime compatibility and security

The v0.4.0 IDE uses Node.js 8.17.x and npm 6.x because its legacy `serialport` native module and upstream build scripts have not yet been migrated. Node.js 8 is end-of-life and no longer receives security fixes. Use this version only for the legacy local development environment; keep the IDE bound to localhost and do not expose it to untrusted networks. A migration to a supported Node.js LTS release is planned separately.

The KBT compiler requires Python 3.10 or newer. The full IDE also requires the two npm dependency trees (repository root and `app/`) and the matching ESP32 hardware tools. On Windows, installing the legacy `serialport` dependency from source may require Visual C++ Build Tools if a compatible prebuilt native binary is not available. A self-contained Windows runtime installer is a separate packaging target and is not included in this source release.

## Hardware files and distribution

The repository includes the KidBright ESP32 SDK source/runtime directory and the upstream `archive/kidbright32.json` manifest needed by the legacy build pipeline. The partition table is stored at `esp32/lib/release/partitions_singleapp.bin`.

Large platform compiler toolchains (`xtensa-esp32-elf/`, `esp32ulp-elf-binutils/`), generated firmware build output (`esp32/build/`), `node_modules/`, user data and the downloaded platform-specific `esptool` executable are not committed as ordinary source files. The platform setup process obtains the required tool binaries separately. See the repository file manifest for the exact inclusion policy.

## Licensing

The repository retains the upstream license and attribution files. KBT-specific contributions are identified in `NOTICE`. The ESP32 SDK, plugin assets, static libraries, browser libraries, PDFs, fonts and external tool binaries may have their own notices or redistribution terms. Read `THIRD_PARTY_NOTICES.md` and `docs/LICENSING.md` before redistributing a binary installer or third-party binaries.

## Upstream project

KidBright IDE upstream source: <https://gitlab.com/kidbright/kbide>

Please preserve upstream attribution, license texts and third-party notices when using or modifying the integrated IDE.
