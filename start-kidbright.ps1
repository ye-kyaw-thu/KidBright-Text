[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$AppRoot = Join-Path $RepoRoot 'app'

function Write-Status {
    param([string]$Label, [bool]$Ok, [string]$Detail)
    if ($Ok) {
        Write-Host ('[ OK ] ' + $Label + ': ' + $Detail) -ForegroundColor Green
    } else {
        Write-Host ('[WARN] ' + $Label + ': ' + $Detail) -ForegroundColor Yellow
    }
}

Write-Host ''
Write-Host '=========================================='
Write-Host '       KidBright Text v0.4.0'
Write-Host '=========================================='
Write-Host ('Project: ' + $RepoRoot)
Write-Host ''

# Prefer a project-local portable runtime, then KBT_NODE_HOME, then the
# user's portable Tools folder, and finally a Node executable on PATH.
$NodeCandidates = @()
$NodeCandidates += (Join-Path $RepoRoot 'runtime\node-v8.17.0-win-x64\node.exe')
if ($env:KBT_NODE_HOME) {
    $NodeCandidates += (Join-Path $env:KBT_NODE_HOME 'node.exe')
}
$NodeCandidates += (Join-Path $env:USERPROFILE 'Tools\node-v8.17.0-win-x64\node.exe')
$PathNode = Get-Command node.exe -ErrorAction SilentlyContinue
if ($PathNode) {
    $NodeCandidates += $PathNode.Source
}

$NodeExe = $null
foreach ($Candidate in $NodeCandidates) {
    if ($Candidate -and (Test-Path -LiteralPath $Candidate -PathType Leaf)) {
        $NodeExe = $Candidate
        break
    }
}

if (-not $NodeExe) {
    throw 'Node.js v8.17.0 was not found. Install the legacy runtime or set KBT_NODE_HOME to its folder. See docs/WINDOWS-INSTALLATION.md.'
}

$NodeVersion = (& $NodeExe --version 2>&1 | Out-String).Trim()
$NodeAbi = (& $NodeExe -p 'process.versions.modules' 2>&1 | Out-String).Trim()
Write-Status 'Node.js' ($NodeVersion -eq 'v8.17.0' -and $NodeAbi -eq '57') ($NodeVersion + '; native module ABI ' + $NodeAbi)
if ($NodeVersion -ne 'v8.17.0' -or $NodeAbi -ne '57') {
    throw 'This v0.4.0 launcher requires Node.js v8.17.0 (native module ABI 57). Do not start it with Node 20/22/24/26.'
}

if (-not (Test-Path -LiteralPath (Join-Path $AppRoot 'node_modules\express'))) {
    throw 'app/node_modules/express is missing. Install the app dependencies as described in docs/WINDOWS-INSTALLATION.md.'
}
if (-not (Test-Path -LiteralPath (Join-Path $AppRoot 'node_modules\serialport'))) {
    throw 'app/node_modules/serialport is missing. Install the app dependencies as described in docs/WINDOWS-INSTALLATION.md.'
}

Push-Location $AppRoot
try {
    & $NodeExe -e "require('express'); require('serialport'); console.log('Express and SerialPort native bindings OK');"
    if ($LASTEXITCODE -ne 0) {
        throw 'Express or the SerialPort native binding could not be loaded by Node.js v8.17.0.'
    }
}
finally {
    Pop-Location
}

# Python is needed by the KBT compiler. Warn, but let the IDE start so that
# users can still inspect the workspace and settings.
$PythonOk = $false
$PythonDetail = 'Python 3.10+ not detected through the Windows py launcher.'
$PyLauncher = Get-Command py.exe -ErrorAction SilentlyContinue
if ($PyLauncher) {
    $PythonOutput = (& $PyLauncher.Source -3 --version 2>&1 | Out-String).Trim()
    if ($PythonOutput -match 'Python\s+([0-9]+)\.([0-9]+)') {
        $PyMajor = [int]$Matches[1]
        $PyMinor = [int]$Matches[2]
        $PythonOk = ($PyMajor -gt 3 -or ($PyMajor -eq 3 -and $PyMinor -ge 10))
        $PythonDetail = $PythonOutput
    }
}
Write-Status 'Python compiler runtime' $PythonOk $PythonDetail

# Hardware prerequisites are reported separately; the IDE can still launch
# without a board attached, but firmware build/upload will not be available.
$HardwareRequired = @(
    @{ Name = 'Xtensa C++ compiler'; Path = 'xtensa-esp32-elf\bin\xtensa-esp32-elf-c++.exe' },
    @{ Name = 'ESP32 SDK common.mk'; Path = 'esp32\lib\release\common.mk' },
    @{ Name = 'ESP32 bootloader'; Path = 'esp32\lib\release\bootloader.bin' },
    @{ Name = 'Partition table'; Path = 'esp32\lib\release\partitions_singleapp.bin' },
    @{ Name = 'Windows esptool'; Path = 'esptool.exe' }
)
$HardwareMissing = @()
foreach ($Item in $HardwareRequired) {
    $Exists = Test-Path -LiteralPath (Join-Path $RepoRoot $Item.Path) -PathType Leaf
    Write-Status $Item.Name $Exists $Item.Path
    if (-not $Exists) { $HardwareMissing += $Item.Path }
}

$UlpFiles = @(
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-as.exe',
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-ld.exe',
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-nm.exe',
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-objcopy.exe'
)
$UlpMissing = @($UlpFiles | Where-Object { -not (Test-Path -LiteralPath (Join-Path $RepoRoot $_) -PathType Leaf) })
Write-Status 'ESP32 ULP tools' ($UlpMissing.Count -eq 0) $(if ($UlpMissing.Count -eq 0) { 'all four tools present' } else { 'missing: ' + ($UlpMissing -join ', ') })

if ($HardwareMissing.Count -gt 0) {
    Write-Host ''
    Write-Host 'IDE can start, but firmware build/upload prerequisites are incomplete.' -ForegroundColor Yellow
    Write-Host 'See docs/WINDOWS-INSTALLATION.md to install the hardware toolchain.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Starting KidBright Text. Open http://localhost:8000 in your browser.' -ForegroundColor Cyan
Write-Host 'Press Ctrl+C in this window to stop the local IDE server.'
Write-Host ''

Set-Location $RepoRoot
& $NodeExe (Join-Path $RepoRoot 'index.js')
exit $LASTEXITCODE
