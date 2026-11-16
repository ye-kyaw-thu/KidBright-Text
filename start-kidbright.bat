@echo off
setlocal
set "KBT_ROOT=%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%KBT_ROOT%start-kidbright.ps1"
set "KBT_RC=%ERRORLEVEL%"
if not "%KBT_RC%"=="0" pause
exit /b %KBT_RC%
