@echo off
call "%~dp0Convert-KBTExamplesToBlocklyXml.bat" core
exit /b %ERRORLEVEL%
