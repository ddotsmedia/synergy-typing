# Claude Code — Master prompt for Synergy Typing Services

> Paste **Section 1** into Claude Code as your first message. Then feed the follow-up prompts (Section 2) one at a time, with `/clear` between them.

---

## SECTION 0 — Rules for the operator (you)

1. One step at a time. After each step, review in localhost (EN and AR) before continuing.
2. `/clear` between steps to reset Claude Code's context.
3. Ask for plans before code: "Plan in ≤20 lines, wait for approval."
4. Use Haiku (`/model haiku`) for seed data + CRUD. Use Sonnet / Opus only for architecture, AI module, state machine, and tricky debugging.
5. If Claude Code drifts, interrupt: "Stay on `BUILD_PLAN.md`. Revert anything outside it."
6. Never let it install a paid dependency without telling you first.

---

## SECTION 1 — The master prompt (paste this first)

You are my senior full-stack engineer and technical architect. We are building a new website for **Synergy Typing Services**, a licensed typing centre in **Abu Dhabi, UAE**. The current site is `https://synergytyping.com/` — please fetch it once in your planning to pull the exact service list, phone numbers, address, and hours. If anything can't be fetched, flag it and continue with placeholders marked `TO VERIFY`.

### What a UAE typing centre does

Typing centres are the front door to UAE government e-services. This site must sell, explain, and (where possible) process applications for:

