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
    expect(contrastRatio('#5E2757', '#5E2757')).toBeCloseTo(1, 5);
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

  it('classifies the bidri gunmetal base as dark', () => {
    expect(isLightSurface('#17181A')).toBe(false);
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
  it('reads the anjeer accent as fig-purple', () => {
    expect(hue('#5E2757')).toBeCloseTo(308, 0);
  });

  it('reads the pista field as yellow-green', () => {
    expect(hue('#C9D99C')).toBeCloseTo(76, 0);
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

  it('clears Cadbury purple from the anjeer accent by at least 40 degrees', () => {
    expect(hueClearance('#5E2757', '#3F1B7A')).toBeGreaterThanOrEqual(40);
  });
});
