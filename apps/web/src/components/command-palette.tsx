'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Calculator, HelpCircle, MessageSquare, Search as SearchIcon } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@synergy/ui/command';
import { useRouter } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

type Ctx = {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
};

const CommandPaletteContext = createContext<Ctx | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used inside CommandPaletteProvider');
  return ctx;
}

export type PaletteService = {
  slug: string;
  titleEn: string;
  titleAr: string;
  authority: string;
};

export function CommandPaletteProvider({
  services,
  children,
}: {
  services: PaletteService[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((p) => !p), []);
  const t = useTranslations('command');
  const locale = useLocale() as Locale;
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('placeholder')} />
        <CommandList>
          <CommandEmpty>{t('empty')}</CommandEmpty>
          <CommandGroup heading={t('groups.services')}>
            {services.map((s) => (
              <CommandItem
                key={s.slug}
                value={`${s.titleEn} ${s.titleAr} ${s.authority} ${s.slug}`}
                onSelect={() => go(`/services/${s.slug}`)}
              >
                <SearchIcon className="text-ink-subtle" aria-hidden />
                <span>{locale === 'ar' ? s.titleAr : s.titleEn}</span>
                <span className="text-ink-subtle ms-auto text-xs">{s.authority}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t('groups.actions')}>
            <CommandItem onSelect={() => go('/fee-calculator')}>
              <Calculator className="text-ink-subtle" aria-hidden />
              <span>{t('actions.fees')}</span>
            </CommandItem>
            <CommandItem onSelect={() => go('/track')}>
              <SearchIcon className="text-ink-subtle" aria-hidden />
              <span>{t('actions.track')}</span>
            </CommandItem>
            <CommandItem onSelect={() => go('/assistant')}>
              <MessageSquare className="text-ink-subtle" aria-hidden />
              <span>{t('actions.assistant')}</span>
            </CommandItem>
            <CommandItem onSelect={() => go('/faq')}>
              <HelpCircle className="text-ink-subtle" aria-hidden />
              <span>FAQ</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}
