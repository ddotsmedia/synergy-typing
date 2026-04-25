#!/usr/bin/env bash
# Deploy script — pulls latest, rebuilds the affected container, restarts.
# Safe to re-run; restarts only what changed when possible.
#
# Run on the VPS:
#   sudo -u synergy bash /opt/synergy/scripts/deploy.sh
#
# GitHub Actions invokes this via SSH after a push to main (see
# .github/workflows/deploy.yml).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/synergy}"
BRANCH="${BRANCH:-main}"

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()  { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }

cd "$APP_DIR"

log "Fetching latest $BRANCH"
git fetch --all --prune
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"
ok "At $(git rev-parse --short HEAD): $(git log -1 --pretty=%s)"

if [[ ! -f .env ]]; then
  echo "✗ .env missing at $APP_DIR — copy .env.example first." >&2
  exit 1
fi

log "Building images"
docker compose build --pull

log "Bringing stack up"
docker compose up -d --remove-orphans

log "Waiting for health"
sleep 5
docker compose ps

ok "Deploy complete. Tail logs with: docker compose logs -f"
