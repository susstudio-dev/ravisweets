'use client';

import type { Product } from '@ravisweets/shared';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  facetCounts,
  FILTER_GROUPS,
  SORTS,
  stockFacet,
  toggleValue,
  type FilterGroup,
  type FilterState,
  type SortKey,
} from '@/lib/catalogue/filters';
import { cn } from '@/lib/cn';

/**
 * THE REFINE PANEL — shared by /shop and /category/[slug].
 *
 * EVERY CHIP CARRIES ITS LIVE COUNT, AND A ZERO-COUNT CHIP IS HIDDEN. That is
 * the whole reason this can offer six groups without becoming a wall: the
 * panel only ever shows moves that lead somewhere. A shop with no sale on
 * shows no "On offer" chip; a category with no sugar-free line shows no
 * sugar-free chip. Counts come from facetCounts, which measures each option
 * against the OTHER groups — so "Vegan · 12" is a promise that clicking it
 * leaves twelve, not a catalogue-wide statistic.
 *
 * The one exception is a chip the shopper has already SELECTED: it stays
 * rendered even at zero, because it may be the only control that can undo an
 * empty result set. Hiding it would strand them.
 */
interface ProductFiltersProps {
  /** The surface's UNFILTERED set — facet counts are measured against it. */
  products: Product[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  /** Rendered inside the panel on mobile, beside the results on desktop. */
  showSort?: boolean;
  /** The sheet supplies its own dialog title, so the panel's would duplicate it. */
  hideHeading?: boolean;
  className?: string;
}

export function filterChipClass(active: boolean) {
  return cn(
    'focus-visible:ring-theme-accent inline-flex min-h-[36px] items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
    active
      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
      : 'bg-surface text-theme-ink/80 hover:border-theme-accent hover:text-theme-ink border-[color:var(--color-border)]',
  );
}

export function ProductFilters({
  products,
  state,
  onChange,
  showSort = false,
  hideHeading = false,
  className,
}: ProductFiltersProps) {
  const counts = facetCounts(products, state);
  const stock = stockFacet(products, state);
  const active = activeFilterCount(state);

  function toggle(group: FilterGroup['id'], value: string) {
    onChange({ ...state, [group]: toggleValue(state[group], value) });
  }

  /* Category and sort are deliberately preserved — "clear filters" should not
     also throw away which aisle you are standing in, or how it is ordered. */
  const clear = () => onChange({ ...EMPTY_FILTERS, cat: state.cat, sort: state.sort });

  return (
    <div className={cn(hideHeading ? '' : 'docket p-5', className)}>
      {hideHeading ? (
        active > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-theme-accent mb-4 text-xs font-semibold hover:underline"
          >
            Clear {active}
          </button>
        )
      ) : (
        <div className="docket-head">
          <h2 className="font-display text-theme-ink text-lg">Refine</h2>
          {active > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-theme-accent text-xs font-semibold hover:underline"
            >
              Clear {active}
            </button>
          )}
        </div>
      )}

      {FILTER_GROUPS.map((group) => {
        const selected = state[group.id];
        const visible = group.options.filter(
          (o) => (counts[group.id]?.[o.value] ?? 0) > 0 || selected.includes(o.value),
        );
        // A group whose every option leads nowhere is not shown at all — an
        // empty "Pack size" heading is noise, not information.
        if (visible.length === 0) return null;

        return (
          <fieldset
            key={group.id}
            className="mb-5 border-b border-[color:var(--color-border)] pb-5 last:mb-0 last:border-b-0 last:pb-0"
          >
            <legend className="field-label mb-2">{group.legend}</legend>
            {group.hint && (
              <p className="text-text-muted mb-2.5 text-[11px] leading-snug">{group.hint}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {visible.map((o) => {
                const on = selected.includes(o.value);
                const n = counts[group.id]?.[o.value] ?? 0;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(group.id, o.value)}
                    aria-pressed={on}
                    className={filterChipClass(on)}
                  >
                    {o.label}
                    <span className={cn('field-value text-[10px]', on ? 'opacity-80' : 'opacity-55')}>
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {/* Same rule as a zero-count chip, applied to a checkbox: if everything
          in view is in stock, the control cannot change the result, so it is
          not offered. It stays while checked so it can always be undone. */}
      {(stock.matching < stock.total || state.inStock) && (
        <fieldset className="mb-5 border-b border-[color:var(--color-border)] pb-5">
          <legend className="field-label mb-2">Availability</legend>
          <label className="text-theme-ink/85 flex min-h-[36px] items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.inStock}
              onChange={(e) => onChange({ ...state, inStock: e.target.checked })}
              className="text-theme-accent focus:ring-theme-accent h-4 w-4 rounded-md border-[color:var(--color-border)]"
            />
            In stock only
            <span className="field-value text-theme-ink/55 text-[10px]">{stock.matching}</span>
          </label>
        </fieldset>
      )}

      {showSort && (
        <fieldset>
          <legend className="field-label mb-2">Sort by</legend>
          <SortSelect
            value={state.sort}
            onChange={(sort) => onChange({ ...state, sort })}
            className="w-full"
          />
        </fieldset>
      )}
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
  className,
}: {
  value: SortKey;
  onChange: (next: SortKey) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      aria-label="Sort products"
      className={cn(
        'bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2',
        className,
      )}
    >
      {SORTS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
