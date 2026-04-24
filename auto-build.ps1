# ======================================================================
# auto-build.ps1 - Claude Code orchestrator
# ----------------------------------------------------------------------
# Reads a BUILD_PLAN.md, splits it on "## STEP N" headings, and runs each
# step through Claude Code non-interactively.
#
# DEFAULTS are safe:
#   - Shows each step's prompt and asks Y/N/Q before sending
#   - Per-step timeout
#   - Logs every step's stdout+stderr to .\build-logs\
#   - Writes .checkpoint.json so you can resume from any step
#
# FULL AUTO needs the explicit flag  -AutoApprove -SkipPermissions
# and will burn credits fast. Use only after you trust the prompts.
#
# Pure ASCII on purpose - Windows PowerShell 5.1 compatible.
# ======================================================================

#Requires -Version 5.1
[CmdletBinding()]
param(
    # Path to the BUILD_PLAN.md to orchestrate
    [string]$PlanFile = "$PSScriptRoot\BUILD_PLAN.md",

    # Project directory (where claude will run)
    [string]$ProjectDir = $PSScriptRoot,

    # Which step numbers to run, e.g. 1,2,3   Empty = all.
    [int[]]$Steps = @(),

    # Model override passed to claude (haiku | sonnet | opus | model-id)
    [string]$Model = 'sonnet',

    # Don't prompt between steps.
    [switch]$AutoApprove,

    # Show what would run but do not call claude.
    [switch]$DryRun,

    # Per-step timeout (minutes). Kills the step and logs it.
    [int]$StepTimeoutMinutes = 25,

    # Use --dangerously-skip-permissions so claude doesn't ask for
    # tool permissions. Needed for true unattended runs.
    [switch]$SkipPermissions,

    # Start a fresh session (don't use --continue on step 1 even if a
    # prior session exists). Later steps still --continue.
    [switch]$FreshStart,

    # Custom system prompt appended to every step (stays on-plan).
    [string]$SystemNudge = "You are executing one step of BUILD_PLAN.md. Stop at the end of this step and wait. Do not move to the next step. Do not install paid dependencies without asking. Keep responses concise."
)

$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = 'Claude Code auto-builder'

# ----------------------------------------------------------------------
# Pre-flight
# ----------------------------------------------------------------------
if (-not (Test-Path $PlanFile)) {
    Write-Host "Plan file not found: $PlanFile" -ForegroundColor Red; exit 1
}
if (-not (Test-Path $ProjectDir)) {
    Write-Host "Project dir not found: $ProjectDir" -ForegroundColor Red; exit 1
}
$claude = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claude) {
    Write-Host "claude CLI not found on PATH." -ForegroundColor Red
    Write-Host "Install:  npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
    exit 1
}

$LogDir = Join-Path $ProjectDir 'build-logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$RunStamp     = Get-Date -Format 'yyyyMMdd-HHmmss'
$RunLog       = Join-Path $LogDir ("run-$RunStamp.log")
$CheckpointFile = Join-Path $ProjectDir '.checkpoint.json'

function Write-Log([string]$msg, [string]$color = 'Gray') {
    Write-Host $msg -ForegroundColor $color
    Add-Content -Path $RunLog -Value ("{0}  {1}" -f (Get-Date -Format 'HH:mm:ss'), $msg)
}

function Read-Checkpoint {
    if (Test-Path $CheckpointFile) {
        try { return (Get-Content $CheckpointFile -Raw | ConvertFrom-Json) }
        catch { return @{ completed = @() } }
    }
    return @{ completed = @() }
}

function Save-Checkpoint($cp) {
    $cp | ConvertTo-Json -Depth 4 | Set-Content -Path $CheckpointFile -Encoding UTF8
}

# ----------------------------------------------------------------------
# Parse BUILD_PLAN.md into steps
# ----------------------------------------------------------------------
$planText = Get-Content $PlanFile -Raw

# Match "## STEP N" or "## STEP N - ..." or "## STEP N: ..." etc.
# Captures step number and body up to the next "## STEP" or "---"/EOF.
$pattern = '(?ms)^##\s*STEP\s+(?<num>\d+)\b(?<title>[^\r\n]*)\r?\n(?<body>.*?)(?=^##\s*STEP\s+\d+\b|^---\s*$|\Z)'
$matches = [regex]::Matches($planText, $pattern)

