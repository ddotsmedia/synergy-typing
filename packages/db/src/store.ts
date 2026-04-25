// JSON-backed store for the admin shell. Lives at apps/admin/.data/store.json.
// Seeded from the in-source seed on first run, mutable from server actions,
// auto-persisted on every write. Survives dev-server restarts.
//
// When STEP 2 lands Prisma, replace the file ops with prisma calls — the
// exported function signatures stay, server actions don't change.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applications as seedApplications,
  auditLog as seedAuditLog,
  customers as seedCustomers,
  faqs as seedFaqs,
  integrations as seedIntegrations,
  services as seedServices,
  settings as seedSettings,
  staff as seedStaff,
} from './seed';
import type {
  Application,
  ApplicationDocument,
  ApplicationEvent,
  ApplicationStatus,
  AuditEntry,
  Customer,
  Faq,
  Integration,
  Service,
  ServiceCategory,
  Settings,
  SocialLinks,
  Staff,
  StaffRole,
} from './types';

export * from './types';

// Resolve the store at the monorepo root so apps/web and apps/admin share it.
// This file is at packages/db/src/store.ts → ../../.. is the repo root.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const STORE_DIR = process.env.SYNERGY_STORE_DIR ?? path.resolve(HERE, '..', '..', '..', '.data');
const STORE_FILE = path.join(STORE_DIR, 'store.json');

type Store = {
  applications: Application[];
  customers: Customer[];
  services: Service[];
  staff: Staff[];
  faqs: Faq[];
  auditLog: AuditEntry[];
  settings: Settings;
  integrations: Integration[];
};

function freshSeed(): Store {
  // Deep-clone so subsequent mutations don't mutate the seed module.
  return JSON.parse(
    JSON.stringify({
      applications: seedApplications,
      customers: seedCustomers,
      services: seedServices,
      staff: seedStaff,
      faqs: seedFaqs,
      auditLog: seedAuditLog,
      settings: seedSettings,
      integrations: seedIntegrations,
    }),
  );
}

function ensureStoreFile(): void {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(freshSeed(), null, 2), 'utf8');
  }
}

function readStore(): Store {
  ensureStoreFile();
  const raw = fs.readFileSync(STORE_FILE, 'utf8');
  let parsed: Store;
  try {
    parsed = JSON.parse(raw) as Store;
  } catch {
    // Corrupted file → reset.
    parsed = freshSeed();
    writeStore(parsed);
    return parsed;
  }
  // Lightweight forward migrations — backfill new fields on older store.json files.
  let migrated = false;
  for (const svc of parsed.services) {
    if (typeof (svc as Service & { feesVisible?: boolean }).feesVisible !== 'boolean') {
      svc.feesVisible = true;
      migrated = true;
    }
  }
  // socialLinks → backfill empty record
  const settings = parsed.settings as Settings & { socialLinks?: Partial<Record<string, string>> };
  if (!settings.socialLinks) {
    settings.socialLinks = {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
      snapchat: '',
      whatsappChannel: '',
    };
    migrated = true;
  } else {
    // Ensure every known platform key exists (newly added ones backfill).
    const required = [
      'facebook',
      'instagram',
      'twitter',
      'linkedin',
      'youtube',
      'tiktok',
      'snapchat',
      'whatsappChannel',
    ] as const;
    for (const k of required) {
      if (typeof settings.socialLinks[k] !== 'string') {
        (settings.socialLinks as Record<string, string>)[k] = '';
        migrated = true;
      }
    }
  }
  if (migrated) writeStore(parsed);
  return parsed;
}

function writeStore(s: Store): void {
  ensureStoreFile();
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2), 'utf8');
  fs.renameSync(tmp, STORE_FILE);
}

function nextId(prefix: string, existing: { id: string }[]): string {
  let max = 0;
  for (const item of existing) {
    const m = item.id.match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1]!, 10);
      if (n > max) max = n;
    }
  }
  return `${prefix}_${String(max + 1).padStart(2, '0')}`;
}

function nextRef(existing: Application[]): string {
  let max = 1000;
  for (const a of existing) {
    const m = a.reference.match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1]!, 10);
      if (n > max) max = n;
    }
  }
  return `STS-2026-${max + 1}`;
}

