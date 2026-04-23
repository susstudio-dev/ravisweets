'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { Product } from '@ravisweets/shared';
import { VariantSelector } from '@/components/product/variant-selector';
import { Paisley } from '@/components/brand/paisley';
import { Grain } from '@/components/brand/grain';
import { Garnish } from '@/components/motion/garnish';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface QuickViewModalProps {
  product: Product;
}

export function QuickViewModal({ product }: QuickViewModalProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    router.back();
  }, [router]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Focus close button on open + Escape to close + simple focus-trap
  useEffect(() => {
    closeBtnRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input:not([disabled]), [tabindex="0"]',
        );
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const primaryImage = product.images[0];
  if (!primaryImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? DURATION.fast : DURATION.base }}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close quick view"
          onClick={close}
          className="absolute inset-0 bg-black/55 backdrop-blur-sm focus-visible:outline-none"
        />

        {/* Panel */}
        <motion.div
          ref={panelRef}
          layoutId={reduced ? undefined : `qv-panel-${product.slug}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: reduced ? DURATION.fast : DURATION.slow, ease: EASE.emphasised }}
          className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-surface shadow-lifted ring-1 ring-[color:var(--color-border)] md:grid-cols-[1.05fr_1fr]"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          {/* Close button */}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Image — shared-element morph from the listing card */}
          <motion.div
            layoutId={reduced ? undefined : `product-image-${product.slug}`}
            className="relative aspect-square md:aspect-auto md:min-h-[28rem]"
          >
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 520px, (min-width: 640px) 50vw, 95vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, color-mix(in oklab, var(--theme-ink) 40%, transparent) 0%, transparent 50%)',
              }}
              aria-hidden="true"
            />
            <Grain />
            {!reduced && <Garnish mark={product.garnish} seed={`qv-${product.id}`} count={10} />}
            <div
              className="pointer-events-none absolute left-4 top-4 text-theme-glow opacity-80"
              aria-hidden="true"
            >
              <Paisley size="md" rotate={20} />
            </div>
            <div
              className="absolute bottom-4 right-4 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur"
              aria-label="Placeholder image — dev only"
            >
              Dev only
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex flex-col gap-5 overflow-y-auto p-6 md:p-8">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Quick view
            </p>

            <TextKinetic
              as="h2"
              text={product.title}
              split="word"
              gap={35}
              className="font-display text-display-md font-semibold leading-[1.05] text-theme-ink"
            />
            {/* Screen reader title anchor */}
            <span id="qv-title" className="sr-only">
              {product.title}
            </span>

            <motion.p
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.quick, delay: 0.2, ease: EASE.standard }}
              className="text-theme-ink/75"
            >
              {product.description}
            </motion.p>

            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, delay: 0.28, ease: EASE.emphasised }}
            >
              <VariantSelector product={product} />
            </motion.div>

            <motion.dl
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, delay: 0.34, ease: EASE.emphasised }}
              className="grid grid-cols-3 gap-3 border-t border-[color:var(--color-border)] pt-5 text-sm"
            >
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
                  Shelf life
                </dt>
                <dd className="mt-1 font-display text-base font-semibold text-theme-ink">
                  {product.shelf_life_days}d
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
                  Weight
                </dt>
                <dd className="mt-1 font-display text-base font-semibold text-theme-ink">
                  {product.variants[0]?.weight_grams}g
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
                  From
                </dt>
                <dd className="mt-1 font-display text-base font-semibold text-theme-ink">
                  Hyderabad
                </dd>
              </div>
            </motion.dl>

            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.quick, delay: 0.42, ease: EASE.standard }}
              className="mt-auto pt-2"
            >
              <Link
                href={`/product/${product.slug}`}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-theme-ink/80 transition-colors hover:text-theme-accent"
                scroll={false}
              >
                View full details
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
