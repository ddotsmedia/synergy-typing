#!/usr/bin/env bash
# ┌──────────────────────────────────────────────────────────────────────────┐
# │  Synergy Typing — full single-shot installer for a multi-site Docker VPS │
# │  Run as root on Ubuntu 22.04 / 24.04. Idempotent — safe to re-run.       │
# │                                                                          │
# │  curl -fsSL https://raw.githubusercontent.com/ddotsmedia/synergy-typing/main/scripts/full-deploy.sh | sudo bash
# └──────────────────────────────────────────────────────────────────────────┘
#
# What this script does (in order):
#
#   1. Sanity checks: OS, root, disk, ports.
#   2. Detects existing host nginx and the domains it currently serves.
#   3. Backs up nginx config to /root/nginx-backup-<timestamp>/ then rewrites
#      every site to listen ONLY on 127.0.0.1:8080 (Traefik will take 80/443
#      and proxy back to nginx for the legacy hosts).
#   4. Installs Docker Engine + compose plugin + UFW.
#   5. Creates the shared `web` Docker network.
#   6. Clones (or fast-forwards) this repo to /opt/synergy.
#   7. Installs the central Traefik proxy at /opt/proxy with a generated
#      dynamic config that preserves the legacy hosts.
#   8. Writes /opt/synergy/.env with DOMAIN_WEB / DOMAIN_ADMIN.
#   9. Brings up Traefik, then Synergy. Waits for both apps to report healthy.
#  10. Prints final status + how to add GitHub Actions auto-deploy.
#
# Inputs (set as env vars before running, or the script will prompt):
#   DOMAIN_WEB           hostname for apps/web                e.g. milestonm.ae
#   DOMAIN_ADMIN         hostname for apps/admin              e.g. admin.milestonm.ae
#   LETSENCRYPT_EMAIL    Let's Encrypt notification address   e.g. info@milestonm.ae
#   PRESERVE_HOSTS       comma-separated extra hostnames to keep on the legacy
#                        nginx (auto-detected; set explicitly to override).
#                        Example: "ddotsmediajobs.com,www.ddotsmediajobs.com"

set -euo pipefail

# ─── Pretty output ────────────────────────────────────────────────────────────
log()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

[[ "$EUID" -eq 0 ]] || die "Run as root: sudo bash $0"

# ─── Defaults ────────────────────────────────────────────────────────────────
REPO_URL="${REPO_URL:-https://github.com/ddotsmedia/synergy-typing.git}"
APP_DIR="${APP_DIR:-/opt/synergy}"
PROXY_DIR="${PROXY_DIR:-/opt/proxy}"
BRANCH="${BRANCH:-main}"
TS="$(date +%Y%m%d-%H%M%S)"
NGINX_BACKUP="/root/nginx-backup-$TS"

# ─── 1. Sanity checks ────────────────────────────────────────────────────────
log "Sanity checks"

source /etc/os-release 2>/dev/null || true
[[ "${ID:-}" == "ubuntu" ]] || warn "OS '$ID' is not ubuntu — script tested on 22.04/24.04 only."
free_kb=$(df --output=avail -k / | tail -n1)
# Note: bash arithmetic doesn't accept '_' as a digit separator (Python/JS only).
(( free_kb > 2000000 )) || die "Less than ~2 GB free on / — free up space and retry."
ok "OS=$ID $VERSION_ID; free disk: $((free_kb / 1024)) MB"

# Tooling we rely on later (jq for healthcheck polling, dig for DNS sanity,
# git for the repo clone). Pre-installing here so the script doesn't error
# out later if Docker is already present and the per-step apt install was
# skipped.
log "Ensuring base tooling (jq dnsutils curl ca-certificates git ufw)"
DEBIAN_FRONTEND=noninteractive apt-get update -y >/dev/null 2>&1 || true
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  jq dnsutils curl ca-certificates git ufw >/dev/null 2>&1 \
  || warn "apt couldn't install all tooling — continuing, may need manual fix later."