function pushAudit(s: Store, entry: Omit<AuditEntry, 'id' | 'at'>): void {
  s.auditLog.unshift({
    id: nextId('al', s.auditLog),
    at: new Date().toISOString(),
    ...entry,
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Reads
// ──────────────────────────────────────────────────────────────────────────

export function getAll(): Store {
  return readStore();
}

export function listApplications(opts?: { status?: ApplicationStatus }): Application[] {
  const s = readStore();
  return [...s.applications]
    .filter((a) => !opts?.status || a.status === opts.status)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getApplication(id: string): Application | undefined {
  return readStore().applications.find((a) => a.id === id);
}

export function listCustomers(): Customer[] {
  return [...readStore().customers].sort((a, b) => a.name.localeCompare(b.name));
}

export function getCustomer(id: string): Customer | undefined {
  return readStore().customers.find((c) => c.id === id);
}

export function listServices(): Service[] {
  return [...readStore().services].sort((a, b) => a.titleEn.localeCompare(b.titleEn));
}

export function getService(id: string): Service | undefined {
  return readStore().services.find((s) => s.id === id);
}

export function listStaff(): Staff[] {
  return [...readStore().staff].sort((a, b) => a.name.localeCompare(b.name));
}

export function getStaff(id?: string): Staff | undefined {
  if (!id) return undefined;
  return readStore().staff.find((u) => u.id === id);
}

export function listFaqs(): Faq[] {
  return [...readStore().faqs];
}

export function listAudit(opts?: { limit?: number }): AuditEntry[] {
  const all = [...readStore().auditLog].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return opts?.limit ? all.slice(0, opts.limit) : all;
}

export function getSettings(): Settings {
  return readStore().settings;
}

export function listIntegrations(): Integration[] {
  return [...readStore().integrations];
}

// Derived ─────────────────────────────────────────────────────────────────

const TODAY_BOUNDARY = new Date('2026-04-25T00:00:00Z'); // anchored for the demo dataset

export function deriveKpis() {
  const apps = readStore().applications;
  const today = apps.filter((a) => new Date(a.submittedAt) >= TODAY_BOUNDARY);
  const slaBreaches = apps.filter(
    (a) =>
      ['submitted', 'under_review', 'missing_docs'].includes(a.status) &&
      Date.now() - new Date(a.submittedAt).getTime() > 1000 * 60 * 60 * 48,
  );
  const inReview = apps.filter((a) =>
    ['submitted', 'under_review', 'missing_docs', 'with_government'].includes(a.status),
  );
  return {
    todayCount: today.length,
    revenueToday: today.reduce((sum, a) => sum + a.total, 0),
    slaBreaches: slaBreaches.length,
    inReview: inReview.length,
    closedThisWeek: apps.filter((a) => ['approved', 'rejected', 'closed'].includes(a.status))
      .length,
    totalApplications: apps.length,
  };
}

export function statusCounts(): Record<ApplicationStatus, number> {
  const out: Record<ApplicationStatus, number> = {
    draft: 0,
    submitted: 0,
    under_review: 0,
    missing_docs: 0,
    with_government: 0,
    approved: 0,
    rejected: 0,
    closed: 0,
  };
  for (const a of readStore().applications) out[a.status]++;
  return out;
}

export function topServices(limit = 5) {
  const counts = new Map<string, number>();
  const s = readStore();
  for (const a of s.applications) counts.set(a.serviceId, (counts.get(a.serviceId) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, n]) => ({ service: s.services.find((sv) => sv.id === id)!, count: n }))
    .filter((row) => row.service)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ──────────────────────────────────────────────────────────────────────────
// Mutations — every write goes through here, so audit log stays honest.
// ──────────────────────────────────────────────────────────────────────────

const ACTOR = 'Mariam Al-Hosani'; // hardcoded admin until Auth.js lands

// Customers ───────────────────────────────────────────────────────────────

export function createCustomer(
  input: Omit<Customer, 'id' | 'joinedAt' | 'applications'>,
): Customer {
  const s = readStore();
  const c: Customer = {
    ...input,
    id: nextId('c', s.customers),
    joinedAt: new Date().toISOString().slice(0, 10),
    applications: 0,
  };
  s.customers.push(c);
  pushAudit(s, { actor: ACTOR, action: 'customer.created', target: c.id, meta: c.name });
  writeStore(s);
  return c;
}

export function updateCustomer(
  id: string,
  patch: Partial<Omit<Customer, 'id' | 'joinedAt'>>,
): void {
  const s = readStore();
  const c = s.customers.find((x) => x.id === id);
  if (!c) throw new Error(`Customer ${id} not found`);
  Object.assign(c, patch);
  pushAudit(s, { actor: ACTOR, action: 'customer.updated', target: id, meta: c.name });
  writeStore(s);
}

export function deleteCustomer(id: string): void {
  const s = readStore();
  const c = s.customers.find((x) => x.id === id);
  if (!c) return;
  s.customers = s.customers.filter((x) => x.id !== id);
  pushAudit(s, { actor: ACTOR, action: 'customer.deleted', target: id, meta: c.name });
  writeStore(s);
}

// Services ────────────────────────────────────────────────────────────────

export function createService(
  input: Omit<Service, 'id' | 'active' | 'feesVisible'> & {
    active?: boolean;
    feesVisible?: boolean;
  },
): Service {
  const s = readStore();
  const svc: Service = {
    ...input,
    id: nextId('s', s.services),
    active: input.active ?? true,
    feesVisible: input.feesVisible ?? true,
  };
  s.services.push(svc);
  pushAudit(s, { actor: ACTOR, action: 'service.created', target: svc.id, meta: svc.titleEn });
  writeStore(s);
  return svc;
}

export function updateService(id: string, patch: Partial<Omit<Service, 'id'>>): void {
  const s = readStore();
  const svc = s.services.find((x) => x.id === id);
  if (!svc) throw new Error(`Service ${id} not found`);
  Object.assign(svc, patch);
  pushAudit(s, { actor: ACTOR, action: 'service.updated', target: id, meta: svc.titleEn });
  writeStore(s);
}

export function deleteService(id: string): void {
  const s = readStore();
  const svc = s.services.find((x) => x.id === id);
  if (!svc) return;
  s.services = s.services.filter((x) => x.id !== id);
  pushAudit(s, { actor: ACTOR, action: 'service.deleted', target: id, meta: svc.titleEn });
  writeStore(s);
}

export function toggleServiceActive(id: string): void {
  const s = readStore();
  const svc = s.services.find((x) => x.id === id);
  if (!svc) return;
  svc.active = !svc.active;
  pushAudit(s, {
    actor: ACTOR,
    action: svc.active ? 'service.activated' : 'service.deactivated',
    target: id,
    meta: svc.titleEn,
  });
  writeStore(s);
}

export function toggleServiceFeesVisible(id: string): void {
  const s = readStore();
  const svc = s.services.find((x) => x.id === id);
  if (!svc) return;
  svc.feesVisible = !svc.feesVisible;
  pushAudit(s, {
    actor: ACTOR,
    action: svc.feesVisible ? 'service.fees_shown' : 'service.fees_hidden',
    target: id,
    meta: svc.titleEn,
  });
  writeStore(s);
}

// Staff ───────────────────────────────────────────────────────────────────

export function createStaff(input: Omit<Staff, 'id' | 'activeApplications'>): Staff {
  const s = readStore();
  const u: Staff = { ...input, id: nextId('u', s.staff), activeApplications: 0 };
  s.staff.push(u);
  pushAudit(s, {
    actor: ACTOR,
    action: 'staff.invited',
    target: u.id,
    meta: `${u.name} (${u.role})`,
  });
  writeStore(s);
  return u;
}

export function updateStaff(id: string, patch: Partial<Omit<Staff, 'id'>>): void {
  const s = readStore();
  const u = s.staff.find((x) => x.id === id);
  if (!u) throw new Error(`Staff ${id} not found`);
  Object.assign(u, patch);
  pushAudit(s, { actor: ACTOR, action: 'staff.updated', target: id, meta: u.name });
  writeStore(s);
}

export function deleteStaff(id: string): void {
  const s = readStore();
  const u = s.staff.find((x) => x.id === id);
  if (!u) return;
  s.staff = s.staff.filter((x) => x.id !== id);
  // Unassign their applications
  for (const a of s.applications) if (a.assignedTo === id) a.assignedTo = undefined;
  pushAudit(s, { actor: ACTOR, action: 'staff.removed', target: id, meta: u.name });
  writeStore(s);
}

// FAQs ────────────────────────────────────────────────────────────────────

export function createFaq(input: Omit<Faq, 'id' | 'published'> & { published?: boolean }): Faq {
  const s = readStore();
  const f: Faq = { ...input, id: nextId('f', s.faqs), published: input.published ?? false };
  s.faqs.push(f);
  pushAudit(s, {
    actor: ACTOR,
    action: 'faq.created',
    target: f.id,
    meta: f.question.slice(0, 60),
  });
  writeStore(s);
  return f;
}

export function updateFaq(id: string, patch: Partial<Omit<Faq, 'id'>>): void {
  const s = readStore();
  const f = s.faqs.find((x) => x.id === id);
  if (!f) throw new Error(`FAQ ${id} not found`);
  Object.assign(f, patch);
  pushAudit(s, { actor: ACTOR, action: 'faq.updated', target: id, meta: f.question.slice(0, 60) });
  writeStore(s);
}

export function deleteFaq(id: string): void {
  const s = readStore();
  const f = s.faqs.find((x) => x.id === id);
  if (!f) return;
  s.faqs = s.faqs.filter((x) => x.id !== id);
  pushAudit(s, { actor: ACTOR, action: 'faq.deleted', target: id, meta: f.question.slice(0, 60) });
  writeStore(s);
}

export function toggleFaqPublished(id: string): void {
  const s = readStore();
  const f = s.faqs.find((x) => x.id === id);
  if (!f) return;
  f.published = !f.published;
  pushAudit(s, {
    actor: ACTOR,
    action: f.published ? 'faq.published' : 'faq.unpublished',
    target: id,
    meta: f.question.slice(0, 60),
  });
  writeStore(s);
}

// Settings ────────────────────────────────────────────────────────────────

export function updateSettings(patch: Partial<Settings>): void {
  const s = readStore();
  s.settings = { ...s.settings, ...patch };
  pushAudit(s, {
    actor: ACTOR,
    action: 'settings.updated',
    target: 'branch',
    meta: Object.keys(patch).join(', '),
  });
  writeStore(s);
}

export function updateSocialLinks(socialLinks: Partial<SocialLinks>): void {
  const s = readStore();
  s.settings.socialLinks = { ...s.settings.socialLinks, ...socialLinks };
  const live = Object.entries(s.settings.socialLinks)
    .filter(([, v]) => v && v.length > 0)
    .map(([k]) => k);
  pushAudit(s, {
    actor: ACTOR,
    action: 'settings.social_updated',
    target: 'social',
    meta: live.length ? `live: ${live.join(', ')}` : 'all empty',
  });
  writeStore(s);
}

export function setIntegrationStatus(name: string, status: Integration['status']): void {
  const s = readStore();
  const i = s.integrations.find((x) => x.name === name);
  if (!i) return;
  i.status = status;
  pushAudit(s, { actor: ACTOR, action: 'integration.updated', target: name, meta: status });
  writeStore(s);
}

export function resetToSeed(): void {
  writeStore(freshSeed());
  // No audit entry — the log was reset too.
}

// Applications ────────────────────────────────────────────────────────────

const NEXT_STATES: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review', 'missing_docs', 'rejected'],
  under_review: ['with_government', 'missing_docs', 'rejected'],
  missing_docs: ['under_review', 'rejected'],
  with_government: ['approved', 'rejected'],
  approved: ['closed'],
  rejected: ['closed'],
  closed: [],
};

export function nextStatesFor(status: ApplicationStatus): ApplicationStatus[] {
  return NEXT_STATES[status];
}

function pushAppEvent(app: Application, evt: Omit<ApplicationEvent, 'at'>) {
  const at = new Date().toISOString();
  app.events.push({ at, ...evt });
  app.updatedAt = at;
}

export function assignApplication(id: string, staffId: string | null): void {
  const s = readStore();
  const a = s.applications.find((x) => x.id === id);
  if (!a) throw new Error(`Application ${id} not found`);
  const prev = a.assignedTo ? s.staff.find((u) => u.id === a.assignedTo)?.name : 'unassigned';
  const next = staffId ? s.staff.find((u) => u.id === staffId)?.name : 'unassigned';
  a.assignedTo = staffId ?? undefined;
  pushAppEvent(a, { actor: ACTOR, action: 'Reassigned', note: `${prev} → ${next}` });
  pushAudit(s, {
    actor: ACTOR,
    action: 'application.assigned',
    target: a.reference,
    meta: `${prev} → ${next}`,
  });
  writeStore(s);
}

export function transitionApplication(id: string, status: ApplicationStatus, note?: string): void {
  const s = readStore();
  const a = s.applications.find((x) => x.id === id);
  if (!a) throw new Error(`Application ${id} not found`);
  if (!NEXT_STATES[a.status].includes(status)) {
    throw new Error(`Cannot transition ${a.status} → ${status}`);
  }
  const prev = a.status;
  a.status = status;
  pushAppEvent(a, { actor: ACTOR, action: `Transitioned to ${status}`, note });
  pushAudit(s, {
    actor: ACTOR,
    action: 'application.transitioned',
    target: a.reference,
    meta: `${prev} → ${status}`,
  });
  writeStore(s);
}

export function setDocumentStatus(
  appId: string,
  docName: string,
  status: ApplicationDocument['status'],
): void {
  const s = readStore();
  const a = s.applications.find((x) => x.id === appId);
  if (!a) throw new Error(`Application ${appId} not found`);
  const doc = a.documents.find((d) => d.name === docName);
  if (!doc) throw new Error(`Document ${docName} not found on ${appId}`);
  doc.status = status;
  pushAppEvent(a, { actor: ACTOR, action: `Document ${status}`, note: docName });
  pushAudit(s, {
    actor: ACTOR,
    action:
      status === 'verified'
        ? 'document.verified'
        : status === 'rejected'
          ? 'document.rejected'
          : 'document.pending',
    target: a.reference,
    meta: docName,
  });
  writeStore(s);
}

export function requestDocuments(appId: string, message: string): void {
  const s = readStore();
  const a = s.applications.find((x) => x.id === appId);
  if (!a) throw new Error(`Application ${appId} not found`);
  if (a.status !== 'missing_docs') {
    a.status = 'missing_docs';
  }
  pushAppEvent(a, { actor: ACTOR, action: 'Requested documents', note: message });
  pushAudit(s, {
    actor: ACTOR,
    action: 'application.docs_requested',
    target: a.reference,
    meta: message.slice(0, 80),
  });
  writeStore(s);
}

export function addNote(appId: string, note: string): void {
  const s = readStore();
  const a = s.applications.find((x) => x.id === appId);
  if (!a) throw new Error(`Application ${appId} not found`);
  pushAppEvent(a, { actor: ACTOR, action: 'Note added', note });
  pushAudit(s, {
    actor: ACTOR,
    action: 'application.note_added',
    target: a.reference,
    meta: note.slice(0, 80),
  });
  writeStore(s);
}

export function createApplication(input: { customerId: string; serviceId: string }): Application {
  const s = readStore();
  const svc = s.services.find((x) => x.id === input.serviceId);
  if (!svc) throw new Error(`Service ${input.serviceId} not found`);
  const customer = s.customers.find((x) => x.id === input.customerId);
  if (!customer) throw new Error(`Customer ${input.customerId} not found`);
  const now = new Date().toISOString();
  const vat = Math.round((svc.govFee + svc.serviceFee) * 0.05);
  const a: Application = {
    id: nextId('a', s.applications),
    reference: nextRef(s.applications),
    customerId: input.customerId,
    serviceId: input.serviceId,
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
    govFee: svc.govFee,
    serviceFee: svc.serviceFee,
    vat,
    total: svc.govFee + svc.serviceFee + vat,
    documents: [],
    events: [{ at: now, actor: customer.name, action: 'Submitted application' }],
  };
  s.applications.push(a);
  customer.applications += 1;
  pushAudit(s, {
    actor: ACTOR,
    action: 'application.submitted',
    target: a.reference,
    meta: svc.titleEn,
  });
  writeStore(s);
  return a;
}

// Helpers exposed to UI ───────────────────────────────────────────────────

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  missing_docs: 'Missing docs',
  with_government: 'With government',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'Closed',
};

export const STATUS_VARIANT: Record<
  ApplicationStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted'
> = {
  draft: 'muted',
  submitted: 'secondary',
  under_review: 'secondary',
  missing_docs: 'warning',
  with_government: 'default',
  approved: 'success',
  rejected: 'danger',
  closed: 'muted',
};

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  immigration: 'Immigration',
  labour: 'Labour',
  company: 'Company',
  transport: 'Transport',
  realEstate: 'Real estate',
  attestation: 'Attestation',
  medical: 'Medical',
  other: 'Other',
};

export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'Admin',
  staff: 'Staff',
  reviewer: 'Reviewer',
};

export function formatAed(n: number) {
  return `AED ${n.toLocaleString('en-AE')}`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  });
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}
