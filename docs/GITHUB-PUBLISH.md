# Publish KidBright Text source to GitHub

Target repository:

<https://github.com/ye-kyaw-thu/KidBright-Text>

## Recommended workflow: preserve upstream history

The maintainer's current `kbide` folder is a Git checkout with local modifications. The source-review ZIP intentionally excludes `.git`, so the clean source ZIP alone cannot preserve upstream commit history or restore the omitted tracked build inputs.

### 1. Record the original upstream remote and base commit

Run in the original local `kbide` directory:

```powershell
git remote -v
git rev-parse HEAD
git status --short
```

Save the original remote URL and exact commit hash.

### 2. Clone the exact upstream base into a NEW directory

Use the URL and base commit recorded above. The known public KidBright upstream is `https://gitlab.com/kidbright/kbide.git`, but prefer the actual remote URL reported by the local checkout.

```powershell
$Kbide = "<LOCAL_KBIDE_ROOT>"
$Repo = "$env:USERPROFILE\Projects\KidBright-Text"
$UpstreamUrl = (git -C $Kbide remote get-url origin).Trim()
$BaseCommit = (git -C $Kbide rev-parse HEAD).Trim()

git clone --recursive $UpstreamUrl $Repo
if ($LASTEXITCODE -ne 0) { throw "git clone failed" }

git -C $Repo checkout --detach $BaseCommit
if ($LASTEXITCODE -ne 0) { throw "Could not check out the exact base commit" }
git -C $Repo checkout -b main
if ($LASTEXITCODE -ne 0) { throw "Could not create main branch" }
```

This preserves the original upstream history and restores tracked files omitted from the review ZIP, including `archive/` and `esp32/`.

### 3. Overlay the cleaned source candidate

Extract `KidBright-Text-v0.4.0-GitHub-Source.zip` to a temporary directory. Copy its contents over the new clone, preserving the clone's `.git` directory and original folders omitted from the review ZIP.

Example, after extracting the source ZIP so that it contains a `KidBright-Text-v0.4.0-GitHub-Source` folder:

```powershell
$Candidate = "$env:USERPROFILE\Downloads\KidBright-Text-v0.4.0-GitHub-Source"
Copy-Item -Path (Join-Path $Candidate '*') -Destination $Repo -Recurse -Force
```

Do not delete `archive/`, `esp32/`, or original flashing files from the clone. The review ZIP omitted them by design; keep the same upstream versions.

### 4. Review before staging

```powershell
git status --short
git diff --stat
git diff -- package.json app/package.json
```

Look for local data, backup folders, credentials, generated binaries and large downloaded toolchains. The updated `.gitignore` excludes common runtime output and toolchain folders.

### 5. Keep the original project as upstream and add GitHub as origin

```powershell
git remote rename origin upstream
git remote add origin https://github.com/ye-kyaw-thu/KidBright-Text.git
git remote -v
```

If the clone already has a different remote name, inspect `git remote -v` and adjust instead of blindly running the rename.

### 6. Stage and inspect

```powershell
git add README.md LICENSE NOTICE THIRD_PARTY_NOTICES.md `
  CHANGELOG.md CONTRIBUTING.md VERSION.txt `
  requirements.txt requirements-hardware.txt requirements-dev.txt `
  .gitignore .gitattributes

git add app plugins docs tests examples .github KidBright-Text-CLI-Demo-v0.1.0

git status --short
git diff --cached --stat
git diff --cached --name-only
```

Only stage folders that exist in the worktree. Do not use `git add .` until the status and ignore rules have been reviewed. Do not stage `node_modules`, expanded toolchains, firmware build output or personal backups.

### 7. Commit

```powershell
git commit -m "Release KidBright Text v0.4.0 source"
```

### 8. Push the source repository

Create an EMPTY repository on GitHub named `KidBright-Text` (do not initialize a README/LICENSE/.gitignore there), then:

```powershell
git push -u origin main
```

### 9. Tag the release after source and licensing review

```powershell
git tag -a v0.4.0 -m "KidBright Text v0.4.0"
git push origin v0.4.0
```

Do not publish a one-click installer asset until the native package has passed OS-specific application and board-upload tests. Attach the source ZIP and its SHA-256 to the GitHub Release, along with accurate platform validation notes.
