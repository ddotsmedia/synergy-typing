#!/usr/bin/env bash
# One-shot VPS bootstrap for Ubuntu 22.04 / 24.04, designed for a multi-site
# Docker host with a shared Traefik reverse proxy.
#
# Run as root on a fresh VPS:
#   curl -fsSL https://raw.githubusercontent.com/ddotsmedia/synergy-typing/main/scripts/provision-vps.sh | sudo bash
#
# Idempotent — safe to re-run.
#
# What it does:
#   1. Installs Docker Engine + compose plugin (official Docker apt repo)
#   2. Opens UFW for 22 / 80 / 443
#   3. Creates the shared `web` Docker network (every site joins it)
#   4. Installs the central Traefik proxy at /opt/proxy and starts it
#   5. Clones this repo to /opt/synergy and creates a `synergy` deploy user
#   6. Prints the next steps (set .env files, add GitHub secrets, deploy)
#
# Optional env:
#   APP_DIR    site directory (default /opt/synergy)
#   PROXY_DIR  proxy directory (default /opt/proxy)
#   BRANCH     git branch (default main)
#   REPO_URL   override https clone URL
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ddotsmedia/synergy-typing.git}"
APP_DIR="${APP_DIR:-/opt/synergy}"
PROXY_DIR="${PROXY_DIR:-/opt/proxy}"
BRANCH="${BRANCH:-main}"

if [[ "$EUID" -ne 0 ]]; then
  echo "This script must be run as root (or via sudo)." >&2
  exit 1
fi

log()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }

# ─── Sanity: ports 80 / 443 must be free ──────────────────────────────────────
log "Checking that ports 80 and 443 are free for Traefik"
busy_80=$(ss -tnlp '( sport = :80 )'  2>/dev/null | tail -n +2 || true)
busy_443=$(ss -tnlp '( sport = :443 )' 2>/dev/null | tail -n +2 || true)
if [[ -n "$busy_80" || -n "$busy_443" ]]; then
  warn "Something is already listening on 80/443 — Traefik won't be able to bind."
  echo "$busy_80$busy_443" | head -10
  echo
  echo "Common culprit: a previously-installed nginx/apache. To stop and"
  echo "disable nginx (preserves config so you can migrate it later):"
  echo "    systemctl stop nginx && systemctl disable nginx"
  echo
  echo "Re-run this script after the ports are free. Aborting now."
  exit 1
fi

# ─── Docker ───────────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine"
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release ufw git
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  ok "Docker installed: $(docker --version)"
else
  ok "Docker already present: $(docker --version)"
fi

# ─── UFW ──────────────────────────────────────────────────────────────────────
log "Configuring UFW (allow 22 / 80 / 443)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
yes | ufw enable >/dev/null || true
ok "UFW: $(ufw status | head -1)"

# ─── Shared `web` network ─────────────────────────────────────────────────────
if ! docker network inspect web >/dev/null 2>&1; then
  log "Creating shared Docker network 'web'"
  docker network create web
fi
ok "Network 'web' ready"

# ─── Repo clone ───────────────────────────────────────────────────────────────
if [[ ! -d "$APP_DIR/.git" ]]; then
  log "Cloning $REPO_URL into $APP_DIR"
  mkdir -p "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  log "Repo present at $APP_DIR — fast-forwarding $BRANCH"
  git -C "$APP_DIR" fetch --all --prune
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
fi
ok "Repo at $(git -C "$APP_DIR" rev-parse --short HEAD)"

# ─── Central proxy stack ──────────────────────────────────────────────────────
log "Installing central Traefik proxy at $PROXY_DIR"
mkdir -p "$PROXY_DIR"
cp -n "$APP_DIR/infra/proxy/docker-compose.yml" "$PROXY_DIR/docker-compose.yml"
if [[ ! -f "$PROXY_DIR/.env" ]]; then
  cp "$APP_DIR/infra/proxy/.env.example" "$PROXY_DIR/.env"
  chmod 600 "$PROXY_DIR/.env"
  warn "Edit $PROXY_DIR/.env and set LETSENCRYPT_EMAIL before continuing."
else
  ok "Proxy .env already exists at $PROXY_DIR/.env"
fi

# ─── Deploy user ──────────────────────────────────────────────────────────────
if ! id -u synergy >/dev/null 2>&1; then
  log "Creating deploy user 'synergy'"
  useradd --system --shell /bin/bash --home-dir "$APP_DIR" synergy
fi
usermod -aG docker synergy
chown -R synergy:synergy "$APP_DIR"
chown -R synergy:synergy "$PROXY_DIR"
ok "Deploy user ready"

# ─── Site .env hint ───────────────────────────────────────────────────────────
if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  chown synergy:synergy "$APP_DIR/.env"
  warn "Created $APP_DIR/.env from template — edit it to set DOMAIN_WEB / DOMAIN_ADMIN."
fi

# ─── Final ────────────────────────────────────────────────────────────────────
cat <<EOF

──────────────────────────────────────────────────────────────────────────────
✓ VPS is provisioned for multi-site Docker hosting.

Next steps (in order):

  1) Edit the proxy email (one-time, shared by every site):
       nano $PROXY_DIR/.env
     Set LETSENCRYPT_EMAIL.

  2) Start the central proxy (one-time):
       cd $PROXY_DIR && docker compose up -d
     Confirm with:
       docker compose ps

  3) Edit this site's domains:
       nano $APP_DIR/.env
     Set DOMAIN_WEB and DOMAIN_ADMIN.

  4) Point DNS A records of DOMAIN_WEB and DOMAIN_ADMIN at this server's
     public IP. Wait until 'dig DOMAIN_WEB' returns the right answer.

  5) Deploy the site:
       sudo -u synergy bash $APP_DIR/scripts/deploy.sh

  6) Watch Traefik issue Let's Encrypt certs the first time you visit:
       cd $PROXY_DIR && docker compose logs -f traefik

To add a SECOND site later:
  • 'cd /path/to/other/site'
  • Add traefik labels + 'networks: [web]' to its docker-compose.yml
  • 'docker compose up -d' — Traefik picks it up automatically.

For automatic deploys on push to main, add these GitHub secrets:
   VPS_HOST     this server's public IP or hostname
   VPS_USER     synergy
   VPS_SSH_KEY  a private key authorised in /home/synergy/.ssh/authorized_keys
                (generate with: ssh-keygen -t ed25519 -C github-actions-deploy)
──────────────────────────────────────────────────────────────────────────────
EOF
