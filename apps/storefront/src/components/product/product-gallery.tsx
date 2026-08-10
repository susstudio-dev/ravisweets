'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ProductImage, GarnishMark } from '@ravisweets/shared';
import { Grain } from '@/components/brand/grain';
import { cn } from '@/lib/cn';
import { isUsableImage } from '@/lib/images';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { useProductImagesOverride } from '@/lib/supabase/site-content-context';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  /** When set, owner-edited DB images overlay the static `images` (spec §6.4). */
  productId?: string;
  /**
   * Retained in the contract for existing callers. The scattered-garnish
   * overlay was retired with the old world — drifting marks read as debris
   * on the record — so these are accepted but no longer rendered.
   */
  garnish?: GarnishMark;
  /** See `garnish`. */
  seed?: string;
}

/**
 * THE PLATE. A square-cut, ruled specimen slot on the sheet — the photograph
 * sits inside the record, not above it. Image usability is decided at render
 * (isUsableImage) so a dead catalogue URL never becomes a request or a
 * preload; the in-world fallback is the dashed specimen plate on the
 * product's flavour wash, same as the product card.
 */
export function ProductGallery({ images: staticImages, title, productId }: ProductGalleryProps) {
  // Owner-edited DB images overlay the static catalogue set (spec §6.4);
  // null (no DB row / empty overlay) keeps the caller-supplied images.
  const overrideImages = useProductImagesOverride(productId ?? '');
  const images = overrideImages ?? staticImages;
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const galleryRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const active = images[activeIndex] ?? images[0];

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (document.activeElement !== galleryRef.current) return;
      if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => (i - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i + 1) % images.length);
      }
    },
    [images.length],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  if (!active) return null;

  const activeUsable = isUsableImage(active.url) && !failed[active.url];

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={galleryRef}
        tabIndex={0}
        role="region"
        aria-label={`${title} — image gallery. Use arrow keys to navigate.`}
        className="bg-theme-glow/20 focus-visible:ring-theme-accent relative aspect-square overflow-hidden rounded-lg border border-[color:var(--color-border)] shadow-soft focus-visible:outline-none focus-visible:ring-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.url}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick, ease: EASE.standard }}
            className="absolute inset-0"
          >
            {activeUsable ? (
              <Image
                src={active.url}
                alt={active.alt}
                fill
                priority={activeIndex === 0}
                fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
                sizes="(min-width: 1024px) 560px, (min-width: 640px) 60vw, 95vw"
                className="object-cover"
                onError={() => setFailed((f) => ({ ...f, [active.url]: true }))}
              />
            ) : (
              /*
               * Dead catalogue host (see lib/images.ts). The specimen plate
               * stands in: a dashed 45°-rotated square on the flavour wash —
               * part of the form, not a broken-image icon.
               */
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="border-theme-accent block h-20 w-20 rotate-45 border-2 border-dashed opacity-40" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {!activeUsable && <Grain />}
      </div>

      {/* Thumbnails (only show if > 1 image) — square-cut, ruled chips. */}
      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Image thumbnails">
          {images.map((img, i) => {
            const usable = isUsableImage(img.url) && !failed[img.url];
            return (
              <button
                key={img.url}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Image ${i + 1} of ${images.length}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'bg-theme-glow/15 relative aspect-square w-20 overflow-hidden rounded-md border transition-opacity duration-200',
                  i === activeIndex
                    ? 'border-theme-accent ring-theme-accent ring-1'
                    : 'border-[color:var(--color-border)] opacity-70 hover:opacity-100',
                )}
              >
                {usable ? (
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    onError={() => setFailed((f) => ({ ...f, [img.url]: true }))}
                  />
                ) : (
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="border-theme-accent block h-6 w-6 rotate-45 border border-dashed opacity-40" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
