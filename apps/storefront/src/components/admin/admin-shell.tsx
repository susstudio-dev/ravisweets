'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Palette,
  Settings,
  Sparkles,
  Star,
  Tag,
  Users,
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
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Promotions', href: '/admin/promotions', icon: Sparkles },
  { label: 'Themes', href: '/admin/themes', icon: Palette },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Enquiries', href: '/admin/enquiries', icon: MessageCircle },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { configured, user, role, loading, signOut } = useSession();

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

  return (
    <div className="flex min-h-screen bg-theme-base">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[color:var(--color-border)] bg-surface-elevated md:flex">
        <Link href="/admin" className="flex items-center gap-2 px-5 py-5">
          <Paisley size="sm" />
          <span className="font-display text-lg font-bold text-theme-ink">Ravi Admin</span>
        </Link>
        <nav className="flex-1 px-2">
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
        </nav>
        <div className="border-t border-[color:var(--color-border)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Signed in
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-theme-ink">{user.email}</p>
          <button
            type="button"
            onClick={() => {
              void signOut();
              router.replace('/admin/login');
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-theme-ink/65 hover:text-theme-accent"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[color:var(--color-border)] bg-surface-elevated/85 px-5 backdrop-blur md:h-16 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60">
            <Building2 className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
            Khammam · Ravi Sweets
          </p>
          <Link
            href="/"
            className="text-xs font-semibold text-theme-ink/65 transition-colors hover:text-theme-accent"
          >
            View storefront →
          </Link>
        </header>
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

void SUPABASE_CONFIGURED;
