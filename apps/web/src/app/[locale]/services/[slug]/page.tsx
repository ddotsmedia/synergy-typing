import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText, Shield } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CATEGORY_LABEL, formatAed, listServices } from '@synergy/db';
import { Link } from '@/i18n/routing';
import { Button } from '@synergy/ui/button';

// Doc checklists are static for now; real per-service requirements arrive in STEP 2.
const docChecklists: Record<string, { en: string; ar: string }[]> = {
  'employment-visa': [
    { en: 'Passport (colour, valid 6+ months)', ar: 'جواز السفر (ساري لأكثر من ٦ أشهر)' },
    { en: 'Passport-size photo, white background', ar: 'صورة شخصية بخلفية بيضاء' },
    { en: 'Job offer letter', ar: 'عرض العمل' },
    { en: 'Educational certificates (attested)', ar: 'الشهادات الدراسية (مصدّقة)' },
  ],
  'family-visa-spouse': [
    { en: 'Sponsor passport + Emirates ID', ar: 'جواز سفر الكفيل + الهوية' },
    { en: 'Marriage certificate (attested)', ar: 'شهادة الزواج (مصدّقة)' },
    {
      en: 'Salary certificate (min AED 4000 + accommodation)',
      ar: 'شهادة راتب (الحد الأدنى ٤٠٠٠ + سكن)',
    },
    { en: 'Tenancy contract (Tawtheeq)', ar: 'عقد إيجار موثّق (توثيق)' },
  ],
  'emirates-id-renewal': [
    { en: 'Old Emirates ID', ar: 'الهوية الإماراتية القديمة' },
    { en: 'Recent passport-size photo', ar: 'صورة شخصية حديثة' },
  ],
};

const fallbackDocs = [
  { en: 'Original passport', ar: 'جواز سفر أصلي' },
  { en: 'Recent passport-size photo', ar: 'صورة شخصية حديثة' },
  { en: 'Application form (we type it for you)', ar: 'استمارة الطلب (نقوم بطباعتها)' },
];

