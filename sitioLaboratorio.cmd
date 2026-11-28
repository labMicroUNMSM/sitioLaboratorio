@echo off
setlocal EnableExtensions DisableDelayedExpansion
powershell.exe -NoLogo -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0scripts\sitioLaboratorio.ps1" "%~1"
exit /b %errorlevel%
