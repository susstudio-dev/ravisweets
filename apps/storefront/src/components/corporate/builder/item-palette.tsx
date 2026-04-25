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
  namkeens: 'Namkeens',
  'dry-fruits': 'Dry fruits',
  combos: 'Combos',
  'gift-hampers': 'Gift hampers',
  'festival-specials': 'Festival',
};

const CATEGORY_ORDER: CategorySlug[] = [
  'hyderabadi-specials',
  'sweets',
  'namkeens',
  'dry-fruits',
];

export function ItemPalette({ products, selectedCount, onAdd }: ItemPaletteProps) {
  const [query, setQuery] = useState('');
  const reduced = useReducedMotion();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);

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
              <ul className="flex flex-col gap-2">
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
                        onClick={() => onAdd(p.id, primary.id)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-surface px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-theme-accent hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                        )}
                        style={{ backgroundColor: p.theme_palette.base }}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-[color:var(--color-border)]">
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-sm font-semibold text-theme-ink">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-theme-ink/60">
                            {primary.title} · {formatMoney(primary.price)}
                          </p>
                        </div>
                        <Plus
                          className="h-4 w-4 text-theme-ink/40 transition-colors group-hover:text-theme-accent"
                          aria-hidden="true"
                        />
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
    </aside>
  );
}
