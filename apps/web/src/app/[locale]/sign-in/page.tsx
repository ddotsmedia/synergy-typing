import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { LogIn } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { SignInForm } from '@/components/sign-in-form';
import { Link } from '@/i18n/routing';
import { getSession } from '@/lib/session';

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { ref, email } = await searchParams;
  setRequestLocale(locale);
  // Already signed in? Skip the form.
  const session = await getSession();
  if (session) redirect(`/${locale}/account`);
  const isAr = locale === 'ar';

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'دخول العميل' : 'Customer sign-in'}
        title={isAr ? 'الدخول إلى حسابك' : 'Sign in to your account'}
        description={
          isAr
            ? 'أدخل بريدك الإلكتروني ورقم أي طلب سابق لرؤية كل طلباتك في مكان واحد.'
            : 'Enter your email and any one of your application reference numbers to see all your applications in one place.'
        }
      />
      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[1.4fr_1fr] lg:py-16">
        <SignInForm locale={locale} defaultEmail={email} defaultReference={ref} />
        <aside className="border-subtle bg-surface space-y-4 rounded-2xl border p-6">
          <div className="bg-brand-secondary-soft text-brand-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
            <LogIn className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="text-brand-primary text-base font-semibold">
            {isAr ? 'لا تملك حسابًا بعد؟' : 'No account yet?'}
          </h3>
          <p className="text-ink-muted text-sm leading-relaxed">
            {isAr
              ? 'في المرحلة الحالية ينشأ الحساب تلقائيًا عند تقديم أول طلب. ابدأ من صفحة الخدمات وستحصل على رقم مرجعي يستخدم للدخول هنا.'
              : "Phase 1 creates your account automatically when you file your first application. Start from the services page — you'll get a reference number that doubles as your sign-in here."}
          </p>
          <Link
            href="/services"
            className="text-brand-secondary inline-flex text-sm font-medium hover:underline"
          >
            {isAr ? 'تصفح الخدمات →' : 'Browse services →'}
          </Link>
          <p className="border-subtle text-ink-subtle border-t pt-4 text-xs">
            {isAr
              ? 'سيتم استبدال هذه الطريقة لاحقًا بدخول عبر رابط البريد الإلكتروني (الخطوة ٦).'
              : 'In a later release this swaps for magic-link email sign-in (STEP 6).'}
          </p>
        </aside>
      </section>
    </>
  );
}
