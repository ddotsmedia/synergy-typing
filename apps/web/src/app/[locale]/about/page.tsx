import { Award, Building2, Languages, MapPin, Shield, Users } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { brand } from '@synergy/config/tokens/brand';
import { getSettings } from '@synergy/db';
import { PageHero } from '@/components/page-hero';

const VALUES = [
  {
    icon: Shield,
    en: { t: 'Government-licensed', b: 'Operating in Musaffah since 2013 with TAMM affiliation.' },
    ar: { t: 'مرخّص حكوميًا', b: 'نعمل في المصفح منذ ٢٠١٣ ضمن منظومة TAMM.' },
  },
  {
    icon: Languages,
    en: {
      t: 'Bilingual by default',
      b: 'EN + AR end-to-end — forms, status updates, receipts, support.',
    },
    ar: { t: 'ثنائي اللغة', b: 'العربية والإنجليزية في كل خطوة — نماذج، تحديثات، فواتير، دعم.' },
  },
  {
    icon: Users,
    en: { t: '6 languages spoken', b: 'EN, AR, HI, UR, ML, TL — answer in your language.' },
    ar: {
      t: '٦ لغات نتحدثها',
      b: 'الإنجليزية، العربية، الهندية، الأردية، المالايالامية، التاغالوغية.',
    },
  },
  {
    icon: Award,
    en: {
      t: 'Honest fees',
      b: 'Government fee, service fee, 5% VAT — separated. No hidden charges.',
    },
    ar: { t: 'رسوم شفافة', b: 'رسوم حكومية، رسوم خدمة، ضريبة ٥٪ — منفصلة بدون رسوم خفية.' },
  },
] as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const settings = getSettings();

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'من نحن' : 'About us'}
        title={
          isAr
            ? 'بوابتك إلى المعاملات الحكومية في الإمارات'
            : 'Your trusted door to UAE government services'
        }
        description={
          isAr
            ? 'مركز سينرجي للطباعة في المصفح بأبوظبي يخدم الأفراد والشركات منذ ٢٠١٣. نقوم بكل ما يتطلب طوابير: نطبع، نتحقق، نقدّم، ونتابع نيابةً عنك.'
            : "Synergy Typing Services is a licensed UAE typing centre in Musaffah, Abu Dhabi — serving residents and businesses since 2013. We do the queueing, the typing, the verification, the submission, and the follow-up so you don't have to."
        }
      />

      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            const t = isAr ? v.ar : v.en;
            return (
              <div key={i} className="border-subtle rounded-2xl border bg-white p-6">
                <span className="bg-brand-secondary-soft text-brand-primary inline-flex h-11 w-11 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-brand-primary mt-4 text-base font-semibold">{t.t}</h3>
                <p className="text-ink-muted mt-1 text-sm leading-relaxed">{t.b}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-subtle bg-surface border-y">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-2 lg:py-16">
          <div className="space-y-4">
            <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em]">
              {isAr ? 'موقعنا' : 'Where to find us'}
            </p>
            <h2 className="text-display-md text-brand-primary font-bold">
              {isAr ? 'فرعنا في المصفح' : 'Our Musaffah branch'}
            </h2>
            <ul className="text-ink-muted space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-secondary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{settings.address || brand.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Building2 className="text-brand-secondary h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {isAr
                    ? 'السبت–الخميس: ٨:٠٠–٢٢:٠٠ · الجمعة: ١٤:٠٠–٢٢:٠٠'
                    : 'Sat–Thu: 8:00–22:00 · Fri: 14:00–22:00'}
                </span>
              </li>
            </ul>
            <div className="border-subtle text-ink-muted rounded-lg border bg-white p-4 text-xs">
              <p className="text-ink font-semibold">{isAr ? 'هاتف' : 'Phone'}</p>
              <p>{settings.phone || brand.contact.phone}</p>
              <p className="text-ink mt-2 font-semibold">{isAr ? 'بريد إلكتروني' : 'Email'}</p>
              <p>{settings.email || brand.contact.email}</p>
            </div>
          </div>

          <div className="border-subtle overflow-hidden rounded-2xl border bg-white">
            <div className="bg-dot-grid bg-dot-grid text-ink-subtle grid h-full min-h-[280px] place-items-center p-12 text-center text-sm">
              <div>
                <MapPin className="text-brand-secondary mx-auto h-8 w-8" aria-hidden />
                <p className="text-brand-primary mt-2 font-semibold">Musaffah Industrial Area 10</p>
                <p className="text-xs">
                  {isAr
                    ? 'خريطة تفاعلية ستُضاف لاحقًا.'
                    : 'Interactive map embeds in a later step.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
