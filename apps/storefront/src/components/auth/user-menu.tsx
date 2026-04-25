'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  LogIn,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useSession } from '@/lib/supabase/session-context';
import { AuthModal } from '@/components/auth/auth-modal';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

/**
 * Header user menu — persona-aware:
 *  - Anonymous (no session OR is_anonymous): "Sign in" button → opens AuthModal
 *  - Signed-in customer: dropdown with email, /account, sign out
 *  - Signed-in admin: same as customer + an "Open admin" link
 */
export function UserMenu() {
  const { user, isAnonymous, role, signOut } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isSignedIn = !!user && !isAnonymous;

  if (!isSignedIn) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          aria-label="Sign in"
          title="Sign in to your account"
          className="hidden items-center gap-1.5 rounded-full border border-theme-ink/20 px-3 py-1.5 text-xs font-semibold text-theme-ink/85 transition-colors hover:border-theme-accent hover:text-theme-accent sm:inline-flex"
        >
          <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          aria-label="Sign in"
          className="inline-flex rounded-full p-2 text-theme-ink/70 transition-colors hover:bg-[color:var(--theme-glow)]/20 hover:text-theme-ink sm:hidden"
        >
          <UserIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  const initial = (user?.email ?? user?.phone ?? '?').slice(0, 1).toUpperCase();
  const isAdmin = role === 'admin';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="inline-flex items-center gap-1.5 rounded-full border border-theme-ink/15 bg-surface-elevated px-2 py-1 text-xs font-semibold text-theme-ink/85 transition-colors hover:border-theme-accent"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent text-[10px] font-bold text-[color:var(--theme-base)]">
          {initial}
        </span>
        <span className="hidden truncate max-w-[7rem] sm:inline">
          {user?.email ?? user?.phone ?? 'Account'}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-theme-ink/55" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: DURATION.quick, ease: EASE.standard }}
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated shadow-lifted"
          >
            <div className="border-b border-[color:var(--color-border)] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                Signed in {isAdmin && '· admin'}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-theme-ink">
                {user?.email ?? user?.phone}
              </p>
            </div>
            <ul className="flex flex-col py-1">
              <MenuLink href="/account" icon={Package} onClick={() => setMenuOpen(false)}>
                Your orders
              </MenuLink>
              <MenuLink
                href="/account#profile"
                icon={Settings}
                onClick={() => setMenuOpen(false)}
              >
                Profile &amp; addresses
              </MenuLink>
              {isAdmin && (
                <MenuLink href="/admin" icon={ShieldCheck} onClick={() => setMenuOpen(false)}>
                  Open admin
                </MenuLink>
              )}
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-theme-ink/85 transition-colors hover:bg-theme-glow/15 hover:text-theme-accent"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: typeof UserIcon;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        onClick={onClick}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-theme-ink/85 transition-colors hover:bg-theme-glow/15 hover:text-theme-accent"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {children}
      </Link>
    </li>
  );
}
