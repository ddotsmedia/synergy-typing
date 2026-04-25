'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';
import type { Integration, SocialPlatform } from '@synergy/db/types';
import { SOCIAL_PLATFORMS } from '@synergy/db/types';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function updateSettingsAction(formData: FormData) {
  store.updateSettings({
    tradeName: s(formData.get('tradeName')),
    phone: s(formData.get('phone')),
    whatsapp: s(formData.get('whatsapp')),
    email: s(formData.get('email')),
    address: s(formData.get('address')),
    licence: s(formData.get('licence')),
    trn: s(formData.get('trn')),
  });
  revalidatePath('/settings');
  revalidatePath('/audit-log');
  return { ok: true as const };
}

export async function updateSocialLinksAction(formData: FormData) {
  const next: Partial<Record<SocialPlatform, string>> = {};
  for (const k of SOCIAL_PLATFORMS) {
    const raw = s(formData.get(k));
    // Light validation: must look like an http(s) URL or be empty.
    if (raw && !/^https?:\/\//i.test(raw)) {
      return { error: `${k}: enter a full URL starting with http:// or https://` };
    }
    next[k] = raw;
  }
  store.updateSocialLinks(next);
  revalidatePath('/settings');
  revalidatePath('/audit-log');
  return { ok: true as const };
}

export async function setIntegrationStatusAction(formData: FormData) {
  const name = s(formData.get('name'));
  const status = s(formData.get('status')) as Integration['status'];
  if (!name || !status) return;
  store.setIntegrationStatus(name, status);
  revalidatePath('/settings');
  revalidatePath('/audit-log');
}

export async function resetToSeedAction() {
  store.resetToSeed();
  revalidatePath('/');
  revalidatePath('/applications');
  revalidatePath('/customers');
  revalidatePath('/services');
  revalidatePath('/fees');
  revalidatePath('/faqs');
  revalidatePath('/staff');
  revalidatePath('/audit-log');
  revalidatePath('/settings');
}
