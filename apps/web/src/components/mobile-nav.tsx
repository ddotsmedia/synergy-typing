'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@synergy/ui/sheet';
import { Button } from '@synergy/ui/button';
import { Link } from '@/i18n/routing';
import { navLinks } from '@/lib/nav-links';

export function MobileNav() {
  const tNav = useTranslations('nav');
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={tNav('openMenu')} className="md:hidden">
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="end" className="flex flex-col gap-2">
        <SheetHeader>
          <SheetTitle>Synergy Typing</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-ink hover:bg-surface hover:text-brand-primary rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {tNav(link.key)}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
