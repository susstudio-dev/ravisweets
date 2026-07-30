/**
 * ROSE & CREAM — the single source of truth for every brand colour.
 *
 * The identity's organising image is the Ravi Sweets shopfront at dusk: cream
 * plaster, the rose-striped awning, marigold lamplight in the display windows,
 * brass scale-weights on the counter. Every token maps to that scene.
 *
 * Design decisions encoded here, from
 * docs/superpowers/specs/2026-07-31-shop-at-dusk-redesign-design.md:
 *
 *  - ROSE IS THE OWNER'S CALL. #A8345D sits ~3 degrees from Bombay Sweet
 *    Shop's wine hue. The owner was shown that finding and chose rose anyway
 *    (spec section 1 and 14); palette.test.ts pins the proximity so any future
 *    accent change re-surfaces the decision instead of silently waiving it.
 *  - GOLD IS DEMOTED, NOT DELETED. varak/varakRule are brass, allowed only as
 *    hairlines, dividers and small marks — never fills, frames or gradients.
 *  - MARIGOLD IS THE LAMPLIGHT. The `field` slot (stored as `glow` in the DB
 *    shape) is a warm wash and hover glow, not a text panel; the only text
 *    asserted on it is ink.
 *  - THE TWO REGISTERS SWAP ROLES. Rose is interactive on light and a panel
 *    on dusk; marigold is the glow on light and interactive on dusk.
 *
 * palette.test.ts asserts every contrast pair, so this file cannot drift out
 * of spec silently.
 */

/**
 * The four colours an admin can author via /admin/themes, plus grain.
 *
 * This shape is the `palette` jsonb column on `theme_presets` and the
 * `theme_palette` field on Product. DO NOT rename these keys — the seed SQL
 * and the admin editor depend on them. Note that `glow` is the stored name
 * for what the design calls the "field".
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

/** Light register — the default, used everywhere commerce happens. */
export const ROSE_CREAM: RegisterTokens = {
  base: '#FAF5E9', // cream plaster; never #ffffff
  surfaceElevated: '#FFFDF6', // butter paper
  ink: '#2E2118', // teak counter
  inkMuted: '#6B5A48',
  accent: '#A8345D', // the awning rose — links, filled CTAs
  accentDeep: '#7C2344', // awning in shadow
  field: '#E8A13C', // marigold lamplight — glow washes, never a text panel
  varak: '#B08D57', // brass, decorative only
  varakRule: '#9C7C45', // brass hairline; must clear 3:1, #B08D57 does not
};

/** Dusk register — the hero scene's own sky. Story, festival, corporate, footer. */
export const DUSK_TOKENS: RegisterTokens = {
  base: '#3A1F31', // deep plum dusk
  surfaceElevated: '#4A2A3F',
  ink: '#F6EAD8',
  inkMuted: '#CBB3A6',
  accent: '#E8A13C', // marigold becomes the interactive colour on dark
  accentDeep: '#F2B15C',
  field: '#7C2344', // rose becomes a panel colour on dark
  varak: '#D9C6A8', // brass inlay
  varakRule: '#D9C6A8',
};

/** Reduce a register to the four authored keys the DB and admin understand. */
function toFlavour(t: RegisterTokens, grainOpacity: number): FlavourPalette {
  return { base: t.base, accent: t.accent, glow: t.field, ink: t.ink, grainOpacity };
}

export const LIGHT: FlavourPalette = toFlavour(ROSE_CREAM, 0.05);
export const DUSK: FlavourPalette = toFlavour(DUSK_TOKENS, 0.07);

/**
 * Named product palettes. Every one is a tonal variation of Rose & Cream, so
 * a product page never repaints the site a different brand.
 *
 * NOTE: this set is deliberately duplicated in
 * packages/shared/src/catalogue/palettes.ts (the shared package cannot import
 * upward). If you change a value here, change it there too.
 */
export const PRODUCT_PALETTES = {
  /** Default for sweets — the house palette. */
  house: LIGHT,
  /** Nut-forward: kaju, badam, pista, cashew. Roasted-almond warmth. */
  badam: {
    base: '#F7EFE2',
    accent: '#7A4A21',
    glow: '#DDBE8E',
    ink: '#2E2118',
    grainOpacity: 0.05,
  },
  /** Dried fruit and floral: fig, date, apricot, rose preserves. */
  gulkand: {
    base: '#FAEEE9',
    accent: '#962D53',
    glow: '#E9B9C9',
    ink: '#2E2118',
    grainOpacity: 0.05,
  },
  /** Savouries, namkeens, podis — fried-gold, turmeric-deep. */
  kesar: {
    base: '#F8F0DC',
    accent: '#7A5A14',
    glow: '#DCC372',
    ink: '#2E2118',
    grainOpacity: 0.06,
  },
  /** Premium hampers and drops — the dusk register as a product palette. */
  hamper: DUSK,
} as const satisfies Record<string, FlavourPalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;

/**
 * Measured competitor colours, extracted from live production CSS on
 * 2026-07-26 except Cadbury, which is Pantone 2685C. The accent must clear
 * Cadbury by >=25 degrees; the Bombay Sweet Shop proximity is an accepted,
 * pinned exception — see palette.test.ts.
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
