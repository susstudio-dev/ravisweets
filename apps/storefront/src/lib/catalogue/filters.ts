import {
  computeEffectivePrice,
  isNonVeg,
  type CategorySlug,
  type DietaryTag,
  type Product,
} from '@ravisweets/shared';

/**
 * THE CATALOGUE FILTER MODEL — one source of truth for /shop and /category.
 *
 * Both surfaces used to filter independently: /shop had category chips and a
 * sort and nothing else, /category had dietary + in-stock + sort, and the two
 * sets of semantics were written twice and drifted. Everything here is pure —
 * no React, no router — so the browse surfaces only own presentation, and the
 * fiddly part (facet counting) is unit-testable.
 *
 * STATE LIVES IN THE URL, NOWHERE ELSE. That predates this file and is kept:
 * filters and grid read the same params independently, so no state threads
 * between components and every filtered view is linkable.
 *
 * ── THE COMBINATOR RULE ────────────────────────────────────────────────────
 * Between groups: always AND.
 * Within a group: AND where each pick NARROWS a claim about the product
 *   ("eggless AND vegan", "free from nuts AND dairy"), OR where the picks are
 *   BUCKETS of one axis ("₹250–500 OR ₹500–1000"). Selecting more can never
 *   widen a narrowing group, and can never narrow a bucket group. Getting this
 *   backwards is the classic faceted-search bug — a shopper who ticks two
 *   price bands and sees zero results assumes the shop is empty.
 *
 * ── ALLERGENS ARE NOT A STYLE CHOICE ───────────────────────────────────────
 * "Free from" reads BOTH `allergens[]` and `dietary_tags[]` and excludes on
 * either, because the seed data carries nuts in both and they do not agree
 * (allergens 45, dietary_tags 46). Over-exclusion is the safe direction: a
 * missed product costs a sale, a missed allergen costs a great deal more.
 * Ghee counts as dairy — see hasAllergen. The UI must state that the recipe
 * excluding an allergen is NOT a free-from guarantee, because /policies
 * declares nuts, dairy, wheat and sesame are handled on the same premises.
 */

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export type GroupId = 'cat' | 'vtype' | 'diet' | 'free' | 'price' | 'keeps' | 'pack' | 'flags' | 'stock';

export interface FilterState {
  cat: CategorySlug | null;
  /** Veg / non-veg — buckets of one axis, OR. Veg = the tag's absence. */
  vtype: string[];
  /** Positive dietary claims — AND. */
  diet: string[];
  /** Allergens to exclude — AND. */
  free: string[];
  /** Price bands — OR. */
  price: string[];
  /** Shelf-life bands — OR. */
  keeps: string[];
  /** Pack-size bands — OR. */
  pack: string[];
  /** new / bestseller / sale — AND. */
  flags: string[];
  inStock: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterState = {
  cat: null,
  vtype: [],
  diet: [],
  free: [],
  price: [],
  keeps: [],
  pack: [],
  flags: [],
  inStock: false,
  sort: 'featured',
};

/** URL parameter names. `flags` is `tag` for brevity in a shared link. */
export const PARAM: Record<GroupId, string> = {
  cat: 'cat',
  vtype: 'type',
  diet: 'diet',
  free: 'free',
  price: 'price',
  keeps: 'keeps',
  pack: 'pack',
  flags: 'tag',
  stock: 'stock',
};

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: Exclude<GroupId, 'cat' | 'stock'>;
  legend: string;
  /** Rendered under the legend when the group needs a caveat. */
  hint?: string;
  options: FilterOption[];
}

/*
 * Only claims the catalogue actually carries. `nuts`, `dairy` and
 * `contains-ghee` are deliberately ABSENT here — they are not things a shopper
 * wants, they are things a shopper avoids, so they belong to "Free from"
 * below and are consumed by hasAllergen. Listing "Contains nuts" beside
 * "Sugar-free" as if both were desirable was the old panel's real flaw.
 */
