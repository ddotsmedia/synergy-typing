/**
 * Brand tokens derived from the Synergy Typing logo (assets/SYNERGY LOGO-01.png).
 * Source of truth — Tailwind config and CSS variables consume these.
 *
 * Mark: soft teal endless-knot diamond (#5DBCC9).
 * Wordmark: deep navy geometric sans (#0F1E4C).
 * Tagline: neutral mid-gray.
 *
 * Use:
 *   primary  — navy. Headings, primary CTAs, nav text, strong borders.
 *   secondary — teal. Links, focus rings, accents, illustrations.
 *   accent (gold) — reserved for trust/premium badges only. Do not use as a generic CTA.
 */

export const colors = {
  // Brand
  primary: '#0F1E4C', // navy from "SYNERGY"
  primaryDark: '#0A1638', // pressed / hover-darken
  primarySoft: '#1F3266', // alt navy for layered backgrounds
  secondary: '#5DBCC9', // teal mark
  secondaryDark: '#3DA1AE', // pressed
  secondarySoft: '#E6F4F6', // teal tint background
  accent: '#C9A14A', // UAE gold — sparingly, trust badges only
  accentSoft: '#F5ECD6',

  // Ink (text)
  ink: '#0B1220',
  inkStrong: '#0A1124',
  inkMuted: '#475569', // body subtext
  inkSubtle: '#6B7280', // captions / hints

  // Surfaces
  surface: '#F6F8FB', // page background
  surfaceElevated: '#FFFFFF', // cards
  surfaceMuted: '#EEF2F8', // hover / chip background
  surfaceInverse: '#0F1E4C', // navy panels (sidebar, hero band)

  // Borders
  borderSubtle: '#E5E9F0', // hairline default
  borderDefault: '#D1D9E6', // form borders
  borderStrong: '#A8B3C7', // dividers between sections

  // State
  white: '#FFFFFF',
  success: '#0E8A5F', // refined to match navy/teal palette
  successSoft: '#E1F4EC',
  warning: '#B5651D',
  warningSoft: '#FBEBD9',
  danger: '#B91C1C',
  dangerSoft: '#FCE7E7',
} as const;

export const fonts = {
  sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
  display: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
} as const;

export const radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  full: '9999px',
} as const;

export const shadows = {
  // Soft, multi-layered shadows for a premium feel
  xs: '0 1px 2px 0 rgba(15, 30, 76, 0.04)',
  sm: '0 1px 3px 0 rgba(15, 30, 76, 0.06), 0 1px 2px -1px rgba(15, 30, 76, 0.04)',
  md: '0 4px 8px -2px rgba(15, 30, 76, 0.08), 0 2px 4px -2px rgba(15, 30, 76, 0.05)',
  lg: '0 12px 24px -8px rgba(15, 30, 76, 0.12), 0 4px 8px -4px rgba(15, 30, 76, 0.06)',
  xl: '0 24px 48px -12px rgba(15, 30, 76, 0.18)',
  // Soft teal glow for focus / hero accents
  glow: '0 0 0 4px rgba(93, 188, 201, 0.15)',
} as const;

export const contact = {
  phone: '+971 2 554 2220',
  whatsapp: '+971 50 660 1090',
  whatsappDigits: '971506601090',
  email: 'info@synergytyping.com',
  address: 'Shop #35, Al Maldieve Centre, Musaffah Industrial Area 10, Abu Dhabi, UAE',
} as const;

export const brand = { colors, fonts, radii, shadows, contact } as const;
export type Brand = typeof brand;
