[CmdletBinding()]
param(
    [ValidateSet('all', 'core', 'advanced', 'plugins')]
    [string]$Profile = 'all',

    [string]$KbideRoot = '',

    [string]$OutputRoot = ''
)

$ErrorActionPreference = 'Stop'

# Supports either <KBIDE_ROOT>\tools or a nested extracted package folder.
if ([string]::IsNullOrWhiteSpace($KbideRoot)) {
    $candidate = Split-Path -Parent $PSScriptRoot
    $candidateCompiler = Join-Path $candidate 'app\kbt\compiler\kbtc.py'
    if (Test-Path -LiteralPath $candidateCompiler -PathType Leaf) {
        $KbideRoot = $candidate
    } else {
        $parentCandidate = Split-Path -Parent $candidate
        $parentCompiler = Join-Path $parentCandidate 'app\kbt\compiler\kbtc.py'
        if (Test-Path -LiteralPath $parentCompiler -PathType Leaf) {
            $KbideRoot = $parentCandidate
        } else {
            throw 'Could not locate KBIDE root automatically. Pass -KbideRoot with the folder that contains app\kbt\compiler\kbtc.py.'
        }
    }
}

if (-not (Test-Path -LiteralPath $KbideRoot -PathType Container)) {
    throw "KBIDE root folder not found: $KbideRoot"
}
$KbideRoot = (Resolve-Path -LiteralPath $KbideRoot).Path

$Compiler = Join-Path $KbideRoot 'app\kbt\compiler\kbtc.py'
$ExamplesRoot = Join-Path $KbideRoot 'app\kbt\examples'

if (-not (Test-Path -LiteralPath $Compiler -PathType Leaf)) {
    throw "KBT compiler not found: $Compiler`nConfirm that Stage 5 is installed in this KBIDE folder."
}
if (-not (Test-Path -LiteralPath $ExamplesRoot -PathType Container)) {
    throw "KBT examples folder not found: $ExamplesRoot"
}

if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
    $OutputRoot = Join-Path $KbideRoot 'kbt-demo-output\blockly'
} elseif (-not [System.IO.Path]::IsPathRooted($OutputRoot)) {
    $OutputRoot = Join-Path $KbideRoot $OutputRoot
}

# Stage 5 uses the Windows Python launcher and Python 3.10+.
$PyLauncher = Get-Command 'py.exe' -ErrorAction SilentlyContinue
if (-not $PyLauncher) {
    $PyLauncher = Get-Command 'py' -ErrorAction SilentlyContinue
}
if (-not $PyLauncher) {
    throw 'Python launcher "py" was not found. Install Python 3.10+ and enable the Python Launcher for Windows.'
}
$PythonExe = $PyLauncher.Source

Write-Host 'Checking Python launcher...' -ForegroundColor Cyan
$pythonVersion = & $PythonExe -3 --version 2>&1
if ($LASTEXITCODE -ne 0) {
    throw "Could not run Python 3 through the py launcher. Output: $pythonVersion"
}
Write-Host "Python: $pythonVersion"
Write-Host "KBIDE:  $KbideRoot"
Write-Host "Output: $OutputRoot"
Write-Host ''

if ($Profile -eq 'all') {
    $ProfilesToRun = @('core', 'advanced', 'plugins')
} else {
    $ProfilesToRun = @($Profile)
}

$successCount = 0
$failureCount = 0
$skipCount = 0
$failedFiles = New-Object System.Collections.Generic.List[string]

foreach ($profileName in $ProfilesToRun) {
    $inputDir = Join-Path $ExamplesRoot $profileName
    $outputDir = Join-Path $OutputRoot $profileName

    if (-not (Test-Path -LiteralPath $inputDir -PathType Container)) {
        Write-Warning "Example profile folder not found; skipping: $inputDir"
        $skipCount++
        continue
    }

    $files = @(Get-ChildItem -LiteralPath $inputDir -File -Filter '*.kbt' | Sort-Object Name)
    if ($files.Count -eq 0) {
        Write-Warning "No .kbt files found in: $inputDir"
        $skipCount++
        continue
    }

    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "[$($profileName.ToUpperInvariant())] $($files.Count) source file(s)" -ForegroundColor Yellow

    foreach ($file in $files) {
        $outputFile = Join-Path $outputDir ($file.BaseName + '.xml')
        Write-Host "  Converting $($file.Name) ..." -NoNewline

        & $PythonExe -3 $Compiler blockly $file.FullName --profile $profileName -o $outputFile
        $compilerExitCode = $LASTEXITCODE

        if ($compilerExitCode -eq 0 -and (Test-Path -LiteralPath $outputFile -PathType Leaf)) {
            Write-Host ' PASS' -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " FAIL (exit code $compilerExitCode)" -ForegroundColor Red
            $failureCount++
            $failedFiles.Add($file.FullName)
        }
    }
    Write-Host ''
}

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host 'KBT to Blockly XML conversion summary' -ForegroundColor Cyan
Write-Host "Converted successfully : $successCount" -ForegroundColor Green
Write-Host "Failed                 : $failureCount" -ForegroundColor $(if ($failureCount -gt 0) { 'Red' } else { 'Green' })
Write-Host "Skipped profiles       : $skipCount"
Write-Host "Output directory       : $OutputRoot"

if ($failedFiles.Count -gt 0) {
    Write-Host ''
    Write-Host 'Files that failed:' -ForegroundColor Red
    foreach ($failed in $failedFiles) { Write-Host "  $failed" -ForegroundColor Red }
    exit 1
}

if ($successCount -eq 0) {
    Write-Error 'No Blockly XML files were generated.'
    exit 2
}

Write-Host ''
Write-Host 'All requested KBT examples were converted successfully.' -ForegroundColor Green
exit 0
