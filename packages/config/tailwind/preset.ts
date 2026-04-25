import type { Config } from 'tailwindcss';
import { brand } from '../tokens/brand';

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: brand.colors.primary,
          'primary-dark': brand.colors.primaryDark,
          'primary-soft': brand.colors.primarySoft,
          secondary: brand.colors.secondary,
          'secondary-dark': brand.colors.secondaryDark,
          'secondary-soft': brand.colors.secondarySoft,
          accent: brand.colors.accent,
          'accent-soft': brand.colors.accentSoft,
        },
        ink: {
          DEFAULT: brand.colors.ink,
          strong: brand.colors.inkStrong,
          muted: brand.colors.inkMuted,
          subtle: brand.colors.inkSubtle,
        },
        surface: {
          DEFAULT: brand.colors.surface,
          elevated: brand.colors.surfaceElevated,
          muted: brand.colors.surfaceMuted,
          inverse: brand.colors.surfaceInverse,
        },
        border: {
          subtle: brand.colors.borderSubtle,
          DEFAULT: brand.colors.borderDefault,
          strong: brand.colors.borderStrong,
        },
        muted: brand.colors.inkSubtle, // back-compat — components still reference text-muted
        success: { DEFAULT: brand.colors.success, soft: brand.colors.successSoft },
        warning: { DEFAULT: brand.colors.warning, soft: brand.colors.warningSoft },
        danger: { DEFAULT: brand.colors.danger, soft: brand.colors.dangerSoft },
      },
      fontFamily: {
        // Spread to drop the `readonly` from the `as const` source tuples.
        sans: [...brand.fonts.sans],
        display: [...brand.fonts.display],
        mono: [...brand.fonts.mono],
      },
      fontSize: {
        // Refined display scale for headings
        'display-2xl': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-xl': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-lg': ['2.25rem', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'display-md': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      borderRadius: brand.radii,
      boxShadow: brand.shadows,
      backgroundImage: {
        'navy-panel': `linear-gradient(135deg, ${brand.colors.primary} 0%, ${brand.colors.primarySoft} 100%)`,
        'teal-band': `linear-gradient(180deg, ${brand.colors.secondarySoft} 0%, ${brand.colors.surfaceElevated} 100%)`,
        // Subtle dotted texture for hero / panel backgrounds (mimics knot pattern)
        'dot-grid': `radial-gradient(${brand.colors.borderSubtle} 1px, transparent 1px)`,
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
};

export default preset;
