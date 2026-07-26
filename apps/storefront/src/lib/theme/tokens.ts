/**
 * Ravi Sweets design tokens.
 *
 * Colour now lives in ./palette.ts — the single source of truth. This file
 * keeps the non-colour scales (radii, elevation, motion, grain) and re-exports
 * colour so existing importers do not all have to change at once.
 *
 * The old `rawPalette.brand.*` / `.saffron` / `.rose` scales are GONE. They had
 * zero Tailwind-class usages across the entire tree, so nothing consumed them
 * except by hand-copying hex. Gold is deleted deliberately — see palette.ts.
 */
import { ANJEER_PISTA, BIDRI_TOKENS, LIGHT } from './palette';

export type { FlavourPalette } from './palette';
export { ANJEER_PISTA, BIDRI_TOKENS, LIGHT, BIDRI, PRODUCT_PALETTES } from './palette';

/** Projected into Tailwind. Semantic names only — no numeric brand ramp. */
export const rawPalette = {
  cream: ANJEER_PISTA.base,
  ink: ANJEER_PISTA.ink,
  anjeer: { DEFAULT: ANJEER_PISTA.accent, deep: ANJEER_PISTA.accentDeep },
  pista: { DEFAULT: ANJEER_PISTA.field, deep: '#4F6024' },
  varak: { DEFAULT: ANJEER_PISTA.varak, rule: ANJEER_PISTA.varakRule },
  gunmetal: { DEFAULT: BIDRI_TOKENS.base, elevated: BIDRI_TOKENS.surfaceElevated },
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  semantic: { success: '#2F7A3C', warn: '#8A6A1E', danger: '#9B2F1C' },
} as const;

export const radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  pill: '9999px',
  circle: '50%',
} as const;

/**
 * The `lifted` shadow drops the white inner bevel the old scale carried —
 * it read as plastic on the pista field and inverted wrongly on the dark
 * Bidri register.
 */
export const elevation = {
  flat: 'none',
  soft: '0 1px 2px rgb(34 30 26 / 0.04), 0 2px 8px rgb(34 30 26 / 0.06)',
  lifted: '0 2px 4px rgb(34 30 26 / 0.06), 0 8px 24px rgb(34 30 26 / 0.10)',
} as const;

export const motion = {
  duration: { instant: 100, fast: 150, quick: 200, base: 300, slow: 450, cinematic: 650 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasised: 'cubic-bezier(0.16, 1, 0.3, 1)',
    linear: 'linear',
  },
} as const;

export const grain = { opacityDefault: 0.05, opacityMax: 0.08 } as const;

/** Consumed when no per-route palette is active. */
export const defaultFlavour = LIGHT;
