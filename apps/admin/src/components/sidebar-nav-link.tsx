'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@synergy/ui/cn';

export function SidebarNavLink({
  href,
  label,
  icon: Icon,
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all',
        active
          ? 'bg-brand-primary text-white shadow-sm'
          : 'text-ink-muted hover:bg-surface-muted hover:text-brand-primary',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-white' : 'text-ink-subtle group-hover:text-brand-primary',
        )}
        aria-hidden
      />
      <span className="flex-1 truncate">{label}</span>
      {badge ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            active ? 'bg-white/20 text-white' : 'bg-brand-secondary-soft text-brand-primary',
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
