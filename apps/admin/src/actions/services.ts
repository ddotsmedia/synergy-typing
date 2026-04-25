'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';
import type { ServiceCategory } from '@synergy/db/types';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}
function n(v: FormDataEntryValue | null, fallback = 0): number {
  if (typeof v !== 'string') return fallback;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function reval() {
  revalidatePath('/services');
  revalidatePath('/fees');
  revalidatePath('/');
  revalidatePath('/audit-log');
}

export async function createServiceAction(formData: FormData) {
  const titleEn = s(formData.get('titleEn'));
  const titleAr = s(formData.get('titleAr'));
  if (!titleEn || !titleAr) return { error: 'Both English and Arabic titles are required.' };
  // Checkboxes only appear in form data when checked → we treat presence as true.
  const feesVisibleRaw = formData.get('feesVisible');
  store.createService({
    slug:
      s(formData.get('slug')) ||
      titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    titleEn,
    titleAr,
    category: (s(formData.get('category')) || 'other') as ServiceCategory,
    authority: s(formData.get('authority')),
    govFee: n(formData.get('govFee')),
    serviceFee: n(formData.get('serviceFee')),
    processingDays: n(formData.get('processingDays'), 1),
    active:
      formData.get('active') === 'on' ||
      formData.get('active') === 'true' ||
      formData.get('active') === null,
    feesVisible: feesVisibleRaw === 'on' || feesVisibleRaw === 'true' || feesVisibleRaw === null,
  });
  reval();
  return { ok: true as const };
}

export async function updateServiceAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return { error: 'Missing id' };
  // Distinguish "checkbox unchecked" (null) from "field not in form".
  // We always render the checkbox in the edit dialog, so absence = unchecked = false.
  const feesVisible =
    formData.get('feesVisible') === 'on' || formData.get('feesVisible') === 'true';
  store.updateService(id, {
    slug: s(formData.get('slug')),
    titleEn: s(formData.get('titleEn')),
    titleAr: s(formData.get('titleAr')),
    category: s(formData.get('category')) as ServiceCategory,
    authority: s(formData.get('authority')),
    govFee: n(formData.get('govFee')),
    serviceFee: n(formData.get('serviceFee')),
    processingDays: n(formData.get('processingDays'), 1),
    feesVisible,
  });
  reval();
  return { ok: true as const };
}

export async function updateFeesOnlyAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return { error: 'Missing id' };
  store.updateService(id, {
    govFee: n(formData.get('govFee')),
    serviceFee: n(formData.get('serviceFee')),
  });
  reval();
  return { ok: true as const };
}

export async function toggleServiceActiveAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.toggleServiceActive(id);
  reval();
}

export async function toggleServiceFeesVisibleAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.toggleServiceFeesVisible(id);
  reval();
}

export async function deleteServiceAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.deleteService(id);
  reval();
}
