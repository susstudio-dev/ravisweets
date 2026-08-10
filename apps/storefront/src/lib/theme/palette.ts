/**
 * THE BATCH CARD — the single source of truth for every brand colour.
 *
 * The identity's organising image is the kitchen's own paperwork: the batch
 * docket taped above the kadai, the gummed manila label on the box, the
 * rubber-stamp date, the FSSAI composition panel. Ravi Sweets' claim is that
 * the sweets are made today, without preservatives, in Khammam — and the
 * record is what proves it. So the record IS the interface.
 *
 * Design decisions encoded here:
 *
 *  - THE GROUND IS WORKING STOCK, NOT CREAM. #E9EAE4 is cool and faintly
 *    green, the colour of NCR docket paper — deliberately NOT the warm cream
 *    every Indian sweets brand ships. The system is cool so the food and the
 *    manila tag are the only warm things on the page. That contrast is the
 *    entire appetite strategy; warm the ground and it collapses.
 *  - THE ACCENT IS STAMP-PAD BLUE. #2046C8, hue 226deg. Chosen over the
 *    obvious violet after measuring it: violet #6D2FA0 sits 10deg from
 *    Cadbury 2685C, the most-owned colour in Indian confectionery. Blue
 *    clears all nine measured competitors by >=25deg AND is what an Indian
 *    office stamp pad and ballpoint actually contain. palette.test.ts pins
 *    both facts.
 *  - THE FIELD IS A GUMMED MANILA LABEL. #EBC77E is the warm tag stuck to
 *    the box — a wash and a panel ground for INK, never for accent text.
 *  - EMBER IS RESERVED FOR LIVE STATE. #E2571F marks "made today" and
 *    nothing else. It sits outside RegisterTokens precisely so it cannot
 *    spread into general use.
 *  - THE TWO REGISTERS SWAP ROLES. Blue is interactive on the docket and a
 *    panel on the carbon copy; ember is the live mark on the docket and the
 *    interactive colour on the carbon copy.
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

/**
 * THE DOCKET — the light register, used everywhere commerce happens.
 * Working NCR stock, press-blue ink, a steel rule, a manila tag.
 */
export const DOCKET: RegisterTokens = {
  base: '#E9EAE4', // NCR docket stock; cool, never cream, never #ffffff
  surfaceElevated: '#F6F7F3', // the top copy of the form
  ink: '#161C24', // press black, faintly blue
  inkMuted: '#565F68', // pencil grey
  accent: '#2046C8', // stamp-pad blue — links, filled CTAs
  accentDeep: '#16328F', // the same stamp, pressed harder
  field: '#EBC77E', // gummed manila label — washes and panels, never text
  varak: '#8A9099', // steel rule, decorative only
  varakRule: '#6B737B', // steel hairline; must clear 3:1, #8A9099 does not
};

/**
 * THE CARBON COPY — the dark register. The duplicate sheet under the carbon
 * paper: the same form, read in the dark. Festival drops, the story band,
 * corporate, footer.
 */
export const CARBON_TOKENS: RegisterTokens = {
  base: '#232A2E', // carbon-smudged slate
  surfaceElevated: '#2E373C',
  ink: '#E8EBE6',
  inkMuted: '#A3ADB3',
  /*
   * THE INVERTED STAMP. On the carbon copy the primary action is the docket
   * stock itself, pressed onto the dark sheet.
   *
   * This slot previously held #F2732F on the reasoning that "ember becomes the
   * interactive colour on dark". That was wrong twice over. #F2732F sits two
   * degrees from EMBER, so the one rule this world is built on — ember means
   * LIVE STATE and nothing else — was broken by the token set that declares
   * it. And on the dark ground it made "made today" and "clickable"
   * indistinguishable oranges. Stock-on-carbon is materially truer to the
   * form and leaves ember free to mean the one thing it means.
   */
  accent: '#E9EAE4',
  accentDeep: '#FFFFFF', // the same stamp, pressed harder
  field: '#16328F', // stamp blue becomes a panel colour on dark
  varak: '#A8B2B8',
  varakRule: '#A8B2B8',
};

