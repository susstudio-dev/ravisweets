'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ProductImage, GarnishMark } from '@ravisweets/shared';
import { Grain } from '@/components/brand/grain';
import { Paisley } from '@/components/brand/paisley';
import { Garnish } from '@/components/motion/garnish';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  garnish: GarnishMark;
  /** Seed so the scattered garnish positions are stable per product. */
  seed: string;
}

export function ProductGallery({ images, title, garnish, seed }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
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

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={galleryRef}
        tabIndex={0}
        role="region"
        aria-label={`${title} — image gallery. Use arrow keys to navigate.`}
        className="group relative aspect-square overflow-hidden rounded-[1.75rem] shadow-lifted ring-1 ring-[color:var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
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
            <Image
              src={active.url}
              alt={active.alt}
              fill
              priority={activeIndex === 0}
              fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 60vw, 95vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Warm vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 35%, transparent) 0%, transparent 45%)',
          }}
          aria-hidden="true"
        />
        <Grain />

        {/* Garnish one-shot overlay — fires once on mount */}
        <Garnish mark={garnish} seed={seed} count={12} />

        {/* Paisley ornament */}
        <div
          className="pointer-events-none absolute right-4 top-4 text-theme-glow opacity-80"
          aria-hidden="true"
        >
          <Paisley size="md" rotate={-15} />
        </div>

        {/* Dev-only watermark */}
        <div
          className="absolute bottom-4 right-4 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur"
          aria-label="Placeholder image — dev only"
        >
          Dev only
        </div>
      </div>

      {/* Thumbnails (only show if > 1 image) */}
      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Image thumbnails">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative aspect-square w-20 overflow-hidden rounded-lg ring-1 ring-inset transition-all duration-200',
                i === activeIndex
                  ? 'ring-theme-accent ring-2'
                  : 'ring-[color:var(--color-border)] opacity-70 hover:opacity-100',
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