- Immigration & Residency (ICA / GDRFA): employment visa, family visa, visit visa, Golden Visa, Emirates ID new/renewal/replacement, status change.
- Labour (MOHRE / Tas'heel): work permit, labour contract, WPS, domestic helper visa, Tawjeeh.
- Company formation & PRO: mainland / freezone trade licence, renewal, CoC, corporate sponsorship, PRO.
- Transport (ADP / ITC): driving licence, Mulkiya, traffic file, plate reservation.
- Real estate (TAMM / ADM): Tawtheeq tenancy registration, ADDC utilities, completion certificate.
- Attestation & translation: MOFA, MOE, embassy, legal translation AR<->EN.
- Medical & insurance: medical fitness typing, health insurance typing.
- Misc. TAMM / Amer / Tas'heel: good-conduct certificate, VAT registration, other e-services.

### Ground rules

- Small, reviewable steps. After each major step, stop and summarize in ≤10 bullets, then wait for "continue".
- Before writing code for any feature, produce a short plan (files to add/change, data model, API shape, risks). Wait for approval.
- Concise responses. Code + 3-line summary.
- No new dependency without telling me why and its cost. Prefer free-tier-friendly services.
- TypeScript everywhere. Tests for business logic only.
- Bilingual EN + AR from day 1 with full RTL for Arabic. This is not optional.

### Tech stack

- **Monorepo:** pnpm + Turborepo
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **i18n:** `next-intl` with `/[locale]/...` routing; EN primary, AR secondary; RTL applied via `dir` on Arabic locale
- **Admin:** Next.js app at `apps/admin` behind auth
- **API:** Next.js Route Handlers + tRPC + Zod
- **Background jobs / state machine:** Inngest
- **Database:** PostgreSQL (Neon free tier) + Prisma
- **Auth:** Auth.js v5 (email magic link + Google + UAE Pass placeholder adapter); roles `CUSTOMER`, `STAFF`, `ADMIN`
- **Documents:** Cloudflare R2 with server-signed URLs, encryption at rest, virus-scan hook, watermark on previews, auto-purge after retention
- **Payments:** Stripe (cards, Apple Pay, Google Pay) + adapter stub for Telr and Network International; split fees into government / service / VAT 5% on every invoice
- **Email:** Resend + React Email, bilingual templates
- **WhatsApp:** `wa.me` link now + a webhook-ready stub for WhatsApp Business API
- **AI:** Anthropic Claude via `@anthropic-ai/sdk` wrapped in `packages/ai` (prompt registry, Upstash-backed response cache, daily spend cap env, prompt-injection filter, kill switch)
- **Observability:** Sentry + PostHog
- **Hosting:** Vercel, Neon, Upstash, Inngest — all generous free tiers

### Monorepo layout

```
/
├── apps/
│   ├── web/
│   └── admin/
├── packages/
│   ├── ui/
│   ├── db/
│   ├── api/
│   ├── ai/
│   ├── emails/
│   └── config/
├── assets/              # logo.png etc.
├── docs/                # architecture.md, api.md, security.md, ops.md
└── README.md
```

### Feature scope (in priority order)

1. **Customer site (Phase 1)** — 12 pages as listed in `BUILD_PLAN.md`:
   `/`, `/services`, `/services/[slug]`, `/apply/[slug]`, `/track`, `/appointment`, `/fee-calculator`, `/assistant`, `/account`, `/sign-in`, `/about`, `/contact`, plus `/faq`, `/legal`, and branded error boundaries.
2. **AI features (Phase 1)** — service recommender, document checklist assistant, fee-calculator explainer, document OCR + form auto-fill, in-form helper, multilingual chatbot, status explainer.
3. **State machine + secure docs** — application lifecycle Draft -> Submitted -> Under Review -> Missing Docs -> With Government -> Approved / Rejected -> Closed, driven by Inngest events, with email + WhatsApp notifications.
4. **Admin MVP (Phase 1 tail)** — dashboard, applications queue, document viewer + verification, customer list, service / fee CMS, FAQ CMS, audit log.
5. **Later** — UAE Pass SSO, Telr / Network International go-live, WhatsApp Business API, reviewer-mode for compliance, mobile app (Expo) sharing the `packages/*` layer.

### Non-functional requirements

- Bilingual everywhere, RTL correct on Arabic routes (including icons, carousels, form alignment).
- WCAG 2.1 AA: visible focus, `prefers-reduced-motion`, keyboard nav.
- Core Web Vitals green on all top routes; Lighthouse >= 90 on `/`, `/services`, `/services/[slug]`, `/fee-calculator`, `/apply/[slug]`.
- Security: every route Zod-validated, CSRF protection, rate limiting on AI and public endpoints, signed URLs for docs, **no PII in URLs or logs**, masked Emirates ID displays, audit log on every admin mutation.
- SEO: SSR, `Service` + `Organization` + `FAQPage` JSON-LD, sitemap, robots, hreflang EN / AR.
- Legal/VAT: UAE FTA-style invoices with TRN placeholder and 5% VAT broken out.

### Brand

- Name: **Synergy Typing Services**
- Reference: `https://synergytyping.com/` (fetch once; otherwise use placeholders)
- Logo: `./assets/logo.png` (I will provide; if empty, generate a placeholder wordmark using the palette below)
- Palette:
  - `--brand-primary` `#0F4C81`
  - `--brand-secondary` `#D4AF37`
  - `--brand-accent` `#1F8E5C`
  - neutrals: `#FFFFFF`, `#F6F7FB`, `#0B1220`, `#667085`
- Typography: **Cairo** (AR + Latin) primary, **Inter** as Latin fallback, via `next/font`.

### Deliverable for your FIRST response

1. Root-level **`README.md`**: overview, architecture (Mermaid), stack rationale, monorepo layout, local setup, deployment overview, phase roadmap, brand and tokens, scripts, contribution notes.
2. **`docs/architecture.md`**: ERD for the data model in Mermaid, request flow, AI layer diagram, state machine, role matrix, i18n strategy.
3. **`docs/security.md`**: document handling policy, PII redaction rules, secrets management, audit log scope, retention windows.
4. **`docs/phases.md`**: Phase 1 broken into numbered tickets I can feed you one at a time (aligned with `BUILD_PLAN.md` in my Desktop folder).
5. Scaffold the empty monorepo (Turborepo + pnpm workspaces), root `package.json`, `turbo.json`, shared `tsconfig`, ESLint, Prettier, Husky + lint-staged, and a GitHub Actions CI workflow running lint + typecheck + build. **No app code yet.**
6. Short bullet summary of what you did and the exact next step to run (for example `pnpm install && pnpm dev`).

**Do not build Phase 1 features yet.** Stop after step 6 and wait for me to say "start Phase 1, Step 1."

### Communication style

Short, structured, plans-before-code. Ask before installing deps. Flag anything that could cost money. If a task looks like it won't fit one turn, split it and tell me.

Acknowledge these rules in 3 lines, then produce the deliverables above.

---

## SECTION 2 — Follow-up prompts (one at a time, `/clear` between)

The follow-up prompts **are the seven build steps in `BUILD_PLAN.md`**. Paste them one at a time starting with STEP 1. Do not paste more than one at a time.

---

## SECTION 3 — Things you need to prepare

- [ ] Company logo (`assets/logo.png`) and legal entity name
- [ ] Official phone + WhatsApp number + address + map URL + licence no.
- [ ] Confirm brand colors if different from defaults
- [ ] Service list and fees from the live site (Claude Code will try to fetch; if blocked, supply a screenshot or CSV)
- [ ] Accounts (all free tiers): GitHub, Vercel, Neon (or Supabase), Upstash, Inngest, Resend, Stripe (test), Anthropic API, Cloudflare R2, PostHog
- [ ] Domain for production