export async function generateStaticParams() {
  return listServices().map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = listServices().find((s) => s.slug === slug);
  if (!service) notFound();
  const isAr = locale === 'ar';
  const docs = docChecklists[slug] ?? fallbackDocs;
  const vat = Math.round((service.govFee + service.serviceFee) * 0.05);
  const total = service.govFee + service.serviceFee + vat;

  return (
    <>
      <div className="border-subtle border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <Link
            href="/services"
            className="text-ink-subtle hover:text-brand-primary inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isAr ? 'كل الخدمات' : 'All services'}
          </Link>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[2fr_1fr] lg:py-16">
        <div className="space-y-8">
          <header className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <span className="bg-brand-secondary-soft text-brand-primary rounded-full px-2.5 py-0.5">
                {CATEGORY_LABEL[service.category]}
              </span>
              <span className="text-ink-subtle">· {service.authority}</span>
            </div>
            <h1 className="text-display-lg text-brand-primary md:text-display-xl font-bold leading-tight">
              {isAr ? service.titleAr : service.titleEn}
            </h1>
            <p className="text-ink-muted text-base" dir={isAr ? 'ltr' : 'rtl'}>
              {isAr ? service.titleEn : service.titleAr}
            </p>
          </header>

          <div className="border-subtle rounded-xl border bg-white p-6 lg:p-7">
            <h2 className="text-brand-primary text-base font-semibold">
              {isAr ? 'مستندات تحتاجها' : "Documents you'll need"}
            </h2>
            <p className="text-ink-muted mt-1 text-sm">
              {isAr
                ? 'أحضر النسخ الأصلية للمكتب — أو ارفع المسحوبات أثناء التقديم.'
                : 'Bring the originals to the centre — or upload scans during the online apply flow.'}
            </p>
            <ul className="mt-5 space-y-3">
              {docs.map((doc, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-brand-secondary-soft text-brand-secondary-dark mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="text-ink text-sm">{isAr ? doc.ar : doc.en}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-subtle rounded-xl border bg-white p-5">
              <Clock className="text-brand-secondary h-5 w-5" aria-hidden />
              <p className="text-ink-subtle mt-3 text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'وقت المعالجة' : 'Processing time'}
              </p>
              <p className="text-brand-primary mt-1 text-2xl font-bold">
                {service.processingDays} {isAr ? 'يوم' : 'days'}
              </p>
              <p className="text-ink-subtle mt-1 text-xs">
                {isAr
                  ? 'تقريبًا، حسب جدول الجهة الحكومية.'
                  : 'Average, depending on the authority.'}
              </p>
            </div>
            <div className="border-subtle rounded-xl border bg-white p-5">
              <Shield className="text-brand-secondary h-5 w-5" aria-hidden />
              <p className="text-ink-subtle mt-3 text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'الجهة المختصة' : 'Governing authority'}
              </p>
              <p className="text-brand-primary mt-1 text-2xl font-bold">{service.authority}</p>
              <p className="text-ink-subtle mt-1 text-xs">
                {isAr
                  ? 'نقدّم الطلب نيابةً عنك بعد التحقق منه.'
                  : 'We submit on your behalf after verifying.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky fees + apply card */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          {service.feesVisible ? (
            <div className="border-subtle rounded-2xl border bg-white p-6 shadow-md">
              <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.18em]">
                {isAr ? 'الرسوم' : 'Fees'}
              </p>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-muted">{isAr ? 'رسوم حكومية' : 'Government fee'}</dt>
                  <dd className="font-mono">{formatAed(service.govFee)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-muted">{isAr ? 'رسوم خدمة' : 'Service fee'}</dt>
                  <dd className="font-mono">{formatAed(service.serviceFee)}</dd>
                </div>
                <div className="text-ink-subtle flex items-baseline justify-between">
                  <dt>{isAr ? 'ضريبة (٥٪)' : 'VAT (5%)'}</dt>
                  <dd className="font-mono">{formatAed(vat)}</dd>
                </div>
              </dl>
              <div className="border-subtle mt-4 border-t pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-brand-primary text-sm font-semibold">
                    {isAr ? 'الإجمالي' : 'Total'}
                  </span>
                  <span className="text-brand-primary font-mono text-2xl font-bold">
                    {formatAed(total)}
                  </span>
                </div>
              </div>
              <Button asChild size="lg" className="mt-5 w-full">
                <Link href={`/apply/${service.slug}`}>
                  {isAr ? 'ابدأ التقديم' : 'Start application'}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="mt-2 w-full">
                <Link href={`/fee-calculator?service=${service.id}`}>
                  {isAr ? 'افتح في الحاسبة' : 'Open in calculator'}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="border-subtle rounded-2xl border bg-white p-6 shadow-md">
              <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.18em]">
                {isAr ? 'التسعير' : 'Pricing'}
              </p>
              <p className="text-brand-primary mt-3 text-2xl font-bold">
                {isAr ? 'حسب الطلب' : 'On request'}
              </p>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                {isAr
                  ? 'الرسوم تختلف حسب التفاصيل الخاصة بحالتك. تواصل معنا للحصول على عرض دقيق.'
                  : 'Fees depend on the specifics of your case. Contact us for a precise quote — we usually reply within an hour.'}
              </p>
              <Button asChild size="lg" className="mt-5 w-full">
                <Link href={`/contact?service=${service.slug}`}>
                  {isAr ? 'اطلب عرض سعر' : 'Request a quote'}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="mt-2 w-full">
                <Link href={`/apply/${service.slug}`}>
                  {isAr ? 'ابدأ التقديم بدون عرض السعر' : 'Apply without seeing fees'}
                </Link>
              </Button>
            </div>
          )}
          <div className="border-subtle bg-surface text-ink-subtle mt-4 rounded-xl border p-4 text-[11px] leading-relaxed">
            <p className="text-ink-muted font-semibold">
              <FileText className="me-1 inline h-3.5 w-3.5" aria-hidden />
              {isAr ? 'ملاحظة' : 'Note'}
            </p>
            <p className="mt-1">
              {service.feesVisible
                ? isAr
                  ? 'الرسوم الحكومية قد تتغير بناءً على قرارات الجهة المختصة.'
                  : "Government fees may change based on the authority's schedule."
                : isAr
                  ? 'سنرسل لك عرضًا تفصيليًا قبل بدء أي إجراء.'
                  : "We'll send you an itemised quote before any work starts."}
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
