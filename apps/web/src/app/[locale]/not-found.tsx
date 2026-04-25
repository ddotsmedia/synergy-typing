import { ArrowRight, MessageCircle } from 'lucide-react';
import { brand } from '@synergy/config/tokens/brand';
import { Button } from '@synergy/ui/button';
import { Link } from '@/i18n/routing';
import { KnotPattern } from '@/components/knot-pattern';

export default function LocaleNotFound() {
  // Bilingual fallback: locale-aware version not always available in 404 contexts.
  return (
    <section className="to-surface relative overflow-hidden bg-gradient-to-b from-white">
      <KnotPattern className="text-brand-secondary/30 pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em]">
          404 · Not found
        </p>
        <h1 className="text-display-lg text-brand-primary md:text-display-xl mt-3 font-bold">
          We couldn&apos;t find that page
        </h1>
        <p className="text-ink-muted mt-3 max-w-xl text-base">
          The link may be out of date, or the service has been renamed. Try the search, browse
          services, or message us on WhatsApp — we&apos;ll help in seconds.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild size="lg">
            <Link href="/services">
              Browse services <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="default" className="bg-success hover:bg-success/90">
            <a
              href={`https://wa.me/${brand.contact.whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
