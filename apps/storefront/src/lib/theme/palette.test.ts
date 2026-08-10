import { describe, expect, it } from 'vitest';
import { contrastRatio, hueClearance } from './contrast';
import { CARBON_TOKENS, COMPETITOR_HUES, DOCKET, EMBER, PRODUCT_PALETTES } from './palette';

const AA_TEXT = 4.5;
const AA_UI = 3.0;

describe('the docket — light register', () => {
  const t = DOCKET;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['inkMuted on surfaceElevated', t.inkMuted, t.surfaceElevated, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    // field is the gummed manila label: a wash and panel ground for INK,
    // never for accent-coloured text.
    ['ink on field', t.ink, t.field, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['accent on surfaceElevated', t.accent, t.surfaceElevated, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_TEXT],
    ['accentDeep on field', t.accentDeep, t.field, AA_UI],
    ['varakRule on base', t.varakRule, t.base, AA_UI],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('the carbon copy — dark register', () => {
  const t = CARBON_TOKENS;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['varak on base', t.varak, t.base, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_UI],
    ['ink on blue panel', t.ink, t.field, AA_TEXT],
    // ember on the blue panel is UI-decoration scale only, never body text
    ['accent on blue panel', t.accent, t.field, AA_UI],
    ['accentDeep on blue panel', t.accentDeep, t.field, AA_TEXT],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('hue positioning — the accent owns unoccupied ground', () => {
  it.each(Object.entries(COMPETITOR_HUES))(
    'clears %s by at least 25 degrees',
    (_name, competitor) => {
      expect(hueClearance(DOCKET.accent, competitor)).toBeGreaterThanOrEqual(25);
    },
  );

  it('is exactly the measured stamp-pad blue', () => {
    // #2046C8, hue 226deg. The obvious choice for a "rubber stamp" world was
    // violet; violet #6D2FA0 measures 10 degrees from Cadbury 2685C, which
    // owns purple in Indian confectionery. Blue is both unoccupied and what
    // an Indian stamp pad actually contains. If this fails, the accent moved
    // — re-run the clearance check above before accepting it.
    expect(DOCKET.accent.toUpperCase()).toBe('#2046C8');
  });

  it('keeps ember out of the register token set so it cannot spread', () => {
    const registerValues = [...Object.values(DOCKET), ...Object.values(CARBON_TOKENS)].map((v) =>
      v.toUpperCase(),
    );
    expect(registerValues).not.toContain('#E2571F');
  });

  /*
   * The exact-value check above is not enough on its own: CARBON_TOKENS.accent
   * was once #F2732F, which is not literally EMBER but sits two degrees from
   * it and is indistinguishable on screen. That made "made today" and
   * "clickable" the same colour on the dark register. Hue distance is what
   * actually enforces the rule.
   */
  it.each([
    ['docket', DOCKET.accent],
    ['carbon', CARBON_TOKENS.accent],
  ])('%s accent is not a near-miss of ember', (_label, accent) => {
    expect(hueClearance(accent, EMBER)).toBeGreaterThanOrEqual(25);
  });
});

describe('product palettes', () => {
  it('stays a small named set', () => {
    expect(Object.keys(PRODUCT_PALETTES)).toEqual([
      'house',
      'badam',
      'gulkand',
      'kesar',
      'hamper',
    ]);
  });

  it.each(Object.entries(PRODUCT_PALETTES))(
    '%s keeps ink readable on its own base',
    (_name, palette) => {
      expect(contrastRatio(palette.ink, palette.base)).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it.each(Object.entries(PRODUCT_PALETTES))(
    '%s keeps its accent readable on its own base',
    (_name, palette) => {
      expect(contrastRatio(palette.accent, palette.base)).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it.each(Object.entries(PRODUCT_PALETTES))(
    '%s keeps base readable on its accent, for filled buttons',
    (_name, palette) => {
      expect(contrastRatio(palette.base, palette.accent)).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );
});
