[CmdletBinding()]
param(
    [string]$RepoPath = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
)

$ErrorActionPreference = 'Stop'
$RepoPath = (Resolve-Path -LiteralPath $RepoPath).Path
$Failed = New-Object System.Collections.Generic.List[string]

function Test-File {
    param([string]$Label, [string]$RelativePath)
    $Full = Join-Path $RepoPath $RelativePath
    if (Test-Path -LiteralPath $Full -PathType Leaf) {
        Write-Host ('[ OK ] ' + $Label + ' - ' + $RelativePath) -ForegroundColor Green
        return $true
    }
    Write-Host ('[MISSING] ' + $Label + ' - ' + $RelativePath) -ForegroundColor Red
    $script:Failed.Add($RelativePath)
    return $false
}

Write-Host 'KidBright Text Windows prerequisite check'
Write-Host ('Repository: ' + $RepoPath)
Write-Host ''

$NodeExe = Join-Path $RepoPath 'runtime\node-v8.17.0-win-x64\node.exe'
if (-not (Test-Path $NodeExe)) {
    $NodeExe = Join-Path $env:USERPROFILE 'Tools\node-v8.17.0-win-x64\node.exe'
}
if (-not (Test-Path $NodeExe)) {
    $NodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($NodeCommand) { $NodeExe = $NodeCommand.Source }
}
if (Test-Path $NodeExe) {
    $Version = (& $NodeExe --version 2>&1 | Out-String).Trim()
    $Abi = (& $NodeExe -p 'process.versions.modules' 2>&1 | Out-String).Trim()
    if ($Version -eq 'v8.17.0' -and $Abi -eq '57') {
        Write-Host '[ OK ] Node.js v8.17.0 / ABI 57' -ForegroundColor Green
    } else {
        Write-Host ('[MISSING] Expected Node v8.17.0 / ABI 57; found ' + $Version + ' / ABI ' + $Abi) -ForegroundColor Red
        $Failed.Add('Node.js v8.17.0 / ABI 57')
    }
} else {
    Write-Host '[MISSING] Node.js executable' -ForegroundColor Red
    $Failed.Add('Node.js executable')
}

$null = Test-File 'KBT compiler' 'app\kbt\compiler\kbtc.py'
$null = Test-File 'App Express dependency' 'app\node_modules\express\index.js'
$null = Test-File 'App SerialPort dependency' 'app\node_modules\serialport\package.json'
$null = Test-File 'KidBright manifest' 'archive\kidbright32.json'
$null = Test-File 'Xtensa C++ compiler' 'xtensa-esp32-elf\bin\xtensa-esp32-elf-c++.exe'
$null = Test-File 'Xtensa C compiler' 'xtensa-esp32-elf\bin\xtensa-esp32-elf-gcc.exe'
$null = Test-File 'Xtensa archiver' 'xtensa-esp32-elf\bin\xtensa-esp32-elf-ar.exe'
$null = Test-File 'ESP32 SDK common.mk' 'esp32\lib\release\common.mk'
$null = Test-File 'ESP32 bootloader' 'esp32\lib\release\bootloader.bin'
$null = Test-File 'Partition table' 'esp32\lib\release\partitions_singleapp.bin'
$null = Test-File 'Windows esptool' 'esptool.exe'

if (Test-Path $NodeExe) {
    Push-Location (Join-Path $RepoPath 'app')
    try {
        & $NodeExe -e "require('express'); require('serialport'); console.log('Express and SerialPort native bindings OK');"
        if ($LASTEXITCODE -ne 0) {
            Write-Host '[MISSING] Express/SerialPort could not load with the selected Node runtime.' -ForegroundColor Red
            $Failed.Add('Express/SerialPort native module compatibility')
        }
    } finally {
        Pop-Location
    }
}

$Partition = Join-Path $RepoPath 'esp32\lib\release\partitions_singleapp.bin'
if (Test-Path $Partition) {
    $PartitionInfo = Get-Item $Partition
    $PartitionHash = (Get-FileHash -LiteralPath $Partition -Algorithm SHA256).Hash
    if ($PartitionInfo.Length -eq 3072 -and $PartitionHash -eq '7F00B6C042A89B15B0CAC534F82ED988CAF29278FF5700B0C511EB1B5BB7C820') {
        Write-Host '[ OK ] Partition table matches the verified original KBIDE file.' -ForegroundColor Green
    } else {
        Write-Host ('[WARN] Partition table differs from the known reference. Size=' + $PartitionInfo.Length + '; SHA256=' + $PartitionHash) -ForegroundColor Yellow
    }
}

$Ulp = @(
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-as.exe',
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-ld.exe',
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-nm.exe',
    'esp32ulp-elf-binutils\bin\esp32ulp-elf-objcopy.exe'
)
$UlpMissing = @($Ulp | Where-Object { -not (Test-Path (Join-Path $RepoPath $_) -PathType Leaf) })
if ($UlpMissing.Count -eq 0) {
    Write-Host '[ OK ] ESP32 ULP tools' -ForegroundColor Green
} else {
    Write-Host ('[MISSING] ESP32 ULP tools: ' + ($UlpMissing -join ', ')) -ForegroundColor Red
    $Failed.Add('ESP32 ULP tools')
}

Write-Host ''
if ($Failed.Count -eq 0) {
    Write-Host 'All required Windows runtime and firmware prerequisites are present.' -ForegroundColor Green
    exit 0
}
Write-Host ('Validation failed. Missing or incompatible items: ' + ($Failed -join '; ')) -ForegroundColor Red
exit 1
