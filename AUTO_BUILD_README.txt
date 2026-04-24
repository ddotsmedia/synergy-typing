AUTO-BUILD README
=================

WHAT IT DOES
------------
Reads BUILD_PLAN.md, splits it on "## STEP N" headings, and runs each
step through Claude Code non-interactively (claude -p --continue).
Logs every step, saves checkpoints, and supports resuming after a
failure.


THE THREE MODES
---------------

1. SAFE (default) - guided, pause-between-steps
---------------------------------------------
Double-click  auto-build.cmd
Or run:
    powershell -ExecutionPolicy Bypass -File .\auto-build.ps1

Behavior:
  - Shows first 30 lines of each step prompt
  - Asks Y/N/Q before running each step
  - Claude Code still prompts you for tool permissions
  - You verify localhost between steps
  - Fully resumable via .checkpoint.json

Recommended for your FIRST full run. Uses the fewest credits because
you can interrupt any step that drifts.


2. AUTO-APPROVE (no prompts, still asks for tool permissions)
-------------------------------------------------------------
    powershell -ExecutionPolicy Bypass -File .\auto-build.ps1 -AutoApprove

Skips the Y/N prompts between steps. Claude Code still asks before
running bash commands or writing files. You can walk away but still
need to approve tool prompts when they appear.


3. FULL YOLO (completely unattended - burns credits fast)
---------------------------------------------------------
    powershell -ExecutionPolicy Bypass -File .\auto-build.ps1 `
        -AutoApprove -SkipPermissions -Model sonnet

Passes --dangerously-skip-permissions to Claude Code. No approvals
of any kind. This will:
  - Run shell commands without asking
  - Write and delete files without asking
  - Install npm / pnpm packages without asking
  - Happily consume your Claude credits for hours

You will be asked to type "YOLO" to confirm. Use only after you have
reviewed the prompts once in SAFE mode.


USEFUL FLAGS
------------
  -Steps 1,2,3            Run only specific steps by number
  -Model haiku            Use cheaper model (great for seed data)
  -StepTimeoutMinutes 15  Kill a step that runs longer than N min
  -FreshStart             Don't use --continue on the first step
  -DryRun                 Show what would run, don't call claude


TYPICAL WORKFLOWS
-----------------

First time, synergy-typing:
    cd C:\Users\home\Desktop\synergy-typing
    powershell -ExecutionPolicy Bypass -File .\auto-build.ps1 -Steps 1

Re-run seed data with Haiku to save credits:
    powershell -ExecutionPolicy Bypass -File .\auto-build.ps1 -Steps 2 -Model haiku

Overnight unattended build after you're confident:
    powershell -ExecutionPolicy Bypass -File .\auto-build.ps1 `
        -AutoApprove -SkipPermissions -StepTimeoutMinutes 30

Only run remaining steps (picks up from checkpoint):
    powershell -ExecutionPolicy Bypass -File .\auto-build.ps1


OUTPUT
------
build-logs\
  run-YYYYMMDD-HHMMSS.log     Top-level orchestrator log
  step1-YYYYMMDD-HHMMSS.log   Claude Code stdout+stderr for step 1
  step1-prompt-YYYY...md      The exact prompt sent for step 1
  ...

.checkpoint.json              Which steps completed (auto-managed)


SAFETY RULES
------------
- ALWAYS use -DryRun first on a new BUILD_PLAN.md
- Run step 1 alone first to verify output quality
- Watch credits in your Anthropic console for the first auto run
- Stop the run at any time with Ctrl+C - checkpoint preserves progress
- If a step times out it's logged and the next step continues
- Keep git commits between steps so you can roll back


WHY IT STILL WON'T BE 100% HANDS-OFF
------------------------------------
Even in full YOLO mode:
- Some npm installs prompt interactively (rare) - they'll just hang
  until the step timeout kills them
- Claude Code may need you to log in the first time (`claude login`)
- The plan may ask you to drop a file in assets/ - do that before
  starting or the step will run with placeholders

This is a trade-off between speed and safety. Start in SAFE mode,
graduate to AUTO-APPROVE after one successful build, and only use
YOLO for the parts of the plan you've already watched work.
