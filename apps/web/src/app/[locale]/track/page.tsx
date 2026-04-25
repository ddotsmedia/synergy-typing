import { setRequestLocale } from 'next-intl/server';
import { getApplication, getService } from '@synergy/db';
import { PageHero } from '@/components/page-hero';
import { TrackForm } from '@/components/track-form';
import { ApplicationTimeline } from '@/components/application-timeline';

export default async function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ app?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const app = sp.app ? getApplication(sp.app) : undefined;
  const service = app ? getService(app.serviceId) : undefined;
  const isAr = locale === 'ar';

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'متابعة الطلب' : 'Track an application'}
        title={isAr ? 'أين وصل طلبي؟' : 'Where is my application?'}
        description={
          isAr
            ? 'أدخل الرقم المرجعي والبريد الإلكتروني الذي قدّمت به للحصول على الجدول الزمني الكامل.'
            : 'Enter the reference number and the email you applied with to see the full timeline.'
        }
      >
        <div className="border-subtle max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
          <TrackForm locale={locale} />
        </div>
      </PageHero>

      {app ? (
        <section className="mx-auto max-w-3xl px-6 py-12">
          <ApplicationTimeline app={app} service={service} locale={locale} />
        </section>
      ) : null}
    </>
  );
}
