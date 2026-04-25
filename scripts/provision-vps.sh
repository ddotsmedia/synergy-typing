#!/usr/bin/env bash
# One-shot VPS bootstrap for Ubuntu 22.04 / 24.04.
# Idempotent — safe to re-run.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/scripts/provision-vps.sh | sudo bash
# OR
#   sudo bash scripts/provision-vps.sh
#
# What it does:
#   1. Installs Docker Engine + compose plugin (official Docker apt repo)
#   2. Creates /opt/synergy and clones the repo (or fast-forwards if present)
#   3. Sets up basic UFW firewall (22, 80, 443)
#   4. Creates a deploy user `synergy` if missing (no shell login, only docker)
#   5. Prints the next steps (set .env, add GitHub secrets, push to main)
#
# Required env vars (export before running, or pass inline):
#   REPO_URL  HTTPS clone URL  e.g. https://github.com/owner/synergy-typing-services.git
#
# Optional:
#   APP_DIR   default /opt/synergy
#   BRANCH    default main
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ddotsmedia/synergy-typing.git}"
APP_DIR="${APP_DIR:-/opt/synergy}"
BRANCH="${BRANCH:-main}"

if [[ "$EUID" -ne 0 ]]; then
  echo "This script must be run as root (or via sudo)." >&2
  exit 1
fi

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()  { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }

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

# ─── UFW (basic firewall) ─────────────────────────────────────────────────────
log "Configuring UFW (allow 22, 80, 443)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
yes | ufw enable >/dev/null || true
ok "UFW: $(ufw status | head -1)"

# ─── Repo ─────────────────────────────────────────────────────────────────────
if [[ ! -d "$APP_DIR/.git" ]]; then
  log "Cloning $REPO_URL into $APP_DIR"
  mkdir -p "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  log "Repo present at $APP_DIR — fetching latest $BRANCH"
  git -C "$APP_DIR" fetch --all --prune
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
fi
ok "Repo at $(git -C "$APP_DIR" rev-parse --short HEAD)"

# ─── Deploy user ──────────────────────────────────────────────────────────────
if ! id -u synergy >/dev/null 2>&1; then
  log "Creating deploy user 'synergy'"
  useradd --system --shell /bin/bash --home-dir "$APP_DIR" synergy
fi
usermod -aG docker synergy
chown -R synergy:synergy "$APP_DIR"
ok "Deploy user ready"

# ─── .env hint ────────────────────────────────────────────────────────────────
if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  log "Created $APP_DIR/.env from template — edit it now:"
  echo "    DOMAIN_WEB=your-domain.com"
  echo "    DOMAIN_ADMIN=admin.your-domain.com"
  echo "    LETSENCRYPT_EMAIL=you@your-domain.com"
  echo "  Then point both domains' A records to this server's public IP."
fi

# ─── Final ────────────────────────────────────────────────────────────────────
cat <<EOF

──────────────────────────────────────────────────────────────────────────────
✓ VPS is provisioned.

Next steps:
  1) Edit $APP_DIR/.env with your domains + email.
  2) Point DNS A records of DOMAIN_WEB and DOMAIN_ADMIN at this server's IP.
  3) Run the first deploy:
       sudo -u synergy bash $APP_DIR/scripts/deploy.sh
     or trigger it from GitHub Actions (Workflow → Deploy → Run).
  4) Caddy will auto-issue Let's Encrypt certs on first request.

For automatic deploys on push to main, add these GitHub secrets to the repo:
   VPS_HOST          this server's public IP or hostname
   VPS_USER          synergy
   VPS_SSH_KEY       a private key authorised in /home/synergy/.ssh/authorized_keys
                     (generate with: ssh-keygen -t ed25519 -C github-actions-deploy)
──────────────────────────────────────────────────────────────────────────────
EOF
