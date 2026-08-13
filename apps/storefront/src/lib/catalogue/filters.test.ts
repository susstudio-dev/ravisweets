import { describe, expect, it } from 'vitest';
import { CATALOGUE, isNonVeg, type Product, type ProductVariant } from '@ravisweets/shared';
import {
  FILTER_GROUPS,
  activeFilterCount,
  applyFilters,
  categoryCounts,
  EMPTY_FILTERS,
  facetCounts,
  hasAllergen,
  minPrice,
  parseFilters,
  sortProducts,
  toggleValue,
  writeFilters,
  type FilterState,
} from './filters';

/* ── FIXTURES ───────────────────────────────────────────────────────────── */

function variant(over: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'v1',
    title: '250 g',
    weight_grams: 250,
    price: { amount: 300, currency: 'INR' },
    sku: 'SKU-1',
    stock_available: 5,
    ...over,
  };
}

function product(over: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    slug: 'p1',
    title: 'Product 1',
    description: '',
    category: 'sweets',
    dietary_tags: [],
    ingredients: [],
    allergens: [],
    storage_instructions: '',
    shelf_life_days: 14,
    images: [],
    variants: [variant()],
    region_availability: ['in'],
    featured: false,
    bestseller: false,
    new: false,
    theme_palette: { base: '#fff', accent: '#000', glow: '#eee', ink: '#111', grainOpacity: 0 },
    garnish: 'saffron',
    builder_eligible: true,
    rubric_passed_on: '2026-01-01',
    source_url: '',
    ...over,
  };
}

function state(over: Partial<FilterState> = {}): FilterState {
  return { ...EMPTY_FILTERS, ...over };
}

/* ── ALLERGENS ──────────────────────────────────────────────────────────── */

describe('hasAllergen', () => {
  it('reads the declared allergen list', () => {
    expect(hasAllergen(product({ allergens: ['Nuts'] }), 'nuts')).toBe(true);
  });

  it('is case-insensitive about the declaration', () => {
    expect(hasAllergen(product({ allergens: ['DAIRY'] }), 'dairy')).toBe(true);
  });

  it('also excludes on the dietary tag when allergens[] disagrees', () => {
    // The seed data carries nuts in both lists and they do not agree
    // (45 vs 46). Either declaration must be enough to exclude.
    expect(hasAllergen(product({ allergens: [], dietary_tags: ['nuts'] }), 'nuts')).toBe(true);
  });

  it('counts ghee as dairy', () => {
    expect(hasAllergen(product({ dietary_tags: ['contains-ghee'] }), 'dairy')).toBe(true);
  });

  it('does not fold peanuts into nuts, or the reverse', () => {
    expect(hasAllergen(product({ allergens: ['Peanuts'] }), 'nuts')).toBe(false);
    expect(hasAllergen(product({ allergens: ['Nuts'] }), 'peanuts')).toBe(false);
  });

  it('is false when nothing declares it', () => {
    expect(hasAllergen(product(), 'sesame')).toBe(false);
  });
});

describe('free-from filtering', () => {
  const nutty = product({ id: 'nutty', allergens: ['Nuts'] });
  const dairy = product({ id: 'dairy', allergens: ['Dairy'] });
  const clean = product({ id: 'clean' });

  it('excludes rather than includes', () => {
    const out = applyFilters([nutty, dairy, clean], state({ free: ['nuts'] }));
    expect(out.map((p) => p.id)).toEqual(['dairy', 'clean']);
  });

  it('ANDs within the group — each pick narrows further', () => {
    const out = applyFilters([nutty, dairy, clean], state({ free: ['nuts', 'dairy'] }));
    expect(out.map((p) => p.id)).toEqual(['clean']);
  });
});

/* ── COMBINATORS ────────────────────────────────────────────────────────── */

