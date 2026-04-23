'use client';

import Link from 'next/link';
import { Search, ShoppingBag, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Paisley } from '@/components/brand/paisley';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { useCart } from '@/lib/cart/cart-context';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

const NAV = [
  { label: 'Sweets', href: '/category/sweets' },
  { label: 'Namkeens', href: '/category/namkeens' },
  { label: 'Hyderabadi', href: '/category/hyderabadi-specials' },
  { label: 'Gift Hampers', href: '/category/gift-hampers' },
  { label: 'Corporate', href: '/corporate' },
];

export function Header() {
  const { lineCount } = useCart();
  const reduced = useReducedMotion();
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--theme-base)]/85 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2"
          aria-label="Ravi Sweets home"
        >
          <Paisley size="sm" className="transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-display text-2xl font-bold text-theme-ink">Ravi Sweets</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative text-sm font-medium text-theme-ink/80 transition-colors hover:text-theme-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="rounded-full p-2 text-theme-ink/70 transition-colors hover:bg-[color:var(--theme-glow)]/20 hover:text-theme-ink"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="rounded-full p-2 text-theme-ink/70 transition-colors hover:bg-[color:var(--theme-glow)]/20 hover:text-theme-ink"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart — ${lineCount} ${lineCount === 1 ? 'item' : 'items'}`}
            className="relative rounded-full p-2 text-theme-ink/70 transition-colors hover:bg-[color:var(--theme-glow)]/20 hover:text-theme-ink"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <AnimatePresence mode="popLayout">
              {lineCount > 0 && (
                <motion.span
                  key={lineCount}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: DURATION.quick, ease: EASE.emphasised }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-theme-accent px-1 text-[10px] font-semibold text-white"
                >
                  {lineCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}
