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
        <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
          <Paisley size="sm" />
          Search
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display text-display-md text-theme-ink md:text-display-lg mt-3 leading-[1.02]">
          Find the sweet you&rsquo;re after.
        </h1>
      </Reveal>

      {/* Search input */}
      <div className="mt-10 max-w-2xl">
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
            placeholder="Kaju Katli, Hyderabadi, gift hamper…"
            className="bg-surface-elevated text-theme-ink placeholder:text-theme-ink/40 shadow-soft focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-full border border-[color:var(--color-border)] px-14 py-4 text-base transition-colors focus-visible:outline-none focus-visible:ring-2"
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
              className="text-theme-ink/60 hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:ring-theme-accent absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2"
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
              className="bg-surface text-theme-ink/80 hover:border-theme-accent rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
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
              <p className="font-display text-theme-ink text-lg">
                Start typing to search the catalogue.
              </p>
              <p className="text-theme-ink/70 max-w-lg text-sm">
                We match on titles, ingredients, and dietary tags. Typos are forgiven for short
                queries.
              </p>
              <Link
                href="/category/hyderabadi-specials"
                className="text-theme-accent text-sm font-semibold hover:underline"
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
              <p className="font-display text-theme-ink text-lg">
                No matches for &ldquo;{q}&rdquo;.
              </p>
              <p className="text-theme-ink/70 text-sm">
                Try a different spelling, or pick from the suggestions above.
              </p>
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
              <p className="text-theme-ink/70 mb-6 text-sm">
                <span className="text-theme-ink font-semibold">{results.length}</span>{' '}
                {results.length === 1 ? 'result' : 'results'} for <Badge variant="glow">{q}</Badge>
              </p>
              <Stagger gap={60} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