describe('the combinator rule', () => {
  const cheap = product({ id: 'cheap', variants: [variant({ price: { amount: 100, currency: 'INR' } })] });
  const mid = product({ id: 'mid', variants: [variant({ price: { amount: 300, currency: 'INR' } })] });
  const dear = product({ id: 'dear', variants: [variant({ price: { amount: 1500, currency: 'INR' } })] });

  it('ORs price bands — two bands is a union, never an intersection', () => {
    const out = applyFilters([cheap, mid, dear], state({ price: ['u250', '250-500'] }));
    expect(out.map((p) => p.id)).toEqual(['cheap', 'mid']);
  });

  it('ORs shelf-life bands', () => {
    const fresh = product({ id: 'fresh', shelf_life_days: 5 });
    const weeks = product({ id: 'weeks', shelf_life_days: 21 });
    const travels = product({ id: 'travels', shelf_life_days: 90 });
    const out = applyFilters([fresh, weeks, travels], state({ keeps: ['fresh', 'travels'] }));
    expect(out.map((p) => p.id)).toEqual(['fresh', 'travels']);
  });

  it('ANDs dietary claims', () => {
    const both = product({ id: 'both', dietary_tags: ['eggless', 'vegan'] });
    const one = product({ id: 'one', dietary_tags: ['eggless'] });
    const out = applyFilters([both, one], state({ diet: ['eggless', 'vegan'] }));
    expect(out.map((p) => p.id)).toEqual(['both']);
  });

  it('ANDs across groups', () => {
    const match = product({ id: 'match', dietary_tags: ['vegan'], shelf_life_days: 90 });
    const wrongShelf = product({ id: 'wrongShelf', dietary_tags: ['vegan'], shelf_life_days: 5 });
    const out = applyFilters([match, wrongShelf], state({ diet: ['vegan'], keeps: ['travels'] }));
    expect(out.map((p) => p.id)).toEqual(['match']);
  });

  it('ticking every band of an OR group matches the same set as ticking none', () => {
    const all = [cheap, mid, dear];
    const every = applyFilters(all, state({ price: ['u250', '250-500', '500-1000', '1000p'] }));
    expect(every.map((p) => p.id)).toEqual(applyFilters(all, state()).map((p) => p.id));
  });
});

/* ── PRICE ──────────────────────────────────────────────────────────────── */

describe('minPrice', () => {
  it('takes the cheapest variant, not the first', () => {
    const p = product({
      variants: [
        variant({ id: 'a', price: { amount: 900, currency: 'INR' } }),
        variant({ id: 'b', price: { amount: 250, currency: 'INR' } }),
      ],
    });
    expect(minPrice(p)).toBe(250);
  });

  it('uses the sale price, so a discounted item files under the band its card shows', () => {
    const p = product({
      on_sale: true,
      sale_percent_off: 50,
      variants: [variant({ price: { amount: 600, currency: 'INR' } })],
    });
    expect(minPrice(p)).toBe(300);
    expect(applyFilters([p], state({ price: ['250-500'] }))).toHaveLength(1);
    expect(applyFilters([p], state({ price: ['500-1000'] }))).toHaveLength(0);
  });

  it('ignores an expired sale', () => {
    const p = product({
      on_sale: true,
      sale_percent_off: 50,
      sale_ends_at: '2020-01-01T00:00:00Z',
      variants: [variant({ price: { amount: 600, currency: 'INR' } })],
    });
    expect(minPrice(p)).toBe(600);
  });

  it('does not return Infinity for a product with no variants', () => {
    expect(minPrice(product({ variants: [] }))).toBe(0);
  });
});

/* ── PACK ───────────────────────────────────────────────────────────────── */

describe('pack bands', () => {
  it('matches if ANY variant is in the band', () => {
    const p = product({
      variants: [
        variant({ id: 'a', weight_grams: 250 }),
        variant({ id: 'b', weight_grams: 1000 }),
      ],
    });
    expect(applyFilters([p], state({ pack: ['l'] }))).toHaveLength(1);
    expect(applyFilters([p], state({ pack: ['s'] }))).toHaveLength(1);
  });

  it('holds quantity-mode products out of the gram bands', () => {
    const box = product({ unit_mode: 'quantity', variants: [variant({ weight_grams: 900 })] });
    expect(applyFilters([box], state({ pack: ['l'] }))).toHaveLength(0);
    expect(applyFilters([box], state({ pack: ['fixed'] }))).toHaveLength(1);
  });

  it('puts a 500 g variant in the middle band, not the large one', () => {
    const p = product({ variants: [variant({ weight_grams: 500 })] });
    expect(applyFilters([p], state({ pack: ['m'] }))).toHaveLength(1);
    expect(applyFilters([p], state({ pack: ['l'] }))).toHaveLength(0);
  });
});

