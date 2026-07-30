import { describe, expect, it } from 'vitest';
import { contrastRatio, hueClearance } from './contrast';
import { COMPETITOR_HUES, DUSK_TOKENS, PRODUCT_PALETTES, ROSE_CREAM } from './palette';

const AA_TEXT = 4.5;
const AA_UI = 3.0;

describe('light register — every pair in spec §2.1', () => {
  const t = ROSE_CREAM;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['inkMuted on surfaceElevated', t.inkMuted, t.surfaceElevated, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    // field is the marigold glow: a wash and panel ground for INK, never for
    // accent-coloured text. The old accent-on-field pair is deliberately gone.
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

describe('dusk register — every pair in spec §2.2', () => {
  const t = DUSK_TOKENS;
  const pairs: ReadonlyArray<[string, string, string, number]> = [
    ['ink on base', t.ink, t.base, AA_TEXT],
    ['inkMuted on base', t.inkMuted, t.base, AA_TEXT],
    ['ink on surfaceElevated', t.ink, t.surfaceElevated, AA_TEXT],
    ['accent on base', t.accent, t.base, AA_TEXT],
    ['base on accent', t.base, t.accent, AA_TEXT],
    ['varak on base', t.varak, t.base, AA_TEXT],
    ['accentDeep on base', t.accentDeep, t.base, AA_UI],
    ['ink on rose panel', t.ink, t.field, AA_TEXT],
    // marigold on the rose panel is UI-decoration scale only, never body text
    ['accent on rose panel', t.accent, t.field, AA_UI],
    ['accentDeep on rose panel', t.accentDeep, t.field, AA_TEXT],
  ];

  it.each(pairs)('%s meets its minimum', (_label, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe('hue positioning — spec §1: the collision is accepted, not accidental', () => {
  it('clears Cadbury purple, the category owner, by at least 25 degrees', () => {
    expect(
      hueClearance(ROSE_CREAM.accent, COMPETITOR_HUES['Cadbury Dairy Milk (2685C)']!),
    ).toBeGreaterThanOrEqual(25);
  });

  it('pins the owner-accepted Bombay Sweet Shop proximity so a future accent change re-evaluates it', () => {
    // Rose #A8345D sits ~3 degrees from BSS wine. The owner was shown this and
    // chose rose anyway (spec 2026-07-31 §1, §14). If this assertion ever
    // fails, the accent moved — re-read that decision before deleting this.
    expect(hueClearance(ROSE_CREAM.accent, COMPETITOR_HUES['Bombay Sweet Shop wine']!)).toBeLessThan(
      25,
    );
  });

  it('is exactly the owner-approved rose', () => {
    expect(ROSE_CREAM.accent.toUpperCase()).toBe('#A8345D');
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
