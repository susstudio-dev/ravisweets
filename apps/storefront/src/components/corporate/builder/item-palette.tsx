'use client';

import Image from 'next/image';
import { Plus, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import type { CategorySlug, Product } from '@ravisweets/shared';
import { formatMoney } from '@ravisweets/shared';
import { isUsableImage } from '@/lib/images';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface ItemPaletteProps {
  products: Product[];
  selectedCount: number;
  onAdd: (productId: string, variantId: string) => void;
}

const CATEGORY_LABEL: Record<CategorySlug, string> = {
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
  'sweets',
  'sweet-bites',
  'namkeens',
  'savouries',
  'dry-fruits',
];

/**
 * The specimen plate: a flavour-washed ground carrying either the product
 * photograph or, while the catalogue still points at the retired host, the
 * dashed 45°-rotated specimen mark. Decided at render — a dead URL never
 * becomes a request (see lib/images.ts).
 */
function SpecimenPlate({
  product,
  markSize = 'h-10 w-10',
  sizes,
  cover,
}: {
  product: Product;
  markSize?: string;
  sizes: string;
  cover?: boolean;
}) {
  const img = product.images[0];
  if (!img || !isUsableImage(img.url)) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span
          className={`block ${markSize} rotate-45 border-2 border-dashed`}
          style={{ borderColor: product.theme_palette.accent, opacity: 0.4 }}
        />
      </div>
    );
  }
  return (
    <Image
      src={img.url}
      alt={img.alt}
      fill
      sizes={sizes}
      className={cover ? 'object-cover' : 'object-contain p-3'}
    />
  );
}

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
      className="docket flex min-h-[32rem] flex-col gap-4 p-5"
    >
      <div className="docket-head mb-0">
        <h2 id="palette-heading" className="font-display text-theme-ink text-lg">
          Choose items
        </h2>
        <p className="flex items-baseline gap-1.5">
          <span className="field-value text-theme-ink text-sm">{selectedCount}</span>
          <span className="field-label">added</span>
        </p>
      </div>

      {/* Search */}
      <label className="relative">
        <span className="sr-only">Search items</span>
        <Search
          className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — e.g. kaju, badam, mixture"
          className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
          autoComplete="off"
        />
      </label>

      {/* Groups */}
      <div className="flex flex-col gap-5 overflow-y-auto pr-1" style={{ maxHeight: '42rem' }}>
        {Array.from(grouped.entries()).map(([cat, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <p className="field-label mb-2 border-b border-[color:var(--color-border)] pb-1.5">
                {CATEGORY_LABEL[cat] ?? cat}
              </p>
              {/* Specimen cells — 2 columns. The flavour wash grounds the
                  plate; name and price sit under a caption rule. */}
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
                        className="hover:border-theme-accent hover:shadow-lifted focus-visible:ring-theme-accent group flex w-full flex-col overflow-hidden rounded-lg border border-[color:var(--color-border)] text-left transition-[border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2"
                      >
                        <div
                          className="relative aspect-square w-full overflow-hidden"
                          style={{ backgroundColor: p.theme_palette.glow + '33' }}
                        >
                          <SpecimenPlate
                            product={p}
                            sizes="(min-width: 1024px) 200px, 45vw"
                          />
                          {/* Add stamp — action colour is fixed; only identity varies. */}
                          <span
                            className="bg-theme-accent absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--theme-base)]"
                            aria-hidden="true"
                          >
                            <Plus className="h-4 w-4" />
                          </span>
                          {/* Variant count chip when product has multiple sizes */}
                          {p.variants.length > 1 && (
                            <span className="bg-theme-ink/70 absolute bottom-2 left-2 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[color:var(--theme-base)]">
                              {p.variants.length} sizes
                            </span>
                          )}
                        </div>
                        <div className="bg-surface-elevated w-full border-t border-[color:var(--color-border)] px-2.5 py-2">
                          <p className="font-display text-theme-ink truncate text-sm">{p.title}</p>
                          <p className="text-text-muted mt-0.5 flex items-baseline gap-1 text-[11px]">
                            from{' '}
                            <span className="field-value">{formatMoney(primary.price)}</span>
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
                            className="docket shadow-lifted pointer-events-none absolute left-full top-0 z-30 hidden w-72 origin-top-left translate-x-3 p-3 lg:block"
                          >
                            <div
                              className="relative aspect-[4/3] overflow-hidden rounded-md"
                              style={{ backgroundColor: p.theme_palette.glow + '33' }}
                            >
                              <SpecimenPlate product={p} sizes="288px" cover />
                            </div>
                            <p className="font-display text-theme-ink mt-3 text-sm">{p.title}</p>
                            <p className="text-theme-ink/65 mt-1 line-clamp-2 text-[11px]">
                              {p.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {p.dietary_tags.slice(0, 4).map((t) => (
                                <span
                                  key={t}
                                  className="bg-theme-glow/30 text-theme-ink rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                            <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                              <span className="field-label">Ingredients</span>
                              <span className="text-text-muted text-[11px]">
                                {p.ingredients.slice(0, 4).join(', ')}
                                {p.ingredients.length > 4 ? '…' : ''}
                              </span>
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
          <p className="text-theme-ink/60 text-sm">No matches for &ldquo;{query}&rdquo;.</p>
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
              className="bg-theme-ink/60 absolute inset-0 focus-visible:outline-none"
            />
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: reduced ? DURATION.fast : DURATION.slow,
                ease: EASE.emphasised,
              }}
              className="docket shadow-lifted relative z-10 w-full max-w-md overflow-hidden p-6"
            >
              <h3 className="font-display text-theme-ink text-2xl">{variantSheet.title}</h3>
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
                        className="bg-surface hover:border-theme-accent flex w-full items-center justify-between gap-4 rounded-lg border border-[color:var(--color-border)] px-4 py-3 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>
                          <span className="font-display text-theme-ink block text-base">
                            {v.title}
                          </span>
                          <span className="text-theme-ink/60 block text-xs">
                            {oos ? 'Out of stock' : `${v.stock_available} units in stock`}
                          </span>
                        </span>
                        <span className="field-value text-theme-ink text-base">
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
                className="stamp stamp--ghost mt-5 w-full"
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
