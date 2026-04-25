import { CheckCircle2, Clock, FileText } from 'lucide-react';
import type { Application, ApplicationStatus, Service } from '@synergy/db/types';
import { formatAed, formatDateTime, STATUS_LABEL, STATUS_VARIANT } from '@synergy/db';
import { Badge } from '@synergy/ui/badge';

const STATUS_NEXT_STEP: Record<ApplicationStatus, { en: string; ar: string }> = {
  draft: { en: 'Complete and submit your draft.', ar: 'أكمل المسودة وأرسلها.' },
  submitted: { en: 'A reviewer will pick this up shortly.', ar: 'سيقوم المراجع بمتابعته قريبًا.' },
  under_review: { en: 'Our reviewer is verifying your documents.', ar: 'يتم التحقق من مستنداتك.' },
  missing_docs: { en: 'Please upload the missing documents.', ar: 'يُرجى رفع المستندات الناقصة.' },
  with_government: { en: 'Awaiting the government authority.', ar: 'بانتظار الجهة الحكومية.' },
  approved: { en: 'Approved — collect your documents.', ar: 'تمت الموافقة — استلم مستنداتك.' },
  rejected: {
    en: 'Rejected. See the reviewer note for details.',
    ar: 'مرفوض — راجع ملاحظة المراجع.',
  },
  closed: { en: 'Closed.', ar: 'منتهي.' },
};

export function ApplicationTimeline({
  app,
  service,
  locale,
}: {
  app: Application;
  service?: Service;
  locale: string;
}) {
  const isAr = locale === 'ar';
  const next = STATUS_NEXT_STEP[app.status];

  return (
    <div className="space-y-6">
      <div className="border-subtle rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-ink-subtle font-mono text-xs uppercase tracking-wider">
              {app.reference}
            </p>
            <h2 className="text-brand-primary mt-1 text-xl font-bold">
              {service ? (isAr ? service.titleAr : service.titleEn) : isAr ? 'خدمة' : 'Service'}
            </h2>
          </div>
          <Badge variant={STATUS_VARIANT[app.status]}>{STATUS_LABEL[app.status]}</Badge>
        </div>
        <div className="bg-brand-secondary-soft text-brand-primary mt-4 rounded-lg p-4 text-sm">
          <Clock className="text-brand-secondary-dark me-1.5 inline h-4 w-4 align-text-bottom" />
          <span className="font-semibold">{isAr ? 'الخطوة التالية: ' : 'Next: '}</span>
          {isAr ? next.ar : next.en}
        </div>
      </div>

      <div className="border-subtle rounded-2xl border bg-white p-6">
        <h3 className="text-brand-primary text-sm font-semibold">
          {isAr ? 'الجدول الزمني' : 'Timeline'}
        </h3>
        <ol className="border-subtle mt-5 space-y-4 border-s-2 ps-6">
          {[...app.events].reverse().map((evt, i) => (
            <li key={i} className="relative">
              <span className="bg-brand-secondary absolute -start-[31px] mt-1 inline-flex h-3 w-3 rounded-full border-2 border-white shadow-sm" />
              <p className="text-ink text-sm font-medium">{evt.action}</p>
              {evt.note ? <p className="text-ink-muted text-xs">{evt.note}</p> : null}
              <p className="text-ink-subtle mt-0.5 text-[11px] uppercase tracking-wider">
                {formatDateTime(evt.at)}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {app.documents.length > 0 ? (
        <div className="border-subtle rounded-2xl border bg-white p-6">
          <h3 className="text-brand-primary text-sm font-semibold">
            {isAr ? 'مستنداتك' : 'Your documents'}
          </h3>
          <ul className="divide-subtle mt-4 divide-y">
            {app.documents.map((d) => {
              const variant =
                d.status === 'verified'
                  ? 'success'
                  : d.status === 'rejected'
                    ? 'danger'
                    : 'warning';
              return (
                <li key={d.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="text-brand-secondary h-4 w-4" aria-hidden />
                    <span className="text-ink text-sm">{d.name}</span>
                  </div>
                  <Badge variant={variant}>{d.status}</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="border-subtle rounded-2xl border bg-white p-6">
        <h3 className="text-brand-primary text-sm font-semibold">
          {isAr ? 'الفاتورة' : 'Invoice'}
        </h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">{isAr ? 'رسوم حكومية' : 'Government fee'}</dt>
            <dd className="font-mono">{formatAed(app.govFee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">{isAr ? 'رسوم خدمة' : 'Service fee'}</dt>
            <dd className="font-mono">{formatAed(app.serviceFee)}</dd>
          </div>
          <div className="text-ink-subtle flex justify-between">
            <dt>{isAr ? 'ضريبة (٥٪)' : 'VAT (5%)'}</dt>
            <dd className="font-mono">{formatAed(app.vat)}</dd>
          </div>
          <div className="border-subtle mt-2 flex justify-between border-t pt-2 text-base font-semibold">
            <dt>{isAr ? 'الإجمالي' : 'Total'}</dt>
            <dd className="text-brand-primary font-mono">{formatAed(app.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// Simple tag re-export so other files can pull just the icon if they want.
export { CheckCircle2 };
