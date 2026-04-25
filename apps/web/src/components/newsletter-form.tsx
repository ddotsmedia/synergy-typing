'use client';

import { useActionState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { newsletterSubscribeAction, type LeadResult } from '@/actions/leads';

export function NewsletterForm({
  placeholder,
  cta,
  ariaLabel,
  successAr = false,
}: {
  placeholder: string;
  cta: string;
  ariaLabel: string;
  successAr?: boolean;
}) {
  const [state, action, pending] = useActionState<LeadResult, FormData>(
    newsletterSubscribeAction,
    null,
  );

  if (state && 'ok' in state) {
    return (
      <p className="text-success inline-flex items-center gap-2 text-sm font-medium">
        <Check className="h-4 w-4" /> {successAr ? 'تم الاشتراك. شكرًا لك!' : 'Subscribed. Thanks!'}
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder={placeholder}
        className="border-subtle text-ink focus:border-brand-secondary focus:ring-brand-secondary/25 h-10 flex-1 rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2"
        aria-label={ariaLabel}
      />
      <Button type="submit" disabled={pending}>
        {pending ? '…' : cta}
      </Button>
      {state && 'error' in state ? <span className="sr-only">{state.error}</span> : null}
    </form>
  );
}
