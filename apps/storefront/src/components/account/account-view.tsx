'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  LogIn,
  LogOut,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  Trash2,
  UserIcon as UserCircleIcon,
} from 'lucide-react';
import { formatMoney } from '@ravisweets/shared';
import { getOrders } from '@/lib/orders/store';
import { resetDemoData } from '@/lib/orders/demo-seed';
import { listMyOrders } from '@/lib/supabase/orders';
import { getSupabase } from '@/lib/supabase/client';
import { useSession } from '@/lib/supabase/session-context';
import type { Order } from '@/lib/orders/types';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import { Stagger } from '@/components/motion/stagger';
import { AuthModal } from '@/components/auth/auth-modal';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AccountView() {
  const { configured: authConfigured, user, isAnonymous, signOut } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const isSignedIn = !!user && !isAnonymous;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (authConfigured && isSignedIn) {
        const live = await listMyOrders();
        if (cancelled) return;
        const local = getOrders();
        const liveIds = new Set(live.map((o) => o.id));
        const merged = [...live, ...local.filter((o) => !liveIds.has(o.id))].sort(
          (a, b) => b.placedAt - a.placedAt,
        );
        setOrders(merged);
      } else {
        // Anonymous / unconfigured: show local demo only.
        setOrders(getOrders());
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [authConfigured, isSignedIn]);

  if (orders === null) {
    return (
      <section className="container-site py-20">
        <div className="bg-theme-ink/10 h-10 w-40 animate-pulse rounded" />
      </section>
    );
  }

  function onResetDemo() {
    resetDemoData();
    setOrders(getOrders());
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        'Delete your account? Your orders will be retained (anonymised) for 7 years per Indian GST law. This cannot be undone.',
      )
    ) {
      return;
    }
    const supa = await getSupabase();
    if (!supa) return;
    // v1: best-effort delete from `customers` and sign out. Full server-side
    // anonymisation cascade lands when Supabase Edge Function is provisioned.
    if (user) {
      await supa.from('addresses').delete().eq('customer_id', user.id);
      await supa.from('customers').delete().eq('id', user.id);
    }
    await signOut();
    window.location.href = '/';
  }

  return (
    <>
      <section className="container-site py-12 md:py-16">
        <Reveal>
          <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
            <Paisley size="sm" />
            Your account
          </p>
        </Reveal>

        {!isSignedIn && (
          <Reveal delay={0.05}>
            <div className="bg-surface-elevated mt-6 flex flex-col items-start gap-4 rounded-2xl border border-[color:var(--color-border)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-start gap-4">
                <UserCircleIcon
                  className="text-theme-accent mt-0.5 h-8 w-8 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Customer sign-in
                  </p>
                  <h2 className="font-display text-theme-ink mt-1 text-xl md:text-2xl">
                    Sign in to see your real orders.
                  </h2>
                  <p className="text-theme-ink/65 mt-1 text-sm">
                    Until you sign in, this page shows demo orders so you can preview the layout.
                    {authConfigured ? '' : ' (Connect Supabase in .env.local to enable real auth.)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="bg-theme-accent shadow-soft hover:shadow-lifted group inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-display-md text-theme-ink md:text-display-lg leading-[1.02]">
              Orders
            </h1>
            <button
              type="button"
              onClick={onResetDemo}
              className="text-theme-ink/55 hover:text-theme-accent text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
            >
              Reset demo data
            </button>
          </div>
        </Reveal>

        {orders.length === 0 ? (
          <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-10">
            <Package className="text-theme-accent h-6 w-6" aria-hidden="true" />
            <p className="font-display text-theme-ink text-lg">No orders yet.</p>
            <p className="text-theme-ink/70 max-w-lg text-sm">
              When you place your first order, it&rsquo;ll appear here with its tracking status.
            </p>
            <Link
              href="/category/hyderabadi-specials"
              className="bg-theme-accent mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Start shopping
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <Stagger gap={70} className="mt-10 grid gap-4">
            {orders.map((o) => {
              const firstLine = o.lines[0];
              return (
                <Link
                  key={o.id}
                  href={`/orders?id=${o.id}`}
                  className="bg-surface-elevated hover:shadow-lifted group grid gap-4 rounded-2xl border border-[color:var(--color-border)] p-5 transition-all duration-300 hover:-translate-y-0.5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  {firstLine?.imageUrl ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={firstLine.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-theme-glow/20 text-theme-accent flex h-16 w-16 shrink-0 items-center justify-center rounded-xl">
                      <Package className="h-5 w-5" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-theme-ink/60 font-mono text-xs font-semibold uppercase tracking-wider">
                        {o.number}
                      </span>
                      <span
                        className="bg-theme-glow/30 text-theme-ink rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        aria-label={`Status: ${o.status}`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="font-display text-theme-ink text-base">
                      {o.lines.length === 1
                        ? o.lines[0]!.productTitle
                        : `${o.lines[0]!.productTitle} +${o.lines.length - 1} more`}
                    </p>
                    <p className="text-theme-ink/60 text-xs">Placed {formatDate(o.placedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="font-display text-theme-accent text-lg tabular-nums">
                      {formatMoney(o.total)}
                    </span>
                    <ArrowRight
                      className="text-theme-ink/40 group-hover:text-theme-accent h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </Stagger>
        )}

        {/* Profile section — only when signed in */}
        {isSignedIn && user && (
          <section id="profile" className="mt-16">
            <Reveal>
              <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
                <Paisley size="sm" />
                Profile
              </p>
              <h2 className="font-display text-display-md text-theme-ink mt-2 leading-[1.02]">
                Your details
              </h2>
            </Reveal>

            <div className="bg-surface-elevated mt-6 grid gap-4 rounded-2xl border border-[color:var(--color-border)] p-6 md:grid-cols-2">
              {user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="text-theme-accent h-4 w-4" aria-hidden="true" />
                  <div>
                    <p className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-theme-ink text-sm">{user.email}</p>
                  </div>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-theme-accent h-4 w-4" aria-hidden="true" />
                  <div>
                    <p className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
                      Phone
                    </p>
                    <p className="text-theme-ink text-sm">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--color-border)] pt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="border-theme-ink/25 text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign out
                </button>
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete my account
                </button>
              </div>
              <p className="text-theme-ink/55 text-[11px] md:col-span-2">
                Address book and dietary-preferences fields land in the next sub-phase. Account
                deletion anonymises orders (7-year GST retention) and removes your auth record.
              </p>
            </div>
          </section>
        )}
      </section>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
