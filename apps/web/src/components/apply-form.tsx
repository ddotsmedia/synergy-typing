'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { Link } from '@/i18n/routing';
import { submitApplicationAction, type SubmitResult } from '@/actions/applications';

export function ApplyForm({ slug, locale }: { slug: string; locale: string }) {
  const isAr = locale === 'ar';
  const [state, action, pending] = useActionState<SubmitResult | null, FormData>(
    submitApplicationAction,
    null,
  );

  if (state && 'ok' in state) {
    return (
      <div className="border-success-soft bg-success-soft rounded-2xl border p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-success mt-0.5 h-6 w-6" aria-hidden />
          <div className="space-y-3">
            <h2 className="text-success text-xl font-bold">
              {isAr ? 'تم استلام طلبك!' : 'Application received!'}
            </h2>
            <p className="text-ink-muted text-sm">
              {isAr ? 'رقمك المرجعي:' : 'Your reference number is:'}{' '}
              <span className="text-brand-primary font-mono text-base font-semibold">
                {state.reference}
              </span>
            </p>
            <p className="text-ink-muted text-sm">
              {isAr
                ? 'احتفظ بهذا الرقم لمتابعة طلبك أو تواصل معنا عبر واتساب لأي استفسار.'
                : 'Save this number to follow your application status. You can also message us on WhatsApp for any update.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild>
                <Link href={`/track?app=${state.reference}`}>
                  {isAr ? 'متابعة الطلب' : 'Track application'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/services">{isAr ? 'تصفّح خدمات أخرى' : 'Browse more services'}</Link>
              </Button>
            </div>
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
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={isAr ? 'الاسم الكامل' : 'Full name'}
          name="name"
          required
          placeholder={isAr ? 'كما في جواز السفر' : 'As written in your passport'}
        />
        <Field
          label={isAr ? 'البريد الإلكتروني' : 'Email'}
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
        <Field
          label={isAr ? 'رقم الهاتف' : 'Phone number'}
          name="phone"
          type="tel"
          placeholder="+971 50 …"
        />
        <Field
          label={isAr ? 'رقم الهوية الإماراتية' : 'Emirates ID'}
          name="emiratesId"
          placeholder="784-YYYY-XXXXXXX-X"
          hint={isAr ? 'لا يُحفظ في السجلات الكاملة.' : 'Never logged in plaintext.'}
        />
      </div>

      <div className="border-subtle bg-surface text-ink-muted rounded-lg border p-4 text-xs leading-relaxed">
        {isAr
          ? 'بالضغط على «تقديم» أنت توافق على شروط الخدمة وسياسة الخصوصية. لن نقوم برفع المستندات حتى يتأكد فريقنا من المعلومات المقدّمة.'
          : 'By clicking submit you agree to our terms of service and privacy policy. Document uploads + payment open after our team confirms your details.'}
      </div>

      {state && 'error' in state ? (
        <p className="text-danger text-sm font-medium">{state.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending
          ? isAr
            ? 'جارٍ الإرسال…'
            : 'Submitting…'
          : isAr
            ? 'تقديم الطلب'
            : 'Submit application'}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = props.name ?? props.id;
  return (
    <label htmlFor={id} className="space-y-1.5">
      <span className="text-ink-subtle block text-xs font-semibold uppercase tracking-wider">
        {label}
      </span>
      <Input id={id} {...props} />
      {hint ? <span className="text-ink-subtle block text-[11px]">{hint}</span> : null}
    </label>
  );
}
