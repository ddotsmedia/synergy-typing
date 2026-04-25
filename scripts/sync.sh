#!/usr/bin/env bash
# scripts/sync.sh — one-command "push my local changes to production"
#
# What it does:
#   1. cd into the repo root (works from any directory).
#   2. Show what's changed.
#   3. Refuse to stage .env / private keys / large binaries.
#   4. Stage everything else, commit with $1 (or prompt for a message).
#   5. Push to origin/main.
#   6. Watch the GitHub Actions Deploy run live until it finishes.
#   7. curl the live URLs and confirm 200/3xx.
#
# Usage:
#   bash scripts/sync.sh "fix: tweak hero copy"
#   bash scripts/sync.sh                 # prompts for message
#   bash scripts/sync.sh --deploy-only   # skip git, just trigger + watch deploy
#   bash scripts/sync.sh --no-watch      # push and bail (don't tail the run)
#
# Prereqs:
#   • git authenticated to push to origin
#   • gh CLI authenticated (`gh auth status`) — used to watch the run

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
B='\033[1;36m'; G='\033[1;32m'; Y='\033[1;33m'; R='\033[1;31m'; D='\033[0m'
log()  { printf "${B}▶${D} %s\n" "$*"; }
ok()   { printf "${G}✓${D} %s\n" "$*"; }
warn() { printf "${Y}!${D} %s\n" "$*"; }
die()  { printf "${R}✗${D} %s\n" "$*" >&2; exit 1; }

# ─── Locate repo root ────────────────────────────────────────────────────────
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) \
  || die "not inside a git repository"
cd "$ROOT"

REPO_NWO="ddotsmedia/synergy-typing"
SITE_URLS=("https://milestonm.ae" "https://admin.milestonm.ae")

# ─── Parse args ──────────────────────────────────────────────────────────────
MSG=""
DEPLOY_ONLY=0
NO_WATCH=0
for arg in "$@"; do
  case "$arg" in
    --deploy-only) DEPLOY_ONLY=1 ;;
    --no-watch)    NO_WATCH=1 ;;
    -h|--help)
      sed -n '2,30p' "$0"; exit 0 ;;
    *) MSG="$arg" ;;
  esac
done

# ─── Pre-flight ──────────────────────────────────────────────────────────────
# Detect environment + locate gh.
# If we're sitting on the VPS (no gh, but the deploy script is here), short-
# circuit into a direct "git pull + docker compose up" run — no GitHub Actions
# round-trip needed. That makes `bash scripts/sync.sh` work both on your
# laptop AND inside the VPS shell.
if [[ -x /opt/synergy/scripts/deploy-host.sh && ! -d "$ROOT/apps/web/src" || ! -w "$ROOT" ]]; then
  : # fall through to gh check below
fi

if ! command -v gh >/dev/null 2>&1; then
  # Try common Windows install paths (PATH may be missing in nested shells)
  for cand in \
    "/c/Program Files/GitHub CLI/gh.exe" \
    "/c/Program Files (x86)/GitHub CLI/gh.exe" \
    "$HOME/AppData/Local/Programs/GitHub CLI/gh.exe" \
    "$HOME/scoop/apps/gh/current/bin/gh.exe"; do
    if [[ -x "$cand" ]]; then
      PATH="$(dirname "$cand"):$PATH"
      ok "found gh at $cand"
      break
    fi
  done
fi

if ! command -v gh >/dev/null 2>&1; then
  # No gh anywhere. If we're on the VPS (deploy-host.sh present), do the
  # local equivalent: git pull + docker compose up.
  if [[ -x /opt/synergy/scripts/deploy-host.sh ]]; then
    log "no gh CLI here, but /opt/synergy/scripts/deploy-host.sh exists — running it directly"
    exec sudo -u deploy bash /opt/synergy/scripts/deploy-host.sh
  fi
  die "gh CLI not found in PATH or standard locations.
       Install it from https://cli.github.com/, then 'gh auth login'.
       (Or run this script on the VPS and it will use deploy-host.sh.)"
fi

gh auth status >/dev/null 2>&1 || die "run 'gh auth login' first"