/* ── STOCK ──────────────────────────────────────────────────────────────── */

describe('in-stock', () => {
  it('keeps a product if any variant has stock', () => {
    const p = product({
      variants: [
        variant({ id: 'a', stock_available: 0 }),
        variant({ id: 'b', stock_available: 3 }),
      ],
    });
    expect(applyFilters([p], state({ inStock: true }))).toHaveLength(1);
  });

  it('drops a product whose every variant is out', () => {
    const p = product({ variants: [variant({ stock_available: 0 })] });
    expect(applyFilters([p], state({ inStock: true }))).toHaveLength(0);
    expect(applyFilters([p], state())).toHaveLength(1);
  });
});

/* ── FACETS ─────────────────────────────────────────────────────────────── */

describe('facetCounts', () => {
  const vegan = product({ id: 'vegan', dietary_tags: ['vegan'], shelf_life_days: 90 });
  const veganFresh = product({ id: 'veganFresh', dietary_tags: ['vegan'], shelf_life_days: 5 });
  const eggless = product({ id: 'eggless', dietary_tags: ['eggless'], shelf_life_days: 90 });
  const all = [vegan, veganFresh, eggless];

  it('counts what an option would leave, given the other groups', () => {
    // With "Travels & gifts well" active, only vegan + eggless survive, so
    // Vegan promises 1 — not the 2 that exist catalogue-wide.
    const counts = facetCounts(all, state({ keeps: ['travels'] }));
    expect(counts.diet!.vegan).toBe(1);
    expect(counts.diet!.eggless).toBe(1);
  });

  it('ignores its OWN group, so a selected option still shows its real count', () => {
    const counts = facetCounts(all, state({ diet: ['vegan'] }));
    // eggless is counted as if diet were not applied — otherwise every
    // unselected sibling reads 0 and the group looks broken.
    expect(counts.diet!.eggless).toBe(1);
    expect(counts.diet!.vegan).toBe(2);
  });

  it('reports zero rather than omitting an impossible option', () => {
    const counts = facetCounts(all, state());
    expect(counts.diet!['sugar-free']).toBe(0);
  });

  it('a non-zero count is a promise — selecting it leaves exactly that many', () => {
    const base = state({ keeps: ['travels'] });
    const counts = facetCounts(all, base);
    const picked = applyFilters(all, { ...base, diet: ['vegan'] });
    expect(picked).toHaveLength(counts.diet!.vegan!);
  });
});

describe('categoryCounts', () => {
  it('honours every non-category filter', () => {
    const a = product({ id: 'a', category: 'sweets', dietary_tags: ['vegan'] });
    const b = product({ id: 'b', category: 'sweets' });
    const c = product({ id: 'c', category: 'pickles', dietary_tags: ['vegan'] });
    const counts = categoryCounts([a, b, c], state({ diet: ['vegan'] }));
    expect(counts.get('sweets')).toBe(1);
    expect(counts.get('pickles')).toBe(1);
  });

  it('ignores the active category so sibling chips stay countable', () => {
    const a = product({ id: 'a', category: 'sweets' });
    const c = product({ id: 'c', category: 'pickles' });
    const counts = categoryCounts([a, c], state({ cat: 'sweets' }));
    expect(counts.get('pickles')).toBe(1);
  });
});

/* ── SORT ───────────────────────────────────────────────────────────────── */

describe('sortProducts', () => {
  const cheap = product({ id: 'cheap', variants: [variant({ price: { amount: 100, currency: 'INR' } })] });
  const dear = product({ id: 'dear', variants: [variant({ price: { amount: 900, currency: 'INR' } })] });

  it('sorts by the effective minimum, ascending', () => {
    expect(sortProducts([dear, cheap], 'price-asc').map((p) => p.id)).toEqual(['cheap', 'dear']);
  });

  it('sorts descending', () => {
    expect(sortProducts([cheap, dear], 'price-desc').map((p) => p.id)).toEqual(['dear', 'cheap']);
  });

  it('does not mutate its input', () => {
    const input = [dear, cheap];
    sortProducts(input, 'price-asc');
    expect(input.map((p) => p.id)).toEqual(['dear', 'cheap']);
  });
});

/* ── URL ────────────────────────────────────────────────────────────────── */

