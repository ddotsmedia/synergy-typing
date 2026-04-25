# Deploying Synergy Typing — multi-site VPS with shared Traefik

This repo deploys to a VPS that already hosts (or will host) **multiple
Docker-based sites** behind a single Traefik reverse proxy. The proxy lives
in `infra/proxy/` and runs once per VPS; every site (Synergy and any future
sites) joins the shared `web` Docker network and declares Traefik labels.

```
internet
   ↓ 80 / 443
┌──────────────────────────────────────┐
│  Traefik (one container per VPS)    │  ← /opt/proxy/docker-compose.yml
│  • auto Let's Encrypt for all hosts │
│  • reads Docker labels for routes   │
└─────────┬──────────────┬─────────────┘
          ↓              ↓
   synergy-web      synergy-admin   (this repo's docker-compose.yml)
          ↓              ↓
            shared `synergy-data` volume
```

Adding a future site is two lines: a new compose file with `networks: [web]`
and `traefik.http.routers.<name>.rule=Host(`x.com`)`. No port juggling, no
extra cert management.

---

## 0 · Where you are

You already have:

- **VPS** `194.164.151.202` (Ubuntu, Hostinger)
- **Domain** `milestonm.ae` (Hostinger DNS, nameservers configured)
- **Repo** <https://github.com/ddotsmedia/synergy-typing> (synced)

You may also have:

- **An existing site** on the VPS — at least an nginx serving
  `ddotsmediajobs.com` was responding when we probed it. **Decide what to do
  with it before continuing** (see [Existing nginx](#1--existing-nginx-on-the-vps)).

---

## 1 · Existing nginx on the VPS

Traefik will need to bind ports 80 and 443. The provision script aborts if
either is busy. Pick one of the three before continuing:

| Path                           | Action                                                                                                     | When to choose                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Migrate**                    | Move `ddotsmediajobs.com` into Docker behind the same Traefik (any container with the right labels works). | You want long-term consistency.                                |
| **Stop & disable**             | `systemctl stop nginx && systemctl disable nginx`. The site goes offline.                                  | The other site is being retired or moved elsewhere.            |
| **Coexist on different ports** | Move host nginx to an internal port (8080/8443) and have Traefik proxy to it as just another upstream.     | Short-term, you don't want to dockerise the existing site yet. |

`systemctl stop nginx && systemctl disable nginx` is the simplest if you're
sure. The provision script tells you exactly what's listening when it aborts.

---

## 2 · Bootstrap the VPS (once per machine)

SSH in as root and run:

```bash
ssh root@194.164.151.202
curl -fsSL https://raw.githubusercontent.com/ddotsmedia/synergy-typing/main/scripts/provision-vps.sh | sudo bash
```

The script will:

1. Install Docker Engine + compose plugin
2. Open UFW for 22 / 80 / 443
3. Create the shared `web` Docker network
4. Install the central Traefik stack at `/opt/proxy/`
5. Clone this repo to `/opt/synergy/` and create a `synergy` deploy user
6. Print the next steps

It refuses to continue if 80 or 443 are already in use, surfacing what to do.

---

## 3 · Start Traefik (once per machine)

Edit the proxy's `.env` to set your Let's Encrypt email:

```bash
nano /opt/proxy/.env
```

```env
LETSENCRYPT_EMAIL=info@milestonm.ae
```

Start the proxy:

```bash
cd /opt/proxy && docker compose up -d
docker compose logs -f traefik   # Ctrl-C to leave running
```

Traefik is now listening on 80/443 and will automatically discover any
container that joins the `web` network with the right labels.

---

## 4 · Configure & deploy this site

Edit Synergy's `.env`:

```bash
nano /opt/synergy/.env
```

```env
DOMAIN_WEB=milestonm.ae
DOMAIN_ADMIN=admin.milestonm.ae
```

Add DNS A records at Hostinger (hPanel → Domains → DNS / Nameservers):

| Type | Name    | Value             |
| ---- | ------- | ----------------- |
| A    | `@`     | `194.164.151.202` |
| A    | `admin` | `194.164.151.202` |

Wait until DNS resolves:

```bash
dig +short milestonm.ae
dig +short admin.milestonm.ae
# both should return 194.164.151.202
```

Then deploy:

```bash
sudo -u synergy bash /opt/synergy/scripts/deploy.sh
```

Visit `https://milestonm.ae`. Traefik will issue a Let's Encrypt cert on the
first request — give it ~10 seconds. If something looks wrong, check:

```bash
docker compose -f /opt/synergy/docker-compose.yml ps
docker compose -f /opt/proxy/docker-compose.yml logs -f traefik
```

---

## 5 · Wire GitHub Actions for auto-deploy

On your laptop:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/synergy-deploy -N ""
```

Authorise the public key on the VPS:

```bash
ssh root@194.164.151.202 \
  "mkdir -p /home/synergy/.ssh && \
   echo '$(cat ~/synergy-deploy.pub)' >> /home/synergy/.ssh/authorized_keys && \
   chown -R synergy:synergy /home/synergy/.ssh && \
   chmod 700 /home/synergy/.ssh && \
   chmod 600 /home/synergy/.ssh/authorized_keys"
```

Add the secrets to GitHub:

```bash
gh secret set VPS_HOST    --body "194.164.151.202" --repo ddotsmedia/synergy-typing
gh secret set VPS_USER    --body "synergy"         --repo ddotsmedia/synergy-typing
gh secret set VPS_SSH_KEY < ~/synergy-deploy       # private key, not .pub
```

Done. Every push to `main` triggers the **Deploy** workflow at
<https://github.com/ddotsmedia/synergy-typing/actions>.

---

## Adding another Docker site to this VPS

Pattern repeats for every site. Inside that other repo's `docker-compose.yml`:

```yaml
services:
  app:
    image: my-other-site:latest
    restart: unless-stopped
    networks: [web]
    expose: ['3000']
    labels:
      - traefik.enable=true
      - traefik.docker.network=web
      - traefik.http.routers.othersite.rule=Host(`other.com`)
      - traefik.http.routers.othersite.entrypoints=websecure
      - traefik.http.routers.othersite.tls.certresolver=le
      - traefik.http.services.othersite.loadbalancer.server.port=3000

networks:
  web:
    external: true
```

`docker compose up -d` and Traefik picks it up. New cert issued automatically.

---

## Operations

| Task                  | Command                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Tail proxy logs       | `docker compose -f /opt/proxy/docker-compose.yml logs -f`                                             |
| Tail Synergy logs     | `cd /opt/synergy && docker compose logs -f`                                                           |
| Restart one app       | `cd /opt/synergy && docker compose restart web`                                                       |
| Rebuild from scratch  | `cd /opt/synergy && docker compose up -d --build --force-recreate`                                    |
| Backup the JSON store | `docker compose -f /opt/synergy/docker-compose.yml cp web:/data/store.json ~/backup-$(date +%F).json` |
| Force cert renewal    | `cd /opt/proxy && docker compose restart traefik`                                                     |

---

## When STEP 2 ships Postgres

Add a `postgres` service to `docker-compose.yml`, mount a Postgres volume,
swap the `synergy-data` volume's role from "JSON store" to "uploads only",
and replace the JSON layer in `packages/db/src/store.ts` with Prisma calls.
The customer site, admin shell, Traefik routing, and deploy pipeline don't
change.
