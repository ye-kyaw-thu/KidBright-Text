# Missing upstream build inputs in the source-review ZIP

The user-generated `kbide-source-review.zip` was intentionally made smaller by excluding large and historical folders. That was correct for source review, but the archive is **not a complete clean-build copy** of the original KidBright IDE.

The following items were present in the maintainer's original `kbide` directory listing or were referenced by the included source, but were not present in the uploaded ZIP.

| Missing item | Evidence / use | Action before full IDE build or student installer |
|---|---|---|
| `archive/` (4 files, about 33 MB in the local manifest) | `gulpfile.js` reads `archive/kidbright32.json` | Restore the exact `archive/kidbright32.json` from the same upstream base revision. Review other archive assets individually. |
| `archive/kidbright32.json` | Required by `gulpfile.js` at build time to select platform download URLs | Must be restored. The current source-review ZIP cannot run the original `npm run build` pipeline as-is. |
| `esp32/` (1,721 files, about 63 MB in the local manifest) | `app/server/routes.js` expects `esp32/build` and `esp32/lib/release`. The local Git status did not mark this directory untracked, so it appears to be part of the upstream tracked source. | **Keep it in the full fork** (or intentionally migrate it to a versioned submodule/LFS distribution). Do not drop it as a cache. The source-review ZIP omitted it only to reduce upload size. |
| `xtensa-esp32-elf/` (1,243 files, about 440 MB in the local manifest) | `app/server/routes.js` invokes the Xtensa compiler | Download/build per platform using verified upstream manifests; do not commit the expanded toolchain into ordinary Git history. |
| `esp32ulp-elf-binutils/` (16 files, about 11 MB in the local manifest) | Original build pipeline uses ULP binutils | Package per platform or fetch from its source with integrity checks. |
| Root `esptool.exe`, `esptool.py` and/or macOS `esptool` | `app/server/routes.js` resolves these by platform to read MAC, create image and flash firmware | Restore the exact matching tools and their notices. `esptool.py` may require `pyserial`. |
| `node_modules/` (excluded by design) | Runtime dependencies | Recreate from the two package lockfiles using the compatible npm toolchain. Never commit `node_modules`. |

The source review manifest also reports that the local `data/` folder had no files. The IDE creates its runtime data directory when it starts, so it should not be populated with private user data. The local Git status showed the `archive/` and `esp32/` directories as clean tracked content; preserve them from the exact upstream base when assembling the new GitHub repository.

## Safest way to prepare a complete GitHub worktree

Do not build a full IDE repository from this review ZIP alone. Instead:

1. Read the current Git remote and commit from the maintainer's original `kbide` folder:

   ```powershell
   git -C "<LOCAL_KBIDE_ROOT>" remote -v
   git -C "<LOCAL_KBIDE_ROOT>" rev-parse HEAD
   git -C "<LOCAL_KBIDE_ROOT>" status --short
   ```

2. Clone the same upstream remote into a new folder and check out the exact base commit. This restores tracked base folders such as `archive/` and `esp32/` that the review ZIP intentionally omitted.
3. Overlay the cleaned KidBright Text source candidate onto that clone, preserving the cloned `.git` directory and the restored base/toolchain metadata.
4. Review `git status`, licenses, untracked files and the exact binary assets before committing.
5. Keep expanded platform compiler toolchains and end-user data outside the Git source repository.

The public upstream source is <https://gitlab.com/kidbright/kbide>. Use the actual remote URL and commit hash reported by the maintainer's local checkout; do not assume `master` has remained unchanged.
