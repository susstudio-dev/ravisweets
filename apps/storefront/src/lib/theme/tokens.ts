/**
 * Ravi Sweets design tokens.
 *
 * Colour lives in ./palette.ts — the single source of truth. This file keeps
 * the non-colour scales (radii, elevation, motion, grain) and re-exports
 * colour so importers have one place to reach for.
 *
 * The world is The Batch Card: the kitchen's own paperwork as the interface.
 * That has consequences beyond colour, and they are encoded below — radii are
 * near-square because a docket is a docket, and elevation is nearly flat
 * because paper on a counter does not float.
 */
import { DOCKET, LIGHT } from './palette';

export type { FlavourPalette } from './palette';
export { DOCKET, CARBON_TOKENS, LIGHT, CARBON, EMBER, PRODUCT_PALETTES } from './palette';

/**
 * Projected into Tailwind. Semantic names only — no numeric brand ramp.
 *
 * `cream`, `anjeer`, `pista` and `gunmetal` were dropped here: zero Tailwind
 * class usages across the tree. Register colour is read through the
 * register-aware `--theme-*` / `--color-*` custom properties (see
 * globals.css and tailwind.config.ts's `theme-*` / `field` / `field-deep`
 * bindings) instead. Do not re-add without checking usage first.
 */
export const rawPalette = {
  ink: DOCKET.ink,
  varak: { DEFAULT: DOCKET.varak, rule: DOCKET.varakRule },
  /*
   * Cool slate, not warm stone. The docket ground is faintly green-grey; a
   * warm neutral ramp beside it reads as two different papers.
   */
  neutral: {
    50: '#F7F8F6',
    100: '#EEF0EC',
    200: '#DDE0DC',
    300: '#C3C9C6',
    400: '#98A0A3',
    500: '#6B737B',
    600: '#565F68',
    700: '#3F4750',
    800: '#2A323A',
    900: '#161C24',
  },
  semantic: { success: '#1F6238', warn: '#6B5A0E', danger: '#A81B52' },
} as const;

/**
 * Paper is square-cut. A docket has a guillotined edge; a gummed label has
 * about 2mm of radius and nothing on a counter has 24px of it.
 *
 * This scale is deliberately compressed rather than renamed, so the ~200
 * existing `rounded-2xl` / `rounded-3xl` call sites across the tree resolve
 * to the new world without being individually rewritten. `pill` survives for
 * genuine chips only — a rubber stamp is rectangular, so reach for it rarely.
 */
/*
 * Softened from the original guillotine cut (0-8px) on owner feedback,
 * 2026-08-03: "give some border radius to the sweet cards, don't keep
 * everything very sharp." Still paper, never a pill — but friendly paper.
 */
export const radii = {
  sm: '3px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  '2xl': '14px',
  '3xl': '18px',
  pill: '9999px',
  circle: '50%',
} as const;

/**
 * Paper on a counter does not float. Elevation is a sheet resting on another
 * sheet: a hard 1px contact edge, then a short shadow. The old scale's 24px
 * blur read as a floating card, which is the arrangement this world refuses.
 */
export const elevation = {
  flat: 'none',
  soft: '0 1px 0 rgb(22 28 36 / 0.06), 0 1px 2px rgb(22 28 36 / 0.07)',
  lifted: '0 1px 0 rgb(22 28 36 / 0.09), 0 4px 10px rgb(22 28 36 / 0.10)',
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