export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'vtype',
    legend: 'Veg / Non-veg',
    options: [
      { value: 'veg', label: 'Veg' },
      { value: 'nonveg', label: 'Non-veg' },
    ],
  },
  {
    id: 'diet',
    legend: 'Suitable for',
    options: [
      { value: 'eggless', label: 'Eggless' },
      { value: 'sugar-free', label: 'Sugar-free' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'gluten-free', label: 'Gluten-free' },
    ],
  },
  {
    id: 'free',
    legend: 'Free from',
    hint: 'Recipe excludes it. Nuts, dairy, wheat and sesame are handled on the same premises, so we cannot promise traces.',
    options: [
      { value: 'nuts', label: 'Nuts' },
      { value: 'peanuts', label: 'Peanuts' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'gluten', label: 'Gluten' },
      { value: 'sesame', label: 'Sesame' },
      { value: 'mustard', label: 'Mustard' },
    ],
  },
  {
    id: 'price',
    legend: 'Price',
    options: [
      { value: 'u250', label: 'Under ₹250' },
      { value: '250-500', label: '₹250 – ₹500' },
      { value: '500-1000', label: '₹500 – ₹1,000' },
      { value: '1000p', label: '₹1,000 +' },
    ],
  },
  {
    id: 'keeps',
    legend: 'Keeps well',
    options: [
      { value: 'fresh', label: 'Best within a week' },
      { value: 'weeks', label: 'Keeps a few weeks' },
      { value: 'travels', label: 'Travels & gifts well' },
    ],
  },
  {
    id: 'pack',
    legend: 'Pack size',
    options: [
      { value: 's', label: '250 g or less' },
      { value: 'm', label: '250 – 500 g' },
      { value: 'l', label: 'Over 500 g' },
      { value: 'fixed', label: 'Fixed pack' },
    ],
  },
  {
    id: 'flags',
    legend: 'Other',
    options: [
      { value: 'bestseller', label: 'Bestsellers' },
      { value: 'new', label: 'New' },
      { value: 'sale', label: 'On offer' },
    ],
  },
];

const VALID: Record<FilterGroup['id'], Set<string>> = FILTER_GROUPS.reduce(
  (acc, g) => {
    acc[g.id] = new Set(g.options.map((o) => o.value));
    return acc;
  },
  {} as Record<FilterGroup['id'], Set<string>>,
);

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price · low to high' },
  { value: 'price-desc', label: 'Price · high to low' },
  { value: 'newest', label: 'Newest' },
];

const SORT_KEYS = new Set<string>(SORTS.map((s) => s.value));

/* ── PRODUCT FACTS ──────────────────────────────────────────────────────── */

/**
 * The lowest price a shopper can actually pay for this product today —
 * EFFECTIVE, so a discounted item files under the band its card shows rather
 * than the band its struck-through price would suggest.
 */
export function minPrice(product: Product): number {
  let min = Infinity;
  for (const v of product.variants) {
    const eff = computeEffectivePrice(product, v);
    min = Math.min(min, eff.salePrice ?? eff.regular);
  }
  return Number.isFinite(min) ? min : 0;
}

export function isOnSale(product: Product): boolean {
  return product.variants.some((v) => computeEffectivePrice(product, v).salePrice !== null);
}

export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.stock_available > 0);
}

/**
 * Does this product carry the allergen? Reads both declarations and returns
 * true if EITHER says so — see the header note on over-exclusion.
 */
export function hasAllergen(product: Product, key: string): boolean {
  const declared = product.allergens.map((a) => a.toLowerCase());
  const tags = product.dietary_tags as string[];
  switch (key) {
    case 'nuts':
      return declared.includes('nuts') || tags.includes('nuts');
    case 'peanuts':
      return declared.includes('peanuts');
    // Ghee is dairy. A shopper avoiding dairy who is served a ghee-rich
    // laddu has been failed by the filter, not by the label.
    case 'dairy':
      return declared.includes('dairy') || tags.includes('dairy') || tags.includes('contains-ghee');
    default:
      return declared.includes(key);
  }
}

function inPriceBand(product: Product, band: string): boolean {
  const p = minPrice(product);
  switch (band) {
    case 'u250':
      return p < 250;
    case '250-500':
      return p >= 250 && p < 500;
    case '500-1000':
      return p >= 500 && p < 1000;
    case '1000p':
      return p >= 1000;
    default:
      return false;
  }
}

