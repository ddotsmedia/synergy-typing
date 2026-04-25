export const navLinks = [
  { href: '/services', key: 'services' },
  { href: '/fee-calculator', key: 'feeCalculator' },
  { href: '/track', key: 'track' },
  { href: '/assistant', key: 'assistant' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

export type NavLink = (typeof navLinks)[number];
