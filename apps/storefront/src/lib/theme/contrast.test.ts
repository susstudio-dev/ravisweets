import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  hue,
  hueClearance,
  isLightSurface,
  mix,
  relativeLuminance,
} from './contrast';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('accepts lowercase and a missing hash', () => {
    expect(relativeLuminance('ffffff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('is 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('is 1:1 for a colour against itself', () => {
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#221E1A', '#F1F0E2')).toBeCloseTo(contrastRatio('#F1F0E2', '#221E1A'), 5);
  });

  it('matches the spec ratio for ink on base', () => {
    expect(contrastRatio('#221E1A', '#F1F0E2')).toBeCloseTo(14.43, 1);
  });
});

describe('isLightSurface', () => {
  it('classifies the light register base as light', () => {
    expect(isLightSurface('#F1F0E2')).toBe(true);
  });

  it('classifies the dusk plum base as dark', () => {
    expect(isLightSurface('#3A1F31')).toBe(false);
  });

  it('classifies the legacy dark product base as dark', () => {
    expect(isLightSurface('#2a1505')).toBe(false);
  });
});

describe('mix', () => {
  it('returns the first colour at t=0 and the second at t=1', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
  });

  it('produces the midpoint at t=0.5', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });

  it('clamps t outside 0..1', () => {
    expect(mix('#000000', '#FFFFFF', -1)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 2)).toBe('#FFFFFF');
  });
});

describe('hue', () => {
  it('reads a magenta-purple swatch correctly', () => {
    expect(hue('#7A2E52')).toBeCloseTo(332, 0);
  });

  it('reads a yellow-green swatch correctly', () => {
    expect(hue('#A8C060')).toBeCloseTo(75, 0);
  });
});

describe('hueClearance', () => {
  it('never exceeds 180 degrees', () => {
    expect(hueClearance('#FF0000', '#00FFFF')).toBeLessThanOrEqual(180);
  });

  it('wraps around the colour wheel', () => {
    // hue 350 and hue 10 are 20 degrees apart, not 340
    expect(hueClearance('#FF0D45', '#FF2D0D')).toBeLessThan(40);
  });

  it('measures clearance between two arbitrary hues', () => {
    expect(hueClearance('#7A2E52', '#1F7A3F')).toBeCloseTo(169, 0);
  });
});