/** Non-overlapping by design, so ticking all three is the same as ticking none. */
function inKeepsBand(product: Product, band: string): boolean {
  const d = product.shelf_life_days;
  switch (band) {
    case 'fresh':
      return d <= 7;
    case 'weeks':
      return d > 7 && d < 30;
    case 'travels':
      return d >= 30;
    default:
      return false;
  }
}

/**
 * Gram bands read the VARIANTS, so "over 500 g" means "a large size can be
 * bought", not "the default size is large". Quantity-mode products are held
 * out of the gram bands entirely: their weight_grams describes a box, and
 * filing a "Box of 12" under 500 g would be answering a different question.
 */
function inPackBand(product: Product, band: string): boolean {
  if (band === 'fixed') return product.unit_mode === 'quantity';
  if (product.unit_mode === 'quantity') return false;
  return product.variants.some((v) => {
    const g = v.weight_grams;
    if (band === 's') return g <= 250;
    if (band === 'm') return g > 250 && g <= 500;
    if (band === 'l') return g > 500;
    return false;
  });
}

function hasFlag(product: Product, flag: string): boolean {
  switch (flag) {
    case 'new':
      return product.new;
    case 'bestseller':
      return product.bestseller;
    case 'sale':
      return isOnSale(product);
    default:
      return false;
  }
}

/** Does one option, on its own, match? Used for both filtering and counting. */
export function matchesOption(product: Product, group: FilterGroup['id'], value: string): boolean {
  switch (group) {
    case 'vtype':
      return value === 'nonveg' ? isNonVeg(product) : !isNonVeg(product);
    case 'diet':
      return product.dietary_tags.includes(value as DietaryTag);
    case 'free':
      return !hasAllergen(product, value);
    case 'price':
      return inPriceBand(product, value);
    case 'keeps':
      return inKeepsBand(product, value);
    case 'pack':
      return inPackBand(product, value);
    case 'flags':
      return hasFlag(product, value);
    default:
      return true;
  }
}

/* ── GROUPS ─────────────────────────────────────────────────────────────── */

const ALL_GROUPS: GroupId[] = ['cat', 'vtype', 'diet', 'free', 'price', 'keeps', 'pack', 'flags', 'stock'];

/** AND groups narrow on every pick; OR groups are buckets of one axis. */
const OR_GROUPS = new Set<string>(['vtype', 'price', 'keeps', 'pack']);

function passesGroup(product: Product, group: GroupId, state: FilterState): boolean {
  if (group === 'cat') return state.cat === null || product.category === state.cat;
  if (group === 'stock') return !state.inStock || isInStock(product);

  const selected = state[group];
  if (selected.length === 0) return true;
  return OR_GROUPS.has(group)
    ? selected.some((v) => matchesOption(product, group, v))
    : selected.every((v) => matchesOption(product, group, v));
}

function passesAllExcept(product: Product, skip: GroupId | null, state: FilterState): boolean {
  return ALL_GROUPS.every((g) => g === skip || passesGroup(product, g, state));
}

export function applyFilters(products: Product[], state: FilterState): Product[] {
  return products.filter((p) => passesAllExcept(p, null, state));
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const out = [...products];
  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => minPrice(a) - minPrice(b));
    case 'price-desc':
      return out.sort((a, b) => minPrice(b) - minPrice(a));
    case 'newest':
      return out.sort((a, b) => Number(b.new) - Number(a.new));
    default:
      return out.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

/**
 * How many products each option WOULD leave, counted against everything the
 * shopper has already chosen in OTHER groups but ignoring this group. That is
 * what makes a count a promise: "Vegan · 12" means clicking it leaves twelve,
 * not that twelve exist somewhere in the catalogue.
 *
 * Zero-count options are not removed here — the caller hides them — because
 * an option the shopper has ALREADY SELECTED must stay rendered even at zero,
 * or the only control that could undo an empty result set disappears with it.
 */
