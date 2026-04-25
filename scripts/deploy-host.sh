#!/usr/bin/env bash
# Deploy script for the host-nginx pattern.
#
# Use on a VPS where host nginx already serves as the front door for many
# Docker apps. Pulls latest, rebuilds the synergy images, restarts the
# containers (which only bind to 127.0.0.1:3100/3101 — nginx proxies in).
#
# Run on the VPS:
#   sudo -u deploy bash /opt/synergy/scripts/deploy-host.sh
#
# Triggered automatically by .github/workflows/deploy.yml on push to main.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/synergy}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo "▶ Fetching latest $BRANCH"
git fetch --all --prune
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"
echo "✓ At $(git rev-parse --short HEAD): $(git log -1 --pretty=%s)"

echo "▶ Building images"
docker compose -f docker-compose.host.yml build --pull

echo "▶ Bringing stack up"
docker compose -f docker-compose.host.yml up -d --remove-orphans

echo "▶ Status"
docker compose -f docker-compose.host.yml ps
