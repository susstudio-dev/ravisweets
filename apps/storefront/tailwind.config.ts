import type { Config } from 'tailwindcss';
import { rawPalette, radii, elevation } from './src/lib/theme/tokens';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px' },
    },
    extend: {
      colors: {
        ...rawPalette,
        // semantic + theme tokens consumed via CSS vars
        // rgb(var(--x-rgb) / <alpha-value>) rather than var(--x), so opacity
        // modifiers actually emit CSS. With a hex-valued var, `text-theme-ink/60`
        // silently produces nothing — 1003 such usages were dead across the tree.
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated-rgb) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary-rgb) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        ring: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        'theme-base': 'rgb(var(--theme-base-rgb) / <alpha-value>)',
        'theme-accent': 'rgb(var(--theme-accent-rgb) / <alpha-value>)',
        'theme-glow': 'rgb(var(--theme-glow-rgb) / <alpha-value>)',
        'theme-ink': 'rgb(var(--theme-ink-rgb) / <alpha-value>)',
        // Brand tokens. `field` is the pista panel on light and the anjeer
        // panel on dark — it follows --theme-glow, which swaps per register.
        field: 'rgb(var(--theme-glow-rgb) / <alpha-value>)',
        'field-deep': 'var(--color-field-deep)',
        varak: 'var(--color-varak)',
        'varak-rule': 'var(--color-varak-rule)',
      },
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
        '2xl': radii['2xl'],
        '3xl': radii['3xl'],
        pill: radii.pill,
      },
      boxShadow: {
        flat: elevation.flat,
        soft: elevation.soft,
        lifted: elevation.lifted,
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        indic: ['var(--font-indic)', 'var(--font-body)', 'sans-serif'],
      },
      fontSize: {
        // Fluid scale via clamp(): min, fluid, max
        'display-xl': [
          'clamp(2.75rem, 2rem + 3.2vw, 4.75rem)',
          { lineHeight: '1.04', letterSpacing: '-0.02em' },
        ],
        'display-lg': [
          'clamp(2.25rem, 1.7rem + 2.4vw, 3.5rem)',
          { lineHeight: '1.08', letterSpacing: '-0.018em' },
        ],
        'display-md': [
          'clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)',
          { lineHeight: '1.15', letterSpacing: '-0.012em' },
        ],
        heading: ['clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', { lineHeight: '1.3' }],
        body: ['1rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.45', letterSpacing: '0.01em' }],
      },
      backgroundImage: {
        grain: "url('/textures/grain.svg')",
      },
      transitionTimingFunction: {
        emphasised: 'cubic-bezier(0.16, 1, 0.3, 1)',
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