export function facetCounts(
  products: Product[],
  state: FilterState,
): Record<string, Record<string, number>> {
  const counts: Record<string, Record<string, number>> = {};
  for (const group of FILTER_GROUPS) {
    const base = products.filter((p) => passesAllExcept(p, group.id, state));
    counts[group.id] = {};
    for (const opt of group.options) {
      counts[group.id]![opt.value] = base.filter((p) =>
        matchesOption(p, group.id, opt.value),
      ).length;
    }
  }
  return counts;
}

/**
 * What the in-stock toggle would do, given everything else selected.
 * `matching === total` means the control cannot change the result, and the
 * caller hides it — same rule as a zero-count chip, applied to a checkbox.
 * With the current catalogue every product is in stock, so this control is
 * correctly invisible until something actually sells out.
 */
export function stockFacet(
  products: Product[],
  state: FilterState,
): { matching: number; total: number } {
  const base = products.filter((p) => passesAllExcept(p, 'stock', state));
  return { matching: base.filter(isInStock).length, total: base.length };
}

/** Per-category counts, honouring every non-category filter. */
export function categoryCounts(
  products: Product[],
  state: FilterState,
): Map<CategorySlug, number> {
  const out = new Map<CategorySlug, number>();
  for (const p of products) {
    if (!passesAllExcept(p, 'cat', state)) continue;
    out.set(p.category, (out.get(p.category) ?? 0) + 1);
  }
  return out;
}

/* ── URL ────────────────────────────────────────────────────────────────── */

interface ParamReader {
  get(name: string): string | null;
}

/**
 * Unknown values are DROPPED, not carried. An old link with `diet=nuts` (the
 * tag lived in the dietary group before "Free from" existed) would otherwise
 * apply a filter with no chip to clear it — an invisible reason for an empty
 * grid. Degrading to "no filter" is the recoverable failure.
 */
function readList(params: ParamReader, name: string, valid: Set<string>): string[] {
  const raw = params.get(name);
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => valid.has(s));
}

export function parseFilters(params: ParamReader): FilterState {
  const sort = params.get('sort');
  return {
    cat: (params.get(PARAM.cat) as CategorySlug | null) || null,
    vtype: readList(params, PARAM.vtype, VALID.vtype),
    diet: readList(params, PARAM.diet, VALID.diet),
    free: readList(params, PARAM.free, VALID.free),
    price: readList(params, PARAM.price, VALID.price),
    keeps: readList(params, PARAM.keeps, VALID.keeps),
    pack: readList(params, PARAM.pack, VALID.pack),
    flags: readList(params, PARAM.flags, VALID.flags),
    inStock: params.get(PARAM.stock) === 'in',
    sort: sort && SORT_KEYS.has(sort) ? (sort as SortKey) : 'featured',
  };
}

/**
 * Writes state onto a COPY of the current params, so anything the filters do
 * not own (a campaign tag, a scroll anchor) survives a chip click. Defaults
 * are deleted rather than written, keeping a no-filter URL clean.
 */
export function writeFilters(current: URLSearchParams, state: FilterState): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  const set = (name: string, value: string) => {
    if (value) next.set(name, value);
    else next.delete(name);
  };
  set(PARAM.cat, state.cat ?? '');
  set(PARAM.vtype, state.vtype.join(','));
  set(PARAM.diet, state.diet.join(','));
  set(PARAM.free, state.free.join(','));
  set(PARAM.price, state.price.join(','));
  set(PARAM.keeps, state.keeps.join(','));
  set(PARAM.pack, state.pack.join(','));
  set(PARAM.flags, state.flags.join(','));
  set(PARAM.stock, state.inStock ? 'in' : '');
  set('sort', state.sort === 'featured' ? '' : state.sort);
  return next;
}

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Chips only — sort is not a filter and must not show a "clear" affordance. */
export function activeFilterCount(state: FilterState): number {
  return (
    state.vtype.length +
    state.diet.length +
    state.free.length +
    state.price.length +
    state.keeps.length +
    state.pack.length +
    state.flags.length +
    (state.inStock ? 1 : 0)
  );
}
