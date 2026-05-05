'use client';

import Image from 'next/image';
import { Plus, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { formatMoney } from '@ravisweets/shared';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface ItemPaletteProps {
  products: Product[];
  selectedCount: number;
  onAdd: (productId: string, variantId: string) => void;
}

const CATEGORY_LABEL: Record<CategorySlug, string> = {
  'hyderabadi-specials': 'Hyderabadi',
  sweets: 'Sweets',
  'sweet-bites': 'Sweet bites',
  'healthy-sweets': 'Healthy',
  namkeens: 'Namkeens',
  savouries: 'Savouries',
  'dry-fruits': 'Dry fruits',
  pickles: 'Pickles',
  powders: 'Podis',
  biscuits: 'Biscuits',
  combos: 'Combos',
  'gift-hampers': 'Gift hampers',
  'festival-specials': 'Festival',
};

const CATEGORY_ORDER: CategorySlug[] = [
  'hyderabadi-specials',
  'sweets',
  'sweet-bites',
  'namkeens',
  'savouries',
  'dry-fruits',
];

export function ItemPalette({ products, selectedCount, onAdd }: ItemPaletteProps) {
  const [query, setQuery] = useState('');
  const reduced = useReducedMotion();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [variantSheet, setVariantSheet] = useState<Product | null>(null);
  const hoverTimer = useRef<number | null>(null);

  function handleAdd(p: Product) {
    if (p.variants.length <= 1) {
      const v = p.variants[0];
      if (v) onAdd(p.id, v.id);
      return;
    }
    setVariantSheet(p);
  }

  function schedulePreview(id: string) {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setPreviewId(id), 280);
  }
  function cancelPreview() {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setPreviewId(null);
  }

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.ingredients.join(' ').toLowerCase().includes(q),
        )
      : products;
    const map = new Map<CategorySlug, Product[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return map;
  }, [products, query]);

  return (
    <aside
      aria-labelledby="palette-heading"
      className="flex min-h-[32rem] flex-col gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="palette-heading"
          className="font-display text-lg font-semibold text-theme-ink"
        >
          Choose items
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          {selectedCount} added
        </span>
      </div>

      {/* Search */}
      <label className="relative">
        <span className="sr-only">Search items</span>
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-ink/40"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — e.g. kaju, badam, mixture"
          className="w-full rounded-full border border-[color:var(--color-border)] bg-surface px-9 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          autoComplete="off"
        />
      </label>

      {/* Groups */}
      <div className="flex flex-col gap-5 overflow-y-auto pr-1" style={{ maxHeight: '42rem' }}>
        {Array.from(grouped.entries()).map(([cat, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                {CATEGORY_LABEL[cat] ?? cat}
              </p>
              {/* Image-led tile grid — 2 columns of square cards. The product
                  cutout dominates each tile (the user feedback was "more
                  visualization, less text"). Title + price stay below the
                  image; the floating + button is the only chrome on the card. */}
              <ul className="grid grid-cols-2 gap-3">
                {items.map((p) => {
                  const primary = p.variants[0];
                  const img = p.images[0];
                  if (!primary || !img) return null;
                  return (
                    <li
                      key={p.id}
                      className="relative"
                      onMouseEnter={() => schedulePreview(p.id)}
                      onMouseLeave={cancelPreview}
                      onFocus={() => schedulePreview(p.id)}
                      onBlur={cancelPreview}
                    >
                      <button
                        type="button"
                        onClick={() => handleAdd(p)}
                        aria-label={`Add ${p.title} to hamper`}
                        className="group flex w-full flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-theme-accent hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                      >
                        <div
                          className="relative aspect-square w-full overflow-hidden"
                          style={{
                            background: `radial-gradient(ellipse at 30% 30%, color-mix(in oklab, ${p.theme_palette.glow} 40%, ${p.theme_palette.base}) 0%, ${p.theme_palette.base} 80%)`,
                          }}
                        >
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 200px, 45vw"
                            className="object-contain p-3 drop-shadow-[0_18px_28px_rgba(60,30,5,0.18)] transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Floating + button */}
                          <span
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--theme-base)] shadow-soft transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: p.theme_palette.accent }}
                            aria-hidden="true"
                          >
                            <Plus className="h-4 w-4" />
                          </span>
                          {/* Variant count chip when product has multiple sizes */}
                          {p.variants.length > 1 && (
                            <span className="absolute bottom-2 left-2 rounded-full bg-theme-ink/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[color:var(--theme-base)] backdrop-blur">
                              {p.variants.length} sizes
                            </span>
                          )}
                        </div>
                        <div className="bg-surface px-3 py-2">
                          <p className="truncate font-display text-sm font-semibold text-theme-ink">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-theme-ink/60">
                            from {formatMoney(primary.price)}
                          </p>
                        </div>
                      </button>
                      <AnimatePresence>
                        {previewId === p.id && !reduced && (
                          <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: DURATION.quick, ease: EASE.standard }}
                            role="tooltip"
                            className="pointer-events-none absolute left-full top-0 z-30 hidden w-72 origin-top-left translate-x-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-3 shadow-lifted lg:block"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                              <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                sizes="288px"
                                className="object-cover"
                              />
                            </div>
                            <p className="mt-3 font-display text-sm font-semibold text-theme-ink">
                              {p.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-[11px] text-theme-ink/65">
                              {p.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {p.dietary_tags.slice(0, 4).map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full bg-theme-glow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-accent"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                            <p className="mt-2 text-[10px] uppercase tracking-wider text-theme-ink/50">
                              Ingredients · {p.ingredients.slice(0, 4).join(', ')}
                              {p.ingredients.length > 4 ? '…' : ''}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {query && Array.from(grouped.values()).every((arr) => arr.length === 0) && (
          <p className="text-sm text-theme-ink/60">No matches for &ldquo;{query}&rdquo;.</p>
        )}
      </div>

      {/* Variant picker sheet — opens for multi-variant products before insertion */}
      <AnimatePresence>
        {variantSheet && (
          <motion.div
            key="variant-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`Pick a size for ${variantSheet.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? DURATION.fast : DURATION.base }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          >
            <button
              type="button"
              aria-label="Close variant picker"
              onClick={() => setVariantSheet(null)}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm focus-visible:outline-none"
            />
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: reduced ? DURATION.fast : DURATION.slow, ease: EASE.emphasised }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl bg-surface-elevated p-6 shadow-lifted ring-1 ring-[color:var(--color-border)] sm:rounded-3xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
                Pick a size
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-theme-ink">
                {variantSheet.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-2">
                {variantSheet.variants.map((v) => {
                  const oos = v.stock_available <= 0;
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        disabled={oos}
                        onClick={() => {
                          onAdd(variantSheet.id, v.id);
                          setVariantSheet(null);
                        }}
                        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-theme-accent hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>
                          <span className="block font-display text-base font-semibold text-theme-ink">
                            {v.title}
                          </span>
                          <span className="block text-xs text-theme-ink/60">
                            {oos ? 'Out of stock' : `${v.stock_available} units in stock`}
                          </span>
                        </span>
                        <span className="font-display text-base font-semibold text-theme-accent">
                          {formatMoney(v.price)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => setVariantSheet(null)}
                className="mt-5 w-full rounded-full border border-theme-ink/25 px-5 py-2 text-sm font-semibold text-theme-ink/80 hover:border-theme-accent hover:text-theme-accent"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
