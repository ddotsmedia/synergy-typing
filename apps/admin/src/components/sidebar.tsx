'use client';

import { navSections } from '@/lib/nav';
import { SidebarNavLink } from './sidebar-nav-link';
import { AdminLogo } from './brand-logo';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-subtle flex h-[72px] items-center border-b px-5">
        <AdminLogo />
      </div>
      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-ink-subtle px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-subtle bg-surface text-ink-subtle border-t px-4 py-3 text-[11px]">
        <p className="text-ink-muted font-medium">Demo mode</p>
        <p>Mock store · Phase 1 · STEP 1</p>
      </div>
    </div>
  );
}
