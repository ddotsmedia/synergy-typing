'use server';

// Stub server actions for newsletter + contact form.
// At Phase 1 these just log the submission server-side and return a success
// flag. Resend wiring + a leads collection land in STEP 5 / STEP 7.

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

export type LeadResult = { ok: true } | { error: string } | null;

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

export async function contactSubmitAction(
  _prev: LeadResult,
  formData: FormData,
): Promise<LeadResult> {
  const name = s(formData.get('name'));
  const email = s(formData.get('email'));
  const message = s(formData.get('message'));
  if (!name || !email || !message) return { error: 'All fields are required.' };
  // eslint-disable-next-line no-console
  console.warn('[contact] message stub:', { name, email, message: message.slice(0, 80) });
  return { ok: true };
}
