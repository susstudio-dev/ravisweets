'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Badge } from '@ravisweets/ui';
import { ProductCard } from '@/components/product-card';
import { CATALOGUE as SAMPLE_PRODUCTS } from '@ravisweets/shared';
import { searchProducts } from '@/lib/search/score';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

const SUGGESTIONS = [
  'Qubani ka Meetha',
  'Kaju Katli',
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
    <section className="container-site py-12 md:py-16">
      <Reveal>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
          <Paisley size="sm" />
          Search
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="mt-3 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
          Find the sweet you&rsquo;re after.
        </h1>
      </Reveal>

      {/* Search input */}
      <div className="mt-10 max-w-2xl">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <SearchIcon
            className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-ink/40"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kaju Katli, Hyderabadi, gift hamper…"
            className="w-full rounded-full border border-[color:var(--color-border)] bg-surface-elevated px-14 py-4 text-base text-theme-ink placeholder:text-theme-ink/40 shadow-soft transition-colors focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-theme-ink/60 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
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
              className="rounded-full border border-[color:var(--color-border)] bg-surface px-3 py-1 text-xs font-medium text-theme-ink/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-theme-accent"
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
              className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-[color:var(--color-border)] p-8"
            >
              <Paisley size="md" />
              <p className="font-display text-lg font-semibold text-theme-ink">
                Start typing to search the catalogue.
              </p>
              <p className="max-w-lg text-sm text-theme-ink/70">
                We match on titles, ingredients, and dietary tags. Typos are forgiven for short
                queries.
              </p>
              <Link
                href="/category/hyderabadi-specials"
                className="text-sm font-semibold text-theme-accent hover:underline"
              >
                Or browse Hyderabadi specials →
              </Link>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              key="nohits"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-[color:var(--color-border)] p-8"
            >
              <Paisley size="md" />
              <p className="font-display text-lg font-semibold text-theme-ink">
                No matches for &ldquo;{q}&rdquo;.
              </p>
              <p className="text-sm text-theme-ink/70">
                Try a different spelling, or pick from the suggestions above.
              </p>
              <Link
                href="/"
                className="text-sm font-semibold text-theme-accent hover:underline"
              >
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
              <p className="mb-6 text-sm text-theme-ink/70">
                <span className="font-semibold text-theme-ink">{results.length}</span>{' '}
                {results.length === 1 ? 'result' : 'results'} for{' '}
                <Badge variant="glow">{q}</Badge>
              </p>
              <Stagger
                gap={60}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </Stagger>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
