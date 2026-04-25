'use server';

import { redirect } from 'next/navigation';
import * as store from '@synergy/db';
import { clearSession, setSession } from '@/lib/session';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

export type SignInResult = { error: string } | null;

/**
 * Cookie-stub sign-in: customer proves identity by knowing one of their own
 * application reference numbers + the email they used. Both must match.
 *
 * Real magic-link auth lands in STEP 6 — this is the placeholder shape.
 */
export async function signInAction(_prev: SignInResult, formData: FormData): Promise<SignInResult> {
  const email = s(formData.get('email')).toLowerCase();
  const reference = s(formData.get('reference')).toUpperCase();
  const locale = s(formData.get('locale')) || 'en';

  if (!email || !reference) {
    return { error: 'Both email and reference number are required.' };
  }

  // Find an application matching the reference.
  const app = store.listApplications().find((a) => a.reference.toUpperCase() === reference);
  if (!app) {
    return { error: 'No application found for that reference + email pair.' };
  }
  const customer = store.getCustomer(app.customerId);
  if (!customer || customer.email.toLowerCase() !== email) {
    // Constant-error so we don't reveal which half is wrong.
    return { error: 'No application found for that reference + email pair.' };
  }

  await setSession(customer.id);
  redirect(`/${locale}/account`);
}

export async function signOutAction(formData: FormData) {
  const locale = s(formData.get('locale')) || 'en';
  await clearSession();
  redirect(`/${locale}`);
}

export type ProfileResult = { ok: true } | { error: string } | null;

export async function updateProfileAction(
  _prev: ProfileResult,
  formData: FormData,
): Promise<ProfileResult> {
  const id = s(formData.get('id'));
  if (!id) return { error: 'Missing id' };
  const patch: Record<string, string> = {};
  const name = s(formData.get('name'));
  const phone = s(formData.get('phone'));
  if (name) patch.name = name;
  if (phone) patch.phone = phone;
  if (Object.keys(patch).length === 0) return { error: 'Nothing to update.' };
  store.updateCustomer(id, patch);
  return { ok: true };
}
