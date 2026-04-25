@echo off
REM Windows wrapper — double-click or run from cmd/PowerShell.
REM Forwards everything to scripts\sync.sh under git-bash.
SETLOCAL
SET "REPO=%~dp0.."
WHERE bash >nul 2>nul || (
  ECHO bash not found. Install Git for Windows ^(https://git-scm.com^), which provides bash.
  EXIT /B 1
)
bash "%REPO%\scripts\sync.sh" %*
