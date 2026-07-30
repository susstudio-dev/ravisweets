import type { ThemePalette } from '../types/product';

/**
 * ROSE & CREAM — the five named palettes a product may paint the site with.
 *
 * WHY THIS FILE EXISTS TWICE. The canonical authoring copy lives in the
 * storefront at `apps/storefront/src/lib/theme/palette.ts`, where it is derived
 * from the register token sets and guarded by palette.test.ts. This package
 * cannot import that file: `@ravisweets/shared` is a workspace *dependency of*
 * the storefront, so importing upward would invert the dependency graph and
 * make the shared package unbuildable on its own. The five values below are
 * therefore duplicated verbatim. They are four hex strings and a number each,
 * they change roughly never, and the alternative — hoisting a third package
 * just to hold twenty constants — costs more than it saves.
 *
 * If you change a value here, change it in the storefront copy too.
 */

/** Default for sweets and anything without a stronger signal. */
export const HOUSE: ThemePalette = {
  base: '#FAF5E9',
  accent: '#A8345D',
  glow: '#E8A13C',
  ink: '#2E2118',
  grainOpacity: 0.05,
};

/** Nut-forward: kaju, badam, pista, cashew. Roasted-almond warmth. */
export const BADAM: ThemePalette = {
  base: '#F7EFE2',
  accent: '#7A4A21',
  glow: '#DDBE8E',
  ink: '#2E2118',
  grainOpacity: 0.05,
};

/** Dried fruit and floral: fig, date, apricot/khubani, rose preserves. */
export const GULKAND: ThemePalette = {
  base: '#FAEEE9',
  accent: '#962D53',
  glow: '#E9B9C9',
  ink: '#2E2118',
  grainOpacity: 0.05,
};

/** Savouries, namkeens, pickles, podis — fried-gold, turmeric-deep. */
export const KESAR: ThemePalette = {
  base: '#F8F0DC',
  accent: '#7A5A14',
  glow: '#DCC372',
  ink: '#2E2118',
  grainOpacity: 0.06,
};

/** Premium hampers and drops — the dusk register as a product palette. */
export const HAMPER: ThemePalette = {
  base: '#3A1F31',
  accent: '#E8A13C',
  glow: '#7C2344',
  ink: '#F6EAD8',
  grainOpacity: 0.07,
};

export const PRODUCT_PALETTES = {
  house: HOUSE,
  badam: BADAM,
  gulkand: GULKAND,
  kesar: KESAR,
  hamper: HAMPER,
} as const satisfies Record<string, ThemePalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;
