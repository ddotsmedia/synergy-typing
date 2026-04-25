'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';
import type { ApplicationStatus } from '@synergy/db/types';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

function reval(id?: string) {
  revalidatePath('/applications');
  if (id) revalidatePath(`/applications/${id}`);
  revalidatePath('/');
  revalidatePath('/audit-log');
}

export async function assignApplicationAction(formData: FormData) {
  const id = s(formData.get('id'));
  const staffId = s(formData.get('staffId'));
  if (!id) return { error: 'Missing id' };
  store.assignApplication(id, staffId || null);
  reval(id);
  return { ok: true as const };
}

export async function transitionApplicationAction(formData: FormData) {
  const id = s(formData.get('id'));
  const status = s(formData.get('status')) as ApplicationStatus;
  const note = s(formData.get('note')) || undefined;
  if (!id || !status) return { error: 'Missing id or status' };
  try {
    store.transitionApplication(id, status, note);
    reval(id);
    return { ok: true as const };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function setDocumentStatusAction(formData: FormData) {
  const id = s(formData.get('id'));
  const docName = s(formData.get('docName'));
  const status = s(formData.get('status')) as 'verified' | 'rejected' | 'pending';
  if (!id || !docName || !status) return;
  store.setDocumentStatus(id, docName, status);
  reval(id);
}

export async function requestDocumentsAction(formData: FormData) {
  const id = s(formData.get('id'));
  const message = s(formData.get('message'));
  if (!id || !message) return { error: 'Message is required' };
  store.requestDocuments(id, message);
  reval(id);
  return { ok: true as const };
}

export async function addNoteAction(formData: FormData) {
  const id = s(formData.get('id'));
  const note = s(formData.get('note'));
  if (!id || !note) return { error: 'Note is required' };
  store.addNote(id, note);
  reval(id);
  return { ok: true as const };
}

export async function createApplicationAction(formData: FormData) {
  const customerId = s(formData.get('customerId'));
  const serviceId = s(formData.get('serviceId'));
  if (!customerId || !serviceId) return { error: 'Customer and service are required.' };
  store.createApplication({ customerId, serviceId });
  reval();
  return { ok: true as const };
}
