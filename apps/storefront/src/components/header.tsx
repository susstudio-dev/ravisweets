'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Paisley } from '@/components/brand/paisley';

const RAVI_LOGO_URL =
  'https://ravisweets.com/wp-content/uploads/2025/09/cropped-WhatsApp_Image_2025-09-04_at_5.28.12_PM-removebg-preview-1-1.png';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { SearchOverlay } from '@/components/search/search-overlay';
import { UserMenu } from '@/components/auth/user-menu';
import { useCart } from '@/lib/cart/cart-context';
import { useActiveTheme } from '@/lib/theme/active-theme-context';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { cn } from '@/lib/cn';

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
  { label: 'Festivals', href: '/festivals/diwali' },
  { label: 'Corporate', href: '/corporate' },
  { label: 'Stores', href: '/stores' },
  { label: 'About', href: '/about' },
];

const BANNER_DISMISS_KEY = 'ravi.banner.dismissed.v1';

export function Header() {
  const { lineCount } = useCart();
  const { active: theme } = useActiveTheme();
  const reduced = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);

  // Scroll-aware collapse: tall header at top of page, compact when scrolled.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
  });

  // Banner: rehydrate dismissed flag from sessionStorage so it doesn't
  // re-appear within the same session.
  useEffect(() => {
    try {
      setBannerDismissed(sessionStorage.getItem(BANNER_DISMISS_KEY) === '1');
    } catch {
      setBannerDismissed(false);
    }
  }, []);

  // Cmd/Ctrl+K opens search; Esc closes mobile menu.
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

  function dismissBanner() {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem(BANNER_DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  const banner = theme?.bannerText && !bannerDismissed ? theme.bannerText : null;

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement strip — reads from active theme.bannerText. Dismissible per-session. */}
      <AnimatePresence initial={false}>
        {banner && (
          <motion.div
            key="banner"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 36, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: DURATION.quick, ease: EASE.standard }}
            className="overflow-hidden bg-theme-ink text-[color:var(--theme-base)]"
          >
            <div className="container-site relative flex h-9 items-center justify-center gap-2 text-[11px] font-medium tracking-wide">
              <Sparkles className="h-3 w-3 text-theme-glow" aria-hidden="true" />
              <span>{banner}</span>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss announcement"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[color:var(--theme-base)]/65 transition-colors hover:bg-white/10 hover:text-[color:var(--theme-base)]"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header bar — height + bg shift on scroll */}
      <motion.div
        animate={{
          height: scrolled ? 60 : 84,
          backgroundColor: scrolled
            ? 'color-mix(in oklab, var(--theme-base) 88%, transparent)'
            : 'color-mix(in oklab, var(--theme-base) 60%, transparent)',
        }}
        transition={{ duration: DURATION.base, ease: EASE.standard }}
        style={{ backdropFilter: 'blur(14px) saturate(140%)' }}
        className={cn(
          'relative border-b transition-shadow duration-300',
          scrolled
            ? 'border-theme-ink/10 shadow-[0_1px_0_color-mix(in_oklab,var(--theme-accent)_20%,transparent)]'
            : 'border-transparent shadow-none',
        )}
      >
        <div className="container-site flex h-full items-center justify-between gap-6">
          {/* Brand logo — official Ravi Sweets mark, scales on scroll */}
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Ravi Sweets — home"
          >
            <motion.div
              animate={{
                width: scrolled ? 44 : 64,
                height: scrolled ? 44 : 64,
              }}
              transition={{ duration: DURATION.base, ease: EASE.standard }}
              className="relative shrink-0"
            >
              <Image
                src={RAVI_LOGO_URL}
                alt="Ravi Sweets"
                fill
                priority
                sizes="64px"
                className="object-contain drop-shadow-[0_2px_8px_color-mix(in_oklab,var(--theme-ink)_18%,transparent)]"
              />
            </motion.div>
            <AnimatePresence>
              {!scrolled && (
                <motion.span
                  key="sub-mark"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
                  transition={{ duration: DURATION.quick, ease: EASE.standard }}
                  className="hidden text-[10px] font-semibold uppercase tracking-[0.32em] text-theme-ink/55 sm:block"
                >
                  Khammam · est. 1985
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Primary nav — refined typography, animated underline */}
          <ShopMegaMenu sections={SHOP_SECTIONS} flatNav={FLAT_NAV} />

          {/* Action cluster */}
          <div className="flex items-center gap-1.5">
            <IconButton
              ariaLabel="Search · Ctrl+K"
              title="Search · Ctrl+K"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <UserMenu />
            <Link
              href="/cart"
              aria-label={`Cart — ${lineCount} ${lineCount === 1 ? 'item' : 'items'}`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-theme-ink/75 transition-all duration-200 hover:bg-theme-glow/25 hover:text-theme-ink"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <AnimatePresence mode="popLayout">
                {lineCount > 0 && (
                  <motion.span
                    key={lineCount}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ duration: DURATION.quick, ease: EASE.emphasised }}
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--theme-base)] px-1 text-[10px] font-semibold tabular-nums text-theme-accent ring-1 ring-theme-accent shadow-[0_2px_6px_color-mix(in_oklab,var(--theme-ink)_25%,transparent)]"
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
              className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-theme-accent text-[color:var(--theme-base)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Hairline gold accent — only visible at the top of the page */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div
              key="hairline"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.6 }}
              transition={{ duration: DURATION.slow, ease: EASE.emphasised }}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-theme-accent/40 to-transparent"
            />
          )}
        </AnimatePresence>
      </motion.div>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sections={SHOP_SECTIONS}
        flatNav={FLAT_NAV}
      />

      <ScrollProgress />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function IconButton({
  children,
  onClick,
  ariaLabel,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-theme-ink/75 transition-all duration-200 hover:bg-theme-glow/25 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
    >
      {children}
    </button>
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
      <ul className="flex items-center gap-1">
        <li className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="group relative inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-ink/85 transition-colors hover:text-theme-accent"
          >
            Shop
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform duration-300',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
            <Underline active={open} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                role="menu"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: DURATION.quick, ease: EASE.standard }}
                className="absolute left-1/2 top-full z-50 mt-4 w-[44rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#e6dcc6] bg-[#fffaf0] text-[#2a1a04] shadow-lifted"
              >
                <div className="grid grid-cols-3 gap-5 p-6">
                  {sections.map((section) => (
                    <div key={section.heading}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a5a10]">
                        {section.heading}
                      </p>
                      <ul className="mt-3 flex flex-col gap-0.5">
                        {section.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="group/item block rounded-lg px-2 py-1.5 transition-colors hover:bg-[#f4ead0]"
                            >
                              <span className="block text-sm font-semibold text-[#2a1a04] group-hover/item:text-theme-accent">
                                {item.label}
                              </span>
                              {item.tagline && (
                                <span className="mt-0.5 block text-[11px] leading-snug text-[#2a1a04]/60">
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
                <div className="border-t border-[#e6dcc6] bg-[#f9f0d8] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#2a1a04]/70">
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="hover:text-theme-accent"
                  >
                    See the entire catalogue →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>
        {flatNav.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-ink/85 transition-colors hover:text-theme-accent"
    >
      {children}
      <Underline />
    </Link>
  );
}

/**
 * Underline that grows from the centre on hover (or stays put if `active`).
 * Pure CSS via group-hover for performance — no per-frame work.
 */
function Underline({ active = false }: { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-3 bottom-1 h-px origin-center bg-theme-accent transition-transform duration-300',
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
      )}
    />
  );
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  sections: NavSection[];
  flatNav: { label: string; href: string }[];
}

/**
 * Full-screen slide-in drawer from the right (mobile + tablet). Replaces the
 * previous top-drop sheet which had small tap targets and used theme-driven
 * CSS variables that could become invisible on dark-themed routes.
 *
 * - Full viewport height, fixed-position so it overlays the page (z-50).
 * - 88vw wide, max 360px so the right edge of the page is still tappable
 *   to dismiss without scrolling to the X button.
 * - Hardcoded cream/ink colours so it's never invisible regardless of
 *   route's --theme-base / --theme-ink overrides.
 * - Body scroll-lock while open so the drawer doesn't drag the page.
 * - Backdrop dismiss + Escape key + drawer-internal X all close.
 */
function MobileDrawer({ open, onClose, sections, flatNav }: MobileDrawerProps) {
  const reduced = useReducedMotion();
  const { lineCount } = useCart();

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick }}
            className="fixed inset-0 z-40 bg-[#1a0a02]/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={reduced ? { opacity: 0 } : { x: '100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: DURATION.base, ease: EASE.emphasised }}
            className="fixed right-0 top-0 z-50 flex h-[100dvh] w-[88vw] max-w-[360px] flex-col bg-[#fffaf0] text-[#2a1a04] shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[#e6dcc6] px-5 py-4">
              <div className="flex items-center gap-2">
                <Paisley size="sm" />
                <span className="font-display text-lg font-bold">Ravi Sweets</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ead0] text-[#2a1a04] transition-colors hover:bg-[#e6dcc6]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Cart shortcut at the very top — high-intent users see it first */}
              <Link
                href="/cart"
                onClick={onClose}
                className="mb-5 flex items-center justify-between rounded-2xl bg-[#3a1a04] px-4 py-3 text-[#fdf6ec]"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  <span className="font-display text-base font-semibold">Your cart</span>
                </span>
                <span className="rounded-full bg-[#f0bd4a] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[#3a1a04]">
                  {lineCount}
                </span>
              </Link>

              {sections.map((section) => (
                <div key={section.heading} className="mb-6">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a5a10]">
                    {section.heading}
                  </p>
                  <ul className="flex flex-col">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          // h-12 = 48px tap target — comfortably above the 44px Apple HIG / Google Material minimum
                          className="flex h-12 items-center border-b border-[#f0e7cf] text-[15px] font-medium text-[#2a1a04] transition-colors hover:text-[#a85a08] active:bg-[#f4ead0]"
                        >
                          {item.label}
                          {item.tagline && (
                            <span className="ml-auto truncate pl-3 text-[11px] font-normal text-[#2a1a04]/55">
                              {item.tagline}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="mb-6 border-t border-[#e6dcc6] pt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a5a10]">
                  More
                </p>
                <ul className="flex flex-col">
                  {flatNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex h-12 items-center border-b border-[#f0e7cf] text-[15px] font-semibold text-[#2a1a04] transition-colors hover:text-[#a85a08] active:bg-[#f4ead0]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#e6dcc6] bg-[#f9f0d8] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a5a10]">
                  Talk to us
                </p>
                <a
                  href="https://wa.me/919398859978"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full bg-[#25d366] text-sm font-semibold text-white"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+919398859978"
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full bg-[#c0592b] text-sm font-semibold text-white"
                >
                  Call +91 93988 59978
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
