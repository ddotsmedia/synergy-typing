import { Sparkles } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@synergy/ui/button';
import { PageHero } from '@/components/page-hero';
import { listServices } from '@synergy/db';

const SUGGESTIONS = [
  {
    en: 'I want to bring my wife from Pakistan',
    ar: 'أريد إحضار زوجتي من باكستان',
    target: 'family-visa-spouse',
  },
  {
    en: 'My Emirates ID expires next month',
    ar: 'هويتي الإماراتية تنتهي الشهر القادم',
    target: 'emirates-id-renewal',
  },
  {
    en: 'I need to renew my driving licence',
    ar: 'أريد تجديد رخصة القيادة',
    target: 'driving-licence-renewal',
  },
  {
    en: 'How do I attest my degree at MOFA?',
    ar: 'كيف أصدّق شهادتي في الخارجية؟',
    target: 'mofa-attestation',
  },
];

export default async function AssistantPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const services = listServices();

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'المساعد الذكي' : 'AI assistant'}
        title={isAr ? 'اشرح موقفك بكلمات بسيطة' : 'Tell us what you need, in your own words'}
        description={
          isAr
            ? 'سيقترح المساعد الخدمة المناسبة، قائمة المستندات، والتكلفة الكاملة. تتوفر النسخة الكاملة عند تفعيل الذكاء الاصطناعي في خطوة لاحقة.'
            : 'The assistant suggests the right service, the document checklist, and the full cost. The full Claude-powered chat lights up in a later step — meanwhile, the rule-based suggestions below cover the most common requests.'
        }
      />

      <section className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <div className="border-subtle rounded-2xl border bg-white p-6 shadow-sm lg:p-8">
          <div className="text-brand-secondary flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? 'اختر سؤالًا للبدء' : 'Pick a question to start'}
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {SUGGESTIONS.map((s, i) => {
              const svc = services.find((x) => x.slug === s.target);
              if (!svc) return null;
              return (
                <li key={i}>
                  <Link
                    href={`/services/${svc.slug}`}
                    className="border-subtle bg-surface hover:border-brand-secondary/40 group block rounded-xl border p-4 transition-colors hover:bg-white"
                  >
                    <p className="text-ink text-sm">«{isAr ? s.ar : s.en}»</p>
                    <p className="text-ink-subtle mt-2 text-xs">
                      {isAr ? 'يقترح:' : 'Suggests:'}{' '}
                      <span className="text-brand-primary font-semibold">
                        {isAr ? svc.titleAr : svc.titleEn}
                      </span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-default bg-surface mt-8 space-y-3 rounded-xl border border-dashed p-5">
            <p className="text-brand-primary text-sm font-semibold">
              {isAr ? 'محادثة بالذكاء الاصطناعي' : 'Chat with the AI assistant'}
            </p>
            <p className="text-ink-muted text-xs">
              {isAr
                ? 'سيتم تفعيل المحادثة الكاملة بعد ربط Claude (الخطوة ٦). حتى ذلك الحين، استخدم الاقتراحات أعلاه أو واتساب للحصول على رد فوري.'
                : 'The live Claude-powered chat lands in STEP 6. Until then, use the suggestions above — or message us on WhatsApp for an immediate human reply.'}
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/services">{isAr ? 'تصفح الخدمات' : 'Browse services'}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">{isAr ? 'تواصل بشريًا' : 'Talk to a human'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
