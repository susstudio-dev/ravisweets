'use client';

import Link from 'next/link';
import { ChevronDown, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Paisley } from '@/components/brand/paisley';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { SearchOverlay } from '@/components/search/search-overlay';
import { UserMenu } from '@/components/auth/user-menu';
import { useCart } from '@/lib/cart/cart-context';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

interface NavSection {
  heading: string;
  items: { label: string; href: string; tagline?: string }[];
}

const SHOP_SECTIONS: NavSection[] = [
  {
    heading: 'Sweets',
    items: [
      { label: 'Hyderabadi specials', href: '/category/hyderabadi-specials', tagline: 'Qubani · Double ka Meetha · Badam ki Jali' },
      { label: 'Sweets', href: '/category/sweets', tagline: 'Kaju Katli · Gulab Jamun · Soan Papdi' },
      { label: 'Sweet bites', href: '/category/sweet-bites', tagline: 'Twelve flavours, one box' },
      { label: 'Healthy sweets', href: '/category/healthy-sweets', tagline: 'Booster · Gondh · Millet laddu' },
    ],
  },
  {
    heading: 'Savoury',
    items: [
      { label: 'Namkeens', href: '/category/namkeens', tagline: 'Mixture · Chivda · Sev' },
      { label: 'Savouries', href: '/category/savouries', tagline: 'Chegodilu · Janthikalu · Karapusa' },
      { label: 'Pickles', href: '/category/pickles', tagline: 'Gongura · Allam · Mamidikaya' },
      { label: 'Podis & powders', href: '/category/powders', tagline: 'Karam · Kandi · Sambar' },
    ],
  },
  {
    heading: 'Pantry',
    items: [
      { label: 'Dry fruits', href: '/category/dry-fruits', tagline: 'Anjeer · Badam · Kaju · Pista' },
      { label: 'Biscuits', href: '/category/biscuits', tagline: 'Vegan, butter-rich' },
      { label: 'Combos', href: '/category/combos', tagline: 'Chai-time · Festival pairs' },
      { label: 'Gift hampers', href: '/category/gift-hampers', tagline: 'Diwali · Wedding · Corporate' },
    ],
  },
];

const FLAT_NAV = [
  { label: 'Festivals', href: '/festivals' },
  { label: 'Corporate', href: '/corporate' },
  { label: 'Stores', href: '/stores' },
  { label: 'About', href: '/about' },
];

export function Header() {
  const { lineCount } = useCart();
  const reduced = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Cart count is read from localStorage on first client render. SSR doesn't
  // see localStorage, so SSR always renders 0. Without gating, the badge +
  // aria-label flip on hydration → React throws a hydration mismatch and
  // re-renders the whole tree (which also breaks <Image> mid-flight).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cmd/Ctrl+K to open search overlay
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6dcc6] bg-[#fffaf0]/95 text-[#2a1a04] backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2"
          aria-label="Ravi Sweets home"
        >
          <Paisley size="sm" className="transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-display text-2xl font-bold text-theme-ink">Ravi Sweets</span>
        </Link>

        <ShopMegaMenu sections={SHOP_SECTIONS} flatNav={FLAT_NAV} />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search (Ctrl+K)"
            title="Search (Ctrl+K)"
            className="rounded-full p-2 text-theme-ink/70 transition-colors hover:bg-[color:var(--theme-glow)]/20 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <UserMenu />
          <Link
            href="/cart"
            aria-label={
              mounted
                ? `Cart — ${lineCount} ${lineCount === 1 ? 'item' : 'items'}`
                : 'Cart'
            }
            className="relative rounded-full p-2 text-theme-ink/70 transition-colors hover:bg-[color:var(--theme-glow)]/20 hover:text-theme-ink"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <AnimatePresence mode="popLayout">
              {mounted && lineCount > 0 && (
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
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="ml-1 rounded-full p-2 text-theme-ink/70 transition-colors hover:bg-[color:var(--theme-glow)]/20 hover:text-theme-ink lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DURATION.quick, ease: EASE.standard }}
            className="border-t border-[#e6dcc6] bg-[#fffaf0] text-[#2a1a04] lg:hidden"
          >
            <div className="container-site grid gap-5 py-5">
              {SHOP_SECTIONS.map((section) => (
                <div key={section.heading}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
                    {section.heading}
                  </p>
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-1 text-sm font-medium text-theme-ink/85 hover:text-theme-accent"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="border-t border-[color:var(--color-border)] pt-4">
                <ul className="grid grid-cols-2 gap-3">
                  {FLAT_NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1 text-sm font-semibold text-theme-ink/85 hover:text-theme-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollProgress />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

interface ShopMegaMenuProps {
  sections: NavSection[];
  flatNav: { label: string; href: string }[];
}

function ShopMegaMenu({ sections, flatNav }: ShopMegaMenuProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <nav aria-label="Primary" className="hidden lg:block" ref={ref}>
      <ul className="flex items-center gap-6">
        <li className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-sm font-medium text-theme-ink/80 transition-colors hover:text-theme-accent"
          >
            Shop
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                role="menu"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: DURATION.quick, ease: EASE.standard }}
                // Hard-coded cream + ink so the menu stays readable on routes that
                // override --theme-base / --theme-ink (e.g. dark festival pages).
                className="absolute left-1/2 top-full z-50 mt-3 w-[42rem] -translate-x-1/2 rounded-2xl border border-[#e6dcc6] bg-[#fffaf0] p-5 text-[#2a1a04] shadow-lifted"
              >
                <div className="grid grid-cols-3 gap-5">
                  {sections.map((section) => (
                    <div key={section.heading}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a5a10]">
                        {section.heading}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1">
                        {section.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-[#f4ead0]"
                            >
                              <span className="block text-sm font-semibold text-[#2a1a04]">
                                {item.label}
                              </span>
                              {item.tagline && (
                                <span className="block text-[11px] text-[#2a1a04]/65">
                                  {item.tagline}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>
        {flatNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm font-medium text-theme-ink/80 transition-colors hover:text-theme-accent"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

