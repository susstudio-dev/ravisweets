import { describe, expect, it } from 'vitest';
import {
  EMPTY_PAGE_MEDIA,
  FESTIVAL_SLUGS,
  getSlot,
  parsePageMedia,
  setSlot,
} from './page-media';

describe('parsePageMedia', () => {
  it('returns the empty shape for undefined', () => {
    expect(parsePageMedia(undefined)).toEqual(EMPTY_PAGE_MEDIA);
  });

  it('returns the empty shape for garbage input', () => {
    const parsed = parsePageMedia({ garbage: 1 });
    expect(parsed).toEqual(EMPTY_PAGE_MEDIA);
    expect(parsed.festivals).toEqual({});
  });

  it('round-trips a valid partial and defaults every other slot', () => {
    const parsed = parsePageMedia({ about: { portrait: { assetId: 'a', alt: 'x' } } });
    expect(parsed.about.portrait).toEqual({ assetId: 'a', alt: 'x' });
    expect(parsed.about.kitchen).toBeNull();
    expect(parsed.about.founder).toBeNull();
    expect(parsed.stores.storefront).toBeNull();
    expect(parsed.corporate).toEqual({ essence: null, premium: null, grande: null });
    expect(parsed.festivals).toEqual({});
    expect(parsed.brand.logo).toBeNull();
  });

  it('never throws on wildly wrong slot values', () => {
    const parsed = parsePageMedia({ about: { portrait: 42, kitchen: 'nope' }, festivals: [] });
    expect(parsed.about.portrait).toBeNull();
    expect(parsed.about.kitchen).toBeNull();
  });
});

describe('getSlot / setSlot', () => {
  it('setSlot returns a new object without mutating its input', () => {
    const before = parsePageMedia(undefined);
    const after = setSlot(before, 'about.portrait', { assetId: 'a1', alt: 'Founder' });
    expect(after).not.toBe(before);
    expect(before.about.portrait).toBeNull();
    expect(after.about.portrait).toEqual({ assetId: 'a1', alt: 'Founder' });
    expect(getSlot(after, 'about.portrait')).toEqual({ assetId: 'a1', alt: 'Founder' });
  });

  it('reads and writes the festivals record by slug', () => {
    const media = setSlot(parsePageMedia(undefined), 'festivals.diwali', {
      assetId: 'f1',
      alt: 'Diwali hamper',
    });
    expect(getSlot(media, 'festivals.diwali')).toEqual({ assetId: 'f1', alt: 'Diwali hamper' });
    expect(getSlot(media, 'festivals.holi')).toBeNull();
  });
});

describe('FESTIVAL_SLUGS', () => {
  it('carries all eleven festival pages, including the one the hand-kept list dropped', () => {
    expect(FESTIVAL_SLUGS).toContain('diwali');
    expect(FESTIVAL_SLUGS).toContain('raksha-bandhan');
    expect(FESTIVAL_SLUGS).toContain('independence-day');
    expect(FESTIVAL_SLUGS).toHaveLength(11);
  });
});
