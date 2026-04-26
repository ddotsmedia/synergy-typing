'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';
import { MESSAGE_SUBJECTS, type MessageSubject } from '@synergy/db/types';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

export type LeadResult = { ok: true } | { error: string } | null;

/**
 * Newsletter sign-up. Until Resend is wired (STEP 5) we just log it server-
 * side. Replacing this with `store.createSubscriber()` is a one-line edit.
 */
export async function newsletterSubscribeAction(
  _prev: LeadResult,
  formData: FormData,
): Promise<LeadResult> {
  const email = s(formData.get('email'));
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }
  // eslint-disable-next-line no-console
  console.warn('[newsletter] subscribe stub:', email);
  return { ok: true };
}

/**
 * Contact-us submission — persists to the shared store as a Message so
 * admin sees it in /messages.
 */
export async function contactSubmitAction(
  _prev: LeadResult,
  formData: FormData,
): Promise<LeadResult> {
  const name = s(formData.get('name'));
  const email = s(formData.get('email'));
  const phone = s(formData.get('phone')) || undefined;
  const subjectRaw = s(formData.get('subject'));
  const body = s(formData.get('message'));
  const serviceId = s(formData.get('serviceId')) || undefined;

  if (!name || !email || !body) return { error: 'All fields are required.' };
  if (!email.includes('@')) return { error: 'Please enter a valid email address.' };

  const subject: MessageSubject | undefined =
    subjectRaw && (MESSAGE_SUBJECTS as readonly string[]).includes(subjectRaw)
      ? (subjectRaw as MessageSubject)
      : undefined;

  store.createMessage({
    name,
    email,
    phone,
    subject,
    body,
    serviceId,
    source: serviceId ? 'service-quote' : 'contact',
  });

  // Bust the admin pages so the new message appears immediately.
  revalidatePath('/messages');
  revalidatePath('/');
  revalidatePath('/audit-log');

  return { ok: true };
}
