import type { ThemePalette } from '../types/product';

/**
 * THE BATCH CARD — the five named palettes a product may paint the site with.
 *
 * Every one is the SAME docket, stamped in a different ink. Hovering a sweet
 * retunes the stamp, not the brand; the ground never moves more than a few
 * degrees. Real Indian stamp pads come in blue, green, red, violet and black,
 * and four of those are used here.
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

/** Default for sweets and anything without a stronger signal. The house stamp. */
export const HOUSE: ThemePalette = {
  base: '#E9EAE4',
  accent: '#2046C8',
  glow: '#EBC77E',
  ink: '#161C24',
  grainOpacity: 0.04,
};

/** Nut-forward: kaju, badam, pista, cashew. The green stamp. */
export const BADAM: ThemePalette = {
  base: '#EDEAE2',
  accent: '#1F6238',
  glow: '#DDC79B',
  ink: '#161C24',
  grainOpacity: 0.04,
};

/** Dried fruit and floral: fig, date, apricot/khubani, rose preserves. The red stamp. */
export const GULKAND: ThemePalette = {
  base: '#EFE9E7',
  accent: '#A81B52',
  glow: '#E6BFC6',
  ink: '#161C24',
  grainOpacity: 0.04,
};

/** Savouries, namkeens, pickles, podis — the olive-brass stamp. */
export const KESAR: ThemePalette = {
  base: '#EEEBE0',
  accent: '#6B5A0E',
  glow: '#DCC372',
  ink: '#161C24',
  grainOpacity: 0.05,
};

/** Premium hampers and drops — the carbon copy as a product palette. */
export const HAMPER: ThemePalette = {
  base: '#232A2E',
  accent: '#F2732F',
  glow: '#16328F',
  ink: '#E8EBE6',
  grainOpacity: 0.06,
};

export const PRODUCT_PALETTES = {
  house: HOUSE,
  badam: BADAM,
  gulkand: GULKAND,
  kesar: KESAR,
  hamper: HAMPER,
} as const satisfies Record<string, ThemePalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;
