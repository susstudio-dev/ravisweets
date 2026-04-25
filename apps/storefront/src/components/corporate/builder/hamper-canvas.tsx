'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, X } from 'lucide-react';
import {
  CATALOGUE,
  RIBBON_SWATCHES,
  type BoxFinish,
  type HamperItem,
  type RibbonColor,
} from '@ravisweets/shared';
import { Paisley } from '@/components/brand/paisley';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface HamperCanvasProps {
  items: HamperItem[];
  ribbon: RibbonColor;
  box: BoxFinish;
  logoPrint: boolean;
  message: string;
  /** Hamper unit count — used for per-variant stock validation. */
  totalUnits: number;
  onUpdateQty: (lineId: string, qty: number) => void;
  onRemove: (lineId: string) => void;
  onSwapVariant: (lineId: string, newVariantId: string) => void;
}

const BOX_COLOUR: Record<BoxFinish, { bg: string; border: string; label: string }> = {
  'matte-cream': { bg: '#faf2dc', border: '#d6c79c', label: 'Matte cream' },
  'lacquered-brass': { bg: '#8b5a1e', border: '#d6a352', label: 'Lacquered brass' },
  'silk-wrap': { bg: '#e8d8c4', border: '#c0592b', label: 'Silk wrap' },
};

export function HamperCanvas({
  items,
  ribbon,
  box,
  logoPrint,
  message,
  totalUnits,
  onUpdateQty,
  onRemove,
  onSwapVariant,
}: HamperCanvasProps) {
  const reduced = useReducedMotion();
  const boxColour = BOX_COLOUR[box];
  const ribbonColour = RIBBON_SWATCHES.find((r) => r.id === ribbon)?.hex ?? '#f0e7d5';
  const isDarkBox = box === 'lacquered-brass';

  return (
    <section
      aria-labelledby="canvas-heading"
      className="flex flex-col gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5"
    >
      <div className="flex items-center justify-between">
        <h2
          id="canvas-heading"
          className="font-display text-lg font-semibold text-theme-ink"
        >
          Your hamper
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          {items.length}/30 item types
        </span>
      </div>

      {/* Stylised box preview */}
      <div className="relative min-h-[18rem] overflow-hidden rounded-2xl p-6 shadow-soft" style={{ backgroundColor: boxColour.bg, border: `2px solid ${boxColour.border}` }}>
        {/* Ribbon stripe down the centre of the box */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-6 -translate-x-1/2"
          style={{ backgroundColor: ribbonColour, opacity: 0.8 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{
            backgroundColor: isDarkBox ? '#fdf6ec' : '#2a1505',
            color: isDarkBox ? '#2a1505' : '#fdf6ec',
          }}
        >
          Ravi Sweets
        </div>
        {logoPrint && (
          <div
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur"
          >
            <Paisley size="sm" color="#f2c66f" />
            Your logo
          </div>
        )}

        {/* Items grid inside the box */}
        <div className="relative mt-10 flex flex-wrap justify-center gap-3">
          {items.length === 0 ? (
            <div className="flex min-h-[10rem] w-full items-center justify-center text-center">
              <p className={cn(
                'max-w-sm text-sm',
                isDarkBox ? 'text-[#fdf6ec]/80' : 'text-theme-ink/60',
              )}>
                Your box is empty — pick from the palette on the left to start composing.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((it) => {
                const product = CATALOGUE.find((p) => p.id === it.productId);
                const variant = product?.variants.find((v) => v.id === it.variantId);
                const img = product?.images[0];
                if (!product || !variant || !img) return null;
                const stockNeeded = it.qtyPerHamper * totalUnits;
                const stockShort = stockNeeded > variant.stock_available;
                const maxFeasibleUnits = Math.floor(variant.stock_available / Math.max(1, it.qtyPerHamper));
                return (
                  <motion.div
                    key={it.lineId}
                    layout
                    layoutId={reduced ? undefined : `hitem-${it.lineId}`}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                    transition={{ duration: DURATION.quick, ease: EASE.emphasised }}
                    className="group relative flex w-36 flex-col gap-1 rounded-xl p-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      border: `1px solid ${stockShort ? '#c0392b' : boxColour.border}`,
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${product.title}`}
                        onClick={() => onRemove(it.lineId)}
                        className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-theme-ink">
                      {product.title}
                    </p>
                    {/* Variant swap dropdown — preserves lineId on change */}
                    {product.variants.length > 1 ? (
                      <select
                        aria-label={`Variant for ${product.title}`}
                        value={it.variantId}
                        onChange={(e) => onSwapVariant(it.lineId, e.target.value)}
                        className="w-full rounded border border-[color:var(--color-border)] bg-surface px-1.5 py-0.5 text-[10px] font-medium text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                      >
                        {product.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title} · ₹{v.price.amount}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[10px] text-theme-ink/55">{variant.title}</p>
                    )}
                    <div className="mt-1 inline-flex items-center justify-between rounded-full border border-[color:var(--color-border)] bg-surface">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(it.lineId, it.qtyPerHamper - 1)}
                        aria-label={`Decrease ${product.title}`}
                        className="rounded-full p-1 text-theme-ink/60 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                      >
                        <Minus className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <span className="min-w-6 text-center text-[11px] font-semibold tabular-nums text-theme-ink">
                        × {it.qtyPerHamper}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(it.lineId, it.qtyPerHamper + 1)}
                        aria-label={`Increase ${product.title}`}
                        className="rounded-full p-1 text-theme-ink/60 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                    {stockShort && (
                      <p className="text-[10px] font-semibold text-[#c0392b]">
                        Only {maxFeasibleUnits} hampers possible at this size
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Message preview */}
        {message && (
          <div
            className="relative mt-6 rounded-lg p-3 text-center font-display text-sm italic"
            style={{
              backgroundColor: isDarkBox ? 'rgba(253,246,236,0.9)' : 'rgba(42,21,5,0.05)',
              color: isDarkBox ? '#2a1505' : '#3a1e0c',
            }}
          >
            &ldquo;{message}&rdquo;
          </div>
        )}

        {/* Finish label */}
        <p
          className={cn(
            'relative mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em]',
            isDarkBox ? 'text-[#fdf6ec]/70' : 'text-theme-ink/50',
          )}
        >
          Finish · {boxColour.label}
        </p>

        {/* Dev-only */}
        <div className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          Dev preview
        </div>
      </div>
    </section>
  );
}
