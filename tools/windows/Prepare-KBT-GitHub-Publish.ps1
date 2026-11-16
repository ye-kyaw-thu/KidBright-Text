[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [Parameter(Mandatory=$true)]
    [string]$SourceRoot,
    [Parameter(Mandatory=$true)]
    [string]$RepositoryPath
)

$ErrorActionPreference = 'Stop'
$SourceRoot = (Resolve-Path -LiteralPath $SourceRoot).Path
$RepositoryPath = (Resolve-Path -LiteralPath $RepositoryPath).Path
$OverlayRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path

if (-not (Test-Path (Join-Path $RepositoryPath '.git'))) {
    throw 'RepositoryPath must be an existing Git checkout (a .git directory or file is required).'
}
$Origin = (& git -C $RepositoryPath remote get-url origin 2>$null | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $Origin -notmatch 'ye-kyaw-thu/KidBright-Text') {
    throw ('The destination origin is not the expected KidBright-Text GitHub repository. Current origin: ' + $Origin)
}

$RequiredSource = @(
    'package.json',
    'archive\kidbright32.json',
    'esp32\lib\release\common.mk',
    'esp32\lib\release\partitions_singleapp.bin',
    'esp32\lib\release\kidbright32\include\devman.h'
)
foreach ($Relative in $RequiredSource) {
    if (-not (Test-Path -LiteralPath (Join-Path $SourceRoot $Relative) -PathType Leaf)) {
        throw ('Original development source is missing required file: ' + $Relative)
    }
}

$PartitionSource = Join-Path $SourceRoot 'esp32\lib\release\partitions_singleapp.bin'
$PartitionHash = (Get-FileHash -LiteralPath $PartitionSource -Algorithm SHA256).Hash
if ($PartitionHash -ne '7F00B6C042A89B15B0CAC534F82ED988CAF29278FF5700B0C511EB1B5BB7C820') {
    throw ('The source partition table does not match the known-good reference. SHA256=' + $PartitionHash)
}

$Esp32Source = Join-Path $SourceRoot 'esp32'
$Esp32Target = Join-Path $RepositoryPath 'esp32'
$BuildDirectory = Join-Path $Esp32Source 'build'

Write-Host 'KBT GitHub publishing preparation'
Write-Host ('Source:      ' + $SourceRoot)
Write-Host ('Destination: ' + $RepositoryPath)
Write-Host ('Origin:      ' + $Origin)
Write-Host ''
Write-Host 'Copy policy:'
Write-Host '- Copy esp32/ recursively, excluding generated esp32/build/.'
Write-Host '- Copy only archive/kidbright32.json from archive/.'
Write-Host '- Do not copy esptool.exe, Xtensa/ULP expanded toolchains, node_modules, data or temp.'
Write-Host '- Do not delete destination files.'
Write-Host ''

if ($PSCmdlet.ShouldProcess($Esp32Target, 'Copy original esp32 SDK/source tree (excluding esp32/build)')) {
    $RobocopyArgs = @(
        $Esp32Source,
        $Esp32Target,
        '/E', '/COPY:DAT', '/DCOPY:DAT', '/R:2', '/W:2', '/XJ',
        '/XD', $BuildDirectory
    )
    & robocopy @RobocopyArgs
    $RoboCode = $LASTEXITCODE
    if ($RoboCode -ge 8) {
        throw ('Robocopy failed with exit code ' + $RoboCode)
    }
    Write-Host ('[ OK ] esp32 copied; robocopy exit code ' + $RoboCode) -ForegroundColor Green
}

$ArchiveTarget = Join-Path $RepositoryPath 'archive'
if ($PSCmdlet.ShouldProcess((Join-Path $ArchiveTarget 'kidbright32.json'), 'Copy upstream hardware manifest')) {
    if (-not (Test-Path $ArchiveTarget)) {
        New-Item -ItemType Directory -Path $ArchiveTarget -Force | Out-Null
    }
    Copy-Item -LiteralPath (Join-Path $SourceRoot 'archive\kidbright32.json') `
        -Destination (Join-Path $ArchiveTarget 'kidbright32.json') -Force
    Write-Host '[ OK ] archive/kidbright32.json copied.' -ForegroundColor Green
}

$OverlayFiles = @(
    'README.md',
    '.gitignore',
    'start-kidbright.bat',
    'start-kidbright.ps1',
    'docs\WINDOWS-INSTALLATION.md',
    'docs\REPOSITORY-FILE-MANIFEST.md',
    'docs\MISSING-BUILD-INPUTS.md',
    'docs\DEVELOPER-SETUP.md',
    'docs\GITHUB-PUBLISH.md',
    'docs\INSTALLER-ROADMAP.md',
    'docs\RELEASE-VALIDATION.md',
    'THIRD_PARTY_NOTICES.md',
    'tools\windows\Prepare-KBT-GitHub-Publish.ps1',
    'tools\windows\Test-KBT-WindowsPrerequisites.ps1'
)
foreach ($Relative in $OverlayFiles) {
    $From = Join-Path $OverlayRoot $Relative
    $To = Join-Path $RepositoryPath $Relative
    if (-not (Test-Path -LiteralPath $From -PathType Leaf)) {
        throw ('Publishing overlay is incomplete; missing ' + $Relative)
    }
    if ($PSCmdlet.ShouldProcess($To, 'Copy publishing overlay file')) {
        $Parent = Split-Path -Parent $To
        if (-not (Test-Path $Parent)) { New-Item -ItemType Directory -Path $Parent -Force | Out-Null }
        Copy-Item -LiteralPath $From -Destination $To -Force
    }
}

Write-Host ''
Write-Host 'Publishing files staged. No Git add, commit or push was performed.' -ForegroundColor Green
Write-Host ('Partition SHA256: ' + $PartitionHash)
Write-Host 'Next: inspect git status, git diff --check, ignored files and large-file report.'
