'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCommandPalette } from './command-palette';

export function CommandTrigger() {
  const { setOpen } = useCommandPalette();
  const t = useTranslations('header');

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="border-subtle bg-surface text-ink-subtle hover:border-brand-secondary/40 hover:text-brand-primary hidden h-9 w-full max-w-[18rem] items-center gap-2 rounded-full border px-3.5 text-sm transition-colors md:inline-flex"
      aria-label={t('search')}
    >
      <Search className="h-4 w-4" aria-hidden />
      <span className="flex-1 text-start text-[13px]">{t('search')}</span>
      <kbd className="border-subtle text-ink-subtle rounded border bg-white px-1.5 py-0.5 text-[10px] font-medium">
        ⌘K
      </kbd>
    </button>
  );
}
