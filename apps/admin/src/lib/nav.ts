import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Briefcase,
  Calculator,
  HelpCircle,
  Mail,
  ShieldCheck,
  ClipboardList,
  Settings,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = { title: string; items: NavItem[] };

/**
 * Build the sidebar nav. Optional `dynamicBadges` lets the server-side
 * caller inject runtime-computed badges (e.g. unread message count).
 */
export function getNavSections(dynamicBadges: Partial<Record<string, string>> = {}): NavSection[] {
  return [
    {
      title: 'Operations',
      items: [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/applications', label: 'Applications', icon: Inbox },
        { href: '/messages', label: 'Messages', icon: Mail, badge: dynamicBadges['/messages'] },
        { href: '/customers', label: 'Customers', icon: Users },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { href: '/services', label: 'Services', icon: Briefcase },
        { href: '/fees', label: 'Fees', icon: Calculator },
        { href: '/faqs', label: 'FAQs', icon: HelpCircle },
      ],
    },
    {
      title: 'Organisation',
      items: [
        { href: '/staff', label: 'Staff', icon: ShieldCheck },
        { href: '/audit-log', label: 'Audit log', icon: ClipboardList },
        { href: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];
}

// Back-compat for any caller that wants the static set (no badges).
export const navSections = getNavSections();
