@echo off
call "%~dp0Convert-KBTExamplesToBlocklyXml.bat" plugins
exit /b %ERRORLEVEL%
