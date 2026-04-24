# Synergy Typing - project launcher (pure ASCII for PS 5.1 compatibility)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

Write-Host ''
Write-Host '==========================================================' -ForegroundColor DarkCyan
Write-Host '  Synergy Typing Services - project launcher' -ForegroundColor Cyan
Write-Host '==========================================================' -ForegroundColor DarkCyan
Write-Host ("Project folder: {0}" -f $ProjectRoot) -ForegroundColor Gray
Write-Host ''

# 1. Pre-flight
$required = @('CLAUDE_CODE_PROMPT.md','BUILD_PLAN.md','SERVICES_CATALOGUE.md')
$missing = @()
foreach ($f in $required) {
    if (-not (Test-Path (Join-Path $ProjectRoot $f))) { $missing += $f }
}
if ($missing.Count -gt 0) {
    Write-Host 'Missing files:' -ForegroundColor Red
    $missing | ForEach-Object { Write-Host ('  - {0}' -f $_) -ForegroundColor Red }
    exit 1
}
Write-Host '[1/5] Project files present.' -ForegroundColor Green

# 2. Check VS Code
$codeCmd = Get-Command code -ErrorAction SilentlyContinue
if (-not $codeCmd) {
    Write-Host '[2/5] VS Code CLI not found. Install VS Code and enable "Add to PATH".' -ForegroundColor Yellow
    $open = Read-Host 'Open the folder in Explorer instead? [Y/n]'
    if ($open -ne 'n' -and $open -ne 'N') { Start-Process explorer.exe $ProjectRoot }
    exit 1
}
Write-Host '[2/5] VS Code CLI detected.' -ForegroundColor Green

# 3. Check Node + Claude Code
$nodeCmd   = Get-Command node -ErrorAction SilentlyContinue
$claudeCmd = Get-Command claude -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host '[3/5] Node.js not found. Install Node LTS from https://nodejs.org then re-run.' -ForegroundColor Yellow
}
elseif (-not $claudeCmd) {
    Write-Host '[3/5] Claude Code CLI not found.' -ForegroundColor Yellow
    $install = Read-Host 'Install it now with "npm i -g @anthropic-ai/claude-code"? [Y/n]'
    if ($install -ne 'n' -and $install -ne 'N') {
        npm install -g '@anthropic-ai/claude-code'
        if ($LASTEXITCODE -eq 0) { Write-Host '  Installed.' -ForegroundColor Green }
        else { Write-Host '  Install failed. Install manually later.' -ForegroundColor Red }
    }
}
else {
    Write-Host '[3/5] Claude Code CLI detected.' -ForegroundColor Green
}

# 4. Copy Section 1 of the prompt to clipboard
$promptPath = Join-Path $ProjectRoot 'CLAUDE_CODE_PROMPT.md'
$promptText = Get-Content $promptPath -Raw
$match = [regex]::Match(
    $promptText,
    '##\s*SECTION\s*1[^\n]*\n(?<body>[\s\S]*?)(?=\n##\s*SECTION\s*2)',
    'IgnoreCase'
)
if ($match.Success) {
    $body = $match.Groups['body'].Value.Trim()
    Set-Clipboard -Value $body
    Write-Host '[4/5] Section 1 of the prompt copied to clipboard.' -ForegroundColor Green
}
else {
    Set-Clipboard -Value $promptText
    Write-Host '[4/5] Full prompt copied to clipboard (Section 1 marker not found).' -ForegroundColor Yellow
}

# 5. Open VS Code
Write-Host '[5/5] Opening VS Code...' -ForegroundColor Green
& code $ProjectRoot (Join-Path $ProjectRoot 'CLAUDE_CODE_PROMPT.md')
Start-Sleep -Seconds 2

Write-Host ''
Write-Host 'Next:' -ForegroundColor Cyan
Write-Host '  1. VS Code: Terminal -> New Terminal (Ctrl+`)' -ForegroundColor Cyan
Write-Host '  2. Run:  claude' -ForegroundColor Cyan
Write-Host '  3. Paste (Ctrl+V) and press Enter.' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Remember: stop after the scaffold, then feed STEP 1 from BUILD_PLAN.md.' -ForegroundColor DarkGray
Write-Host 'Use /clear between steps. Switch /model haiku for seed data + CRUD.' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'Done.' -ForegroundColor Yellow
Start-Sleep -Seconds 3
