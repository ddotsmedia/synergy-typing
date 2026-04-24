# Phases — Synergy Typing Services

> One ticket per paste into Claude Code. `/clear` between tickets. Each ticket ends with a localhost review in **both** EN and AR. Aligned with `BUILD_PLAN.md`.

---

## Phase 0 — Foundation _(this commit)_

- Monorepo scaffold (pnpm + Turborepo), shared tsconfig, ESLint, Prettier, Husky, lint-staged.
- Docs: `README.md`, `docs/architecture.md`, `docs/security.md`, `docs/phases.md`.
- CI: lint · typecheck · build on push + PR.
- `.env.example` and brand tokens (`packages/config/tokens/brand.ts`).
- **No app code yet.**

---

## Phase 1 — Customer site

Each step is a standalone ticket. Keep steps small; ship and review before starting the next.

### Step 1 — Scaffold `apps/web` + global shell

- Next.js 15 App Router, React 19, TypeScript, Tailwind.
- `next-intl` with `/[locale]/...`, `en` + `ar`, RTL on `ar`.
- `next/font` loading **Cairo** + **Inter**.
- Global layout: header (logo, nav, locale switcher), footer, WhatsApp FAB, skip-to-content, focus ring theme.
- Brand palette wired to Tailwind from `packages/config/tokens/brand.ts`.
- Empty pages for the 12 customer routes so nav renders.
- **Acceptance:** `/` renders EN; `/ar` renders AR with RTL; Lighthouse a11y ≥ 95 on shell.

### Step 2 — Home page `/`

Hero, 8 service category tiles, fee estimator teaser, assistant teaser, why-us, testimonials, WhatsApp CTA. Bilingual copy. Organization JSON-LD.

### Step 3 — `/services` + `/services/[slug]`

Seeded service catalogue (Haiku-generated content + fee placeholders). Filter by category. Per-service detail with checklist, fee breakdown, processing time, Apply CTA. `Service` JSON-LD.

### Step 4 — `/fee-calculator`

Interactive calculator. Government / service / VAT split. Save-estimate CTA. Shareable URL (no PII).

### Step 5 — `packages/db` + Auth.js

Prisma schema matching the ERD. Neon connection. Auth.js v5 (email magic link, Google, UAE Pass placeholder). Session + role.

### Step 6 — `/sign-in` + `/account` shell

Sign-in flows. Account tabs (Applications / Documents / Invoices / Profile). Empty states with clear next steps.

### Step 7 — `/apply/[slug]` wizard (no upload yet)

Multi-step form per service. Server-side Zod validation. Draft autosave. Review step. Stores to `application` with `DRAFT`.

### Step 8 — Document upload + R2

Pre-signed PUT, SHA-256 verify, mime/size caps, watermarked previews. Virus-scan hook via Inngest. `document` rows tied to application.

### Step 9 — State machine + notifications

Inngest functions for each transition. Bilingual Resend templates. WhatsApp `wa.me` deep links (Business API deferred).

### Step 10 — `/track` + `/appointment`

Public tracker (order + email). Appointment booking with slot inventory.

### Step 11 — Payments

Stripe integration (cards, Apple Pay, Google Pay). Invoice generation (FTA-style, TRN from env). Adapter stubs for Telr + Network International.

### Step 12 — `packages/ai` surfaces

Service recommender, checklist assistant, fee explainer, OCR auto-fill, in-form helper, chatbot, status explainer. Cache + cap + kill switch wired.

### Step 13 — Admin MVP (`apps/admin`)

Dashboard, applications queue, document viewer + verify, customer list, service/fee CMS, FAQ CMS, audit log viewer.

### Step 14 — SEO, a11y, perf pass

Sitemap, robots, hreflang EN/AR, JSON-LD audit. WCAG 2.1 AA pass. Lighthouse ≥ 90 on the five top routes.

### Step 15 — Launch prep

Sentry + PostHog live. Error boundaries branded. `/legal` (Terms / Privacy / Refund). `/faq` filled. Production Vercel deploy. DNS cutover runbook.

---

## Phase 2 — After launch

- UAE Pass SSO (real, not stub)
- Telr / Network International go-live
- WhatsApp Business API webhook
- Reviewer / compliance mode (read-only portal for auditors)
- Mobile app (Expo) sharing `packages/*`

---

## Rules

- Before each step, Claude Code outputs a ≤ 20-line plan and waits for "go".
- No paid dependency without being called out first.
- Concise responses. Code + 3-line summary.
- Bilingual EN + AR everywhere, RTL correct on AR — **not optional**.
- Tests for business logic only (state machine, fee math, auth guards, Zod schemas).