# ─── 2. Inputs ───────────────────────────────────────────────────────────────
prompt() {
  local var="$1" default="$2" answer
  if [[ -z "${!var:-}" ]]; then
    if [[ -t 0 ]]; then
      read -r -p "$3 [$default]: " answer
    else
      answer=""
    fi
    eval "$var=\"\${answer:-\$default}\""
  fi
}

prompt DOMAIN_WEB         "milestonm.ae"           "Customer-facing domain (DOMAIN_WEB)"
prompt DOMAIN_ADMIN       "admin.${DOMAIN_WEB}"    "Admin domain (DOMAIN_ADMIN)"
prompt LETSENCRYPT_EMAIL  "info@${DOMAIN_WEB}"     "Let's Encrypt email"

ok "DOMAIN_WEB=$DOMAIN_WEB · DOMAIN_ADMIN=$DOMAIN_ADMIN · email=$LETSENCRYPT_EMAIL"

# ─── 3. Detect & migrate existing host nginx ─────────────────────────────────
LEGACY_HOSTS=()
if systemctl is-active --quiet nginx 2>/dev/null; then
  log "Existing host nginx found — analysing its sites"
  mkdir -p "$NGINX_BACKUP"
  cp -a /etc/nginx "$NGINX_BACKUP/etc-nginx"
  ok "Backup → $NGINX_BACKUP"

  # Use 'nginx -T' to dump the live, fully-included config and parse server_names.
  mapfile -t found_hosts < <(
    nginx -T 2>/dev/null \
      | awk '/^[[:space:]]*server_name[[:space:]]/' \
      | sed -E 's/^[[:space:]]*server_name[[:space:]]+//; s/;.*$//' \
      | tr ' ' '\n' \
      | grep -E '^[A-Za-z0-9._-]+$' \
      | grep -v -F -e "$DOMAIN_WEB" -e "$DOMAIN_ADMIN" -e '_' \
      | sort -u
  )
  if (( ${#found_hosts[@]} )); then
    LEGACY_HOSTS=("${found_hosts[@]}")
    ok "Detected legacy hosts: ${LEGACY_HOSTS[*]}"
  else
    warn "No legacy server_names found in nginx — disabling nginx instead."
  fi

  if [[ -n "${PRESERVE_HOSTS:-}" ]]; then
    IFS=',' read -ra extra <<< "$PRESERVE_HOSTS"
    LEGACY_HOSTS+=("${extra[@]}")
    LEGACY_HOSTS=($(printf '%s\n' "${LEGACY_HOSTS[@]}" | sort -u))
    ok "Adding PRESERVE_HOSTS: ${extra[*]}"
  fi

  if (( ${#LEGACY_HOSTS[@]} )); then
    log "Rewriting nginx to listen on 127.0.0.1:8080 (Traefik will take 80/443)"
    # Replace external listens with localhost-only HTTP. Drop SSL listens
    # entirely — Traefik terminates TLS for these hosts going forward.
    for f in $(find /etc/nginx/sites-enabled /etc/nginx/conf.d \
        -maxdepth 2 -type f \( -name '*.conf' -o ! -name '*.*' \) 2>/dev/null); do
      sed -i \
        -e 's/^\([[:space:]]*\)listen[[:space:]]\+\[::\]:443[^;]*;/\1# (disabled by full-deploy) &/' \
        -e 's/^\([[:space:]]*\)listen[[:space:]]\+443[^;]*;/\1# (disabled by full-deploy) &/' \
        -e 's/^\([[:space:]]*\)listen[[:space:]]\+\[::\]:80[^;]*;/\1listen 127.0.0.1:8080;/' \
        -e 's/^\([[:space:]]*\)listen[[:space:]]\+80[^;]*;/\1listen 127.0.0.1:8080;/' \
        "$f"
    done
    if nginx -t 2>&1 | tail -2 | grep -q 'syntax is ok'; then
      systemctl reload nginx
      ok "Host nginx now listens on 127.0.0.1:8080 only"
    else
      warn "nginx -t failed after edits — restoring backup"
      rm -rf /etc/nginx
      cp -a "$NGINX_BACKUP/etc-nginx" /etc/nginx
      systemctl reload nginx || true
      die "nginx config edit failed; original restored. Inspect $NGINX_BACKUP and re-run."
    fi
  else
    log "Stopping & disabling nginx (no hosts to preserve)"
    systemctl stop nginx || true
    systemctl disable nginx || true
    ok "nginx stopped"
  fi
else
  ok "No host nginx running — nothing to migrate"
fi

# ─── 4. Free 80/443 ──────────────────────────────────────────────────────────
busy_80=$(ss -tnlp '( sport = :80 )'  2>/dev/null | tail -n +2 || true)
busy_443=$(ss -tnlp '( sport = :443 )' 2>/dev/null | tail -n +2 || true)
if [[ -n "$busy_80" || -n "$busy_443" ]]; then
  echo "$busy_80$busy_443" >&2
  die "Ports 80/443 are still in use after the migration. Inspect the output above and re-run."
fi
ok "Ports 80 and 443 are free"

# ─── 5. Docker + UFW ─────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine"
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release ufw git jq
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi
ok "Docker: $(docker --version)"

log "Configuring UFW (22 / 80 / 443)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
yes | ufw enable >/dev/null || true
ok "UFW: $(ufw status | head -1)"

# ─── 6. Shared `web` network ─────────────────────────────────────────────────
docker network inspect web >/dev/null 2>&1 || docker network create web >/dev/null
ok "Network 'web' ready"

# ─── 7. Repo ─────────────────────────────────────────────────────────────────
if [[ ! -d "$APP_DIR/.git" ]]; then
  log "Cloning $REPO_URL → $APP_DIR"
  mkdir -p "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  log "Repo present — fast-forwarding $BRANCH"
  git -C "$APP_DIR" fetch --all --prune
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
fi
ok "At $(git -C "$APP_DIR" rev-parse --short HEAD): $(git -C "$APP_DIR" log -1 --pretty=%s)"

# ─── 8. Proxy stack files ────────────────────────────────────────────────────
mkdir -p "$PROXY_DIR/dynamic"
cp -f "$APP_DIR/infra/proxy/docker-compose.yml" "$PROXY_DIR/docker-compose.yml"

cat > "$PROXY_DIR/.env" <<EOF
LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL
PROXY_PING_HOST=traefik.invalid
EOF
chmod 600 "$PROXY_DIR/.env"

if (( ${#LEGACY_HOSTS[@]} )); then
  log "Generating Traefik file provider for legacy hosts"
  rule="$(printf 'Host(`%s`) || ' "${LEGACY_HOSTS[@]}")"
  rule="${rule%% || }"   # drop trailing ' || '
  cat > "$PROXY_DIR/dynamic/legacy-nginx.yml" <<EOF
# Auto-generated by scripts/full-deploy.sh on $TS
http:
  routers:
    legacy-nginx:
      rule: "$rule"
      entryPoints: [websecure]
      service: legacy-nginx
      tls:
        certResolver: le
  services:
    legacy-nginx:
      loadBalancer:
        servers:
          - url: http://host.docker.internal:8080
        passHostHeader: true
EOF
  ok "Legacy router → ${LEGACY_HOSTS[*]}"
else
  rm -f "$PROXY_DIR/dynamic/legacy-nginx.yml"
fi

# ─── 9. Site .env ────────────────────────────────────────────────────────────
cat > "$APP_DIR/.env" <<EOF
DOMAIN_WEB=$DOMAIN_WEB
DOMAIN_ADMIN=$DOMAIN_ADMIN
EOF
chmod 600 "$APP_DIR/.env"
ok "Site env at $APP_DIR/.env"

# ─── 10. Deploy user ─────────────────────────────────────────────────────────
if ! id -u synergy >/dev/null 2>&1; then
  useradd --system --shell /bin/bash --home-dir "$APP_DIR" synergy
fi
usermod -aG docker synergy
chown -R synergy:synergy "$APP_DIR" "$PROXY_DIR"
ok "Deploy user 'synergy' ready"

# ─── 11. Bring up Traefik ────────────────────────────────────────────────────
log "Starting Traefik"
( cd "$PROXY_DIR" && docker compose up -d --remove-orphans )
sleep 3
docker compose -f "$PROXY_DIR/docker-compose.yml" ps

# ─── 12. Bring up Synergy ────────────────────────────────────────────────────
log "Building & starting Synergy site (this takes 2–4 min on first run)"
( cd "$APP_DIR" && docker compose build --pull && docker compose up -d --remove-orphans )

log "Waiting for healthchecks"
ok_count=0
for _ in $(seq 1 60); do
  ok_count=$(docker compose -f "$APP_DIR/docker-compose.yml" ps --format json \
    | jq -r 'select(.Health=="healthy")|.Name' | wc -l)
  (( ok_count >= 2 )) && break
  sleep 5
done
docker compose -f "$APP_DIR/docker-compose.yml" ps

if (( ok_count < 2 )); then
  warn "Containers haven't reported healthy in 5 minutes — tail logs:"
  echo "  docker compose -f $APP_DIR/docker-compose.yml logs --tail=80"
else
  ok "Synergy containers healthy"
fi

# ─── 13. Quick smoke (DNS-dependent) ─────────────────────────────────────────
ip=$(curl -sS --max-time 4 https://api.ipify.org 2>/dev/null || echo unknown)
log "Checks"
for h in "$DOMAIN_WEB" "$DOMAIN_ADMIN" "${LEGACY_HOSTS[@]}"; do
  [[ -z "$h" ]] && continue
  resolved=$(dig +short "$h" @1.1.1.1 2>/dev/null | head -1)
  if [[ -z "$resolved" ]]; then
    warn "DNS for $h not yet resolved — add an A record → $ip and wait a few minutes."
  elif [[ "$resolved" != "$ip" && "$ip" != unknown ]]; then
    warn "DNS for $h points to $resolved (expected $ip)."
  else
    ok "DNS for $h → $resolved"
  fi
done

# ─── 14. Final ──────────────────────────────────────────────────────────────
cat <<EOF

──────────────────────────────────────────────────────────────────────────────
✓ Stack is up.

Your VPS is now hosting:
  • https://$DOMAIN_WEB        (apps/web)
  • https://$DOMAIN_ADMIN      (apps/admin)
EOF

if (( ${#LEGACY_HOSTS[@]} )); then
  for h in "${LEGACY_HOSTS[@]}"; do
    echo "  • https://$h            (legacy host nginx via Traefik)"
  done
fi

cat <<EOF

Watch Let's Encrypt issue certs:
  docker compose -f $PROXY_DIR/docker-compose.yml logs -f traefik

If a host doesn't load yet, double-check its DNS A record points to:
  $ip

Auto-deploy on git push:
  ssh-keygen -t ed25519 -C github-actions-deploy -f ~/synergy-deploy -N ""
  cat ~/synergy-deploy.pub >> /home/synergy/.ssh/authorized_keys   # (this VPS)
  gh secret set VPS_HOST    --body "$ip"        --repo ddotsmedia/synergy-typing
  gh secret set VPS_USER    --body "synergy"    --repo ddotsmedia/synergy-typing
  gh secret set VPS_SSH_KEY < ~/synergy-deploy

Original nginx backed up at:
  $NGINX_BACKUP

Re-run this script any time — it's idempotent.
──────────────────────────────────────────────────────────────────────────────
EOF
