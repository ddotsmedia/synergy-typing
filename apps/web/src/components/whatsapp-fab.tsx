import { MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { brand } from '@synergy/config/tokens/brand';

export async function WhatsAppFab() {
  const t = await getTranslations('whatsapp');
  const href = `https://wa.me/${brand.contact.whatsappDigits}?text=${encodeURIComponent(
    t('prefill'),
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('fab')}
      className="bg-success hover:bg-success/95 focus:ring-success/30 group fixed bottom-6 end-6 z-50 inline-flex h-14 items-center gap-3 rounded-full px-5 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden text-sm font-semibold sm:inline">{t('fab')}</span>
    </a>
  );
}
