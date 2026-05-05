'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Beaker,
  Boxes,
  Building2,
  Calendar,
  CalendarClock,
  Compass,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Palette,
  Settings,
  Sparkles,
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';
import { useSession } from '@/lib/supabase/session-context';
import { SUPABASE_CONFIGURED } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

const ADMIN_ENABLED = process.env.NEXT_PUBLIC_ADMIN_ENABLED !== 'false';

const NAV: { label: string; href: string; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Strategy', href: '/admin/strategy', icon: Compass },
  { label: 'Orders', href: '/admin/orders', icon: Package },
  { label: 'Products', href: '/admin/products', icon: Boxes },
  { label: 'Inventory', href: '/admin/inventory', icon: BarChart3 },
  { label: 'Locations', href: '/admin/locations', icon: MapPin },
  { label: 'Batches', href: '/admin/batches', icon: Beaker },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Promotions', href: '/admin/promotions', icon: Sparkles },
  { label: 'Festivals', href: '/admin/festivals', icon: Calendar },
  { label: 'Schedule', href: '/admin/schedule', icon: CalendarClock },
  { label: 'Themes', href: '/admin/themes', icon: Palette },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Enquiries', href: '/admin/enquiries', icon: MessageCircle },
  { label: 'Inbox', href: '/admin/inbox', icon: Inbox },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { configured, user, role, loading, signOut } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change so users land on the new page cleanly.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Body scroll-lock + Escape close while drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  // Login page is public — render it without the gate.
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!ADMIN_ENABLED) return;
    if (loading) return;
    if (isLoginPage) return;
    // If Supabase not configured, show setup gate (no redirect).
    if (!configured) return;
    // Not signed in → /admin/login
    if (!user) {
      router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    // Signed in but not admin → 404-style page
    if (role !== 'admin') {
      router.replace('/admin/login?reason=forbidden');
    }
  }, [configured, user, role, loading, isLoginPage, pathname, router]);

  if (!ADMIN_ENABLED) {
    return (
      <main className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="max-w-md rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-theme-ink">
            Admin disabled
          </h1>
          <p className="mt-2 text-sm text-theme-ink/70">
            Set <code className="font-mono">NEXT_PUBLIC_ADMIN_ENABLED=true</code> in your env to
            enable the admin panel.
          </p>
        </div>
      </main>
    );
  }

  if (isLoginPage) {
    return <main className="min-h-[100vh] bg-theme-base">{children}</main>;
  }

  if (!configured) {
    return (
      <main className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="max-w-lg rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-8">
          <Paisley size="md" />
          <h1 className="mt-4 font-display text-3xl font-semibold text-theme-ink">
            Connect Supabase to enable admin
          </h1>
          <p className="mt-3 text-sm text-theme-ink/75">
            The admin panel is built and ready. To turn it on, provision a free Supabase
            project and add these to <code className="font-mono">.env.local</code>:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-[color:var(--theme-ink)]/5 p-3 text-xs">
            <code>{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY`}</code>
          </pre>
          <p className="mt-4 text-xs text-theme-ink/60">
            Then run the migration at <code className="font-mono">supabase/migrations/0001_init.sql</code>{' '}
            in the Supabase SQL editor. Restart the dev server and refresh.
          </p>
        </div>
      </main>
    );
  }

  if (loading || !user || role !== 'admin') {
    return (
      <main className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-32 animate-pulse rounded bg-theme-ink/10" />
      </main>
    );
  }

  function handleSignOut() {
    void signOut();
    router.replace('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-theme-base">
      {/* Desktop sidebar — hidden on small screens */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[color:var(--color-border)] bg-surface-elevated md:flex">
        <Link href="/admin" className="flex items-center gap-2 px-5 py-5">
          <Paisley size="sm" />
          <span className="font-display text-lg font-bold text-theme-ink">Ravi Admin</span>
        </Link>
        <nav className="flex-1 px-2">
          <AdminNavList pathname={pathname} />
        </nav>
        <div className="border-t border-[color:var(--color-border)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Signed in
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-theme-ink">{user.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-theme-ink/65 hover:text-theme-accent"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer — full-screen slide-in from the left, replicates the
          desktop sidebar nav but with bigger 48px tap targets, hardcoded
          colours so route theme overrides can't make items invisible. */}
      {mobileOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-[#1a0a02]/60 backdrop-blur-sm"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="fixed left-0 top-0 z-50 flex h-[100dvh] w-[88vw] max-w-[300px] flex-col bg-[#fbf3df] text-[#1f0c02] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#e8d8a8] px-5 py-4">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <Paisley size="sm" />
                <span className="font-display text-lg font-bold">Ravi Admin</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2e2b6] text-[#1f0c02] transition-colors hover:bg-[#e8d8a8]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="flex flex-col gap-1">
                {NAV.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex h-12 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors',
                          active
                            ? 'bg-[#a85a08] text-white'
                            : 'text-[#1f0c02] hover:bg-[#f2e2b6]',
                        )}
                      >
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-[#e8d8a8] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a0e]">
                Signed in
              </p>
              <p className="mt-0.5 truncate text-sm font-medium">{user.email}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#e8d8a8] text-xs font-semibold text-[#1f0c02] transition-colors hover:bg-[#f2e2b6]"
                >
                  Storefront →
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#2e1c04] text-xs font-semibold text-[#fdf6ec] transition-colors hover:bg-[#5a2a08]"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[color:var(--color-border)] bg-surface-elevated/85 px-4 backdrop-blur md:h-16 md:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-label="Open admin menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-theme-accent text-[color:var(--theme-base)] shadow-soft transition-all hover:-translate-y-0.5 md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60">
              <Building2 className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Khammam · </span>Ravi Sweets
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-theme-ink/65 transition-colors hover:text-theme-accent"
          >
            View storefront →
          </Link>
        </header>
        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavList({ pathname }: { pathname: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-theme-accent text-[color:var(--theme-base)]'
                  : 'text-theme-ink/75 hover:bg-theme-glow/15 hover:text-theme-ink',
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

void SUPABASE_CONFIGURED;
