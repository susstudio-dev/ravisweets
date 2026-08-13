import { describe, expect, it } from 'vitest';
import { CATALOGUE, isNonVeg } from '@ravisweets/shared';

/**
 * GUARDS THE CLAIM, NOT A MODULE.
 *
 * Mislabeling a non-veg product as veg is the one failure this feature must
 * never have — a vegetarian shopper served chicken has been failed by the
 * data, not the UI. This pins every known non-veg slug to the tag, and the
 * tag to never co-existing with a vegetarian-reading claim.
 *
 * Runs against the BAKED catalogue (products.generated.ts), so it also fails
 * if products.ts was edited without `pnpm run bake:catalogue`.
 */

const NONVEG_SLUGS = [
  'chicken-pickle',
  'mutton-pickle',
  'gongura-mutton-pickle',
  'gongura-chicken-pickle',
  'prawn-pickle',
  'fish-pickle',
];

describe('the non-veg claim is carried where it must be', () => {
  it('every known non-veg product exists and carries the tag', () => {
    for (const slug of NONVEG_SLUGS) {
      const p = CATALOGUE.find((x) => x.slug === slug);
      expect(p, `${slug} missing from the baked catalogue`).toBeDefined();
      expect(isNonVeg(p!), `${slug} is not tagged non-veg`).toBe(true);
    }
  });

  it('non-veg never wears a vegetarian-reading tag', () => {
    const offenders = CATALOGUE.filter(
      (p) =>
        isNonVeg(p) &&
        (p.dietary_tags.includes('vegan') || p.dietary_tags.includes('eggless')),
    );
    expect(offenders.map((p) => p.slug)).toEqual([]);
  });

  it('seafood declares its allergen', () => {
    expect(CATALOGUE.find((p) => p.slug === 'prawn-pickle')!.allergens).toContain('Crustaceans');
    expect(CATALOGUE.find((p) => p.slug === 'fish-pickle')!.allergens).toContain('Fish');
  });

  it('non-veg stays out of the corporate hamper builder', () => {
    const inBuilder = CATALOGUE.filter((p) => isNonVeg(p) && p.builder_eligible);
    expect(inBuilder.map((p) => p.slug)).toEqual([]);
  });
});
