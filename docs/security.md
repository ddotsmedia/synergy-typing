# Security — Synergy Typing Services

> Typing centres handle Emirates IDs, passports, labour contracts, tenancy, and medical documents. Security posture is non-negotiable from day 1.

---

## 1. Document handling policy

- **Storage:** Cloudflare R2, private bucket, AES-256 at rest (R2 default).
- **Access:** server-signed URLs only. URLs expire in ≤ 5 minutes for previews, ≤ 60 minutes for downloads. No public links.
- **Transport:** HTTPS only. HSTS enabled on production domain.
- **Upload pipeline:**
  1. Client requests a pre-signed PUT URL from the server (server validates user + application state + Zod schema).
  2. Client uploads directly to R2.
  3. Server records `{r2Key, sha256, mime, size, uploaderId}` in `document`.
  4. Virus scan hook (Cloudflare Workers / Lambda) queued via Inngest. On failure → `status = REJECTED`, object purged.
- **Previews:** watermarked server-side with `{applicationId, timestamp}` before rendering. Raw originals never ship to the browser.
- **Retention:** see §5.
- **Thumbnails / OCR artifacts:** stored with the same policy as originals.

---

## 2. PII redaction rules

PII we touch: name, Emirates ID number, passport number, DOB, nationality, phone, email, home address, employer, sponsor details, salary, medical data.

Rules:
- **Logs:** never log full Emirates ID, passport, or DOB. Use a `redactPII()` helper before `console.*`, Sentry, PostHog, or any transport. Hash (HMAC-SHA256 with server secret) when cross-referencing in logs.
- **URLs:** never put PII in query strings or path segments. Use opaque UUIDs for resource IDs.
- **Display:** Emirates ID masked as `784-XXXX-XXXXXXX-X` except on the verified owner's own account page and in the admin document viewer (role-gated, audit-logged).
- **Error messages:** generic, no field echo. "That didn't work" — not "invalid Emirates ID 784-1990-1234567-8".
- **Clipboard:** customer account page supports "copy masked" vs "copy full" — the full variant writes a short-lived entry to the audit log.

---

## 3. Secrets management

- **Never** commit secrets. `.env.example` is the only env file tracked in git.
- Local dev: `.env.local` (gitignored).
- Production: Vercel env vars (preview, production scoped separately).
- Rotation:
  - `AUTH_SECRET`, `ANTHROPIC_API_KEY`, Stripe keys: every 90 days or on any suspected leak.
  - R2 keys: every 180 days.
  - Webhook signing secrets (Stripe, Inngest, WhatsApp): rotate on change.
- **Never paste secrets into chat.** CI reads from GitHub Actions secrets; Vercel pulls its own.

---

## 4. Audit log scope

Every admin mutation and every sensitive customer action writes to `audit_log` with:

- `actorId` (nullable for system)
- `action` (e.g., `application.transition`, `document.verify`, `user.role_change`)
- `entity`, `entityId`
- `before` / `after` (JSON, PII-redacted snapshots)
- `ipHash`, `userAgentHash` (HMAC'd, not raw)
- `at` (UTC)

**Always logged:**
- Role changes, user creation/deletion
- Application state transitions
- Document verification / rejection / purge
- Service/fee catalogue edits
- Accessing a customer's full (unmasked) Emirates ID or passport
- Failed login attempts (after 3 in 10 min)
- Refunds, invoice voids

Audit log is append-only at the app layer. A scheduled Inngest job ships a daily digest to cold storage.

---

## 5. Retention windows

| Data | Retention | Rationale |
| --- | --- | --- |
| Draft application + attached docs | 30 days after last edit | Abandoned carts; auto-purge |
| Completed application + docs | 7 years | UAE FTA + typing-centre record-keeping norms |
| Rejected / cancelled application docs | 90 days | Customer re-submission window |
| AI prompt cache | 24 h (or 1 h for chat) | Cost + drift; never PII cached |
| Session tokens | 30 days idle / 90 days absolute | Auth.js defaults hardened |
| Logs (non-audit) | 30 days | Operational debugging |
| Audit log | 7 years + cold archive | Compliance |
| Email / WhatsApp outbound content | 2 years | Dispute resolution |

Purge is idempotent, scheduled via Inngest, and produces a summary audit entry.

---

## 6. Application-layer controls

- **Zod validation on every boundary** — route handler input, tRPC procedure input, AI tool arguments, webhook payloads. Reject unknown keys.
- **CSRF:** Auth.js handles session cookies; state-changing routes require same-origin + double-submit token.
- **Rate limiting:** Upstash Ratelimit on:
  - Public endpoints: 60 req/min/IP
  - AI endpoints: 10 req/min/user, 30/min/IP
  - Auth endpoints: 5 req/min/IP
- **Uploads:** mime allowlist (`pdf`, `png`, `jpg`, `jpeg`, `webp`, `heic`), size cap 10 MB per file, 30 MB per application.
- **Headers:** CSP (no inline script except nonced), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` locked down, `X-Content-Type-Options: nosniff`.
- **Dependency hygiene:** `pnpm audit` on CI; Dependabot on.
- **Kill switches:** `AI_KILL_SWITCH=true` disables all LLM calls instantly; a `PAYMENTS_KILL_SWITCH` can halt checkout (manual card/cash only).

---

## 7. Threat-model watchlist (to refine in Phase 1)

- Prompt injection via uploaded PDFs / OCR'd text → filter + never execute tool calls from document text.
- Credential stuffing on `/sign-in` → email magic link + rate limit + IP reputation.
- Voucher/fee tampering → all pricing server-computed from `service_id`, never trusted from the client.
- Webhook replay (Stripe, Inngest) → signature + timestamp window.
- Account takeover via email compromise → sensitive actions (role change, document download) require fresh re-auth (< 5 min).
