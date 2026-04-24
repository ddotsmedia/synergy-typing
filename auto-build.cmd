@echo off
REM ================================================================
REM  Claude Code auto-builder (double-click launcher)
REM ================================================================
REM  By default this runs in review-between-steps mode: you see each
REM  step's prompt, approve it, then verify localhost before the next.
REM
REM  For full unattended mode (credit-burning, system-changing),
REM  run the .ps1 directly with:
REM     powershell -ExecutionPolicy Bypass -File .\auto-build.ps1 ^
REM       -AutoApprove -SkipPermissions -Model sonnet
REM ================================================================

cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-build.ps1" %*
if errorlevel 1 (
    echo.
    echo Auto-build reported a non-zero exit code. See build-logs\ for details.
    pause
)
