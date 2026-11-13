@echo off
call "%~dp0Convert-KBTExamplesToBlocklyXml.bat" all
exit /b %ERRORLEVEL%
