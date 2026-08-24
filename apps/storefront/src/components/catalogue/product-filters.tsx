'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import type { Product } from '@ravisweets/shared';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  facetCounts,
  FILTER_GROUPS,
  mixesVtype,
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
 *
 * ── WHY THE GROUPS COLLAPSE ────────────────────────────────────────────────
 * Fully open, six groups measure ~1100px, and on /category another ~200px of
 * title block sits above them in the same rail. Pinned 80px down an 800px
 * viewport, the tail was simply unreachable: the page scrolled, the pinned rail
 * did not, and it had no scrollbar of its own. The rail now scrolls internally
 * (see the asides in shop-view and app/category/[slug]/page), but a 1300px
 * scroll strip in a 700px window is a poor way to choose a filter even when it
 * works.
 *
 * So each group is a disclosure, and only DEFAULT_OPEN starts expanded. A
 * collapsed group still states its name and how many of its options are live,
 * which means six group names are legible at once instead of two.
 *
 * A group arriving with a selection opens on mount — a link shared as
 * `?keeps=fresh` must show the control that can undo it. After that the
 * shopper's own toggles win; nothing re-opens under their hands.
 */
interface ProductFiltersProps {
  /** The surface's UNFILTERED set — facet counts are measured against it. */
  products: Product[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  /** Renders the sort control at the TOP of the panel (owner, 2026-08-24:
   *  sorting belongs in the left panel with the filters, in reach). /shop
   *  desktop keeps its own sort beside the results and omits this. */
  showSort?: boolean;
  /** The sheet supplies its own dialog title, so the panel's would duplicate it. */
  hideHeading?: boolean;
  className?: string;
}

/**
 * Open on first paint. The four a shopper reaches for on almost any visit,
 * veg/non-veg leading; shelf life, pack size and the flags are follow-up
 * questions and start shut.
 */
const DEFAULT_OPEN: ReadonlySet<string> = new Set(['vtype', 'diet', 'free', 'price']);

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
  const panelId = useId();

  // "Does this shelf sell both veg and non-veg?" is a property of the SHELF,
  // not of the shopper's other picks, so — unlike `counts`, which honours the
  // other active filters — this calls mixesVtype on the unfiltered `products`
  // prop directly, the exact same call category-browser's tab strip makes.
  // That is what keeps the two surfaces in step: ticking a filter that
  // zeroes one side's count (e.g. "Eggless" on /category/pickles) must not
  // make the whole group disappear from here while the strip still shows it.
  const mixedVtype = mixesVtype(products);

  // Initialised once, from the state the panel MOUNTED with — see the header
  // note. Recomputing it per render would slam a group shut the moment its last
  // chip was cleared, with the shopper's cursor still on it.
  const [open, setOpen] = useState<ReadonlySet<string>>(
    () => new Set(FILTER_GROUPS.filter((g) => DEFAULT_OPEN.has(g.id) || state[g.id].length > 0).map((g) => g.id)),
  );

  function toggleGroup(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

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

      {/* Sort leads the panel: ordering is the first decision on a shelf,
          and at the bottom it sat under the rail's internal scroll fold. */}
      {showSort && (
        <fieldset className="border-b border-[color:var(--color-border)] pb-5">
          <legend className="field-label mb-2">Sort by</legend>
          <SortSelect
            value={state.sort}
            onChange={(sort) => onChange({ ...state, sort })}
            className="w-full"
          />
        </fieldset>
      )}

      {FILTER_GROUPS.map((group) => {
        const selected = state[group.id];
        const visible = group.options.filter(
          (o) => (counts[group.id]?.[o.value] ?? 0) > 0 || selected.includes(o.value),
        );
        // A group whose every option leads nowhere is not shown at all — an
        // empty "Pack size" heading is noise, not information.
        if (visible.length === 0) return null;

        // Veg / non-veg is only a question when the shelf actually mixes
        // both — measured unfiltered (mixedVtype), NOT from `visible`, which
        // an active filter (say "Eggless", which every non-veg pickle lacks)
        // can zero out on one side. A zero count then behaves like any other
        // zero-count chip below (hidden via `visible`), not like a reason to
        // drop the whole group. It stays while selected so an empty grid can
        // always be undone.
        if (group.id === 'vtype' && selected.length === 0 && !mixedVtype) return null;

        const isOpen = open.has(group.id);
        const groupPanel = `${panelId}-${group.id}`;

        return (
          <div
            key={group.id}
            className="border-b border-[color:var(--color-border)] last:border-b-0"
          >
            {/*
              The disclosure header sits OUTSIDE the fieldset rather than inside
              its <legend>. A legend is laid out as a special box by every
              browser — width, padding and float behave unlike a normal child —
              and a full-width flex button inside one renders inconsistently.
              The fieldset keeps an sr-only legend so the grouping survives.
            */}
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              aria-controls={groupPanel}
              className="focus-visible:ring-theme-accent group/disc flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md py-2 text-left focus-visible:outline-none focus-visible:ring-2"
            >
              <span className="field-label">{group.legend}</span>
              <span className="flex shrink-0 items-center gap-2">
                {/* A collapsed group must still say it is doing something. */}
                {selected.length > 0 && (
                  <span className="bg-theme-accent field-value rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--theme-base)]">
                    {selected.length}
                  </span>
                )}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'text-theme-ink/45 group-hover/disc:text-theme-ink h-4 w-4 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </span>
            </button>

            <fieldset id={groupPanel} className={cn('pb-5', isOpen ? 'block' : 'hidden')}>
              <legend className="sr-only">{group.legend}</legend>
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
                      <span
                        className={cn('field-value text-[10px]', on ? 'opacity-80' : 'opacity-55')}
                      >
                        {n}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        );
      })}

      {/* Same rule as a zero-count chip, applied to a checkbox: if everything
          in view is in stock, the control cannot change the result, so it is
          not offered. It stays while checked so it can always be undone. */}
      {(stock.matching < stock.total || state.inStock) && (
        /* Not a disclosure: it is one checkbox, and hiding one control behind
           another control costs more than it saves. Last in the panel since
           sort moved to the top, so no bottom rule of its own. */
        <fieldset className="py-4">
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
