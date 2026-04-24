/**
 * Brand tokens derived from the Synergy Typing logo (assets/SYNERGY LOGO-01.png).
 * Source of truth — Tailwind config and CSS variables consume these.
 */

export const colors = {
  primary: '#0F1E4C', // navy from "SYNERGY" wordmark
  secondary: '#5DBCC9', // teal from logo mark
  accent: '#C9A14A', // UAE gold — CTAs, trust badges
  ink: '#0B1220',
  surface: '#F5F7FA',
  muted: '#6B7280',
  white: '#FFFFFF',
  success: '#1F8E5C',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export const fonts = {
  sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
} as const;

export const radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const brand = { colors, fonts, radii } as const;
export type Brand = typeof brand;
