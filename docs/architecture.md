# Architecture — Synergy Typing Services

> Status: Phase 0 scaffold. Updated as Phase 1 tickets land.

---

## 1. High-level request flow

```mermaid
flowchart LR
  U[Customer browser<br/>EN / AR + RTL]
  W[apps/web<br/>Next.js 15 App Router]
  A[apps/admin<br/>Staff console]
  API[(Route Handlers<br/>+ tRPC + Zod)]
  DB[(PostgreSQL<br/>Neon)]
  R2[(Cloudflare R2<br/>signed URLs)]
  AI[packages/ai<br/>Claude wrapper]
  INNG[Inngest<br/>jobs + state machine]
  MAIL[Resend<br/>bilingual templates]
  WA[WhatsApp<br/>wa.me + webhook stub]
  PAY[Stripe / Telr / NI]

  U --> W
  U --> A
  W --> API
  A --> API
  API --> DB
  API --> R2
  API --> AI
  API --> INNG
  INNG --> DB
  INNG --> MAIL
  INNG --> WA
  API --> PAY
```

---

## 2. Data model (ERD)

```mermaid
erDiagram
  USER ||--o{ APPLICATION : owns
  USER ||--o{ DOCUMENT : uploads
  USER ||--o{ INVOICE : billed
  SERVICE ||--o{ APPLICATION : drives
  SERVICE ||--o{ FEE : priced_by
  APPLICATION ||--o{ DOCUMENT : attaches
  APPLICATION ||--o{ APPLICATION_EVENT : logs
  APPLICATION ||--|| INVOICE : produces
  INVOICE ||--o{ PAYMENT : settled_by
  USER ||--o{ AUDIT_LOG : performs
  APPOINTMENT }o--|| USER : booked_by
  APPOINTMENT }o--|| SERVICE : for

  USER {
    string id PK
    string email
    string phone
    string name
    string locale
    enum role "CUSTOMER|STAFF|ADMIN"
    datetime createdAt
  }
  SERVICE {
    string id PK
    string slug
    string categoryKey
    json titleI18n
    json descriptionI18n
    int processingDaysMin
    int processingDaysMax
    boolean active
  }
  FEE {
    string id PK
    string serviceId FK
    string key
    int governmentFilsAED
    int serviceFilsAED
    boolean vatable
  }
  APPLICATION {
    string id PK
    string userId FK
    string serviceId FK
    enum status "DRAFT|SUBMITTED|UNDER_REVIEW|MISSING_DOCS|WITH_GOVERNMENT|APPROVED|REJECTED|CLOSED"
    json answers
    datetime createdAt
    datetime updatedAt
  }
  DOCUMENT {
    string id PK
    string applicationId FK
    string userId FK
    string r2Key
    string sha256
    enum kind
    enum status "PENDING|VERIFIED|REJECTED"
    datetime expiresAt
  }
  APPLICATION_EVENT {
    string id PK
    string applicationId FK
    string actorId FK
    string from
    string to
    json payload
    datetime at
  }
  INVOICE {
    string id PK
    string applicationId FK
    int governmentFils
    int serviceFils
    int vatFils
    int totalFils
    string trn
    datetime issuedAt
  }
  PAYMENT {
    string id PK
    string invoiceId FK
    enum provider "STRIPE|TELR|NI|CASH"
    string providerRef
    int amountFils
    enum status "INIT|SUCCEEDED|FAILED|REFUNDED"
  }
  APPOINTMENT {
    string id PK
    string userId FK
    string serviceId FK
    datetime slotStart
    int durationMins
    enum status "BOOKED|COMPLETED|CANCELLED|NO_SHOW"
  }
  AUDIT_LOG {
    string id PK
    string actorId FK
    string action
    string entity
    string entityId
    json before
    json after
    datetime at
  }
```

All money is stored as integer fils (AED × 100). VAT 5% is computed on the service portion only and broken out on every invoice (UAE FTA style).

---

