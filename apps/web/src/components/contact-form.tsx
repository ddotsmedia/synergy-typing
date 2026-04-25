'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { Textarea } from '@synergy/ui/textarea';
import { contactSubmitAction, type LeadResult } from '@/actions/leads';

export function ContactForm({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const [state, action, pending] = useActionState<LeadResult, FormData>(contactSubmitAction, null);

  if (state && 'ok' in state) {
    return (
      <div className="border-success-soft bg-success-soft rounded-2xl border p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-success mt-0.5 h-6 w-6" aria-hidden />
          <div>
            <h3 className="text-success text-lg font-bold">
              {isAr ? 'تم استلام رسالتك' : 'Message received'}
            </h3>
            <p className="text-ink-muted mt-1 text-sm">
              {isAr
                ? 'سنرد عليك خلال ساعة عمل واحدة عادةً.'
                : "We'll get back to you within one business hour."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="border-subtle space-y-5 rounded-2xl border bg-white p-6 lg:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isAr ? 'الاسم' : 'Name'} name="name" required />
        <Field label={isAr ? 'البريد الإلكتروني' : 'Email'} name="email" type="email" required />
      </div>
      <Field label={isAr ? 'الموضوع' : 'Subject'} name="subject" />
      <div className="space-y-1.5">
        <label
          htmlFor="message"
          className="text-ink-subtle block text-xs font-semibold uppercase tracking-wider"
        >
          {isAr ? 'كيف يمكننا المساعدة؟' : 'How can we help?'}
        </label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder={isAr ? 'اكتب تفاصيل طلبك…' : 'Tell us a bit about what you need…'}
        />
      </div>
      {state && 'error' in state ? (
        <p className="text-danger text-sm font-medium">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (isAr ? 'جارٍ الإرسال…' : 'Sending…') : isAr ? 'إرسال الرسالة' : 'Send message'}
      </Button>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={rest.name}
        className="text-ink-subtle block text-xs font-semibold uppercase tracking-wider"
      >
        {label}
      </label>
      <Input id={rest.name} {...rest} />
    </div>
  );
}