if ($matches.Count -eq 0) {
    Write-Log "No '## STEP N' sections found in $PlanFile" 'Red'
    Write-Log "Expected headings like '## STEP 1 - Scaffold' or '## STEP 1: Home page'" 'Red'
    exit 1
}

$allSteps = @()
foreach ($m in $matches) {
    $num   = [int]$m.Groups['num'].Value
    $title = $m.Groups['title'].Value.Trim(' ', '-', ':', [char]0x2014)
    if ([string]::IsNullOrWhiteSpace($title)) { $title = "Step $num" }
    $body  = $m.Groups['body'].Value.Trim()
    $allSteps += [pscustomobject]@{ Number = $num; Title = $title; Body = $body }
}
$allSteps = $allSteps | Sort-Object Number

if ($Steps.Count -gt 0) {
    $selected = $allSteps | Where-Object { $Steps -contains $_.Number }
}
else {
    $selected = $allSteps
}

if ($selected.Count -eq 0) {
    Write-Log "No matching steps selected." 'Yellow'; exit 0
}

# ----------------------------------------------------------------------
# Banner + summary
# ----------------------------------------------------------------------
Write-Host ''
Write-Host '==========================================================' -ForegroundColor DarkCyan
Write-Host ' Claude Code auto-build' -ForegroundColor Cyan
Write-Host '==========================================================' -ForegroundColor DarkCyan
Write-Log ("Plan file : {0}" -f $PlanFile)
Write-Log ("Project   : {0}" -f $ProjectDir)
Write-Log ("Model     : {0}" -f $Model)
Write-Log ("Timeout   : {0} min/step" -f $StepTimeoutMinutes)
Write-Log ("Auto      : {0}" -f (if ($AutoApprove) { 'yes' } else { 'no (pause between steps)' }))
Write-Log ("Perms     : {0}" -f (if ($SkipPermissions) { 'dangerously-skip-permissions' } else { 'prompt' }))
Write-Log ("Log file  : {0}" -f $RunLog)
Write-Log ""
Write-Log "Steps to run:"
foreach ($s in $selected) { Write-Log ("  STEP {0,2}  {1}" -f $s.Number, $s.Title) 'Cyan' }
Write-Log ""

if ($DryRun) {
    Write-Log "Dry run - exiting without calling claude." 'Yellow'
    exit 0
}

if ($SkipPermissions -and $AutoApprove) {
    Write-Host ''
    Write-Host '!!  You enabled both -AutoApprove AND -SkipPermissions.' -ForegroundColor Red
    Write-Host '!!  Claude Code will write files and run shell commands' -ForegroundColor Red
    Write-Host '!!  WITHOUT asking. This burns credits and can modify' -ForegroundColor Red
    Write-Host '!!  your system. Interrupt with Ctrl+C if unsure.' -ForegroundColor Red
    Write-Host ''
    $ok = Read-Host 'Type  YOLO  to proceed'
    if ($ok -ne 'YOLO') { Write-Log 'Aborted.' 'Yellow'; exit 1 }
}

# ----------------------------------------------------------------------
# Run each step
# ----------------------------------------------------------------------
$checkpoint = Read-Checkpoint
$completed  = [System.Collections.ArrayList]::new()
$failed     = [System.Collections.ArrayList]::new()

