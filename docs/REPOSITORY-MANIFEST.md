# KidBright Text Repository Manifest

This document describes the main repository components relevant to developing,
installing, and using KidBright Text (KBT) with a KidBright ESP32 board.

## Main repository components

- `README.md` â€” project overview and entry point.
- `start-kidbright.bat` and `start-kidbright.ps1` â€” Windows launch entry points.
- `archive/kidbright32.json` â€” KidBright32 board definition used by the IDE.
- `esp32/` â€” ESP32/KidBright board build-support source tree. Keep the required
  makefiles, headers, source files, libraries, linker/partition data, and release
  support files together. In particular, `esp32/lib/release/common.mk` and
  `esp32/lib/release/partitions_singleapp.bin` are required build inputs.
- `docs/` â€” installation, developer setup, repository, and release-validation
  documentation.
- `tools/windows/` â€” Windows preparation and prerequisite-check scripts.
- `THIRD_PARTY_NOTICES.md` â€” pointers and notices for third-party components.

## Build and upload considerations

The `archive/kidbright32.json` board definition and the required `esp32/` build
support tree are both needed for the KidBright board workflow. Do not replace the
complete ESP32 support tree with only selected headers or libraries. The original
working ESP32 tree was compared with the repository copy during the Windows
publishing preparation; generated top-level `esp32/build/` output was excluded
from that comparison and is not part of the source inventory.

Toolchains and platform-specific utilities may be provisioned by the project's
build/setup process. Generated build output, local dependency directories,
temporary files, logs, and machine-specific settings should not be committed as
source unless a project maintainer explicitly documents a reason to do so.

## Windows installation

See `docs/WINDOWS-INSTALLATION.md` for the Windows workflow and prerequisites.
See `docs/DEVELOPER-SETUP.md` for development setup details. Run the Windows
prerequisite checker in `tools/windows/` before attempting a fresh installation.

## Third-party components and licensing

Retain upstream license and notice files alongside vendored components. Read
`THIRD_PARTY_NOTICES.md` and the individual upstream notices before redistribution.
This manifest is an inventory guide, not a license grant or a statement that every
third-party redistribution review has been completed.
