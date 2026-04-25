import {
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  Car,
  FileCheck2,
  GraduationCap,
  Home,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wallet,
} from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Button } from '@synergy/ui/button';
import { Link } from '@/i18n/routing';
import { KnotPattern } from '@/components/knot-pattern';

const categories = [
  { key: 'immigration', icon: Users, href: '/services?category=immigration' },
  { key: 'labour', icon: Briefcase, href: '/services?category=labour' },
  { key: 'company', icon: Building2, href: '/services?category=company' },
  { key: 'transport', icon: Car, href: '/services?category=transport' },
  { key: 'realEstate', icon: Home, href: '/services?category=realEstate' },
  { key: 'attestation', icon: GraduationCap, href: '/services?category=attestation' },
  { key: 'medical', icon: Stethoscope, href: '/services?category=medical' },
  { key: 'other', icon: FileCheck2, href: '/services?category=other' },
] as const;

const trustItems = ['licensed', 'bilingual', 'secure', 'transparent'] as const;
const trustIcons: Record<(typeof trustItems)[number], typeof ShieldCheck> = {
  licensed: ShieldCheck,
  bilingual: Sparkles,
  secure: ShieldCheck,
  transparent: Wallet,
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <>
      {/* Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-subtle to-surface relative overflow-hidden border-b bg-gradient-to-b from-white via-white">
        <KnotPattern className="text-brand-secondary/40 pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[3fr_2fr] lg:py-28">
          <div className="space-y-8">
            <p className="border-brand-secondary/30 text-brand-primary inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
              <span className="bg-brand-secondary inline-block h-1.5 w-1.5 rounded-full" />
              {t('eyebrow')}
            </p>
            <h1 className="font-display text-display-lg text-brand-primary md:text-display-xl lg:text-display-2xl font-bold leading-[1.05] tracking-tight">
              {t('title')}
              <br />
              <span className="text-brand-secondary">{t('titleAccent')}</span>
            </h1>
            <p className="text-ink-muted max-w-2xl text-base leading-relaxed md:text-lg">
              {t('subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-6">
                <Link href="/services">
                  {t('ctaPrimary')} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-6">
                <Link href="/fee-calculator">
                  <Calculator className="h-4 w-4" /> {t('ctaSecondary')}
                </Link>
              </Button>
            </div>

            {/* KPI strip */}
            <dl className="border-subtle grid max-w-xl grid-cols-3 gap-6 border-t pt-6">
              {(['years', 'services', 'languages'] as const).map((k) => (
                <div key={k}>
                  <dd className="text-brand-primary text-2xl font-bold md:text-3xl">
                    {t(`kpis.${k}Value`)}
                  </dd>
                  <dt className="text-ink-subtle mt-1 text-[11px] font-medium uppercase tracking-wider">
                    {t(`kpis.${k}Label`)}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Search card — premium, anchored right */}
          <div className="relative">
            <div className="border-subtle rounded-2xl border bg-white p-6 shadow-lg lg:p-7">
              <p className="text-ink-subtle text-xs font-semibold uppercase tracking-wider">
                {t('search.label')}
              </p>
              <form action={`/${locale}/services`} className="mt-3 flex flex-col gap-3">
                <input
                  type="search"
                  name="q"
                  placeholder={t('search.placeholder')}
                  className="border-subtle text-ink placeholder:text-ink-subtle focus:border-brand-secondary focus:ring-brand-secondary/30 h-12 w-full rounded-md border bg-white px-4 text-sm focus:outline-none focus:ring-2"
                />
                <Button type="submit" size="lg" className="w-full">
                  {t('search.cta')}
                </Button>
              </form>
              <ul className="text-ink-muted mt-5 space-y-2.5 text-xs">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="text-brand-secondary h-3.5 w-3.5" />
                  TAMM-affiliated · TRN-registered
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="text-brand-secondary h-3.5 w-3.5" />
                  Documents encrypted · auto-purge after 90 days
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="text-brand-secondary h-3.5 w-3.5" />
                  Bilingual (EN / AR) including RTL forms
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Categories ───────────────────────────────────────────────────── */}
      <section className="border-subtle border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-display-md text-brand-primary font-bold">
              {t('categories.title')}
            </h2>
            <p className="text-ink-muted mt-3 text-base">{t('categories.subtitle')}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ key, icon: Icon, href }) => (
              <Link
                key={key}
                href={href}
                className="border-subtle hover:border-brand-secondary/50 group relative overflow-hidden rounded-xl border bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="bg-brand-secondary-soft text-brand-primary group-hover:bg-brand-secondary inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-brand-primary mt-4 text-base font-semibold">
                  {t(`categories.${key}.title`)}
                </h3>
                <p className="text-ink-muted mt-1 text-sm">{t(`categories.${key}.description`)}</p>
                <ArrowRight className="text-ink-subtle group-hover:text-brand-secondary absolute end-5 top-6 h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust band ───────────────────────────────────────────────────── */}
      <section className="border-subtle bg-surface border-b">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em]">
            {t('trust.eyebrow')}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((key) => {
              const Icon = trustIcons[key];
              return (
                <div key={key} className="border-subtle rounded-xl border bg-white p-6">
                  <span className="bg-brand-primary/5 text-brand-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-brand-primary mt-4 text-base font-semibold">
                    {t(`trust.items.${key}.title`)}
                  </h3>
                  <p className="text-ink-muted mt-1 text-sm leading-relaxed">
                    {t(`trust.items.${key}.body`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
