'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { serialiseConfig } from '@/lib/builder/url-schema';
import type { HamperConfig } from '@ravisweets/shared';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { cn } from '@/lib/cn';

export function ShareButton({
  config,
  disabled,
}: {
  config: HamperConfig;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  async function copy() {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/corporate/builder?${serialiseConfig(config)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard API can fail in non-secure contexts; fallback is selecting
      // the URL with a prompt. Keep it simple — surface a toast and log.
      console.warn('[share] clipboard write failed');
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-5 py-2.5 text-sm font-semibold text-theme-ink transition-all duration-300',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:-translate-y-0.5 hover:border-theme-accent hover:text-theme-accent',
      )}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick, ease: EASE.emphasised }}
            className="inline-flex items-center gap-2"
          >
            <Check className="h-4 w-4 text-theme-accent" aria-hidden="true" />
            Link copied
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick }}
            className="inline-flex items-center gap-2"
          >
            <LinkIcon className="h-4 w-4" aria-hidden="true" />
            Share this hamper
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
