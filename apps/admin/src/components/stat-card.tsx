import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@synergy/ui/card';
import { cn } from '@synergy/ui/cn';

export function StatCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  accent = 'primary',
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon: LucideIcon;
  accent?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
}) {
  const accentMap: Record<string, string> = {
    primary: 'bg-brand-primary/10 text-brand-primary',
    secondary: 'bg-brand-secondary/15 text-brand-primary',
    accent: 'bg-brand-accent/15 text-brand-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-muted text-xs font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-brand-primary text-2xl font-bold md:text-3xl">{value}</p>
          {delta ? (
            <p
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-danger',
                trend === 'flat' && 'text-muted',
              )}
            >
              {delta}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            accentMap[accent],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}
