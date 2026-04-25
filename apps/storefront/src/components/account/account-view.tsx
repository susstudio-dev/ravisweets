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
        <div className="h-10 w-40 animate-pulse rounded bg-theme-ink/10" />
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
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <Paisley size="sm" />
            Your account
          </p>
        </Reveal>

        {!isSignedIn && (
          <Reveal delay={0.05}>
            <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-start gap-4">
                <UserCircleIcon className="mt-0.5 h-8 w-8 shrink-0 text-theme-accent" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
                    Customer sign-in
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-theme-ink md:text-2xl">
                    Sign in to see your real orders.
                  </h2>
                  <p className="mt-1 text-sm text-theme-ink/65">
                    Until you sign in, this page shows demo orders so you can preview the layout.
                    {authConfigured ? '' : ' (Connect Supabase in .env.local to enable real auth.)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-theme-accent px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
              Orders
            </h1>
            <button
              type="button"
              onClick={onResetDemo}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/55 transition-colors hover:text-theme-accent"
            >
              Reset demo data
            </button>
          </div>
        </Reveal>

        {orders.length === 0 ? (
          <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-10">
            <Package className="h-6 w-6 text-theme-accent" aria-hidden="true" />
            <p className="font-display text-lg font-semibold text-theme-ink">No orders yet.</p>
            <p className="max-w-lg text-sm text-theme-ink/70">
              When you place your first order, it&rsquo;ll appear here with its tracking status.
            </p>
            <Link
              href="/category/hyderabadi-specials"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)]"
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
                  className="group grid gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted sm:grid-cols-[auto_1fr_auto] sm:items-center"
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
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-theme-glow/20 text-theme-accent">
                      <Package className="h-5 w-5" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
                        {o.number}
                      </span>
                      <span
                        className="rounded-full bg-theme-glow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-ink"
                        aria-label={`Status: ${o.status}`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="font-display text-base font-semibold text-theme-ink">
                      {o.lines.length === 1
                        ? o.lines[0]!.productTitle
                        : `${o.lines[0]!.productTitle} +${o.lines.length - 1} more`}
                    </p>
                    <p className="text-xs text-theme-ink/60">Placed {formatDate(o.placedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="font-display text-lg font-semibold text-theme-accent tabular-nums">
                      {formatMoney(o.total)}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-theme-ink/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-theme-accent"
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
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
                <Paisley size="sm" />
                Profile
              </p>
              <h2 className="mt-2 font-display text-display-md leading-[1.02] text-theme-ink">
                Your details
              </h2>
            </Reveal>

            <div className="mt-6 grid gap-4 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-6 md:grid-cols-2">
              {user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-theme-accent" aria-hidden="true" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                      Email
                    </p>
                    <p className="text-sm text-theme-ink">{user.email}</p>
                  </div>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-theme-accent" aria-hidden="true" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                      Phone
                    </p>
                    <p className="text-sm text-theme-ink">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="md:col-span-2 flex flex-wrap items-center gap-3 border-t border-[color:var(--color-border)] pt-4">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-2 rounded-full border border-theme-ink/25 px-4 py-2 text-xs font-semibold text-theme-ink/85 transition-colors hover:border-theme-accent hover:text-theme-accent"
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
              <p className="md:col-span-2 text-[11px] text-theme-ink/55">
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
