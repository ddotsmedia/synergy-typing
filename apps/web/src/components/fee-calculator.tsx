'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Calculator } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Service } from '@synergy/db/types';
import { Button } from '@synergy/ui/button';
import { Select } from '@synergy/ui/select';

const ADDONS: {
  id: 'urgent' | 'translation' | 'delivery';
  price: number;
  en: string;
  ar: string;
}[] = [
  {
    id: 'urgent',
    price: 200,
    en: 'Urgent processing (next-day)',
    ar: 'معالجة عاجلة (اليوم التالي)',
  },
  {
    id: 'translation',
    price: 80,
    en: 'Legal translation (per page)',
    ar: 'ترجمة قانونية (لكل صفحة)',
  },
  {
    id: 'delivery',
    price: 50,
    en: 'Document delivery to your address',
    ar: 'توصيل المستندات إلى عنوانك',
  },
];

function aed(n: number) {
  return `AED ${n.toLocaleString('en-AE')}`;
}

export function FeeCalculator({
  services,
  initialServiceId,
  locale,
}: {
  services: Service[];
  initialServiceId?: string;
  locale: string;
}) {
  const isAr = locale === 'ar';
  const [serviceId, setServiceId] = useState<string>(initialServiceId ?? services[0]?.id ?? '');
  const [addons, setAddons] = useState<Record<string, boolean>>({});

  const service = services.find((s) => s.id === serviceId);

  const result = useMemo(() => {
    if (!service) return null;
    const extras = ADDONS.filter((a) => addons[a.id]).reduce((sum, a) => sum + a.price, 0);
    const govFee = service.govFee;
    const serviceFee = service.serviceFee + extras;
    const vat = Math.round((govFee + serviceFee) * 0.05);
    return { govFee, serviceFee, extras, vat, total: govFee + serviceFee + vat };
  }, [service, addons]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="border-subtle space-y-6 rounded-2xl border bg-white p-6 lg:p-8">
        <div className="space-y-2">
          <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-[0.18em]">
            {isAr ? 'الخطوة الأولى' : 'Step 1'}
          </p>
          <label className="text-brand-primary block text-sm font-semibold" htmlFor="service">
            {isAr ? 'اختر الخدمة' : 'Choose a service'}
          </label>
          <Select
            id="service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="h-11"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {isAr ? s.titleAr : s.titleEn} · {s.authority}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-3">
          <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-[0.18em]">
            {isAr ? 'الخطوة الثانية' : 'Step 2'}
          </p>
          <p className="text-brand-primary text-sm font-semibold">
            {isAr ? 'هل تحتاج إضافات؟' : 'Need any add-ons?'}
          </p>
          <div className="space-y-2">
            {ADDONS.map((addon) => (
              <label
                key={addon.id}
                className="border-subtle bg-surface hover:border-brand-secondary/40 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={!!addons[addon.id]}
                  onChange={(e) => setAddons((p) => ({ ...p, [addon.id]: e.target.checked }))}
                  className="border-default text-brand-primary focus:ring-brand-secondary/30 mt-0.5 h-4 w-4 rounded"
                />
                <span className="flex-1">
                  <span className="text-ink block text-sm font-medium">
                    {isAr ? addon.ar : addon.en}
                  </span>
                  <span className="text-ink-subtle block text-xs">+{aed(addon.price)}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="border-subtle to-surface rounded-2xl border bg-gradient-to-br from-white p-6 shadow-md lg:p-8">
        <div className="text-brand-secondary flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Calculator className="h-3.5 w-3.5" />
          {isAr ? 'النتيجة' : 'Your estimate'}
        </div>
        {service && result ? (
          <>
            <h3 className="text-brand-primary mt-2 text-2xl font-bold">
              {isAr ? service.titleAr : service.titleEn}
            </h3>
            <p className="text-ink-muted text-sm">
              {service.authority} · {service.processingDays}d {isAr ? 'تقريبًا' : 'avg'}
            </p>
            <dl className="mt-6 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">{isAr ? 'رسوم حكومية' : 'Government fee'}</dt>
                <dd className="font-mono">{aed(result.govFee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">
                  {isAr ? 'رسوم خدمة' : 'Service fee'}
                  {result.extras > 0 ? (
                    <span className="text-ink-subtle ms-2 text-xs">
                      ({isAr ? 'مع الإضافات' : 'incl. add-ons'} +{aed(result.extras)})
                    </span>
                  ) : null}
                </dt>
                <dd className="font-mono">{aed(result.serviceFee)}</dd>
              </div>
              <div className="text-ink-subtle flex justify-between">
                <dt>{isAr ? 'ضريبة (٥٪)' : 'VAT (5%)'}</dt>
                <dd className="font-mono">{aed(result.vat)}</dd>
              </div>
            </dl>
            <div className="border-subtle mt-5 border-t pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-brand-primary text-base font-semibold">
                  {isAr ? 'الإجمالي المستحق' : 'Total payable'}
                </span>
                <span className="text-brand-primary font-mono text-3xl font-bold">
                  {aed(result.total)}
                </span>
              </div>
              <p className="text-ink-subtle mt-1 text-xs">
                {isAr
                  ? 'فاتورة ضريبية متوافقة مع الهيئة الاتحادية للضرائب تصدر عند الدفع.'
                  : 'A tax-compliant FTA invoice is issued upon payment.'}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href={`/apply/${service.slug}`}>
                  {isAr ? 'ابدأ التقديم' : 'Start application'}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="w-full">
                <Link href={`/services/${service.slug}`}>
                  {isAr ? 'عرض التفاصيل والمستندات المطلوبة' : 'View details + required documents'}
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-ink-muted mt-4 text-sm">
            {isAr ? 'اختر خدمة لرؤية الرسوم.' : 'Pick a service to see the breakdown.'}
          </p>
        )}
      </div>
    </div>
  );
}
