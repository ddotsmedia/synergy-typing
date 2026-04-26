'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { Select } from '@synergy/ui/select';
import { Textarea } from '@synergy/ui/textarea';
import { contactSubmitAction, type LeadResult } from '@/actions/leads';

const SUBJECT_OPTIONS = [
  { value: 'general', en: 'General inquiry', ar: 'استفسار عام' },
  { value: 'pricing', en: 'Pricing question', ar: 'استفسار عن الأسعار' },
  { value: 'service', en: 'Service availability', ar: 'توفر الخدمة' },
  { value: 'application', en: 'Application status', ar: 'حالة الطلب' },
  { value: 'documents', en: 'Document help', ar: 'مساعدة في المستندات' },
  { value: 'complaint', en: 'Complaint', ar: 'شكوى' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
] as const;

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
        <Field
          label={isAr ? 'رقم الهاتف' : 'Phone'}
          name="phone"
          type="tel"
          placeholder="+971 50 …"
        />
        <div className="space-y-1.5">
          <label
            htmlFor="subject"
            className="text-ink-subtle block text-xs font-semibold uppercase tracking-wider"
          >
            {isAr ? 'الموضوع' : 'Subject'}
          </label>
          <Select id="subject" name="subject" defaultValue="general">
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {isAr ? opt.ar : opt.en}
              </option>
            ))}
          </Select>
        </div>
      </div>
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
        <p className="text-danger bg-danger-soft rounded-md px-3 py-2 text-sm font-medium">
          {state.error}
        </p>
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
