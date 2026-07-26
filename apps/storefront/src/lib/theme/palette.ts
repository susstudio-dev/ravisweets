/**
 * ANJEER & PISTA — the single source of truth for every brand colour.
 *
 * Named for the two most expensive ingredients in the catalogue, which is also
 * why it reads as premium: anjeer (fig) purple and pista (pistachio) green are
 * an established Indian sweet pairing, not an imported colour scheme.
 *
 * Design decisions encoded here, from
 * docs/superpowers/specs/2026-07-26-storefront-art-direction-design.md:
 *
 *  - GOLD IS DELETED. Every competitor signals premium with gold; silver leaf
 *    (varak) is what is actually on kaju katli, and no sampled competitor uses
 *    a silver/cool-grey cue.
 *  - INK IS WARM CHARCOAL, NOT PLUM-BLACK. The previous #1F1820 sat at hue 292,
 *    only 16 degrees from the accent, which would make links read as body text.
 *    #221E1A is at hue 30 — 82 degrees of separation. Functional, not cosmetic.
 *  - THE ACCENT SITS IN A NARROW WINDOW. Cadbury owns purple in Indian
 *    confectionery (hue 263) and Bombay Sweet Shop owns wine (hue 336). The
 *    usable gap at >=25 degrees clearance from both is hue 288-311; the accent
 *    is at 308, so it reads as fig rather than violet.
 *  - THE TWO BRAND COLOURS SWAP ROLES BETWEEN REGISTERS. Pista is the field on
 *    light and the interactive colour on dark; anjeer is interactive on light
 *    and a panel colour on dark.
 *
 * palette.test.ts asserts every contrast pair and hue clearance, so this file
 * cannot drift out of spec silently.
 */

/**
 * The four colours an admin can author via /admin/themes, plus grain.
 *
 * This shape is the `palette` jsonb column on `theme_presets` and the
 * `theme_palette` field on Product. DO NOT rename these keys — 13 seeded DB
 * rows and 3 SQL files depend on them. Note that `glow` is the stored name for
 * what the design calls the "field".
 */
export interface FlavourPalette {
  base: string;
  accent: string;
  glow: string;
  ink: string;
  grainOpacity: number;
}

/** The full authored token set for a register. Everything else is derived. */
export interface RegisterTokens {
  base: string;
  surfaceElevated: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentDeep: string;
  field: string;
  varak: string;
  varakRule: string;
}

/** Light register — the default, and the only one used for shop/PDP/cart/checkout. */
export const ANJEER_PISTA: RegisterTokens = {
  base: '#F1F0E2', // pista-cream ground; never #ffffff
  surfaceElevated: '#FAF9F0',
  ink: '#221E1A', // warm charcoal, hue 30
  inkMuted: '#5C5347',
  accent: '#5E2757', // anjeer, hue 308
  accentDeep: '#3E1938',
  field: '#C9D99C', // pista, hue 76 — unowned by every competitor measured
  varak: '#9A9EA3', // decorative silver fill
  varakRule: '#7E8286', // informational hairline; must clear 3:1, #9A9EA3 does not
};

/** Bidri register — gunmetal + silver inlay. Story, drops, gifting only. */
export const BIDRI_TOKENS: RegisterTokens = {
  base: '#17181A', // Bidar patina gunmetal
  surfaceElevated: '#202225',
  ink: '#F2EDE0',
  inkMuted: '#A7A49B',
  accent: '#C9D99C', // pista becomes the interactive colour on dark
  accentDeep: '#8FA85C',
  field: '#3E1938', // anjeer becomes a panel colour on dark
  varak: '#C8CBD0', // silver inlay
  varakRule: '#C8CBD0',
};

/** Reduce a register to the four authored keys the DB and admin understand. */
function toFlavour(t: RegisterTokens, grainOpacity: number): FlavourPalette {
  return { base: t.base, accent: t.accent, glow: t.field, ink: t.ink, grainOpacity };
}

export const LIGHT: FlavourPalette = toFlavour(ANJEER_PISTA, 0.05);
export const BIDRI: FlavourPalette = toFlavour(BIDRI_TOKENS, 0.07);

/**
 * Named product palettes, replacing 26 hand-typed brass literals that differed
 * by 1-3 hex digits and were all from the pre-2026 "brass & ghee" era.
 *
 * Every one is a tonal variation of Anjeer & Pista, so a product page no longer
 * repaints the site a different brand. Assignment of products to palettes
 * happens in Plan 3.
 */
export const PRODUCT_PALETTES = {
  /** Default for sweets — the house palette. */
  house: LIGHT,
  /** Nut-forward: kaju, badam, pista. Leans further into the field colour. */
  pista: {
    base: '#EDEFDD',
    accent: '#4F6024',
    glow: '#C9D99C',
    ink: '#221E1A',
    grainOpacity: 0.05,
  },
  /** Fig / date / dry-fruit. Anjeer-forward. */
  anjeer: {
    base: '#F2EEE8',
    accent: '#5E2757',
    glow: '#C6A8BE',
    ink: '#221E1A',
    grainOpacity: 0.05,
  },
  /** Savouries and pickles — warmer, earthier ground, still in-system. */
  savoury: {
    base: '#F1ECDD',
    accent: '#5A4A1E',
    glow: '#D3C88F',
    ink: '#221E1A',
    grainOpacity: 0.06,
  },
  /** Premium hampers and the Vault drop — the dark register. */
  vault: BIDRI,
} as const satisfies Record<string, FlavourPalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;

/**
 * Measured competitor colours the accent must clear by >=25 degrees of hue.
 * All extracted from live production CSS on 2026-07-26 except Cadbury, which
 * is Pantone 2685C. Cadbury is the largest confectionery brand in India and was
 * missing from the original research set.
 */
export const COMPETITOR_HUES: Record<string, string> = {
  'Cadbury Dairy Milk (2685C)': '#3F1B7A',
  'Bombay Sweet Shop wine': '#871A45',
  'Anand crimson': '#AF2037',
  'Almond House terracotta': '#C76F46',
  'Anand gold': '#C4A237',
  'Haldiram burnt brick': '#AF431D',
  'Bikanervala vermilion': '#E32E00',
  'Bombay Sweet Shop petrol': '#002C3F',
  'Sweet Karam teal': '#004E4A',
};
