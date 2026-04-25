'use client';

import { useActionState, useState } from 'react';
import { Check, Mail, Pencil, Phone, ShieldCheck, X } from 'lucide-react';
import { Button } from '@synergy/ui/button';
import { Input } from '@synergy/ui/input';
import { updateProfileAction, type ProfileResult } from '@/actions/auth';
import type { Customer } from '@synergy/db/types';

export function ProfileEditCard({ customer, locale }: { customer: Customer; locale: string }) {
  const isAr = locale === 'ar';
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ProfileResult, FormData>(
    updateProfileAction,
    null,
  );

  if (!editing) {
    return (
      <div className="border-subtle rounded-2xl border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-brand-primary text-base font-semibold">
              {isAr ? 'ملفك الشخصي' : 'Your profile'}
            </h3>
            <p className="text-ink mt-1 text-lg font-bold">{customer.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <ul className="text-ink-muted mt-4 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Mail className="text-brand-secondary h-3.5 w-3.5" aria-hidden />
            {customer.email}
          </li>
          <li className="flex items-center gap-2">
            <Phone className="text-brand-secondary h-3.5 w-3.5" aria-hidden />
            {customer.phone || (isAr ? 'لم يضف بعد' : 'Not set')}
          </li>
          {customer.emiratesId ? (
            <li className="flex items-center gap-2 font-mono text-xs">
              <ShieldCheck className="text-brand-secondary h-3.5 w-3.5" aria-hidden />
              EID ••••{customer.emiratesId.slice(-4)}
            </li>
          ) : null}
        </ul>
        {state && 'ok' in state ? (
          <p className="text-success mt-3 inline-flex items-center gap-1 text-xs font-medium">
            <Check className="h-3 w-3" /> {isAr ? 'تم التحديث' : 'Updated'}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={(fd) => action(fd)} className="border-subtle rounded-2xl border bg-white p-6">
      <div className="flex items-start justify-between">
        <h3 className="text-brand-primary text-base font-semibold">
          {isAr ? 'تعديل الملف' : 'Edit profile'}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing(false)}
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <input type="hidden" name="id" value={customer.id} />
      <div className="mt-4 space-y-3">
        <label className="block space-y-1">
          <span className="text-ink-subtle text-[11px] font-semibold uppercase tracking-wider">
            {isAr ? 'الاسم' : 'Name'}
          </span>
          <Input name="name" defaultValue={customer.name} required />
        </label>
        <label className="block space-y-1">
          <span className="text-ink-subtle text-[11px] font-semibold uppercase tracking-wider">
            {isAr ? 'الهاتف' : 'Phone'}
          </span>
          <Input name="phone" type="tel" defaultValue={customer.phone} />
        </label>
        <p className="text-ink-subtle text-[11px]">
          {isAr ? 'لتغيير البريد، تواصل معنا.' : 'To change your email, message us.'}
        </p>
      </div>
      {state && 'error' in state ? <p className="text-danger mt-3 text-sm">{state.error}</p> : null}
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="mt-4 w-full"
        onClick={() => setTimeout(() => setEditing(false), 600)}
      >
        {pending ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : isAr ? 'حفظ' : 'Save'}
      </Button>
    </form>
  );
}
