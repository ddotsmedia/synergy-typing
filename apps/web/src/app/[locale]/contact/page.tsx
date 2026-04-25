import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { brand } from '@synergy/config/tokens/brand';
import { getSettings } from '@synergy/db';
import { PageHero } from '@/components/page-hero';
import { ContactForm } from '@/components/contact-form';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const settings = getSettings();
  const waHref = `https://wa.me/${brand.contact.whatsappDigits}?text=${encodeURIComponent(
    isAr ? 'مرحبًا، أحتاج مساعدة بخصوص خدمة' : 'Hello Synergy, I need help with a service',
  )}`;

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'تواصل معنا' : 'Contact us'}
        title={isAr ? 'كيف يمكننا المساعدة؟' : 'How can we help?'}
        description={
          isAr
            ? 'نرد عادةً خلال ساعة عمل واحدة. للمواضيع العاجلة، استخدم واتساب.'
            : 'We typically reply within one business hour. For urgent matters, message us on WhatsApp.'
        }
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_2fr] lg:py-16">
        <div className="space-y-4">
          <ContactCard
            icon={Phone}
            label={isAr ? 'هاتف' : 'Phone'}
            value={settings.phone || brand.contact.phone}
            href={`tel:${(settings.phone || brand.contact.phone).replace(/\s+/g, '')}`}
          />
          <ContactCard
            icon={MessageCircle}
            label="WhatsApp"
            value={settings.whatsapp || brand.contact.whatsapp}
            href={waHref}
            accent
          />
          <ContactCard
            icon={Mail}
            label={isAr ? 'بريد إلكتروني' : 'Email'}
            value={settings.email || brand.contact.email}
            href={`mailto:${settings.email || brand.contact.email}`}
          />
          <div className="border-subtle rounded-2xl border bg-white p-5">
            <div className="flex items-start gap-3">
              <MapPin className="text-brand-secondary mt-0.5 h-4 w-4" aria-hidden />
              <div>
                <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'العنوان' : 'Address'}
                </p>
                <p className="text-ink mt-1 text-sm">{settings.address || brand.contact.address}</p>
                <p className="text-ink-subtle mt-3 text-xs">
                  {isAr
                    ? 'السبت–الخميس: ٨:٠٠–٢٢:٠٠ · الجمعة: ١٤:٠٠–٢٢:٠٠'
                    : 'Sat–Thu: 8:00–22:00 · Fri: 14:00–22:00'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <ContactForm locale={locale} />
      </section>
    </>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  accent,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={`border-subtle hover:border-brand-secondary/40 flex items-center gap-4 rounded-2xl border bg-white p-5 transition-colors ${accent ? 'border-success/20' : ''}`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
          accent ? 'bg-success-soft text-success' : 'bg-brand-secondary-soft text-brand-primary'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-brand-primary text-sm font-semibold">{value}</p>
      </div>
    </a>
  );
}
