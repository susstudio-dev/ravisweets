import { describe, expect, it } from 'vitest';
import { contrastRatio, isLightSurface, relativeLuminance } from './contrast';
import { DUSK, LIGHT, type FlavourPalette } from './palette';
import { THEME_VAR_NAMES, applyPalette, paletteToCss } from './apply-palette';

/** A mid-tone base an admin could plausibly type into /admin/themes. */
const MIDTONE: FlavourPalette = {
  base: '#7A7A7A',
  accent: '#2A1A40',
  glow: '#C9D99C',
  ink: '#100E12',
  grainOpacity: 0.05,
};

/** The legacy dark product palette that breaks the current system today. */
const LEGACY_DARK: FlavourPalette = {
  base: '#2a1505',
  accent: '#e9ad4a',
  glow: '#f2c66f',
  ink: '#fdf6ec',
  grainOpacity: 0.08,
};

describe('completeness', () => {
  it.each([LIGHT, DUSK, MIDTONE, LEGACY_DARK])('sets every declared variable', (palette) => {
    const vars = applyPalette(palette);
    for (const name of THEME_VAR_NAMES) {
      expect(vars[name], `missing ${name}`).toBeDefined();
      expect(vars[name]).not.toBe('');
    }
  });

  it('sets the semantic --color-* layer, not just --theme-*', () => {
    const vars = applyPalette(LIGHT);
    // This is the whole point: these were static before and broke on dark.
    expect(vars['--color-surface']).toBeDefined();
    expect(vars['--color-surface-elevated']).toBeDefined();
    expect(vars['--color-text-primary']).toBeDefined();
    expect(vars['--color-text-muted']).toBeDefined();
    expect(vars['--color-accent']).toBeDefined();
    expect(vars['--color-ring']).toBeDefined();
  });

  it('passes the four authored colours through unchanged', () => {
    const vars = applyPalette(LIGHT);
    expect(vars['--theme-base']).toBe(LIGHT.base);
    expect(vars['--theme-accent']).toBe(LIGHT.accent);
    expect(vars['--theme-glow']).toBe(LIGHT.glow);
    expect(vars['--theme-ink']).toBe(LIGHT.ink);
    expect(vars['--theme-grain-opacity']).toBe(String(LIGHT.grainOpacity));
  });
});

describe('polarity', () => {
  it('raises an elevated surface away from the ground on a light base', () => {
    const vars = applyPalette(LIGHT);
    expect(relativeLuminance(vars['--color-surface-elevated'])).toBeGreaterThan(
      relativeLuminance(LIGHT.base),
    );
  });

  it('raises an elevated surface away from the ground on a dark base', () => {
    const vars = applyPalette(DUSK);
    expect(relativeLuminance(vars['--color-surface-elevated'])).toBeGreaterThan(
      relativeLuminance(DUSK.base),
    );
  });

  it('lands close to the authored light surfaceElevated', () => {
    const vars = applyPalette(LIGHT);
    // Derivation should reproduce the spec's authored #FAF9F0 within tolerance.
    expect(contrastRatio(vars['--color-surface-elevated'], '#FAF9F0')).toBeLessThan(1.06);
  });

  it('lands close to the authored dusk surfaceElevated', () => {
    const vars = applyPalette(DUSK);
    expect(contrastRatio(vars['--color-surface-elevated'], '#4A2A3F')).toBeLessThan(1.15);
  });
});

describe('derived tokens stay readable on every register', () => {
  it.each([
    ['light', LIGHT],
    ['dusk', DUSK],
    ['midtone', MIDTONE],
    ['legacy dark', LEGACY_DARK],
  ] as const)('%s keeps primary text at AA on both surfaces', (_label, palette) => {
    const vars = applyPalette(palette);
    expect(
      contrastRatio(vars['--color-text-primary'], vars['--color-surface']),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(vars['--color-text-primary'], vars['--color-surface-elevated']),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['light', LIGHT],
    ['dusk', DUSK],
    ['legacy dark', LEGACY_DARK],
  ] as const)('%s keeps muted text at AA on the ground', (_label, palette) => {
    const vars = applyPalette(palette);
    expect(
      contrastRatio(vars['--color-text-muted'], vars['--color-surface']),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe('paletteToCss', () => {
  it('emits every variable as a css declaration list', () => {
    const css = paletteToCss(LIGHT);
    for (const name of THEME_VAR_NAMES) {
      expect(css).toContain(`${name}:`);
    }
  });

  it('does not emit anything that could break out of a style attribute', () => {
    const css = paletteToCss(LIGHT);
    expect(css).not.toContain('<');
    expect(css).not.toContain('"');
    expect(css).not.toContain('}');
  });
});

describe('the polarity helper agrees with the registers', () => {
  it('reads light as light and dusk as dark', () => {
    expect(isLightSurface(LIGHT.base)).toBe(true);
    expect(isLightSurface(DUSK.base)).toBe(false);
  });
});

describe('channel twins — the fix for dead opacity modifiers', () => {
  it('emits a channel twin for every colour Tailwind binds with <alpha-value>', () => {
    const vars = applyPalette(LIGHT);
    for (const name of [
      '--theme-base-rgb',
      '--theme-accent-rgb',
      '--theme-glow-rgb',
      '--theme-ink-rgb',
      '--color-surface-rgb',
      '--color-surface-elevated-rgb',
      '--color-text-primary-rgb',
      '--color-text-muted-rgb',
      '--color-accent-rgb',
    ] as const) {
      expect(vars[name], `missing ${name}`).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/);
    }
  });

  it('keeps each channel twin in step with its hex counterpart', () => {
    const vars = applyPalette(DUSK);
    expect(vars['--theme-ink-rgb']).toBe('246 234 216'); // #F6EAD8
    expect(vars['--theme-base-rgb']).toBe('58 31 49'); // #3A1F31
    expect(vars['--color-surface-elevated-rgb']).toBe(
      vars['--color-surface-elevated']
        .replace('#', '')
        .match(/.{2}/g)!
        .map((h) => parseInt(h, 16))
        .join(' '),
    );
  });
});
