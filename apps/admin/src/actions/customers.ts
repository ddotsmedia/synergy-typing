'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

function reval() {
  revalidatePath('/customers');
  revalidatePath('/');
  revalidatePath('/audit-log');
}

export async function createCustomerAction(formData: FormData) {
  const input = {
    name: s(formData.get('name')),
    email: s(formData.get('email')),
    phone: s(formData.get('phone')),
    emiratesId: s(formData.get('emiratesId')),
  };
  if (!input.name || !input.email) return { error: 'Name and email are required.' };
  store.createCustomer(input);
  reval();
  return { ok: true as const };
}

export async function updateCustomerAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return { error: 'Missing id' };
  store.updateCustomer(id, {
    name: s(formData.get('name')),
    email: s(formData.get('email')),
    phone: s(formData.get('phone')),
    emiratesId: s(formData.get('emiratesId')),
  });
  reval();
  return { ok: true as const };
}

export async function deleteCustomerAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.deleteCustomer(id);
  reval();
}