branch=$(git rev-parse --abbrev-ref HEAD)
[[ "$branch" == "main" ]] || warn "you're on '$branch', not main — pushing will deploy from this branch only if the workflow allows it"

# ─── --deploy-only short-circuit ─────────────────────────────────────────────
if (( DEPLOY_ONLY )); then
  log "Triggering Deploy workflow without pushing"
  run_url=$(gh workflow run deploy.yml --repo "$REPO_NWO" --ref "$branch" 2>&1 | tail -1)
  ok "$run_url"
  if (( ! NO_WATCH )); then
    sleep 4
    run_id=$(gh run list --repo "$REPO_NWO" --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
    gh run watch "$run_id" --repo "$REPO_NWO" --exit-status
  fi
  exit 0
fi

# ─── Show + guard the working tree ───────────────────────────────────────────
mapfile -t changed < <(git status --porcelain)
if [[ ${#changed[@]} -eq 0 ]]; then
  warn "no local changes — nothing to commit. Use --deploy-only to redeploy current main."
  exit 0
fi

# Block dangerous additions
declare -a blocked=()
for line in "${changed[@]}"; do
  path=$(echo "$line" | awk '{print $2}')
  case "$path" in
    .env|.env.*|*.pem|*.key|*.pfx|*/secrets/*|.data/*) blocked+=("$path") ;;
  esac
  # Block files >= 5 MB
  if [[ -f "$path" ]]; then
    size=$(stat -c %s "$path" 2>/dev/null || stat -f %z "$path" 2>/dev/null || echo 0)
    if (( size > 5000000 )); then
      blocked+=("$path  ($((size / 1024 / 1024)) MB — too large)")
    fi
  fi
done
if (( ${#blocked[@]} )); then
  warn "the following files would be committed but look risky — rejected:"
  printf "    %s\n" "${blocked[@]}"
  die "remove or .gitignore these files first, then re-run"
fi

log "Changes to commit:"
git status --short

# ─── Commit message ──────────────────────────────────────────────────────────
# If no message was passed, auto-generate one from the changed files +
# timestamp so the script is fully zero-input. Pass a custom message any
# time you want a more meaningful commit.
if [[ -z "$MSG" ]]; then
  # Build a hint from up to 3 changed paths
  hint=$(printf '%s\n' "${changed[@]}" \
    | awk '{print $NF}' \
    | xargs -n1 basename 2>/dev/null \
    | head -3 | paste -sd, -)
  ts=$(date '+%Y-%m-%d %H:%M')
  MSG="chore: sync ${ts}${hint:+ — ${hint}}"
  ok "auto commit message: $MSG"
fi

# ─── Stage / commit / push ───────────────────────────────────────────────────
log "Staging + committing"
git add -A
git commit -m "$MSG" || warn "commit declined (maybe pre-commit hook?)"

log "Pushing to origin/$branch"
git push origin "$branch"
sha=$(git rev-parse --short HEAD)
ok "pushed $sha"

# ─── Watch deploy ────────────────────────────────────────────────────────────
if (( NO_WATCH )); then
  ok "skipping watch (per --no-watch). Track at: https://github.com/$REPO_NWO/actions"
  exit 0
fi

log "Waiting for GitHub Actions to pick up the push…"
run_id=""
for _ in $(seq 1 30); do
  run_id=$(gh run list --repo "$REPO_NWO" --workflow=deploy.yml --limit 1 \
    --json headSha,databaseId -q ".[] | select(.headSha == \"$(git rev-parse HEAD)\") | .databaseId" || true)
  [[ -n "$run_id" ]] && break
  sleep 2
done
[[ -n "$run_id" ]] || die "deploy run for $sha didn't appear after 60s — check Actions tab"

log "Watching run #$run_id"
gh run watch "$run_id" --repo "$REPO_NWO" --exit-status

# ─── Smoke test ──────────────────────────────────────────────────────────────
log "Smoke-testing live URLs"
sleep 3
for url in "${SITE_URLS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url/" || echo 000)
  if [[ "$code" =~ ^[23] ]]; then
    ok "$url → $code"
  else
    warn "$url → $code (may need a moment after restart)"
  fi
done

ok "done"
