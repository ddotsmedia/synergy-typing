'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { Textarea } from '@synergy/ui/textarea';
import { ConfirmActionForm, FieldRow, FormDialog } from './form-dialog';
import {
  createFaqAction,
  deleteFaqAction,
  toggleFaqPublishedAction,
  updateFaqAction,
} from '@/actions/faqs';
import type { Faq } from '@synergy/db/types';

function FaqFields({ faq }: { faq?: Faq }) {
  return (
    <>
      <FieldRow label="Category" htmlFor="category">
        <Input
          id="category"
          name="category"
          defaultValue={faq?.category}
          placeholder="Immigration, Labour, …"
          required
        />
      </FieldRow>
      <FieldRow label="Question" htmlFor="question">
        <Input id="question" name="question" defaultValue={faq?.question} required />
      </FieldRow>
      <FieldRow label="Answer" htmlFor="answer">
        <Textarea id="answer" name="answer" defaultValue={faq?.answer} rows={4} required />
      </FieldRow>
    </>
  );
}

export function NewFaqButton() {
  return (
    <FormDialog
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      }
      title="Add FAQ"
      action={createFaqAction}
    >
      <FaqFields />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" /> Publish immediately
      </label>
    </FormDialog>
  );
}

export function EditFaqButton({ faq }: { faq: Faq }) {
  return (
    <FormDialog
      trigger={
        <Button variant="ghost" size="sm" aria-label="Edit FAQ">
          <Pencil className="h-4 w-4" />
        </Button>
      }
      title="Edit FAQ"
      action={updateFaqAction}
    >
      <input type="hidden" name="id" value={faq.id} />
      <FaqFields faq={faq} />
    </FormDialog>
  );
}

export function ToggleFaqPublishedForm({ faq }: { faq: Faq }) {
  return (
    <form action={toggleFaqPublishedAction}>
      <input type="hidden" name="id" value={faq.id} />
      <button
        type="submit"
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
          faq.published
            ? 'bg-success/15 text-success hover:bg-success/25'
            : 'bg-surface text-muted hover:bg-brand-primary/10'
        }`}
      >
        {faq.published ? 'Published' : 'Draft'}
      </button>
    </form>
  );
}

export function DeleteFaqButton({ faq }: { faq: Faq }) {
  return (
    <ConfirmActionForm
      trigger={
        <Button variant="ghost" size="sm" aria-label="Delete FAQ">
          <Trash2 className="text-danger h-4 w-4" />
        </Button>
      }
      title="Delete FAQ?"
      description="This removes it from the customer site immediately."
      action={deleteFaqAction}
      hiddenFields={{ id: faq.id }}
    />
  );
}
