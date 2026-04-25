'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as store from '@synergy/db';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

export type SubmitResult = { ok: true; reference: string; locale: string } | { error: string };

export async function submitApplicationAction(
  _prev: SubmitResult | null,
  formData: FormData,
): Promise<SubmitResult> {
  const slug = s(formData.get('slug'));
  const locale = s(formData.get('locale')) || 'en';
  const name = s(formData.get('name'));
  const email = s(formData.get('email'));
  const phone = s(formData.get('phone'));
  const emiratesId = s(formData.get('emiratesId'));

  if (!slug) return { error: 'Service slug is missing.' };
  if (!name || !email) return { error: 'Name and email are required.' };

  const service = store.listServices().find((s) => s.slug === slug);
  if (!service) return { error: 'That service is no longer available.' };

  // Find or create the customer (by email).
  let customer = store.listCustomers().find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!customer) {
    customer = store.createCustomer({ name, email, phone, emiratesId });
  } else if (phone || emiratesId) {
    // Backfill optional details if the customer has an existing record.
    store.updateCustomer(customer.id, {
      ...(name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(emiratesId ? { emiratesId } : {}),
    });
  }

  const app = store.createApplication({ customerId: customer.id, serviceId: service.id });
  revalidatePath('/track');
  revalidatePath(`/${locale}/track`);
  return { ok: true, reference: app.reference, locale };
}

export type TrackResult = { ok: true; appId: string } | { error: string } | null;

export async function trackApplicationAction(
  _prev: TrackResult,
  formData: FormData,
): Promise<TrackResult> {
  const reference = s(formData.get('reference')).toUpperCase();
  const email = s(formData.get('email')).toLowerCase();
  if (!reference || !email) return { error: 'Both reference and email are required.' };

  const app = store.listApplications().find((a) => a.reference.toUpperCase() === reference);
  if (!app) return { error: 'No application found for that reference.' };
  const customer = store.getCustomer(app.customerId);
  if (!customer || customer.email.toLowerCase() !== email) {
    // Don't reveal whether reference exists when email mismatches.
    return { error: 'No application found for that reference + email pair.' };
  }
  return { ok: true, appId: app.id };
}
