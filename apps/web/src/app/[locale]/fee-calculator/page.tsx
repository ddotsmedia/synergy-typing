import { setRequestLocale } from 'next-intl/server';
import { listServices } from '@synergy/db';
import { PageHero } from '@/components/page-hero';
import { FeeCalculator } from '@/components/fee-calculator';

export default async function FeeCalculatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  // Calculator only lists services whose fees are public — services priced
  // "on request" send the customer to /contact for a quote instead.
  const services = listServices().filter((s) => s.active && s.feesVisible);
  const initial = services.find((s) => s.id === sp.service) ?? services[0];
  const isAr = locale === 'ar';

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'حاسبة الرسوم' : 'Fee calculator'}
        title={isAr ? 'احسب التكلفة الكاملة قبل أن تبدأ' : 'Know the full cost before you start'}
        description={
          isAr
            ? 'اختر الخدمة، أضف الإضافات اللي تحتاجها، وشاهد التحليل الكامل: رسوم حكومية، رسوم خدمة، وضريبة ٥٪.'
            : 'Pick a service, add any extras you need, and see the full breakdown: government fee, service fee, and 5% VAT — no surprises.'
        }
      />
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <FeeCalculator services={services} initialServiceId={initial?.id} locale={locale} />
      </section>
    </>
  );
}
