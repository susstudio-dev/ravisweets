'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { usePathname } from 'next/navigation';
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
      {
        label: 'Hyderabadi specials',
        href: '/category/hyderabadi-specials',
        tagline: 'Qubani · Double ka Meetha · Badam ki Jali',
      },
      {
        label: 'Sweets',
        href: '/category/sweets',
        tagline: 'Kaju Katli · Gulab Jamun · Soan Papdi',
      },
      { label: 'Sweet bites', href: '/category/sweet-bites', tagline: 'Twelve flavours, one box' },
      {
        label: 'Healthy sweets',
        href: '/category/healthy-sweets',
        tagline: 'Booster · Gondh · Millet laddu',
      },
    ],
  },
  {
    heading: 'Savoury',
    items: [
      { label: 'Namkeens', href: '/category/namkeens', tagline: 'Mixture · Chivda · Sev' },
      {
        label: 'Savouries',
        href: '/category/savouries',
        tagline: 'Chegodilu · Janthikalu · Karapusa',
      },
      { label: 'Pickles', href: '/category/pickles', tagline: 'Gongura · Allam · Mamidikaya' },
      { label: 'Podis & powders', href: '/category/powders', tagline: 'Karam · Kandi · Sambar' },
    ],
  },
  {
    heading: 'Pantry',
    items: [
      {
        label: 'Dry fruits',
        href: '/category/dry-fruits',
        tagline: 'Anjeer · Badam · Kaju · Pista',
      },
      { label: 'Biscuits', href: '/category/biscuits', tagline: 'Vegan, butter-rich' },
      { label: 'Combos', href: '/category/combos', tagline: 'Chai-time · Festival pairs' },
      {
        label: 'Gift hampers',
        href: '/category/gift-hampers',
        tagline: 'Diwali · Wedding · Corporate',
      },
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
  const pathname = usePathname();
  // The homepage hero pulls up underneath the header, so at the top of that
  // page the bar floats transparent over the dusk scene and borrows the dusk
  // register for cream type. Everywhere else it stays in the light register.
  const overScene = pathname === '/';
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
            className="bg-theme-ink overflow-hidden text-[color:var(--theme-base)]"
          >
            <div className="container-site relative flex h-9 items-center justify-center gap-2 text-[11px] font-medium tracking-wide">
              <Sparkles className="text-theme-glow h-3 w-3" aria-hidden="true" />
              <span>{banner}</span>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss announcement"
                className="text-[color:var(--theme-base)]/65 absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/10 hover:text-[color:var(--theme-base)]"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header bar — transparent overlay at the top of the page,
          condensing into a centered floating glass pill once scrolled. Over
          the homepage hero the at-top bar borrows the dusk register so the
          nav reads in cream over the scene. */}
      <motion.div
        {...(overScene && !scrolled ? { 'data-register': 'dusk' } : {})}
        animate={{ height: scrolled ? 56 : 84 }}
        transition={{ duration: DURATION.base, ease: EASE.standard }}
        style={scrolled ? { backdropFilter: 'blur(16px) saturate(150%)' } : undefined}
        className={cn(
          'relative transition-[background-color,border-color,border-radius,margin,max-width,box-shadow] duration-300',
          scrolled
            ? 'shadow-lifted mx-3 mt-3 max-w-[1120px] rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_oklab,var(--theme-base)_82%,transparent)] px-2 sm:mx-auto'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="container-site flex h-full items-center justify-between gap-6">
          {/* Brand logo — official Ravi Sweets mark, scales on scroll */}
          <Link href="/" className="group flex items-center gap-3" aria-label="Ravi Sweets — home">
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
                  className="text-theme-ink/55 hidden text-[10px] font-semibold uppercase tracking-[0.32em] sm:block"
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
              className="text-theme-ink/75 hover:bg-theme-glow/25 hover:text-theme-ink relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
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
                    className="text-theme-accent ring-theme-accent absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--theme-base)] px-1 text-[10px] font-semibold tabular-nums shadow-[0_2px_6px_color-mix(in_oklab,var(--theme-ink)_25%,transparent)] ring-1"
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
              className="bg-theme-accent shadow-soft hover:shadow-lifted ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--theme-base)] transition-all hover:-translate-y-0.5 lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
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
              className="via-theme-accent/40 pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
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
      className="text-theme-ink/75 hover:bg-theme-glow/25 hover:text-theme-ink focus-visible:ring-theme-accent inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
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
            className="text-theme-ink/85 hover:text-theme-accent group relative inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors"
          >
            Shop
            <ChevronDown
              className={cn('h-3 w-3 transition-transform duration-300', open && 'rotate-180')}
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
                className="shadow-lifted bg-surface-elevated text-theme-ink absolute left-1/2 top-full z-50 mt-4 w-[44rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-[color:var(--color-border)]"
              >
                <div className="grid grid-cols-3 gap-5 p-6">
                  {sections.map((section) => (
                    <div key={section.heading}>
                      <p className="text-theme-accent text-[10px] font-semibold uppercase tracking-[0.22em]">
                        {section.heading}
                      </p>
                      <ul className="mt-3 flex flex-col gap-0.5">
                        {section.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="group/item hover:bg-field/40 block rounded-lg px-2 py-1.5 transition-colors"
                            >
                              <span className="group-hover/item:text-theme-accent text-theme-ink block text-sm font-semibold">
                                {item.label}
                              </span>
                              {item.tagline && (
                                <span className="text-theme-ink/60 mt-0.5 block text-[11px] leading-snug">
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
                <div className="bg-surface text-theme-ink/70 border-t border-[color:var(--color-border)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.22em]">
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
      className="text-theme-ink/85 hover:text-theme-accent group relative inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors"
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
        'bg-theme-accent pointer-events-none absolute inset-x-3 bottom-1 h-px origin-center transition-transform duration-300',
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
            className="bg-theme-ink/60 fixed inset-0 z-40 backdrop-blur-sm"
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
            className="bg-surface-elevated text-theme-ink fixed right-0 top-0 z-50 flex h-[100dvh] w-[88vw] max-w-[360px] flex-col shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <Paisley size="sm" />
                <span className="font-display text-lg">Ravi Sweets</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="bg-field/40 text-theme-ink hover:bg-field/60 inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors"
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
                className="bg-theme-ink mb-5 flex items-center justify-between rounded-2xl px-4 py-3 text-[color:var(--theme-base)]"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  <span className="font-display text-base">Your cart</span>
                </span>
                <span className="bg-theme-accent text-theme-ink rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                  {lineCount}
                </span>
              </Link>

              {sections.map((section) => (
                <div key={section.heading} className="mb-6">
                  <p className="text-theme-accent mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]">
                    {section.heading}
                  </p>
                  <ul className="flex flex-col">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          // h-12 = 48px tap target — comfortably above the 44px Apple HIG / Google Material minimum
                          className="text-theme-ink hover:text-theme-accent active:bg-field/40 flex h-12 items-center border-b border-[color:var(--color-border)] text-[15px] font-medium transition-colors"
                        >
                          {item.label}
                          {item.tagline && (
                            <span className="text-theme-ink/55 ml-auto truncate pl-3 text-[11px] font-normal">
                              {item.tagline}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="mb-6 border-t border-[color:var(--color-border)] pt-4">
                <p className="text-theme-accent mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]">
                  More
                </p>
                <ul className="flex flex-col">
                  {flatNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="text-theme-ink hover:text-theme-accent active:bg-field/40 flex h-12 items-center border-b border-[color:var(--color-border)] text-[15px] font-semibold transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface rounded-2xl border border-[color:var(--color-border)] p-4">
                <p className="text-theme-accent text-[10px] font-semibold uppercase tracking-[0.22em]">
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
                  className="bg-theme-accent mt-2 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white"
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
