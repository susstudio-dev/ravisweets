'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { Product } from '@ravisweets/shared';
import { VariantSelector } from '@/components/product/variant-selector';
import { Grain } from '@/components/brand/grain';
import { TextKinetic } from '@/components/motion/text-kinetic';
import { isUsableImage } from '@/lib/images';
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
  const [imgFailed, setImgFailed] = useState(false);

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

  // Decided at render (see lib/images.ts) — a dead catalogue URL never
  // becomes a request or a `priority` preload.
  const imageUsable = isUsableImage(primaryImage.url) && !imgFailed;

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
          className="bg-theme-ink/60 absolute inset-0 focus-visible:outline-none"
        />

        {/* Panel — a docket sheet lifted off the counter. */}
        <motion.div
          ref={panelRef}
          layoutId={reduced ? undefined : `qv-panel-${product.slug}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: reduced ? DURATION.fast : DURATION.slow, ease: EASE.emphasised }}
          className="bg-surface-elevated shadow-lifted relative z-10 grid w-full max-w-5xl overflow-hidden rounded-lg border border-[color:var(--color-border)] md:grid-cols-[1.05fr_1fr]"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          {/* Close button */}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="bg-theme-ink focus-visible:ring-theme-accent hover:bg-theme-ink/80 absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-md text-[color:var(--theme-base)] transition-colors focus-visible:outline-none focus-visible:ring-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* The plate — shared-element morph from the listing card. The
              flavour wash grounds it whether or not a photograph exists. */}
          <motion.div
            layoutId={reduced ? undefined : `product-image-${product.slug}`}
            className="relative aspect-square md:aspect-auto md:min-h-[28rem]"
            style={{ backgroundColor: product.theme_palette.glow + '33' }}
          >
            {imageUsable ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 50vw, 95vw"
                className="object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              /* The in-world fallback: the dashed specimen plate. */
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <span
                  className="block h-16 w-16 rotate-45 border-2 border-dashed"
                  style={{ borderColor: product.theme_palette.accent, opacity: 0.4 }}
                />
              </div>
            )}
            <Grain />
          </motion.div>

          {/* Info */}
          <div className="flex flex-col gap-5 overflow-y-auto p-6 md:p-8">
            <TextKinetic
              as="h2"
              text={product.title}
              split="word"
              gap={35}
              className="font-display text-display-md text-theme-ink leading-[1.05]"
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

            {/* The record: ruled label/value rows, values in the typed face. */}
            <motion.dl
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, delay: 0.34, ease: EASE.emphasised }}
              className="border-t border-[color:var(--color-border)] pt-2"
            >
              <div className="field-row">
                <dt className="field-label">Shelf life</dt>
                <dd className="field-value text-theme-ink text-sm font-bold">
                  {product.shelf_life_days} DAYS
                </dd>
              </div>
              <div className="field-row">
                <dt className="field-label">Weight</dt>
                <dd className="field-value text-theme-ink text-sm font-bold">
                  {product.variants[0]?.weight_grams} G
                </dd>
              </div>
              <div className="field-row">
                <dt className="field-label">Kitchen</dt>
                <dd className="field-value text-theme-ink text-sm font-bold">KHAMMAM</dd>
              </div>
            </motion.dl>

            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.quick, delay: 0.42, ease: EASE.standard }}
              className="mt-auto pt-2"
            >
              {/*
                Plain anchor (not <Link>) so the navigation BYPASSES the
                @modal/(.)product/[slug] intercepting route — Next.js only
                intercepts soft navigations. A regular href triggers a hard
                navigation that lands on the real /product/[slug] page.
              */}
              <a
                href={`/product/${product.slug}`}
                className="text-theme-ink/80 hover:text-theme-accent group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4 transition-colors"
              >
                View full details
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
