'use client';

import { useActionState } from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { signInAction, type SignInResult } from '@/actions/auth';

export function SignInForm({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const [state, action, pending] = useActionState<SignInResult, FormData>(signInAction, null);

  return (
    <form
      action={action}
      className="border-subtle space-y-5 rounded-2xl border bg-white p-6 lg:p-8"
    >
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-ink-subtle block text-xs font-semibold uppercase tracking-wider"
        >
          {isAr ? 'البريد الإلكتروني' : 'Email'}
        </label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="reference"
          className="text-ink-subtle block text-xs font-semibold uppercase tracking-wider"
        >
          {isAr ? 'رقم مرجعي لأي طلب' : 'Any application reference number'}
        </label>
        <Input id="reference" name="reference" required placeholder="STS-2026-XXXX" />
        <p className="text-ink-subtle text-[11px]">
          {isAr
            ? 'تجد الرقم المرجعي في رسالة التأكيد التي وصلتك بعد التقديم.'
            : 'You can find this in the confirmation you received after submitting an application.'}
        </p>
      </div>
      {state && 'error' in state ? (
        <p className="bg-danger-soft text-danger rounded-md px-3 py-2 text-sm font-medium">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <LogIn className="h-4 w-4" />
        {pending ? (isAr ? 'جارٍ الدخول…' : 'Signing in…') : isAr ? 'تسجيل الدخول' : 'Sign in'}
      </Button>
    </form>
  );
}