describe('parseFilters', () => {
  it('reads every group', () => {
    const p = new URLSearchParams(
      'cat=sweets&type=nonveg&diet=vegan,eggless&free=nuts&price=u250&keeps=travels&pack=s&tag=new&stock=in&sort=price-asc',
    );
    const s = parseFilters(p);
    expect(s).toEqual({
      cat: 'sweets',
      vtype: ['nonveg'],
      diet: ['vegan', 'eggless'],
      free: ['nuts'],
      price: ['u250'],
      keeps: ['travels'],
      pack: ['s'],
      flags: ['new'],
      inStock: true,
      sort: 'price-asc',
    });
  });

  it('returns the empty state for an empty query', () => {
    expect(parseFilters(new URLSearchParams())).toEqual(EMPTY_FILTERS);
  });

  it('drops unknown values instead of applying an unclearable filter', () => {
    // `diet=nuts` is a real old link — nuts lived in the dietary group before
    // "Free from" existed. It must degrade to no filter, not to a hidden one.
    expect(parseFilters(new URLSearchParams('diet=nuts,vegan')).diet).toEqual(['vegan']);
  });

  it('falls back to featured on a junk sort', () => {
    expect(parseFilters(new URLSearchParams('sort=cheapest')).sort).toBe('featured');
  });

  it('tolerates whitespace in a hand-edited list', () => {
    expect(parseFilters(new URLSearchParams('diet=vegan, eggless')).diet).toEqual([
      'vegan',
      'eggless',
    ]);
  });
});

describe('writeFilters', () => {
  it('round-trips through parseFilters', () => {
    const s = state({
      cat: 'pickles',
      diet: ['vegan'],
      free: ['dairy'],
      price: ['1000p'],
      keeps: ['weeks'],
      pack: ['fixed'],
      flags: ['sale'],
      inStock: true,
      sort: 'price-desc',
    });
    expect(parseFilters(writeFilters(new URLSearchParams(), s))).toEqual(s);
  });

  it('omits defaults so an unfiltered URL stays clean', () => {
    expect(writeFilters(new URLSearchParams(), EMPTY_FILTERS).toString()).toBe('');
  });

  it('preserves params the filters do not own', () => {
    const out = writeFilters(new URLSearchParams('utm_source=wa'), state({ diet: ['vegan'] }));
    expect(out.get('utm_source')).toBe('wa');
    expect(out.get('diet')).toBe('vegan');
  });

  it('clears a param when its group empties', () => {
    const out = writeFilters(new URLSearchParams('diet=vegan'), EMPTY_FILTERS);
    expect(out.get('diet')).toBeNull();
  });
});

