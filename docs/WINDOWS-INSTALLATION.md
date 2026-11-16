# Windows setup: KidBright Text v0.4.0

This guide describes the current source-based Windows setup. It is intended for Windows x64 development/testing on Windows 10 or Windows 11. The project has been manually built and uploaded to a physical KidBright board on a second Windows computer using the matching original KidBright SDK and hardware tools. This is not yet a signed one-click installer.

## Compatibility requirements

- Windows x64.
- Node.js **8.17.0** and npm **6.x** for the v0.4.0 IDE. Node 8 is end-of-life; use it only for this legacy local application and do not expose the server to untrusted networks.
- Python 3.10 or newer, available through the Windows `py` launcher. The KBT server invokes `py -3` by default on Windows.
- Git for Windows, for cloning and updating the source.
- KidBright USB serial driver appropriate for the board/USB interface.
- The repository's `esp32/` tree and `archive/kidbright32.json` hardware manifest.
- Xtensa ESP32 compiler, ESP32 ULP binutils and the Windows esptool executable. These are downloaded platform tools and are not stored in ordinary Git history.

## 1. Clone the repository

```powershell
git clone https://github.com/ye-kyaw-thu/KidBright-Text.git
cd KidBright-Text
```

The repository should contain `esp32/lib/release/common.mk` and `esp32/lib/release/partitions_singleapp.bin`. If either is missing, the source checkout is incomplete for firmware builds.

## 2. Install the legacy Node runtime

Use Node.js 8.17.0 x64 with npm 6.x. The official archive is:

<https://nodejs.org/dist/v8.17.0/node-v8.17.0-win-x64.zip>

The official archive lists npm 6.13.4 and marks Node 8 as out of maintenance. Verify the downloaded ZIP against the SHA-256 entry in the official `SHASUMS256.txt` before extracting it. Keep this runtime isolated from other Node versions. One option is to extract it to:

```text
%USERPROFILE%\Tools\node-v8.17.0-win-x64\
```

For the current PowerShell session:

```powershell
$NodeHome = Join-Path $env:USERPROFILE 'Tools\node-v8.17.0-win-x64'
$env:Path = "$NodeHome;$env:Path"
node --version
npm --version
node -p "process.versions.modules"
```

Expected values are `v8.17.0`, npm `6.x` (the maintainer used `6.13.4`) and native module ABI `57`.

## 3. Install npm dependencies

There are two dependency roots. Use the matching Node 8/npm 6 runtime:

```powershell
# From the repository root
npm ci

# Application dependencies
Push-Location .\app
npm ci
Pop-Location
```

The `app` dependency tree includes `serialport` 6.x, a native Node module. Depending on Windows, architecture and availability of a compatible prebuilt binary, npm may attempt a native build and request Visual C++ Build Tools. Do not try to load a module built for Node 8 with Node 20/22/24/26; the module ABI must match. A prebuilt Windows runtime bundle is the planned way to avoid requiring students to compile native modules during installation.

## 4. Install platform firmware tools

The original Gulp build reads `archive/kidbright32.json` and fetches the platform-specific Xtensa compiler, ULP tools and esptool archive. From the repository root:

```powershell
npm run build
```

This is the legacy upstream build pipeline. It downloads external tool archives and extracts them into the repository. It is not the future one-click installer. Review the manifest URLs and hashes before redistributing binaries. The expanded folders are ignored by Git:

```text
xtensa-esp32-elf/
esp32ulp-elf-binutils/
esptool.exe
```

Do not copy a compiler folder from Linux or macOS into Windows; native toolchains are platform-specific.

## 5. Validate the Windows installation

Run the prerequisite check:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\tools\windows\Test-KBT-WindowsPrerequisites.ps1 `
  -RepoPath (Get-Location).Path
```

Or use `start-kidbright.bat`. The launcher requires Node 8.17.0 / ABI 57 and verifies Express and SerialPort. Missing firmware build tools are reported separately so the IDE can still start for editing.

## 6. Start the IDE

```powershell
.\start-kidbright.bat
```

Open <http://localhost:8000> in a desktop browser. Keep the terminal window open while using the IDE. Press Ctrl+C in that window to stop the server.

## 7. Build and upload a program

1. Connect the KidBright board by USB.
2. Confirm the serial port shown in the IDE (for example, COM3).
3. Open `app/kbt/examples/core/01_hello_world.kbt` or create a simple program.
4. Build first, then upload to the detected board.
5. Test an ordinary plugin and, separately, a ULP plugin if those features are needed.

A successful KBT syntax check is not a hardware build test. The firmware toolchain and board upload must both be tested.

## Troubleshooting

### `NODE_MODULE_VERSION` mismatch

Start with Node 8.17.0, not a newer system Node. Reinstall `app` dependencies with npm 6 under Node 8 only if the current `serialport` binding cannot load.

### Missing `devman.h`, `wificontroller.h` or KidBright headers

The SDK must be a matched complete release tree. Do not copy only one header. The known-working maintainer environment used the complete original `esp32/` directory, excluding generated `esp32/build/` output.

### Missing Xtensa compiler or esptool

Run `npm run build` from the repository root after restoring `archive/kidbright32.json`. Confirm that `xtensa-esp32-elf/bin/xtensa-esp32-elf-c++.exe` and root `esptool.exe` exist.

### PowerShell script execution policy

For a one-off script, use a process-scoped invocation:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\Test-KBT-WindowsPrerequisites.ps1
```

Do not weaken the machine-wide execution policy merely to run the setup check.

## Installer status

A self-contained, signed Windows `.exe` or `.msi` that bundles a compatible Node runtime, prebuilt native dependencies and the hardware toolchain is not part of this source repository yet. It will be published only after clean Windows 10 and Windows 11 installation tests, firmware compilation, board upload and third-party redistribution review.
