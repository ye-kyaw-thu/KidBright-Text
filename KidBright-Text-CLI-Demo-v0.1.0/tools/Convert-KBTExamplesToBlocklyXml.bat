@echo off
setlocal
set "SCRIPT=%~dp0Convert-KBTExamplesToBlocklyXml.ps1"
set "PROFILE=%~1"
if "%PROFILE%"=="" set "PROFILE=all"
set "KBIDE_ROOT=%~dp0.."
if not exist "%KBIDE_ROOT%\app\kbt\compiler\kbtc.py" set "KBIDE_ROOT=%~dp0..\.."

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%" -Profile "%PROFILE%" -KbideRoot "%KBIDE_ROOT%"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" (
  echo KBT to Blockly XML conversion finished with errors. Exit code: %RESULT%
) else (
  echo KBT to Blockly XML conversion completed successfully.
)
exit /b %RESULT%
