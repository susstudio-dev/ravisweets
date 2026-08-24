'use client';

import Link from 'next/link';
import { ChevronDown, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '@ravisweets/shared';
import { BrandLogo } from '@/components/brand/logo';
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
    /*
     * "Hyderabadi specials" led this column until 2026-08-12, when the owner
     * pulled it out of the navigation. On 2026-08-13 the category itself was
     * retired — its products moved into 'sweets' and the category page no
     * longer builds (see supabase/migrations/0022) — so nothing here may link
     * to it. It was replaced rather than simply deleted because this menu is a
     * three-column grid and a 3/4/4 column reads as a mistake.
     */
    items: [
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
      {
        label: 'Festival specials',
        href: '/category/festival-specials',
        tagline: 'Rakhi thali · Eid box · Pongal set',
      },
    ],
  },
  {
    heading: 'Savoury',
    items: [
      // Janthikalu and Murukulu moved here from Savouries on 2026-08-23 (0025).
      { label: 'Namkeens', href: '/category/namkeens', tagline: 'Mixture · Murukulu · Janthikalu' },
      {
        label: 'Savouries',
        href: '/category/savouries',
        tagline: 'Chegodilu · Karapusa · Kachuralu',
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

/*
 * The masthead earns its keep per link. Owner, 2026-08-24: the header reads
 * as cluttered — seven top-level items plus the search field left "Gift
 * hampers" wrapping onto two lines against the search box. The two links that
 * sell nothing directly (Stores, About) came off the desktop bar: both remain
 * one tap away in the footer ("Stores & Contact", "Our Story") and in the
 * mobile drawer, which has vertical room to spare.
 */
const DESKTOP_NAV = [
  // The Essence — the ten-piece rotating drop (VAULT_10_PLAN). Sits right
  // after Shop: it is the brand's flagship statement, not a utility link.
  { label: 'Essence', href: '/essence' },
  // Gift hampers promoted out of the mega menu — the money link both
  // reference stores surface at top level (warm pivot, 2026-08-10).
  { label: 'Gift hampers', href: '/category/gift-hampers' },
  // The INDEX, not /festivals/diwali: deep-linking one festival hid the other
  // ten — the owner asked for "all the festivals by default" (2026-08-11).
  { label: 'Festivals', href: '/festivals' },
  { label: 'Corporate', href: '/corporate' },
];

const DRAWER_NAV = [
  ...DESKTOP_NAV,
  { label: 'Stores', href: '/stores' },
  { label: 'About', href: '/about' },
];

const BANNER_DISMISS_KEY = 'ravi.banner.dismissed.v1';

export function Header() {
  const { lineCount, subtotal } = useCart();
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
            className="bg-theme-ink overflow-hidden text-[color:var(--theme-base)]"
          >
            <div className="container-site relative flex h-9 items-center justify-center gap-2 text-[11px] font-medium tracking-wide">
              <Sparkles className="text-theme-glow h-3 w-3" aria-hidden="true" />
              <span>{banner}</span>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss announcement"
                className="text-[color:var(--theme-base)]/65 absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors hover:bg-white/10 hover:text-[color:var(--theme-base)]"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        The masthead of the form. It sits on the docket ground rather than
        floating over a scene: the retired header borrowed the dark register
        at the top of the homepage because the hero behind it was a night sky,
        and in this world that hero is a pale sheet — cream type on docket
        stock would have been unreadable.

        Scrolled state gains a ruled bottom edge, which is the only thing
        that changes; the bar's colour never does.
      */}
      <motion.div
        animate={{ height: scrolled ? 56 : 64 }}
        transition={{ duration: DURATION.base, ease: EASE.standard }}
        /*
         * No backdrop filter at all. This carried `blur(16px) saturate(150%)`,
         * which pulled the BESTSELLER stamps through the bar as coloured
         * ghosts; dropping the saturate reduced the smear but blur on an
         * 88%-opaque bar is still glass, and plate colour still bled through
         * the top edge. Glass-as-decoration is the opposite of "elevation is
         * contact, not float" — a masthead printed on the sheet is opaque.
         */
        className={cn(
          'bg-theme-base relative border-b transition-[border-color] duration-300',
          scrolled ? 'border-[color:var(--color-rule)]' : 'border-[color:var(--color-border)]',
        )}
      >
        <div className="container-site flex h-full items-center justify-between gap-6">
          {/* Brand lockup — drawn in code (the hotlinked PNG's host is dead) */}
          <Link href="/" aria-label="Ravi Sweets — home" className="shrink-0">
            <BrandLogo compact={scrolled} />
          </Link>

          {/* Primary nav — refined typography, animated underline */}
          <ShopMegaMenu sections={SHOP_SECTIONS} flatNav={DESKTOP_NAV} />

          {/* Action cluster */}
          <div className="flex items-center gap-1.5">
            {/*
              SPEED-TO-ORDER SEARCH. The retired header hid search behind an
              icon; on a 140-SKU catalogue the fastest path to an order is
              typing the sweet's name, so on wide screens the affordance is an
              inviting FIELD (it still just opens the same overlay and Ctrl+K
              still works). Below xl the field would crowd the nav, so it
              collapses back to the icon. Owner ask 2026-08-13: "how fast can we
              make people order."
            */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search · Ctrl+K"
              title="Search · Ctrl+K"
              className="text-theme-ink/50 hover:border-theme-accent/50 hover:text-theme-ink hidden h-9 min-w-[13rem] items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3.5 text-[13px] transition-colors xl:flex"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Search sweets &amp; hampers</span>
            </button>
            <IconButton
              ariaLabel="Search · Ctrl+K"
              title="Search · Ctrl+K"
              className="xl:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <UserMenu />
            {/*
              THE CART PILL. Was an icon with a corner count. It now carries the
              running subtotal beside the count the moment the cart is non-empty
              — the shopper always sees what they are about to spend and that
              checkout is one tap away, without opening the cart. Empty, it
              stays the quiet 36px icon so it does not shout at a first visit.
            */}
            <Link
              href="/cart"
              aria-label={
                lineCount > 0
                  ? `Cart — ${lineCount} ${lineCount === 1 ? 'item' : 'items'}, ${formatMoney(subtotal)}`
                  : 'Cart — empty'
              }
              className={cn(
                'text-theme-ink/75 hover:bg-theme-glow/25 hover:text-theme-ink relative inline-flex h-9 items-center justify-center transition-all duration-200',
                lineCount > 0
                  ? 'bg-theme-accent gap-2 rounded-full px-3 text-[color:var(--theme-base)] hover:bg-[color:var(--color-field-deep)] hover:text-[color:var(--theme-base)]'
                  : 'w-9 rounded-md',
              )}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
              {/*
                THE ONE LINK ON THE SITE WITH NO ANCHOR TEXT (when it is the
                icon). An `sr-only` span is real text in the DOM a crawler reads
                as the anchor; the `aria-label` stays for assistive tech.
              */}
              {lineCount > 0 ? (
                <span className="flex items-center gap-1.5 text-[13px] font-semibold tabular-nums">
                  <span aria-hidden="true">{formatMoney(subtotal)}</span>
                  <span
                    aria-hidden="true"
                    className="text-theme-accent flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--theme-base)] px-1 text-[10px] font-bold"
                  >
                    {lineCount}
                  </span>
                </span>
              ) : (
                <span className="sr-only">Cart</span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="docket text-theme-ink hover:bg-theme-glow/30 ml-1 inline-flex h-9 w-9 items-center justify-center transition-colors lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Hairline accent — only visible at the top of the page */}
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
        flatNav={DRAWER_NAV}
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
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        'text-theme-ink/75 hover:bg-theme-glow/25 hover:text-theme-ink focus-visible:ring-theme-accent inline-flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
        className,
      )}
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
            className="text-theme-ink/85 hover:text-theme-accent group relative inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors"
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
                className="docket shadow-lifted text-theme-ink absolute left-1/2 top-full z-50 mt-4 w-[44rem] -translate-x-1/2 overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-5 p-6">
                  {sections.map((section) => (
                    <div key={section.heading}>
                      <p className="field-label">{section.heading}</p>
                      <ul className="mt-3 flex flex-col gap-0.5">
                        {section.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="group/item hover:bg-field/40 block rounded-md px-2 py-1.5 transition-colors"
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
                <div className="bg-surface border-t border-[color:var(--color-border)] px-6 py-3">
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="field-label hover:text-theme-accent transition-colors"
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

/**
 * A tab on the docket file.
 *
 * The retired header imported usePathname and never used it for this: no nav
 * item ever showed a current state, so a visitor on /corporate had nothing in
 * the chrome telling them where they were. The active tab now keeps its rule
 * drawn rather than revealing it on hover.
 */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        // whitespace-nowrap: a two-word label ("Gift hampers") must never
        // wrap into a two-line tab when the search field squeezes the nav.
        'group relative inline-flex items-center whitespace-nowrap px-2.5 py-1.5 text-[13px] font-semibold transition-colors',
        active ? 'text-theme-accent' : 'text-theme-ink/85 hover:text-theme-accent',
      )}
    >
      {children}
      <Underline active={active} />
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
        'bg-theme-accent pointer-events-none absolute inset-x-2.5 bottom-1 h-[2px] origin-center transition-transform duration-300',
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
 * - Register tokens are safe here: the drawer mounts inside <header>, which
 *   sits outside every data-register subtree, so it always resolves the
 *   light-register values regardless of what the route below it does. (The
 *   colours were hardcoded when the drawer rendered inside route content.)
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
            className="bg-theme-ink/60 fixed inset-0 z-40"
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
            className="bg-surface-elevated text-theme-ink shadow-lifted fixed right-0 top-0 z-50 flex h-[100dvh] w-[88vw] max-w-[360px] flex-col border-l border-[color:var(--color-border)]"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="bg-varak-rule inline-block h-2 w-2 rotate-45" aria-hidden="true" />
                <span className="font-display text-lg">Ravi Sweets</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="bg-field/40 text-theme-ink hover:bg-field/60 inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors"
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
                className="bg-theme-ink mb-5 flex items-center justify-between rounded-lg px-4 py-3 text-[color:var(--theme-base)]"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  <span className="font-display text-base">Your cart</span>
                </span>
                <span className="bg-theme-accent rounded-md px-2.5 py-0.5 text-xs font-bold tabular-nums text-[color:var(--theme-base)]">
                  {lineCount}
                </span>
              </Link>

              {sections.map((section) => (
                <div key={section.heading} className="mb-6">
                  <p className="field-label mb-2">{section.heading}</p>
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
                <p className="field-label mb-2">More</p>
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

              <div className="bg-surface rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="field-label">Talk to us</p>
                <a
                  href="https://wa.me/919398859978"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-md bg-[#25d366] text-sm font-semibold text-white"
                >
                  Chat on WhatsApp
                </a>
                <a href="tel:+919398859978" className="stamp mt-2 flex h-11 w-full">
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
