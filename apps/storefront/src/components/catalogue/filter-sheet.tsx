'use client';

import { AnimatePresence, motion } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '@ravisweets/shared';
import { activeFilterCount, applyFilters, type FilterState } from '@/lib/catalogue/filters';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { ProductFilters } from './product-filters';

/**
 * FILTERS ON A PHONE.
 *
 * Neither browse surface had any. /shop shipped no filter panel at all below
 * the category strip, and /category stacked its 260px rail ABOVE the grid, so
 * a phone visitor scrolled past the entire refine panel before reaching a
 * single product — the filters were both unusable and in the way.
 *
 * This is the mobile half only (`lg:hidden`); above lg the caller renders the
 * panel inline in its rail. Both instances read the same URL state, so the
 * sheet and the rail can never disagree.
 *
 * The trigger states the ACTIVE COUNT and the footer states the RESULT COUNT,
 * because the two questions a shopper has with a sheet open are "what have I
 * already narrowed?" and "what will I get if I close this?".
 */
export function FilterSheet({
  products,
  state,
  onChange,
}: {
  products: Product[];
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const active = activeFilterCount(state);
  const resultCount = applyFilters(products, state).length;

  // Body scroll lock + Escape, same contract as the header's drawer.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/*
        THE TRIGGER STAYS IN REACH. On /category it sits below the back link,
        the h1, the count and the intro — roughly 250px of rail — so a phone
        visitor scrolled it away before the first product and then had no route
        back to the filters but a scroll to the top. Pinning it under the
        masthead (header.tsx is `sticky top-0 z-40`; top-16 clears it, z-20 sits
        beneath) keeps it available for as long as there are products to filter.

        THE STICKY POSITIONING IS ON THIS ROW AND NOT ON THE WRAPPER. `sticky`
        with a z-index opens a stacking context, and the dialog below is a
        SIBLING of this row for exactly that reason: inside it, the overlay's
        z-40 and the sheet's z-50 would be resolved against this row's z-20
        rather than against the page, and the whole sheet would open behind the
        masthead.

        `bg-theme-base` and the negative-margin bleed stop grid cards showing
        through the pinned button as they pass under it.
      */}
      <div className="bg-theme-base sticky top-16 z-20 -mx-4 mb-3 px-4 py-2 sm:-mx-6 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="stamp stamp--ghost w-full justify-center"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {active > 0 && (
            <span className="bg-theme-accent ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[color:var(--theme-base)]">
              {active}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick }}
              className="bg-theme-ink/60 fixed inset-0 z-40"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filter products"
              initial={reduced ? { opacity: 0 } : { y: '100%' }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: DURATION.base, ease: EASE.emphasised }}
              className="bg-surface-elevated text-theme-ink shadow-lifted fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-[color:var(--color-border)]"
            >
              <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4">
                <h2 className="font-display text-lg">Filters</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="bg-field/40 text-theme-ink hover:bg-field/60 inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <ProductFilters
                  products={products}
                  state={state}
                  onChange={onChange}
                  showSort
                  hideHeading
                />
              </div>

              {/* The footer is the only way out that also reports the outcome. */}
              <div className="border-t border-[color:var(--color-border)] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="stamp w-full justify-center"
                >
                  {resultCount === 0
                    ? 'No matches — adjust filters'
                    : `Show ${resultCount} ${resultCount === 1 ? 'product' : 'products'}`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