## 3. Application state machine

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted: customer submits
  Submitted --> UnderReview: staff assigned
  UnderReview --> MissingDocs: staff requests more
  MissingDocs --> UnderReview: customer uploads
  UnderReview --> WithGovernment: typed + forwarded
  WithGovernment --> Approved: portal accepts
  WithGovernment --> Rejected: portal rejects
  Approved --> Closed: invoice paid + docs delivered
  Rejected --> Closed: refund / appeal noted
  Closed --> [*]
```

Transitions emit Inngest events. Each event fans out to:
- DB write (`application_event`)
- Email (Resend, bilingual)
- WhatsApp stub (wa.me link in Phase 1; Business API in Phase 2)
- Audit log entry

---

## 4. AI layer (`packages/ai`)

```mermaid
flowchart TD
  CALLER[API route / server action]
  GUARD{Kill switch on?}
  INJ[Prompt-injection filter]
  CACHE[(Upstash Redis cache<br/>keyed by prompt+model)]
  CAP{Daily spend cap reached?}
  ANT[Anthropic SDK<br/>@anthropic-ai/sdk]
  LOG[Usage log + cost ledger]

  CALLER --> GUARD
  GUARD -- yes --> FALLBACK[Static fallback copy]
  GUARD -- no --> INJ
  INJ --> CACHE
  CACHE -- hit --> CALLER
  CACHE -- miss --> CAP
  CAP -- yes --> FALLBACK
  CAP -- no --> ANT
  ANT --> LOG
  LOG --> CACHE
  CACHE --> CALLER
```

Surfaces:
- Service recommender (`/assistant`, home)
- Document checklist assistant (`/services/[slug]`, `/apply/[slug]`)
- Fee-calculator explainer (`/fee-calculator`)
- Document OCR + form auto-fill (apply wizard)
- In-form helper (apply wizard)
- Multilingual chatbot (floating)
- Status explainer (`/track`, `/account`)

Cache TTL: 24 h for static explanations; 1 h for chat; no cache for anything PII-touching.

---

## 5. Role matrix

| Capability | CUSTOMER | STAFF | ADMIN |
| --- | :-: | :-: | :-: |
| Start / submit own applications | ✅ | ✅ | ✅ |
| Upload own documents | ✅ | ✅ | ✅ |
| Pay own invoices | ✅ | ✅ | ✅ |
| View own applications | ✅ | ✅ | ✅ |
| View all applications in queue | ❌ | ✅ | ✅ |
| Transition application state | ❌ | ✅ | ✅ |
| Verify / reject documents | ❌ | ✅ | ✅ |
| Edit service catalogue + fees | ❌ | ❌ | ✅ |
| Manage users / roles | ❌ | ❌ | ✅ |
| Read audit log | ❌ | read-only | ✅ |

Auth.js v5 sessions carry `role`. Every mutation is role-gated server-side (never trust the client).

---

## 6. i18n strategy

- `next-intl` with `/[locale]/...` routing. Locales: `en` (default), `ar`.
- Arabic routes render with `<html dir="rtl" lang="ar">`.
- Messages live in `apps/web/messages/{en,ar}.json`, scoped per route namespace.
- Service titles, descriptions, and FAQ items are stored as `json` columns with `{ en, ar }` — not English-only with translations bolted on.
- Fonts: **Cairo** for AR + Latin headings, **Inter** Latin fallback, via `next/font`.
- Numerals: Arabic-Indic digits configurable per locale; currency always `AED` with two decimals.
- RTL audit checklist (icons, carousels, form alignment, charts) enforced in the PR template.

---

## 7. Monorepo boundaries

| Package | Imports from | Exports to |
| --- | --- | --- |
| `packages/config` | — | all |
| `packages/ui` | `config` | `web`, `admin` |
| `packages/db` | `config` | `api` |
| `packages/api` | `db`, `ai`, `emails` | `web`, `admin` |
| `packages/ai` | `config` | `api` |
| `packages/emails` | `config` | `api` |
| `apps/web` | `api`, `ui`, `config` | — |
| `apps/admin` | `api`, `ui`, `config` | — |

Apps never import `db` directly — all DB access flows through `packages/api`.
