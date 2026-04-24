# Synergy Typing Services — New Website Plan (Abu Dhabi)

> **Project:** replace `synergytyping.com` with a modern, AI-powered platform for a UAE typing centre.
> **How to use this file:** feed Claude Code the steps below **one at a time**. Between steps, run `/clear` to reset context. Review localhost after each step.

---

## 1. What a UAE typing centre actually does

Typing centres are the front door to UAE government e-services. The new site must sell, explain, and process these flows end-to-end:

### Service categories

| Category | Typical services |
|---|---|
| **Immigration & Residency (ICA / GDRFA)** | Employment visa, Family visa (spouse/children/parents), Visit/tourist visa, Golden Visa, Investor visa, Entry permit, Emirates ID (new / renewal / replacement), Status change |
| **Labour (MOHRE / Tas'heel)** | Work permit (new / renewal / cancellation), Labour contract, Wage Protection (WPS), Domestic helper visa, Tawjeeh worker-awareness typing |
| **Company formation & PRO** | Mainland / freezone trade licence, Licence renewal, Chamber of Commerce, Corporate sponsorship, PRO services |
| **Transport (ADP / ITC)** | Driving licence (new / renewal / transfer), Vehicle registration (Mulkiya), Traffic file, Plate reservation, Salik |
| **Real estate (ADM / TAMM)** | Tawtheeq tenancy registration, Utility (ADDC) connection, Completion certificate |
| **Attestation & translation** | MOFA / MOE attestation, Legal translation (AR↔EN), Embassy attestation |
| **Medical & insurance** | Medical fitness typing, Health insurance typing |
| **Other TAMM / Amer / Tas'heel** | Good-conduct certificate, VAT registration, Misc. e-services |

A typing centre's value is **knowing which government portal handles each case, preparing the exact documents, filling long Arabic forms correctly, submitting them, and tracking status** — so the website has to lean into those jobs.

---

## 2. Target pages (12 customer-facing + 2 admin scopes)

| # | Route | Purpose |
|---|---|---|
| 1 | `/` | Home: hero, 8 service category tiles, fee estimator teaser, AI assistant teaser, why-us, testimonials, WhatsApp CTA |
| 2 | `/services` | All services, filterable by category / user situation |
| 3 | `/services/[slug]` | Service detail: what it is, who needs it, documents checklist, fees, processing time, Apply CTA |
| 4 | `/apply/[slug]` | Application wizard: multi-step form + secure document upload + signature |
| 5 | `/track` | Application status tracker (order number + email or account) |
| 6 | `/appointment` | Book an in-centre visit (if document must be physical) |
| 7 | `/fee-calculator` | Interactive calculator: select service + options -> government fee + service fee + VAT |
| 8 | `/assistant` | AI concierge page: chat + suggested services + document lists |
| 9 | `/account` | Customer portal (tabs: Applications / Documents / Invoices / Profile) |
| 10 | `/sign-in` | Magic link + Google + UAE Pass (placeholder) |
| 11 | `/about` | Company story, team, licence, years in business, service map |
| 12 | `/contact` | Form + WhatsApp + map + hours + phone + directions |

**Support routes:** `/faq`, `/legal` (Terms / Privacy / Refund), `not-found.tsx`, `error.tsx`.

**Admin (Phase 2, behind `/admin`):** dashboard, applications queue with filters, document viewer + verification, customer list, staff list + assignment, service + fee CMS, reports, audit log.

---

## 3. Must-have features (beyond pages)

- **Bilingual EN / AR from day 1**, full RTL for Arabic. (Not optional for UAE government services.)
- **Secure document handling**: uploads go to Cloudflare R2 with server-signed URLs, AES encryption at rest, virus scan (ClamAV or ad-hoc Lambda), watermark on preview images, auto-purge after retention window.
- **Payments**: Stripe (cards, Apple Pay, Google Pay) + adapter for **Telr** or **Network International** for local UAE cards. Fee breakdown separates **government fees** from **service fees** and **VAT 5%**. Tax-compliant invoices (FTA-style).
- **WhatsApp integration**: floating button, click-to-chat prefilled with service, and a webhook-ready stub so you can wire up WhatsApp Business API later.
- **Application state machine**: Draft -> Submitted -> Under Review -> Missing Docs -> With Government -> Approved / Rejected -> Closed. Each transition notifies customer by email + WhatsApp.
- **Status tracker**: public page (order + email) and portal view with timeline.
- **Audit log**: every admin action is recorded (who / when / what / before / after).
- **PII red flags**: no Emirates ID number in URLs or logs, masked displays, PII exported only from admin with reason note.
- **Analytics**: PostHog events for page_view, service_viewed, apply_started, apply_submitted, payment_success, ai_question.
- **Accessibility**: WCAG 2.1 AA, visible focus, reduced-motion, font scaling respected.

---

## 4. AI features (the differentiator)

All wrapped in a single `packages/ai` module with prompt registry, token caps, Upstash cache, and daily spend limit.

1. **AI Service Recommender** — customer describes their situation in plain English or Arabic ("I want to bring my wife from Pakistan to Abu Dhabi") -> returns matched service(s) + doc list + fees + next step.
2. **Document Checklist Assistant** — on any service detail page, a chat box explaining each document ("Why do I need a tenancy contract for this?") and common rejection reasons.
3. **Fee Calculator explainer** — expands the numeric result into plain-English breakdown.
4. **Document OCR + auto-fill** — user uploads Emirates ID or passport; the app extracts name, number, DOB, nationality, expiry and pre-fills the application form (user confirms before submit).
5. **Form helper** — a side-panel assistant that explains each field as the user fills the wizard, translates between EN/AR, and flags likely rejections.
6. **Multilingual chatbot** — EN / AR / HI / UR / ML on `/assistant`, trained on service catalogue + FAQs.
7. **Status explainer** — when a stage says "Pending ICA approval", AI explains what that means and the typical time.
8. **Admin-side triage** — staff dashboard uses AI to pre-classify new applications and flag likely missing documents.

**Guardrails:** prompt-injection filter, refuse anything outside UAE government services, never quote a fee the system hasn't verified, always link to the official gov portal when in doubt.

---

## 5. Tech stack (same as Aerovy, reuse what you already installed)

- **Framework:** Next.js 15 App Router + TypeScript
- **UI:** Tailwind + shadcn/ui + Framer Motion, full RTL via `dir="rtl"` on Arabic routes
- **i18n:** `next-intl` (EN primary, AR secondary). Route layout: `/[locale]/...`
- **API:** tRPC + Zod
- **DB:** PostgreSQL (Neon) + Prisma
- **Auth:** Auth.js v5 (magic link + Google + UAE Pass placeholder adapter)
- **Docs storage:** Cloudflare R2 + signed URLs + encryption
- **Payments:** Stripe + adapter for Telr / Network International
- **Email:** Resend + React Email
- **AI:** Anthropic Claude via `packages/ai` with Upstash-backed cache and spend cap
- **Queue / jobs:** Inngest (state machine transitions, email / WhatsApp notifications)
- **Observability:** Sentry + PostHog
- **Hosting:** Vercel (web + admin), Neon (DB), Upstash (Redis), Inngest (jobs)

---

## 6. Brand & assets

- Company: **Synergy Typing Services**, Abu Dhabi.
- Reference site: `https://synergytyping.com/` — Claude Code should fetch this once to pull the exact service list, phone numbers, and address, and verify fees.
- Logo: place at `./assets/logo.png` (PNG with transparent background, 800 px wide). If you don't have one yet, Claude Code will generate a placeholder wordmark using the brand colors.
- Suggested palette (edit to match your real brand):
  - `--brand-primary` = `#0F4C81` (corporate UAE blue)
  - `--brand-secondary` = `#D4AF37` (gold accent, common in UAE)
  - `--brand-accent` = `#1F8E5C` (confirmation green)
  - Neutrals: `#FFFFFF`, `#F6F7FB`, `#0B1220`, `#667085`
- Typography: **Cairo** (Arabic + Latin) as primary, **Inter** as fallback, both via `next/font`.

---

## 7. Build plan (7 Claude Code steps, one at a time)

### STEP 1 — Scaffold monorepo + global shell

Scaffold pnpm + Turborepo with `apps/web`, `apps/admin`, `packages/db`, `packages/api`, `packages/ui`, `packages/ai`, `packages/emails`, `packages/config`. Install shadcn/ui. Build:

- Sticky header with logo, bilingual switch (EN / AR), nav: Services / Fee calculator / Track application / Assistant / About / Contact, plus WhatsApp CTA.
- Footer with 4 columns + newsletter + payment + government-logo strip placeholder (MOHRE, ICA, TAMM, ADP) + licence number placeholder.
- Floating WhatsApp FAB.
- cmdk command palette (`Ctrl/Cmd + K`) searching services.
- `app/[locale]/layout.tsx` wiring i18n, theme, toasts, RTL.

Brand tokens wired via Tailwind config (no raw hex in components). **Stop and show me the shell.**

### STEP 2 — Data model + seed services

Design Prisma schema: `User`, `Account`, `Session`, `Role`, `ServiceCategory`, `Service`, `ServiceDocument`, `ServiceFee`, `Application`, `ApplicationStep`, `ApplicationDocument`, `Appointment`, `Payment`, `Invoice`, `AuditLog`, `FAQ`.

Seed **40 services** across the 8 categories above with: slug, title (EN + AR), short and long description, required-documents list, government fee, service fee, estimated processing time, eligibility notes, governing authority (MOHRE / ICA / TAMM / ADP / ADM / MOFA / MOE / FTA), tags. Seed **FAQs** per category. Show me a counts table + one sample service (EN and AR). **Stop.**

### STEP 3 — Home page

Hero with search + "What service do you need?" chat-style input, 8 category tiles, fee-calculator teaser card, featured services strip, AI Assistant promo split, why-us (licensed typing centre + x years + staff fluent in 6 languages + TAMM affiliated), testimonials carousel, Abu Dhabi service map placeholder, WhatsApp CTA band. Pull all data from DB. Works in both EN and AR. **Stop and show me the home page in both languages.**

### STEP 4 — Services listing + detail + fee calculator

- `/services`: left sidebar filters (category, governing authority, price range, processing time), sort, grid of cards.
- `/services/[slug]`: hero, who needs this, documents checklist (per document: purpose, format rules, example), fees breakdown, estimated processing, FAQs, related services, sticky "Start application" CTA.
- `/fee-calculator`: select service -> dynamic option flags (urgent, medical add-on, delivery, translation) -> live breakdown of government fee + service fee + VAT + total, with plain-English explainer and "Start application" CTA.

Include JSON-LD `Service` + OG tags. **Stop.**

### STEP 5 — Application wizard + secure document upload + appointment booking

- `/apply/[slug]`: multi-step wizard driven by the service's schema. Each step has inline AI helper. Document upload to Cloudflare R2 via server-signed URLs, virus scan hook, thumbnail preview. OCR side-flow: upload Emirates ID / passport -> extract fields -> pre-fill wizard (user confirms).
- E-signature on the declaration step (canvas + IP + timestamp).
- Payment step using Stripe Payment Element.
- `/appointment`: if the service flagged `requiresVisit = true`, booking is mandatory; otherwise optional. Calendar with branch opening hours.
- State machine: Draft -> Submitted -> Under Review -> Missing Docs -> With Government -> Approved / Rejected -> Closed, driven by Inngest events. Each transition sends a bilingual email via Resend and a WhatsApp message stub.
- `/track`: order number + email -> timeline.

**Stop** and walk me through one full flow with a fake Emirates ID upload.

### STEP 6 — AI features + customer portal

- `packages/ai`: Anthropic client, prompt registry (service_recommender, doc_checker, form_helper, fee_explainer, status_explainer), Zod-validated outputs, Upstash cache, daily spend env cap, prompt-injection filter.
- `/assistant`: full-page chat, language auto-detect, intent classification -> either returns a service recommendation card with "Start application" CTA or a document checklist card.
- Inline AI helper inside the apply wizard (per-field).
- `/account`: single route with 4 tabs (Applications with status timeline, Documents vault, Invoices PDF, Profile). Reuse seeded data.

**Stop** and test the AI recommender with three sample questions (one in Arabic).

### STEP 7 — Remaining pages, admin MVP, polish

- `/about`, `/contact` (form + WhatsApp + embedded map + hours + phone), `/faq`, `/legal` (Terms / Privacy / Refund tabs). Branded 404 / 500 pages.
- **Admin MVP** behind `/admin`, role-gated for `STAFF` / `ADMIN`:
  - Dashboard KPIs (applications today, revenue, SLA breaches, top services)
  - Applications queue with filters, detail drawer, verify documents, trigger state transitions, assign staff
  - Customers list, service CMS, fee CMS, FAQ CMS, audit log
- SEO: `sitemap.ts`, `robots.ts`, dynamic OG images per service, hreflang alternates EN / AR.
- Analytics events wired.
- Accessibility + Lighthouse on `/`, `/services`, `/services/[slug]`, `/fee-calculator`, `/apply/[slug]`.

**Stop** and hand me Lighthouse scores and three sample admin screenshots.

---

## 8. What I need from you before STEP 1

- [ ] Company logo (PNG or SVG) -> drop at `assets/logo.png`
- [ ] Official phone + WhatsApp number
- [ ] Official branch address + Google Maps URL
- [ ] Licence / registration number (for footer)
- [ ] Brand colors if different from suggestions above
- [ ] Actual service list from `synergytyping.com` — easiest: export the sitemap or screenshot their services page
- [ ] Government fees (Claude Code will use placeholder values until you confirm)

Until you supply the above, the site will ship with clearly marked "TO VERIFY" placeholders.

---

## 9. Credit discipline (read every step)

- `/clear` between steps inside Claude Code.
- Switch to Haiku (`/model haiku`) for seed data + static pages, Opus / Sonnet only for AI module and tricky state-machine work.
- Use `Cline` or `Aider` (already installed) for mechanical edits to save Claude credits.
- After a step, verify localhost in **both** EN and AR before continuing.
- If Claude Code drifts (adds unrelated routes, removes Arabic, etc.), say: "Stay on the plan in `BUILD_PLAN.md`. Revert anything outside it."

---

## 10. Rough credit & time estimate

With the phase-by-phase approach and `/clear` between steps:

| Stage | Rough Claude Code turns |
|---|---|
| Step 1 (scaffold + shell) | 2–3 |
| Step 2 (schema + seed 40 services EN/AR) | 3–5 |
| Step 3 (home page) | 2–3 |
| Step 4 (services + fee calc) | 3–4 |
| Step 5 (apply wizard + payments + state machine) | 4–6 |
| Step 6 (AI + portal) | 3–5 |
| Step 7 (remaining + admin MVP + polish) | 5–8 |
| **Total for MVP** | **~22–34 turns** |

Expect 3–5 days of part-time work end-to-end if you follow the discipline above.
