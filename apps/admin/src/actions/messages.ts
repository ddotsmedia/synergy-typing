'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';
import type { MessageStatus } from '@synergy/db/types';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

function reval() {
  revalidatePath('/messages');
  revalidatePath('/');
  revalidatePath('/audit-log');
}

export async function setMessageStatusAction(formData: FormData) {
  const id = s(formData.get('id'));
  const status = s(formData.get('status')) as MessageStatus;
  if (!id || !status) return;
  store.setMessageStatus(id, status);
  reval();
}

export async function deleteMessageAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.deleteMessage(id);
  reval();
}