/**
 * Live state. Marks "made today" / "dispatching now" and nothing else.
 * Deliberately outside RegisterTokens so it cannot leak into general use.
 */
export const EMBER = '#E2571F';

/**
 * BRAND RED — kumkum ink. Celebration and certification: the dispatch seal,
 * the hero ticker, festival line-work, sale stamps. Owner-directed.
 *
 * DERIVED FROM THE LOGO (owner-supplied 2026-08-07, assets/logo/). The mark's
 * wordmark is pure #FF0000, which cannot be used as UI ink: 3.30:1 on manila
 * and 4.00:1 under white both fail AA, and .lighthouserc.json enforces
 * accessibility >= 0.95. Logos are exempt from contrast rules, so the artwork
 * keeps #FF0000 exactly while this token darkens on the SAME hue.
 *
 * #CC0000 measures 4.86:1 on the docket ground, 5.89:1 under white, and
 * 4.90-4.93:1 across the light register bases — AA everywhere it is used as
 * ink, with headroom rather than sitting on the 4.50 threshold (#D50000, the
 * lightest passing value, clears it by only 0.03 and breaks if a ground is
 * ever lightened).
 *
 * Change here and in globals.css (--color-brand, --color-brand-rgb) together
 * — globals-sync.test.ts pins all three.
 *
 * Not merged with EMBER on purpose: 17deg apart in hue but two value tiers
 * apart. Ember is a bright live-state glow; this is a dense certification
 * ink. Merge them and "made today" reads as a discount sticker.
 * Never ink on the carbon register (2.47:1) — ground-under-white only there.
 */
export const BRAND_RED = '#CC0000';

/** Reduce a register to the four authored keys the DB and admin understand. */
function toFlavour(t: RegisterTokens, grainOpacity: number): FlavourPalette {
  return { base: t.base, accent: t.accent, glow: t.field, ink: t.ink, grainOpacity };
}

export const LIGHT: FlavourPalette = toFlavour(DOCKET, 0.04);
export const CARBON: FlavourPalette = toFlavour(CARBON_TOKENS, 0.06);

/**
 * Named product palettes — the Flavour Atlas.
 *
 * Every one is the SAME docket, stamped in a different ink. That is the whole
 * mechanic: hovering a sweet retunes the stamp, not the brand. Real Indian
 * stamp pads come in blue, green, red, violet and black; four are used here,
 * and the ground never moves more than a few degrees.
 *
 * NOTE: this set is deliberately duplicated in
 * packages/shared/src/catalogue/palettes.ts (the shared package cannot import
 * upward). If you change a value here, change it there too.
 */
export const PRODUCT_PALETTES = {
  /** Default for sweets — the house stamp. */
  house: LIGHT,
  /** Nut-forward: kaju, badam, pista, cashew. The green stamp. */
  badam: {
    base: '#EDEAE2',
    accent: '#1F6238',
    glow: '#DDC79B',
    ink: '#161C24',
    grainOpacity: 0.04,
  },
  /** Dried fruit and floral: fig, date, apricot, rose preserves. The red stamp. */
  gulkand: {
    base: '#EFE9E7',
    accent: '#A81B52',
    glow: '#E6BFC6',
    ink: '#161C24',
    grainOpacity: 0.04,
  },
  /** Savouries, namkeens, podis — the olive-brass stamp. */
  kesar: {
    base: '#EEEBE0',
    accent: '#6B5A0E',
    glow: '#DCC372',
    ink: '#161C24',
    grainOpacity: 0.05,
  },
  /** Premium hampers and drops — the carbon copy as a product palette. */
  hamper: CARBON,
} as const satisfies Record<string, FlavourPalette>;

export type ProductPaletteName = keyof typeof PRODUCT_PALETTES;

/**
 * Measured competitor colours, extracted from live production CSS on
 * 2026-07-26 except Cadbury, which is Pantone 2685C.
 *
 * The Batch Card accent must clear EVERY one of these by >=25 degrees. The
 * retired Rose & Cream world accepted a 3-degree collision with Bombay Sweet
 * Shop; this world does not need to, because blue is unoccupied in the
 * category.
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
