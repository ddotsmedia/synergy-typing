import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { listServices, formatAed } from '@synergy/db';
import { PageHero } from '@/components/page-hero';
import { ApplyForm } from '@/components/apply-form';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = listServices().find((s) => s.slug === slug);
  if (!service) notFound();
  const isAr = locale === 'ar';
  const total =
    service.govFee + service.serviceFee + Math.round((service.govFee + service.serviceFee) * 0.05);

  return (
    <>
      <div className="border-subtle border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Link
            href={`/services/${slug}`}
            className="text-ink-subtle hover:text-brand-primary inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isAr ? 'العودة لتفاصيل الخدمة' : 'Back to service details'}
          </Link>
        </div>
      </div>
      <PageHero
        eyebrow={isAr ? 'التقديم' : 'Apply online'}
        title={isAr ? service.titleAr : service.titleEn}
        description={
          isAr
            ? 'أدخل بياناتك الأساسية وسنبدأ معالجة الطلب فورًا. ستحصل على رقم مرجعي للمتابعة.'
            : "Tell us who you are and we'll start processing your application straight away. You'll get a reference number to track progress."
        }
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[2fr_1fr] lg:py-16">
        <ApplyForm slug={slug} locale={locale} />
        <aside>
          <div className="border-subtle sticky top-32 space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.18em]">
              {service.feesVisible
                ? isAr
                  ? 'ما تدفعه'
                  : "You're paying"
                : isAr
                  ? 'التسعير'
                  : 'Pricing'}
            </p>
            {service.feesVisible ? (
              <>
                <p className="text-brand-primary font-mono text-3xl font-bold">
                  {formatAed(total)}
                </p>
                <p className="text-ink-subtle text-xs">
                  {isAr
                    ? 'يشمل رسوم حكومية + خدمة + ضريبة ٥٪.'
                    : 'Includes government fee + service fee + 5% VAT.'}
                </p>
              </>
            ) : (
              <>
                <p className="text-brand-primary text-3xl font-bold">
                  {isAr ? 'حسب الطلب' : 'On request'}
                </p>
                <p className="text-ink-subtle text-xs">
                  {isAr
                    ? 'سنرسل عرض سعر تفصيلي بعد مراجعة بياناتك.'
                    : "You'll get an itemised quote once we review your details — before any payment is required."}
                </p>
              </>
            )}
            <div className="text-ink-muted mt-4 space-y-2 text-xs">
              <p>
                <span className="text-ink font-semibold">
                  {isAr ? 'مدة المعالجة:' : 'Processing time:'}
                </span>{' '}
                {service.processingDays} {isAr ? 'يوم تقريبًا' : 'days avg'}
              </p>
              <p>
                <span className="text-ink font-semibold">{isAr ? 'الجهة:' : 'Authority:'}</span>{' '}
                {service.authority}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
