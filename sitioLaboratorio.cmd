@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title sitioLaboratorio
set "raiz=%~dp0."
if /i "%~1"=="preparar" goto preparar

:menu
echo.
echo sitioLaboratorio
echo   1. Iniciar y abrir portada
echo   2. Abrir panel
echo   3. Ver estado
echo   4. Detener
echo   5. Salir
set "opcion="
ver >nul
set /p "opcion=Elige una opción [1-5]: " || exit /b 0
setlocal EnableDelayedExpansion
if "!opcion!"=="1" (endlocal & goto portada)
if "!opcion!"=="2" (endlocal & goto panel)
if "!opcion!"=="3" (endlocal & goto estado)
if "!opcion!"=="4" (endlocal & goto detener)
if "!opcion!"=="5" (endlocal & exit /b 0)
endlocal
goto menu

:portada
call :wsl iniciar
if not errorlevel 1 start "" "http://127.0.0.1:3102/"
goto menu

:panel
call :wsl iniciar
if not errorlevel 1 start "" "http://127.0.0.1:3102/admin"
goto menu

:estado
call :wsl estado
goto menu

:detener
call :wsl detener
goto menu

:wsl
wsl.exe --cd "%raiz%" --exec python3 scripts/launcher.py %1 <nul
if not errorlevel 1 exit /b 0
echo Revisa el mensaje anterior. Usa la distribución WSL 2 de tu instalación.
exit /b 1

:preparar
call :wsl preparar
if errorlevel 1 exit /b 1
set "ARCHIVO_LAUNCHER=%~f0"
powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop'; $destino=Join-Path ([Environment]::GetFolderPath('DesktopDirectory')) 'sitioLaboratorio.lnk'; $s=(New-Object -ComObject WScript.Shell).CreateShortcut($destino); $s.TargetPath=$env:ARCHIVO_LAUNCHER; $s.WorkingDirectory=Split-Path -LiteralPath $env:ARCHIVO_LAUNCHER; $s.Description='Abrir el menú de sitioLaboratorio'; $s.Save()"
if errorlevel 1 exit /b 1
echo Acceso directo sitioLaboratorio creado en el escritorio de Windows.
exit /b 0
