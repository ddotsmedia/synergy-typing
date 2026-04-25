import { KnotPattern } from './knot-pattern';

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-subtle to-surface relative overflow-hidden border-b bg-gradient-to-b from-white">
      <KnotPattern className="text-brand-secondary/30 pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 md:py-16">
        {eyebrow ? (
          <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-display-lg text-brand-primary md:text-display-xl mt-2 font-bold leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-ink-muted mt-3 max-w-2xl text-base leading-relaxed md:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
