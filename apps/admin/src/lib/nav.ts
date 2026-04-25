import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Briefcase,
  Calculator,
  HelpCircle,
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

export const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operations',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/applications', label: 'Applications', icon: Inbox },
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
