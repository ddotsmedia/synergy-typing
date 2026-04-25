import { redirect } from 'next/navigation';
import { ArrowRight, Calculator, Mail, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { brand } from '@synergy/config/tokens/brand';
import {
  formatAed,
  formatDateTime,
  listApplications,
  getService,
  STATUS_LABEL,
  STATUS_VARIANT,
} from '@synergy/db';
import { Badge } from '@synergy/ui/badge';
import { Button } from '@synergy/ui/button';
import { Link } from '@/i18n/routing';
import { PageHero } from '@/components/page-hero';
import { ProfileEditCard } from '@/components/profile-edit-card';
import { SignOutForm } from '@/components/sign-out-form';
import { getSession } from '@/lib/session';

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect(`/${locale}/sign-in`);
  const { customer } = session;
  const isAr = locale === 'ar';

  // Customer's applications, newest first
  const apps = listApplications().filter((a) => a.customerId === customer.id);
  const open = apps.filter((a) =>
    ['draft', 'submitted', 'under_review', 'missing_docs', 'with_government'].includes(a.status),
  );
  const closed = apps.filter((a) => ['approved', 'rejected', 'closed'].includes(a.status));

  const waHref = `https://wa.me/${brand.contact.whatsappDigits}?text=${encodeURIComponent(
    isAr
      ? `مرحبًا، أنا ${customer.name} (${customer.email}) وأريد المساعدة بخصوص أحد طلباتي.`
      : `Hello, I'm ${customer.name} (${customer.email}) and I'd like help with one of my applications.`,
  )}`;

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'حسابك' : 'Your account'}
        title={
          isAr ? `أهلًا، ${customer.name.split(' ')[0]}` : `Hello, ${customer.name.split(' ')[0]}`
        }
        description={
          isAr
            ? `لديك ${apps.length} طلب${apps.length === 1 ? '' : 'ًا'} (${open.length} قيد المعالجة).`
            : `You have ${apps.length} application${apps.length === 1 ? '' : 's'} on file (${open.length} in progress).`
        }
      >
        <SignOutForm locale={locale} />
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[2fr_1fr] lg:py-16">
        {/* Applications column */}
        <div className="space-y-8">
          <Section title={isAr ? `قيد المعالجة (${open.length})` : `In progress (${open.length})`}>
            {open.length === 0 ? (
              <EmptyState
                title={isAr ? 'لا توجد طلبات نشطة' : 'No active applications'}
                body={
                  isAr
                    ? 'كل طلباتك مكتملة. ابدأ طلبًا جديدًا في أي وقت.'
                    : "You're all caught up. Start a new application any time."
                }
                cta={{ href: '/services', label: isAr ? 'استعراض الخدمات' : 'Browse services' }}
              />
            ) : (
              <ul className="space-y-3">
                {open.map((a) => (
                  <ApplicationRow key={a.id} app={a} locale={locale} />
                ))}
              </ul>
            )}
          </Section>

          {closed.length > 0 ? (
            <Section title={isAr ? `مكتمل (${closed.length})` : `Completed (${closed.length})`}>
              <ul className="space-y-3">
                {closed.map((a) => (
                  <ApplicationRow key={a.id} app={a} locale={locale} />
                ))}
              </ul>
            </Section>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <ProfileEditCard customer={customer} locale={locale} />

          <div className="border-subtle rounded-2xl border bg-white p-6">
            <h3 className="text-brand-primary text-base font-semibold">
              {isAr ? 'إجراءات سريعة' : 'Quick actions'}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/services"
                  className="text-brand-primary hover:text-brand-secondary-dark group inline-flex items-center gap-2"
                >
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  {isAr ? 'بدء طلب جديد' : 'Start a new application'}
                </Link>
              </li>
              <li>
                <Link
                  href="/fee-calculator"
                  className="text-brand-primary hover:text-brand-secondary-dark group inline-flex items-center gap-2"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  {isAr ? 'حاسبة الرسوم' : 'Fee calculator'}
                </Link>
              </li>
              <li>
                <Link
                  href="/assistant"
                  className="text-brand-primary hover:text-brand-secondary-dark group inline-flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isAr ? 'المساعد الذكي' : 'AI assistant'}
                </Link>
              </li>
              <li>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-success hover:text-success/80 group inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {isAr ? 'تواصل عبر واتساب' : 'Message us on WhatsApp'}
                </a>
              </li>
            </ul>
          </div>

          <div className="border-subtle bg-surface text-ink-subtle rounded-2xl border p-5 text-xs leading-relaxed">
            <p className="text-ink-muted font-semibold">{isAr ? 'قادم قريبًا' : 'Coming soon'}</p>
            <ul className="mt-2 space-y-1">
              <li>· {isAr ? 'الفواتير وإيصالات الدفع' : 'Invoices + payment receipts'}</li>
              <li>· {isAr ? 'خزانة المستندات' : 'Document vault'}</li>
              <li>· {isAr ? 'إشعارات حالة الطلب' : 'Status notifications'}</li>
              <li>· {isAr ? 'الدخول برابط البريد الإلكتروني' : 'Magic-link email sign-in'}</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.18em]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="border-subtle rounded-2xl border bg-white p-8 text-center">
      <p className="text-brand-primary text-base font-semibold">{title}</p>
      <p className="text-ink-muted mt-2 text-sm">{body}</p>
      <Button asChild size="sm" className="mt-4">
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}

function ApplicationRow({
  app,
  locale,
}: {
  app: ReturnType<typeof listApplications>[number];
  locale: string;
}) {
  const service = getService(app.serviceId);
  const isAr = locale === 'ar';
  return (
    <li>
      <Link
        href={`/track?app=${app.id}`}
        className="border-subtle hover:border-brand-secondary/50 group block rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-ink-subtle font-mono text-[11px] uppercase tracking-wider">
              {app.reference}
            </p>
            <p className="text-brand-primary mt-1 text-base font-semibold">
              {service ? (isAr ? service.titleAr : service.titleEn) : isAr ? 'خدمة' : 'Service'}
            </p>
            <p className="text-ink-muted mt-1 text-xs">
              {service?.authority ?? ''} · {isAr ? 'آخر تحديث' : 'Updated'}{' '}
              {formatDateTime(app.updatedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={STATUS_VARIANT[app.status]}>{STATUS_LABEL[app.status]}</Badge>
            <span className="text-ink font-mono text-sm">{formatAed(app.total)}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
