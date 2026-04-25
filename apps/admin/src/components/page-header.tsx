import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-display-md text-brand-primary font-bold leading-tight">{title}</h1>
        {description ? (
          <p className="text-ink-muted max-w-2xl text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
