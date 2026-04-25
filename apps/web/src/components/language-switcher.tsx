'use client';

import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@synergy/ui/dropdown-menu';
import { Button } from '@synergy/ui/button';
import { useRouter, usePathname } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('label')}
          className="text-brand-primary gap-1.5"
        >
          <Globe className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onSelect={() => switchTo('en')} aria-current={locale === 'en'}>
          {t('english')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => switchTo('ar')} aria-current={locale === 'ar'}>
          {t('arabic')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
