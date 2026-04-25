import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { listServices } from '@synergy/db';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WhatsAppFab } from '@/components/whatsapp-fab';
import { CommandPaletteProvider } from '@/components/command-palette';
import '@/app/globals.css';

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale as Locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const paletteServices = listServices()
    .filter((s) => s.active)
    .map((s) => ({
      slug: s.slug,
      titleEn: s.titleEn,
      titleAr: s.titleAr,
      authority: s.authority,
    }));

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} ${inter.variable}`}>
      <body className="bg-surface text-ink min-h-screen font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <CommandPaletteProvider services={paletteServices}>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <WhatsAppFab />
          </CommandPaletteProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
