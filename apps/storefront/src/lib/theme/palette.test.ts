import { describe, expect, it } from 'vitest';
import { contrastRatio, hueClearance } from './contrast';
import { ANJEER_PISTA, BIDRI_TOKENS, COMPETITOR_HUES, PRODUCT_PALETTES } from './palette';

const AA_TEXT = 4.5;
const AA_UI = 3.0;

describe('light register — every pair in spec section 3', () => {
  const t = ANJEER_PISTA;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    ['ink on field', t.ink, t.field, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['accent on surfaceElevated', t.accent, t.surfaceElevated, AA_TEXT],
    ['accent on field', t.accent, t.field, AA_TEXT],
    ['field on accent', t.field, t.accent, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_TEXT],
    ['accentDeep on field', t.accentDeep, t.field, AA_TEXT],
    ['varakRule on base', t.varakRule, t.base, AA_UI],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('bidri register — every pair in spec section 3', () => {
  const t = BIDRI_TOKENS;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['varak on base', t.varak, t.base, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_UI],
    ['ink on anjeer panel', t.ink, t.field, AA_TEXT],
    ['accent on anjeer panel', t.accent, t.field, AA_TEXT],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('accent must not collide with the category', () => {
  // Cadbury owns purple in Indian confectionery; Bombay Sweet Shop owns the
  // wine that the old Ravi Sweets rose collided with at 3 degrees.
  it.each(Object.entries(COMPETITOR_HUES))(
    'clears %s by at least 25 degrees',
    (_name, competitor) => {
      expect(hueClearance(ANJEER_PISTA.accent, competitor)).toBeGreaterThanOrEqual(25);
    },
  );

  it('does not reintroduce the old rose hue', () => {
    expect(hueClearance(ANJEER_PISTA.accent, '#A8345D')).toBeGreaterThanOrEqual(25);
  });
});

describe('product palettes', () => {
  it('replaces the 26 stale brass literals with a small named set', () => {
    const names = Object.keys(PRODUCT_PALETTES);
    expect(names.length).toBeGreaterThanOrEqual(4);
    expect(names.length).toBeLessThanOrEqual(8);
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
