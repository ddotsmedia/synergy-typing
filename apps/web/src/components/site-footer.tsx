import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { brand } from '@synergy/config/tokens/brand';
import { getSettings } from '@synergy/db';
import { Button } from '@synergy/ui/button';
import { Link } from '@/i18n/routing';
import { BrandLogoLockup } from './brand-logo';
import { NewsletterForm } from './newsletter-form';
import { SocialIconRow } from './social-links';

const columns = [
  {
    key: 'services',
    links: [
      { key: 'immigration', href: '/services?category=immigration' },
      { key: 'labour', href: '/services?category=labour' },
      { key: 'company', href: '/services?category=company' },
      { key: 'transport', href: '/services?category=transport' },
    ],
  },
  {
    key: 'support',
    links: [
      { key: 'track', href: '/track' },
      { key: 'fees', href: '/fee-calculator' },
      { key: 'faq', href: '/faq' },
    ],
  },
  {
    key: 'company',
    links: [
      { key: 'about', href: '/about' },
      { key: 'contact', href: '/contact' },
      { key: 'careers', href: '/about' },
      { key: 'press', href: '/about' },
    ],
  },
  {
    key: 'legal',
    links: [
      { key: 'terms', href: '/about' },
      { key: 'privacy', href: '/about' },
      { key: 'refund', href: '/about' },
      { key: 'compliance', href: '/about' },
    ],
  },
] as const;

const govPartners = [
  { name: 'MOHRE', label: 'Ministry of Human Resources' },
  { name: 'ICA', label: 'Identity & Citizenship' },
  { name: 'TAMM', label: 'Abu Dhabi Government' },
  { name: 'ADP', label: 'Abu Dhabi Police' },
  { name: 'MOFA', label: 'Foreign Affairs' },
] as const;

const paymentBadges = ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'Telr'] as const;

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const tWa = await getTranslations('whatsapp');
  const locale = await getLocale();
  const year = new Date().getFullYear();
  const settings = getSettings();
  const isAr = locale === 'ar';
  const waHref = `https://wa.me/${brand.contact.whatsappDigits}?text=${encodeURIComponent(
    tWa('prefill'),
  )}`;

  return (
    <footer className="border-subtle mt-24 border-t bg-white">
      {/* Trusted-by strip — government partners */}
      <div className="border-subtle bg-surface border-b">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-ink-subtle text-[10px] font-semibold uppercase tracking-[0.2em]">
            {t('trust.partners')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-3">
            {govPartners.map((partner) => (
              <div key={partner.name} className="flex flex-col">
                <span className="text-brand-primary text-sm font-bold tracking-wide">
                  {partner.name}
                </span>
                <span className="text-ink-subtle text-[11px]">{partner.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[1.4fr_3fr]">
        <div className="space-y-5">
          <BrandLogoLockup className="!justify-start" />
          <p className="text-ink-muted max-w-sm text-sm leading-relaxed">{t('tagline')}</p>
          <ul className="text-ink-muted space-y-2 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="text-brand-secondary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{brand.contact.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="text-brand-secondary h-4 w-4 shrink-0" aria-hidden />
              <a
                href={`tel:${brand.contact.phone.replace(/\s+/g, '')}`}
                className="hover:text-brand-primary"
              >
                {brand.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="text-brand-secondary h-4 w-4 shrink-0" aria-hidden />
              <a href={`mailto:${brand.contact.email}`} className="hover:text-brand-primary">
                {brand.contact.email}
              </a>
            </li>
          </ul>
          <Button
            asChild
            size="sm"
            className="bg-success hover:bg-success/90 px-4 text-white shadow-sm"
          >
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden />
              {tWa('fab')}
            </a>
          </Button>
          <SocialIconRow links={settings.socialLinks} followLabel={isAr ? 'تابعنا' : 'Follow us'} />
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.key} className="space-y-3">
              <h3 className="text-ink-subtle text-[10px] font-semibold uppercase tracking-[0.2em]">
                {t(`columns.${col.key}.title`)}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-ink-muted hover:text-brand-primary text-sm transition-colors"
                    >
                      {t(`columns.${col.key}.links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter band */}
      <div className="border-subtle bg-surface-muted border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-brand-primary text-sm font-semibold">{t('newsletter.title')}</h3>
            <p className="text-ink-subtle text-xs">{t('newsletter.blurb')}</p>
          </div>
          <NewsletterForm
            placeholder={t('newsletter.placeholder')}
            cta={t('newsletter.cta')}
            ariaLabel={t('newsletter.title')}
            successAr={locale === 'ar'}
          />
        </div>
      </div>

      {/* Bottom bar — licence, TRN, payments, copyright */}
      <div className="border-subtle border-t bg-white">
        <div className="text-ink-subtle mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-xs md:flex-row md:items-center md:justify-between">
          <p>{t('rights', { year })}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-ink-muted font-medium">{t('trust.licence')}</span>
            <span className="text-ink-muted font-medium">{t('trust.trn')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {paymentBadges.map((badge) => (
              <span
                key={badge}
                className="border-subtle text-ink-subtle rounded border bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
