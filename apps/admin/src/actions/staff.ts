'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';
import type { StaffRole } from '@synergy/db/types';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

function reval() {
  revalidatePath('/staff');
  revalidatePath('/audit-log');
}

export async function createStaffAction(formData: FormData) {
  const name = s(formData.get('name'));
  const email = s(formData.get('email'));
  if (!name || !email) return { error: 'Name and email are required.' };
  store.createStaff({
    name,
    email,
    role: (s(formData.get('role')) || 'staff') as StaffRole,
    branch: s(formData.get('branch')) || 'Musaffah HQ',
  });
  reval();
  return { ok: true as const };
}

export async function updateStaffAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return { error: 'Missing id' };
  store.updateStaff(id, {
    name: s(formData.get('name')),
    email: s(formData.get('email')),
    role: s(formData.get('role')) as StaffRole,
    branch: s(formData.get('branch')),
  });
  reval();
  return { ok: true as const };
}

export async function deleteStaffAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.deleteStaff(id);
  reval();
}
