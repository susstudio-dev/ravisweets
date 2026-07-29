import type { ThemePalette } from '../types/product';

/**
 * ANJEER & PISTA — the five named palettes a product may paint the site with.
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
 *
 * WHAT THEY REPLACED. Until this file landed, `products.ts` carried 31
 * hand-typed `theme_palette` literals (26 of them distinct), every one from the
 * pre-2026 "brass & ghee" era: a warm cream base with a brass or rust accent.
 * They were near-identical by accident rather than by design — #f5ead2 vs
 * #f4ead2 vs #f4e9d4 differ by one to three hex digits, which is below the
 * threshold anyone can see, so the catalogue paid the full cost of 26 distinct
 * brand colours and received none of the benefit. Worse, each product page
 * swapped its literal onto the :root CSS vars, so browsing the shop repainted
 * the site a slightly different brand on every click.
 *
 * Collapsing them to five named palettes means a product now picks a
 * *register*, not a colour, and the whole catalogue stays recognisably one
 * brand while nut, fruit, savoury and gifting ranges still read distinctly.
 */

/** Default for sweets and anything without a stronger signal. */
export const HOUSE: ThemePalette = {
  base: '#F1F0E2',
  accent: '#5E2757',
  glow: '#C9D99C',
  ink: '#221E1A',
  grainOpacity: 0.05,
};

/** Nut-forward: kaju, badam, pista, cashew. Leans into the field colour. */
export const PISTA: ThemePalette = {
  base: '#EDEFDD',
  accent: '#4F6024',
  glow: '#C9D99C',
  ink: '#221E1A',
  grainOpacity: 0.05,
};

/** Dried fruit: fig, date, apricot/khubani, cranberry. Anjeer-forward. */
export const ANJEER: ThemePalette = {
  base: '#F2EEE8',
  accent: '#5E2757',
  glow: '#C6A8BE',
  ink: '#221E1A',
  grainOpacity: 0.05,
};

/** Savouries, namkeens, pickles, podis — warmer, earthier ground, still in-system. */
export const SAVOURY: ThemePalette = {
  base: '#F1ECDD',
  accent: '#5A4A1E',
  glow: '#D3C88F',
  ink: '#221E1A',
  grainOpacity: 0.06,
};

/** Premium hampers and the Vault drop — the dark Bidri register. */
export const VAULT: ThemePalette = {
  base: '#17181A',
  accent: '#C9D99C',
  glow: '#3E1938',
  ink: '#F2EDE0',
  grainOpacity: 0.07,
};

export const PRODUCT_PALETTES = {
  house: HOUSE,
  pista: PISTA,
  anjeer: ANJEER,
  savoury: SAVOURY,
  vault: VAULT,
} as const satisfies Record<string, ThemePalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;
