# Deploying Synergy Typing to a VPS

End-to-end deploy in **5 steps**. After step 5, every push to `main` redeploys
automatically. The stack uses Docker, Caddy (auto-SSL), and a JSON-backed store
mounted as a Docker volume.

```
your-domain.com         →  Caddy (80/443) → web:3000   (apps/web)
admin.your-domain.com   →  Caddy (80/443) → admin:3000 (apps/admin)
```

---

## 1 · Rent a VPS

Anything ≥ 1 GB RAM with Ubuntu 22.04 or 24.04 is enough for Phase 1.
Cheap-and-good options: Hetzner CX22 (€4 / mo), DigitalOcean basic ($6 / mo),
Vultr regular ($6 / mo). Pick a region near Abu Dhabi for low latency
(Bahrain, Dubai, India).

After provisioning you should have:

- a **public IPv4 address**
- root SSH access (or sudo on a non-root user)

---

## 2 · Point DNS at the VPS

In your domain registrar, add two `A` records:

| Host                         | Type | Value         |
| ---------------------------- | ---- | ------------- |
| `@` (or `synergytyping.com`) | A    | _your VPS IP_ |
| `admin`                      | A    | _your VPS IP_ |

Wait ~5 min for propagation (`dig synergytyping.com` should return your IP).

---

## 3 · Bootstrap the VPS (once)

SSH in as root and run the bootstrap script. It installs Docker, opens the
firewall, clones the repo, and creates a `synergy` deploy user.

```bash
ssh root@YOUR_VPS_IP
curl -fsSL https://raw.githubusercontent.com/ddotsmediahosting-glitch/synergy-typing-services/main/scripts/provision-vps.sh | sudo bash
```

When it finishes, edit `/opt/synergy/.env`:

```env
DOMAIN_WEB=synergytyping.com
DOMAIN_ADMIN=admin.synergytyping.com
LETSENCRYPT_EMAIL=info@synergytyping.com
```

Then run the first deploy by hand:

```bash
sudo -u synergy bash /opt/synergy/scripts/deploy.sh
```

Caddy will issue Let's Encrypt certs on the first HTTPS request. Open both
URLs in a browser to confirm.

---

## 4 · Wire GitHub Actions for auto-deploy

Generate a deploy SSH key on your laptop (or any machine with `ssh-keygen`):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/synergy-deploy -N ""
```

Authorise the public key on the VPS:

```bash
ssh root@YOUR_VPS_IP \
  "mkdir -p /home/synergy/.ssh && \
   echo '$(cat ~/synergy-deploy.pub)' >> /home/synergy/.ssh/authorized_keys && \
   chown -R synergy:synergy /home/synergy/.ssh && \
   chmod 700 /home/synergy/.ssh && \
   chmod 600 /home/synergy/.ssh/authorized_keys"
```

Add **3 secrets** to the GitHub repo
(<https://github.com/ddotsmediahosting-glitch/synergy-typing-services/settings/secrets/actions>):

| Secret        | Value                                                         |
| ------------- | ------------------------------------------------------------- |
| `VPS_HOST`    | your VPS public IP or hostname                                |
| `VPS_USER`    | `synergy`                                                     |
| `VPS_SSH_KEY` | _entire contents of `~/synergy-deploy` (the **private** key)_ |

(One-liners with the `gh` CLI:)

```bash
gh secret set VPS_HOST    --body "203.0.113.42"
gh secret set VPS_USER    --body "synergy"
gh secret set VPS_SSH_KEY < ~/synergy-deploy
```

---

## 5 · Push and watch it deploy

```bash
git push origin main
```

Watch the run in real time:
<https://github.com/ddotsmediahosting-glitch/synergy-typing-services/actions>

You can also trigger a deploy on demand from the **Actions** tab → **Deploy** →
**Run workflow**.

---

## What happens on every push to `main`

1. **Deploy** workflow opens an SSH session to `synergy@VPS_HOST`.
2. The VPS `git pull`s the new commit.
3. `docker compose build --pull` rebuilds only the changed service.
4. `docker compose up -d` recreates affected containers; healthy ones drain
   gracefully.
5. Caddy keeps serving traffic the entire time (no downtime for static
   pages, ~2 s for dynamic during the swap).

The JSON store at `/var/lib/docker/volumes/synergy_synergy-data/_data/store.json`
**persists across rebuilds** — no data loss on deploy.

---

## Operating the live stack

| Task                             | Command                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| Tail logs                        | `docker compose logs -f`                                                                   |
| Restart one app                  | `docker compose restart web`                                                               |
| Rebuild from scratch             | `docker compose up -d --build --force-recreate`                                            |
| Backup the data                  | `docker compose cp web:/data/store.json ~/backup-$(date +%F).json`                         |
| Restore data                     | `docker compose cp ~/backup.json web:/data/store.json && docker compose restart web admin` |
| Renew certs (auto, but manually) | `docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile`                     |

---

## When STEP 2 ships Postgres

Add a `postgres` service to `docker-compose.yml`, replace the `synergy-data`
volume with a Postgres volume + connection string, and the JSON store layer
in `packages/db/src/store.ts` swaps for Prisma calls. The customer site, admin
shell, and deploy pipeline don't change.
