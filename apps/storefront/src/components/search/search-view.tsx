'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { ProductCard } from '@/components/product-card';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { searchProducts } from '@/lib/search/score';
import { Stagger } from '@/components/motion/stagger';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

const SUGGESTIONS = [
  'Kaju Katli',
  'Motichoor Ladoo',
  'Diwali hamper',
  'eggless',
  'namkeens',
  'gift',
];

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();
  const initial = params.get('q') ?? '';
  const [q, setQ] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Keep URL ?q= in sync so results are shareable.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(() => {
        const next = new URLSearchParams(params.toString());
        if (q) next.set('q', q);
        else next.delete('q');
        router.replace(`/search${next.toString() ? `?${next.toString()}` : ''}`, {
          scroll: false,
        });
      });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [q, params, router]);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => searchProducts(SAMPLE_PRODUCTS, q), [q]);
  const hasQuery = q.trim().length > 0;

  return (
    <section className="container-site section-y">
      {/*
        The <h1> moved to app/search/page.tsx. This view reads `?q=` via
        `useSearchParams`, so everything it renders is behind a Suspense
        boundary that the static export never resolves — the heading has to be
        outside it to exist in the HTML at all.
      */}

      {/* Search input */}
      <div className="max-w-2xl">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <SearchIcon
            className="text-theme-ink/40 absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kaju Katli, mixture, gift hamper…"
            className="bg-surface-elevated text-theme-ink placeholder:text-theme-ink/40 shadow-soft focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-14 py-4 text-base transition-colors focus-visible:outline-none focus-visible:ring-2"
            autoComplete="off"
            enterKeyHint="search"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="text-theme-ink/60 hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:ring-theme-accent absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </label>

        {/* Suggestion chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQ(s)}
              className="bg-surface text-theme-ink/80 hover:border-theme-accent hover:text-theme-ink focus-visible:ring-theme-accent min-h-[36px] rounded-md border border-[color:var(--color-border)] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-12" aria-live="polite" aria-atomic="false">
        <AnimatePresence mode="wait">
          {!hasQuery ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick }}
              className="docket flex flex-col items-start gap-4 p-8"
            >
              <span className="inline-block h-2 w-2 rotate-45 bg-varak-rule" aria-hidden="true" />
              <p className="font-display text-theme-ink text-lg">
                Start typing to search the catalogue.
              </p>
              <p className="text-text-muted max-w-lg text-sm">
                We match on titles, ingredients, and dietary tags. Typos are forgiven for short
                queries.
              </p>
              <Link
                href="/shop"
                className="text-theme-accent text-sm font-semibold hover:underline"
              >
                Or browse the whole catalogue →
              </Link>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              key="nohits"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="docket flex flex-col items-start gap-4 p-8"
            >
              <span className="inline-block h-2 w-2 rotate-45 bg-varak-rule" aria-hidden="true" />
              <p className="font-display text-theme-ink text-lg">
                No matches for &ldquo;{q}&rdquo;.
              </p>
              <p className="text-text-muted text-sm">
                Try a different spelling, or pick from the suggestions above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  inputRef.current?.focus();
                }}
                className="stamp stamp--ghost mt-1"
              >
                Clear search
              </button>
              <Link href="/" className="text-theme-accent text-sm font-semibold hover:underline">
                Or go back home →
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={`hits-${q}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
            >
              {/* The query echo and count, typed into the record's head. */}
              <div className="docket-head">
                <p className="flex items-baseline gap-3">
                  <span className="field-label">Query</span>
                  <span className="field-value text-theme-ink text-sm">&ldquo;{q}&rdquo;</span>
                </p>
                <p className="field-value text-theme-ink text-sm">
                  SHOWING {results.length} OF {SAMPLE_PRODUCTS.length}
                </p>
              </div>
              <Stagger gap={60} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} quickAdd />
                ))}
              </Stagger>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
