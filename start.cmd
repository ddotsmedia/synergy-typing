@echo off
REM Synergy Typing - project launcher
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
  echo.
  echo Launcher reported an error. See messages above.
  pause
)
