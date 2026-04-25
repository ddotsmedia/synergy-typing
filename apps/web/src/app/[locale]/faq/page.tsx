import { setRequestLocale } from 'next-intl/server';
import { listFaqs } from '@synergy/db';
import { PageHero } from '@/components/page-hero';

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const faqs = listFaqs().filter((f) => f.published);
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, f) => {
    acc[f.category] = acc[f.category] || [];
    acc[f.category]!.push(f);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'الأسئلة الشائعة' : 'Frequently asked questions'}
        title={isAr ? 'أجوبة سريعة قبل أن تتواصل' : 'Quick answers before you reach out'}
        description={
          isAr
            ? 'إذا لم تجد ما تبحث عنه، اضغط على زر واتساب وسنرد فورًا.'
            : 'If your question is not here, tap the WhatsApp button — we usually answer in minutes.'
        }
      />
      <section className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-ink-muted text-center text-sm">
            {isAr ? 'لا توجد أسئلة منشورة بعد.' : 'No published FAQs yet.'}
          </p>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em]">
                  {category}
                </h2>
                <div className="divide-subtle border-subtle mt-3 divide-y rounded-2xl border bg-white">
                  {items.map((faq) => (
                    <details
                      key={faq.id}
                      className="group p-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="text-brand-primary flex cursor-pointer items-center justify-between gap-3 text-base font-semibold">
                        <span>{faq.question}</span>
                        <span
                          aria-hidden
                          className="border-subtle text-ink-subtle grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="text-ink-muted mt-3 text-sm leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
