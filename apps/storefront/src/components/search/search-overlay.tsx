'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATALOGUE as SAMPLE_PRODUCTS, isNonVeg } from '@ravisweets/shared';
import { searchProducts } from '@/lib/search/score';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { VegMark } from '@/components/veg-mark';

const SUGGESTIONS = ['Kaju Katli', 'Motichoor Ladoo', 'Diwali hamper', 'eggless', 'gift'];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchProducts(SAMPLE_PRODUCTS, q).slice(0, 6), [q]);
  const hasQuery = q.trim().length > 0;

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
    return;
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goto = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/product/${slug}`);
    },
    [onClose, router],
  );

  const submit = useCallback(() => {
    const target = results[active];
    if (target) {
      goto(target.slug);
      return;
    }
    if (hasQuery) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }, [active, goto, hasQuery, onClose, q, results, router]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, results.length, submit]);

  // Reset active when query changes
  useEffect(() => {
    setActive(0);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-overlay-title"
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 md:pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? DURATION.fast : DURATION.base }}
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="absolute inset-0 bg-black/55 focus-visible:outline-none"
          />
          <motion.div
            ref={panelRef}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.97 }}
            transition={{
              duration: reduced ? DURATION.fast : DURATION.slow,
              ease: EASE.emphasised,
            }}
            className="docket shadow-lifted relative z-10 w-full max-w-2xl overflow-hidden"
          >
            <h2 id="search-overlay-title" className="sr-only">
              Search the catalogue
            </h2>
            <div className="flex items-center gap-3 border-b border-[color:var(--color-border)] px-5 py-4">
              <SearchIcon className="text-theme-ink/50 h-5 w-5 shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Kaju Katli, mixture, gift hamper…"
                className="text-theme-ink placeholder:text-theme-ink/40 flex-1 bg-transparent text-base focus:outline-none"
                autoComplete="off"
                enterKeyHint="search"
              />
              <kbd className="bg-surface text-theme-ink/50 hidden rounded-md border border-[color:var(--color-border)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-block">
                Esc
              </kbd>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-theme-ink/60 hover:bg-theme-glow/20 hover:text-theme-ink focus-visible:ring-theme-accent inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-3 py-3" role="listbox">
              {!hasQuery ? (
                <div className="px-2 py-3">
                  <p className="field-label px-2 pb-2">Try</p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQ(s)}
                        className="bg-surface text-theme-ink/80 hover:border-theme-accent rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium transition-colors duration-200"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="text-theme-ink/55 mt-5 flex items-center gap-2 px-2 text-xs">
                    <span
                      className="bg-varak-rule inline-block h-2 w-2 shrink-0 rotate-45"
                      aria-hidden="true"
                    />
                    <span>
                      Match titles, ingredients, dietary tags. Press Enter to open the full search.
                    </span>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <p className="text-theme-ink/70 px-4 py-8 text-sm">
                  No matches for &ldquo;{q}&rdquo;. Try a different spelling.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {results.map((p, i) => (
                    <li
                      key={p.id}
                      className="border-b border-[color:var(--color-border)] last:border-b-0"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => goto(p.slug)}
                        className={`flex w-full items-baseline justify-between gap-4 rounded-md px-3 py-3 text-left transition-colors ${
                          i === active
                            ? 'bg-theme-glow/25 text-theme-ink'
                            : 'text-theme-ink/80 hover:bg-theme-glow/15'
                        }`}
                      >
                        <span className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5">
                            <VegMark nonVeg={isNonVeg(p)} />
                            <span className="font-display text-base">{p.title}</span>
                          </span>
                          <span className="text-theme-ink/55 text-xs">
                            {p.category.replace(/-/g, ' ')}
                            {' · '}
                            {p.shelf_life_days}d shelf
                          </span>
                        </span>
                        <span className="field-value text-theme-ink text-sm">
                          {p.variants[0] ? `₹${p.variants[0].price.amount}` : '—'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {hasQuery && (
              <div className="text-theme-ink/60 border-t border-[color:var(--color-border)] px-5 py-3 text-xs">
                <Link
                  href={`/search?q=${encodeURIComponent(q.trim())}`}
                  onClick={onClose}
                  className="text-theme-accent font-semibold hover:underline"
                >
                  See all results for &ldquo;{q.trim()}&rdquo; →
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
