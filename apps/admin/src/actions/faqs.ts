'use server';

import { revalidatePath } from 'next/cache';
import * as store from '@synergy/db';

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

function reval() {
  revalidatePath('/faqs');
  revalidatePath('/audit-log');
}

export async function createFaqAction(formData: FormData) {
  const category = s(formData.get('category'));
  const question = s(formData.get('question'));
  const answer = s(formData.get('answer'));
  if (!category || !question || !answer) return { error: 'All fields are required.' };
  store.createFaq({ category, question, answer, published: formData.get('published') === 'on' });
  reval();
  return { ok: true as const };
}

export async function updateFaqAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return { error: 'Missing id' };
  store.updateFaq(id, {
    category: s(formData.get('category')),
    question: s(formData.get('question')),
    answer: s(formData.get('answer')),
  });
  reval();
  return { ok: true as const };
}

export async function toggleFaqPublishedAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.toggleFaqPublished(id);
  reval();
}

export async function deleteFaqAction(formData: FormData) {
  const id = s(formData.get('id'));
  if (!id) return;
  store.deleteFaq(id);
  reval();
}
