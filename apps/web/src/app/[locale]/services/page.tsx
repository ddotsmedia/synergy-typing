import { Search } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CATEGORY_LABEL, formatAed, listServices } from '@synergy/db';
import type { ServiceCategory } from '@synergy/db/types';
import { Link } from '@/i18n/routing';
import { PageHero } from '@/components/page-hero';

const CATEGORIES: ServiceCategory[] = [
  'immigration',
  'labour',
  'company',
  'transport',
  'realEstate',
  'attestation',
  'medical',
  'other',
];

export default async function ServicesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().toLowerCase();
  const category = sp.category as ServiceCategory | undefined;

  const all = listServices().filter((s) => s.active);
  const filtered = all.filter((s) => {
    if (category && s.category !== category) return false;
    if (q) {
      const hay = `${s.titleEn} ${s.titleAr} ${s.authority} ${s.slug}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const isAr = locale === 'ar';

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'خدماتنا' : 'Our services'}
        title={isAr ? 'كل خدمات الطباعة في مكان واحد' : 'Every typing service in one place'}
        description={
          isAr
            ? 'اختر فئة، ابحث بالاسم، أو افتح أي خدمة لرؤية المستندات المطلوبة والرسوم الكاملة.'
            : 'Filter by category, search by name, or open any service to see the document checklist and full fees.'
        }
      >
        <form className="flex max-w-2xl flex-col gap-2 sm:flex-row" action="/services">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <div className="relative flex-1">
            <Search
              className="text-ink-subtle pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={isAr ? 'ابحث عن خدمة…' : 'Search services…'}
              className="border-subtle focus:border-brand-secondary focus:ring-brand-secondary/25 h-11 w-full rounded-md border bg-white pe-3 ps-10 text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-primary shadow-xs hover:bg-brand-primary-dark inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold text-white"
          >
            {isAr ? 'بحث' : 'Search'}
          </button>
        </form>
      </PageHero>

      <div className="border-subtle border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Link
              href={q ? `/services?q=${encodeURIComponent(q)}` : '/services'}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                !category
                  ? 'bg-brand-primary shadow-xs text-white'
                  : 'border-subtle text-ink-muted hover:border-brand-secondary hover:text-brand-primary border bg-white'
              }`}
            >
              {isAr ? 'الكل' : 'All'} · {all.length}
            </Link>
            {CATEGORIES.map((cat) => {
              const count = all.filter((s) => s.category === cat).length;
              if (!count) return null;
              const href = `/services?${new URLSearchParams({ ...(q ? { q } : {}), category: cat })}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-brand-primary shadow-xs text-white'
                      : 'border-subtle text-ink-muted hover:border-brand-secondary hover:text-brand-primary border bg-white'
                  }`}
                >
                  {CATEGORY_LABEL[cat]} · {count}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {filtered.length === 0 ? (
          <div className="border-subtle rounded-xl border bg-white p-12 text-center">
            <p className="text-brand-primary text-base font-semibold">
              {isAr ? 'لم يتم العثور على نتائج' : 'No matches yet'}
            </p>
            <p className="text-ink-muted mt-2 text-sm">
              {isAr
                ? 'جرّب كلمة بحث مختلفة أو اختر فئة أخرى.'
                : 'Try a different search term or pick another category.'}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => {
              const total = s.govFee + s.serviceFee + Math.round((s.govFee + s.serviceFee) * 0.05);
              return (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="border-subtle hover:border-brand-secondary/50 group flex h-full flex-col rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="bg-brand-secondary-soft text-brand-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {CATEGORY_LABEL[s.category]}
                      </span>
                      <span className="text-ink-subtle text-[11px] font-medium uppercase tracking-wider">
                        {s.authority}
                      </span>
                    </div>
                    <h3 className="text-brand-primary group-hover:text-brand-secondary-dark mt-3 text-lg font-semibold">
                      {isAr ? s.titleAr : s.titleEn}
                    </h3>
                    <p className="text-ink-subtle mt-1 text-sm" dir={isAr ? 'ltr' : 'rtl'}>
                      {isAr ? s.titleEn : s.titleAr}
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-4 text-sm">
                      <div>
                        <p className="text-ink-subtle text-[10px] font-medium uppercase tracking-wider">
                          {s.feesVisible
                            ? isAr
                              ? 'الإجمالي مع الضريبة'
                              : 'Total incl. VAT'
                            : isAr
                              ? 'الرسوم'
                              : 'Fees'}
                        </p>
                        <p
                          className={
                            s.feesVisible
                              ? 'text-brand-primary font-mono text-base font-semibold'
                              : 'text-brand-secondary-dark text-base font-semibold'
                          }
                        >
                          {s.feesVisible ? formatAed(total) : isAr ? 'حسب الطلب' : 'On request'}
                        </p>
                      </div>
                      <p className="text-ink-muted text-xs">
                        {s.processingDays}d {isAr ? 'تقريبًا' : 'avg'}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