$isFirst = $true
foreach ($s in $selected) {
    Write-Host ''
    Write-Host '----------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host (" STEP {0} - {1}" -f $s.Number, $s.Title) -ForegroundColor Cyan
    Write-Host '----------------------------------------------------------' -ForegroundColor DarkGray

    if ($checkpoint.completed -contains $s.Number) {
        Write-Log ("STEP {0} already in checkpoint." -f $s.Number) 'DarkGray'
        $again = 'y'
        if (-not $AutoApprove) {
            $again = Read-Host 'Run again anyway? [y/N]'
        }
        if ($again -ne 'y' -and $again -ne 'Y') {
            Write-Log "  skipping" 'DarkGray'
            continue
        }
    }

    # Preview first 30 lines
    $preview = ($s.Body -split "`n" | Select-Object -First 30) -join "`n"
    Write-Host ''
    Write-Host $preview -ForegroundColor Gray
    Write-Host ''
    Write-Host '  [ ... truncated ... ]' -ForegroundColor DarkGray

    if (-not $AutoApprove) {
        $ans = Read-Host 'Run this step now? [Y/n/q]'
        if ($ans -eq 'q' -or $ans -eq 'Q') { Write-Log 'Quit requested.' 'Yellow'; break }
        if ($ans -eq 'n' -or $ans -eq 'N') { Write-Log "  user skipped STEP $($s.Number)" 'Yellow'; continue }
    }

    # Build the prompt that goes to claude
    $fullPrompt = @"
SYSTEM NUDGE:
$SystemNudge

STEP $($s.Number) - $($s.Title)

$($s.Body)
"@

    # Temp file for the prompt (avoids quoting hell on the command line)
    $promptFile = Join-Path $LogDir ("step$($s.Number)-prompt-$RunStamp.md")
    $fullPrompt | Out-File -FilePath $promptFile -Encoding UTF8

    $stepLog = Join-Path $LogDir ("step$($s.Number)-$RunStamp.log")

    # Assemble claude arguments
    $cliArgs = @('-p', '--model', $Model, '--output-format', 'text')
    if (-not ($isFirst -and $FreshStart)) { $cliArgs += '--continue' }
    if ($SkipPermissions) { $cliArgs += '--dangerously-skip-permissions' }

    Write-Log ("Running:  claude {0}  <  {1}" -f ($cliArgs -join ' '), $promptFile)
    $started = Get-Date

    # Launch claude as a child process, pipe the prompt via stdin
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName  = $claude.Source
    $psi.Arguments = ($cliArgs -join ' ')
    $psi.WorkingDirectory      = $ProjectDir
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput= $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute       = $false
    $psi.CreateNoWindow        = $true

    $proc = [System.Diagnostics.Process]::Start($psi)

    # Feed the prompt
    $proc.StandardInput.Write((Get-Content $promptFile -Raw))
    $proc.StandardInput.Close()

    # Tee output to console + log
    $outTask = $proc.StandardOutput.ReadToEndAsync()
    $errTask = $proc.StandardError.ReadToEndAsync()

    $deadline = $started.AddMinutes($StepTimeoutMinutes)
    while (-not $proc.HasExited) {
        if ((Get-Date) -gt $deadline) {
            Write-Log ("  TIMEOUT after {0} min - killing process." -f $StepTimeoutMinutes) 'Red'
            try { $proc.Kill() } catch {}
            break
        }
        Start-Sleep -Seconds 2
    }

    $stdout = $outTask.Result
    $stderr = $errTask.Result

    Set-Content -Path $stepLog -Value ("=== STDOUT ===`n" + $stdout + "`n`n=== STDERR ===`n" + $stderr) -Encoding UTF8
    Write-Host $stdout

    if ($proc.HasExited -and $proc.ExitCode -eq 0) {
        $elapsed = (Get-Date) - $started
        Write-Log ("  STEP {0} OK in {1}" -f $s.Number, $elapsed.ToString('mm\:ss')) 'Green'
        [void]$completed.Add($s.Number)
        if (-not ($checkpoint.completed -contains $s.Number)) {
            $checkpoint.completed = @($checkpoint.completed) + $s.Number
            Save-Checkpoint $checkpoint
        }
    }
    else {
        Write-Log ("  STEP {0} FAILED (exit {1})" -f $s.Number, $proc.ExitCode) 'Red'
        Write-Log ("  see {0}" -f $stepLog) 'Red'
        [void]$failed.Add($s.Number)
        if (-not $AutoApprove) {
            $cont = Read-Host 'Continue with next step anyway? [y/N]'
            if ($cont -ne 'y' -and $cont -ne 'Y') { break }
        }
    }

    $isFirst = $false

    # Gentle pause so you can skim localhost in between
    if (-not $AutoApprove) { Read-Host 'Press Enter when youve verified localhost and want the next step' | Out-Null }
}

# ----------------------------------------------------------------------
# Summary
# ----------------------------------------------------------------------
Write-Host ''
Write-Host '==========================================================' -ForegroundColor DarkCyan
Write-Host ' Summary' -ForegroundColor Cyan
Write-Host '==========================================================' -ForegroundColor DarkCyan
Write-Log ("Completed: {0}" -f $completed.Count) 'Green'
$completed | ForEach-Object { Write-Log ("  + STEP {0}" -f $_) 'Green' }
if ($failed.Count) {
    Write-Log ("Failed: {0}" -f $failed.Count) 'Red'
    $failed | ForEach-Object { Write-Log ("  ! STEP {0}" -f $_) 'Red' }
}
Write-Log ""
Write-Log ("Run log   : {0}" -f $RunLog) 'DarkGray'
Write-Log ("Checkpoint: {0}" -f $CheckpointFile) 'DarkGray'
Write-Log "Done." 'Yellow'
