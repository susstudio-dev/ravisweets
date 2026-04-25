'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Check, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { useCart } from '@/lib/cart/cart-context';

interface AddToCartProps {
  productId: string;
  variantId: string;
  disabled?: boolean;
  /** Cap the stepper. Defaults to 99 — we don't expose stock_available here yet. */
  maxQty?: number;
}

type State = 'idle' | 'pending' | 'success' | 'error';

/**
 * Add-to-cart CTA with a discreet success acknowledgement.
 * No real cart wiring yet — simulates the network call so the animation can be reviewed.
 * Replace simulateAdd() with a real API call once the Medusa backend is wired.
 */
export function AddToCart({ productId, variantId, disabled, maxQty = 99 }: AddToCartProps) {
  const [state, setState] = useState<State>('idle');
  const [qty, setQty] = useState(1);
  const [toastKey, setToastKey] = useState(0);
  const [, startTransition] = useTransition();
  const reduced = useReducedMotion();
  const { add } = useCart();

  function handleClick() {
    if (state !== 'idle' || disabled) return;
    setState('pending');
    startTransition(async () => {
      try {
        // Simulated latency so the pending state is visible. When real cart
        // backend lands, replace with the API call and surface real errors.
        await new Promise((r) => setTimeout(r, 320));
        add(productId, variantId, qty);
        setState('success');
        setToastKey((k) => k + 1);
        window.setTimeout(() => setState('idle'), 2400);
      } catch {
        setState('error');
        window.setTimeout(() => setState('idle'), 2400);
      }
    });
  }

  const label =
    state === 'pending'
      ? 'Adding…'
      : state === 'success'
      ? 'Added'
      : state === 'error'
      ? 'Try again'
      : disabled
      ? 'Out of stock'
      : 'Add to cart';

  return (
    <div className="relative flex flex-wrap items-center gap-3">
      {/* Quantity stepper */}
      <div
        className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-surface-elevated p-1"
        role="group"
        aria-label="Quantity"
      >
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={disabled || qty <= 1}
          aria-label="Decrease quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full text-theme-ink/75 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={qty}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) setQty(Math.min(maxQty, Math.max(1, Math.floor(n))));
          }}
          aria-label="Quantity"
          className="w-12 bg-transparent text-center text-sm font-semibold tabular-nums text-theme-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          disabled={disabled || qty >= maxQty}
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full text-theme-ink/75 transition-colors hover:bg-theme-glow/20 hover:text-theme-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-live="polite"
        className={cn(
          'group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-sm font-semibold shadow-soft transition-all duration-300',
          'bg-theme-accent text-[color:var(--theme-base)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'hover:-translate-y-0.5 hover:shadow-lifted',
          state === 'error' && 'bg-red-700',
        )}
      >
        {/* Ribbon-pull success sweep */}
        {state === 'success' && !reduced && (
          <motion.span
            key="sweep"
            initial={{ x: '-110%' }}
            animate={{ x: '110%' }}
            transition={{ duration: 0.55, ease: EASE.emphasised }}
            className="pointer-events-none absolute inset-y-0 w-1/2"
            style={{
              background:
                'linear-gradient(90deg, transparent, color-mix(in oklab, var(--theme-glow) 70%, transparent), transparent)',
            }}
            aria-hidden="true"
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? DURATION.fast : DURATION.quick, ease: EASE.standard }}
            className="flex items-center gap-2"
          >
            {state === 'success' ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            )}
            {label}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Toast — appears once per successful add, near the cart CTA */}
      <AnimatePresence>
        {state === 'success' && (
          <motion.div
            key={toastKey}
            role="status"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick, ease: EASE.standard }}
            className="rounded-full bg-theme-ink px-4 py-2 text-xs font-medium text-[color:var(--theme-base)] shadow-soft"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-theme-glow" aria-hidden="true" />
              Added — view cart
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error inline message */}
      {state === 'error' && (
        <span className="text-sm font-medium text-red-700">
          Couldn&rsquo;t add. Please retry.
        </span>
      )}
    </div>
  );
}
