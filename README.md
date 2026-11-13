<!-- KBT-MODIFICATION-NOTICE: Modified by Ye Kyaw Thu for KidBright Text v0.4.0 on 2026-11-13. Original upstream notices are retained. -->
# KidBright Text v0.4.0

**KidBright Text (KBT)** is a Python-inspired text programming environment integrated into the KidBright IDE. It is designed for teaching programming concepts with text and visual blocks in the same environment.

Repository: <https://github.com/ye-kyaw-thu/KidBright-Text>

> **Source-package status:** This is a cleaned GitHub source candidate prepared from the uploaded `kbide-source-review.zip`. The review ZIP deliberately omitted the original firmware SDK/build metadata and platform flashing binaries. See [Missing upstream build inputs](docs/MISSING-BUILD-INPUTS.md) before expecting a fresh clone to compile and upload firmware. Do not present this source candidate as a complete student installer.

## What is included

- KBT compiler and Python-inspired language implementation.
- KBT-to-Blockly XML translation.
- Integration with the original KidBright Blockly workspace and C++ generators.
- Six interface/Blockly locales: English, Thai, Myanmar, Khmer, Lao and Vietnamese.
- 60 KBT examples:
  - 48 Core
  - 5 Advanced
  - 7 Plugins
- KidBright IDE application and plugin source included in the uploaded source review.
- Dependency lockfiles and developer documentation.
- Regression test that validates all 60 KBT examples and checks generated Blockly XML.

## How KBT works

```text
KBT source (.kbt)
       |
       v
Python KBT compiler
  - lexical / syntax parsing
  - semantic validation
  - Blockly XML translation
       |
       v
Blockly workspace in KidBright IDE
       |
       v
Original KidBright Blockly C++ generators
       |
       v
ESP32 build and flash tools
       |
       v
KidBright board
```

The compiler generates Blockly XML. It does not independently compile firmware. The existing KidBright IDE and its ESP32 build/flash toolchain remain responsible for C++ generation, firmware compilation and uploading.

## Development prerequisites

The v0.4.0 integration is based on the legacy KidBright IDE runtime:

| Component | Development requirement |
|---|---|
| Node.js | 8.17.x |
| npm | 6.x (the maintainer's environment used 6.13.4) |
| Python | 3.10 or newer for the KBT compiler |
| Python hardware dependency | `pyserial` for the legacy `esptool.py` path |
| Git | Required to clone and maintain the source |
| Browser | A modern desktop browser for `http://localhost:8000` |
| Board tools | Original KidBright ESP32 SDK, Xtensa compiler, ULP binutils and esptool |

Node.js 8 is end-of-life. It is retained here only because the current upstream IDE and native `serialport` dependency are tied to the legacy runtime. Do not expose this old local server to untrusted networks. A supported Node.js migration is a priority for a future release.

## Run the KBT compiler directly

The KBT compiler itself uses Python standard-library modules only. No third-party pip package is needed for syntax checking or Blockly XML generation.

Windows PowerShell:

```powershell
py -3.10 .\app\kbt\compiler\kbtc.py version

py -3.10 .\app\kbt\compiler\kbtc.py check `
  .\app\kbt\examples\core\01_hello_world.kbt `
  --profile core

py -3.10 .\app\kbt\compiler\kbtc.py blockly `
  .\app\kbt\examples\core\01_hello_world.kbt `
  --profile core `
  -o .\hello_world.xml
```

macOS / Linux:

```bash
python3.10 app/kbt/compiler/kbtc.py version

python3.10 app/kbt/compiler/kbtc.py check \
  app/kbt/examples/core/01_hello_world.kbt --profile core

python3.10 app/kbt/compiler/kbtc.py blockly \
  app/kbt/examples/core/01_hello_world.kbt --profile core \
  -o hello_world.xml
```

## Run the KBT regression tests

Python's built-in `unittest` is sufficient:

```bash
python -m unittest discover -s tests -v
```

The test suite exercises all 60 `.kbt` examples, semantic validation and Blockly XML generation. It does not test the hardware firmware build or USB upload.

## Full KidBright IDE development setup

A complete source checkout also needs the upstream build inputs described in [docs/MISSING-BUILD-INPUTS.md](docs/MISSING-BUILD-INPUTS.md). The uploaded source-review archive excluded those files intentionally, so this archive alone is not a clean-room full IDE build.

Once the missing upstream source/configuration inputs have been restored from the exact base revision:

1. Install Node.js 8.17.x and npm 6.x.
2. Install Python 3.10 or newer.
3. For hardware flashing, install the optional Python dependency:

   ```bash
   python -m pip install -r requirements-hardware.txt
   ```

4. Install Node dependencies using the lockfiles and the original two-package layout.
5. Run the original KidBright build pipeline with the required `archive/kidbright32.json`, ESP32 SDK and toolchain assets.
6. Start the server from the repository root:

   ```bash
   npm start
   ```

7. Open <http://localhost:8000>.

See [Developer setup](docs/DEVELOPER-SETUP.md) and [Missing upstream build inputs](docs/MISSING-BUILD-INPUTS.md).

## Installation for students and teachers

The v0.4.0 source repository is for developers. It is **not** a one-click installer.

The project still needs native, per-operating-system packaging that bundles:
- a supported Node runtime and the production npm dependencies;
- the compatible native `serialport` module;
- the KBT Python runtime (or a frozen KBT compiler executable);
- the KidBright firmware SDK and ESP32 compiler tools;
- platform-specific flashing utilities and permissions guidance.

See [Installer roadmap](docs/INSTALLER-ROADMAP.md). Windows has been used by the maintainer for the v0.4.0k installation validation. Native macOS and Linux packages are not yet validated.

## Licensing

The repository retains the upstream `LICENSE` file. KBT project contributions are identified in `NOTICE`. Third-party dependencies, plugins, PDFs, static libraries, firmware tools and other bundled assets may have separate terms. Read [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [docs/LICENSING.md](docs/LICENSING.md) before redistributing a binary installer.

## Repository layout

```text
KidBright-Text/
├── app/
│   ├── kbt/                 # KBT compiler, registries and examples
│   ├── public/               # KidBright web UI, Blockly and KBT editor
│   └── server/               # Express routes and Jade views
├── plugins/                  # KidBright plugin source
├── docs/                     # Original technical docs and KBT docs
├── KidBright-Text-CLI-Demo-v0.1.0/
├── tests/                    # KBT example regression tests
├── requirements.txt
├── requirements-hardware.txt
├── package.json
├── package-lock.json
├── LICENSE
├── NOTICE
└── THIRD_PARTY_NOTICES.md
```

## Upstream project

This is a maintained KBT-modified source tree based on the KidBright IDE project:

<https://gitlab.com/kidbright/kbide>

Please retain upstream attribution and license notices when using or modifying the IDE.