describe('toggleValue', () => {
  it('adds then removes', () => {
    expect(toggleValue([], 'a')).toEqual(['a']);
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('activeFilterCount', () => {
  it('counts chips across groups', () => {
    expect(activeFilterCount(state({ diet: ['vegan'], free: ['nuts'], inStock: true }))).toBe(3);
  });

  it('does not count sort or category', () => {
    expect(activeFilterCount(state({ sort: 'price-asc', cat: 'sweets' }))).toBe(0);
  });
});

/* ── AGAINST THE REAL CATALOGUE ─────────────────────────────────────────── */

/*
 * Fixtures cannot catch the failure that actually matters here: an option
 * whose value does not match the strings the catalogue really carries. If the
 * allergen list says "Nuts" and the option says "tree-nuts", every unit test
 * above still passes and the live chip silently filters nothing — or, worse
 * for an allergen, appears to work while excluding nothing at all.
 */
describe('the real catalogue', () => {
  const base = state();

  it('has products to filter', () => {
    expect(CATALOGUE.length).toBeGreaterThan(0);
  });

  it('gives every group at least one option that leads somewhere', () => {
    const counts = facetCounts(CATALOGUE, base);
    for (const group of FILTER_GROUPS) {
      const total = group.options.reduce((n, o) => n + (counts[group.id]?.[o.value] ?? 0), 0);
      expect(total, `group "${group.id}" matches nothing in the catalogue`).toBeGreaterThan(0);
    }
  });

  it('keeps every count honest — selecting an option leaves exactly that many', () => {
    const counts = facetCounts(CATALOGUE, base);
    for (const group of FILTER_GROUPS) {
      for (const o of group.options) {
        const picked = applyFilters(CATALOGUE, { ...base, [group.id]: [o.value] });
        expect(picked.length, `${group.id}=${o.value}`).toBe(counts[group.id]?.[o.value]);
      }
    }
  });

  it('offers a real sugar-free line — the filter the owner asked for', () => {
    const counts = facetCounts(CATALOGUE, base);
    expect(counts.diet?.['sugar-free']).toBeGreaterThan(0);
  });

  it('actually excludes for every allergen option', () => {
    for (const o of FILTER_GROUPS.find((g) => g.id === 'free')!.options) {
      const kept = applyFilters(CATALOGUE, { ...base, free: [o.value] });
      // Fewer than the whole catalogue (it excludes something) and more than
      // none (it does not exclude everything).
      expect(kept.length, `free=${o.value} excluded nothing`).toBeLessThan(CATALOGUE.length);
      expect(kept.length, `free=${o.value} excluded everything`).toBeGreaterThan(0);
      expect(kept.every((p) => !hasAllergen(p, o.value))).toBe(true);
    }
  });

  it('never lets a nut product survive the nut filter, by either declaration', () => {
    const kept = applyFilters(CATALOGUE, { ...base, free: ['nuts'] });
    for (const p of kept) {
      expect(p.allergens.map((a) => a.toLowerCase())).not.toContain('nuts');
      expect(p.dietary_tags as string[]).not.toContain('nuts');
    }
  });

  it('bands every product into exactly one price band and one shelf band', () => {
    const priceBands = FILTER_GROUPS.find((g) => g.id === 'price')!.options;
    const keepsBands = FILTER_GROUPS.find((g) => g.id === 'keeps')!.options;
    for (const p of CATALOGUE) {
      const inPrice = priceBands.filter((b) => applyFilters([p], { ...base, price: [b.value] }).length);
      const inKeeps = keepsBands.filter((b) => applyFilters([p], { ...base, keeps: [b.value] }).length);
      expect(inPrice.length, `${p.slug} price bands`).toBe(1);
      expect(inKeeps.length, `${p.slug} shelf bands`).toBe(1);
    }
  });
});

/* ── VEG / NON-VEG ──────────────────────────────────────────────────────── */

describe('isNonVeg', () => {
  it('reads the tag', () => {
    expect(isNonVeg(product({ dietary_tags: ['non-veg'] }))).toBe(true);
  });

  it('veg is the absence of the tag — a mithai house defaults vegetarian', () => {
    expect(isNonVeg(product())).toBe(false);
    expect(isNonVeg(product({ dietary_tags: ['eggless', 'dairy'] }))).toBe(false);
  });
});

describe('veg / non-veg group', () => {
  const veg = product({ id: 'veg' });
  const nonveg = product({ id: 'nonveg', dietary_tags: ['non-veg'] });
  const all = [veg, nonveg];

  it('veg means the tag is absent', () => {
    expect(applyFilters(all, state({ vtype: ['veg'] })).map((p) => p.id)).toEqual(['veg']);
  });

  it('nonveg means the tag is present', () => {
    expect(applyFilters(all, state({ vtype: ['nonveg'] })).map((p) => p.id)).toEqual(['nonveg']);
  });

  it('is a bucket group — both ticked is the same as none', () => {
    expect(applyFilters(all, state({ vtype: ['veg', 'nonveg'] }))).toHaveLength(2);
    expect(applyFilters(all, state({ vtype: [] }))).toHaveLength(2);
  });

  it('round-trips through the URL as ?type=', () => {
    const qs = writeFilters(new URLSearchParams(), state({ vtype: ['nonveg'] }));
    expect(qs.get('type')).toBe('nonveg');
    expect(parseFilters(qs).vtype).toEqual(['nonveg']);
  });

  it('drops unknown type values rather than carrying an invisible filter', () => {
    expect(parseFilters(new URLSearchParams('type=beef')).vtype).toEqual([]);
  });

  it('counts each side against the other groups', () => {
    const counts = facetCounts(all, state());
    expect(counts.vtype!.veg).toBe(1);
    expect(counts.vtype!.nonveg).toBe(1);
  });

  it('adds to the active filter count', () => {
    expect(activeFilterCount(state({ vtype: ['veg'] }))).toBe(1);
  });
});
