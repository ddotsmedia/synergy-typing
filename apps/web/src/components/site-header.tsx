import { LogIn, MessageCircle, Phone, UserCircle2 } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { brand } from '@synergy/config/tokens/brand';
import { Button } from '@synergy/ui/button';
import { Link } from '@/i18n/routing';
import { navLinks } from '@/lib/nav-links';
import { getSession } from '@/lib/session';
import { BrandLogoLockup } from './brand-logo';
import { LanguageSwitcher } from './language-switcher';
import { CommandTrigger } from './command-trigger';
import { MobileNav } from './mobile-nav';

export async function SiteHeader() {
  const tNav = await getTranslations('nav');
  const tHeader = await getTranslations('header');
  const tWa = await getTranslations('whatsapp');
  const locale = await getLocale();
  const session = await getSession();
  const isAr = locale === 'ar';
  const waHref = `https://wa.me/${brand.contact.whatsappDigits}?text=${encodeURIComponent(
    'Hello Synergy',
  )}`;

  return (
    <header className="border-subtle sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md">
      {/* Slim utility bar — phone, hours, language. Hidden on mobile to save vertical space. */}
      <div className="border-subtle hidden border-b bg-white/60 md:block">
        <div className="text-ink-muted mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-xs">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${brand.contact.phone.replace(/\s+/g, '')}`}
              className="hover:text-brand-primary inline-flex items-center gap-1.5 transition-colors"
            >
              <Phone className="h-3 w-3" aria-hidden />
              {brand.contact.phone}
            </a>
            <span className="text-border-strong">·</span>
            <span>Sat–Thu 8:00–22:00 · Fri 14:00–22:00</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-ink-subtle">Licensed UAE typing centre · Abu Dhabi</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-4 md:px-6">
        <BrandLogoLockup />

        <nav className="ms-auto hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-muted hover:bg-surface-muted hover:text-brand-primary rounded-md px-3 py-2 text-[13px] font-medium transition-colors"
            >
              {tNav(link.key)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <CommandTrigger />
          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
          {session ? (
            <Button asChild variant="ghost" size="sm" className="hidden gap-2 sm:inline-flex">
              <Link href="/account">
                <UserCircle2 className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">{isAr ? 'حسابي' : 'My account'}</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden gap-2 sm:inline-flex">
              <Link href="/sign-in">
                <LogIn className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">{isAr ? 'تسجيل الدخول' : 'Sign in'}</span>
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="default"
            size="sm"
            className="bg-success hover:bg-success/90 hidden px-4 text-white shadow-sm sm:inline-flex"
          >
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden />
              <span>{tHeader('whatsapp')}</span>
              <span className="sr-only"> — {tWa('fab')}</span>
            </a>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
