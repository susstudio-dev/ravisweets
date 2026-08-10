'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, LogIn, LogOut, Package, ShoppingBag, Trash2 } from 'lucide-react';
import { formatMoney } from '@ravisweets/shared';
import { getOrders } from '@/lib/orders/store';
import { resetDemoData } from '@/lib/orders/demo-seed';
import { listMyOrders } from '@/lib/supabase/orders';
import { getSupabase } from '@/lib/supabase/client';
import { useSession } from '@/lib/supabase/session-context';
import type { Order } from '@/lib/orders/types';
import { isUsableImage } from '@/lib/images';
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

/**
 * The account page in the Batch Card world: the customer's own file of
 * dockets. Orders are small sheets — order number and placed date typed in
 * Courier, the status stamped as an ink chip — and the profile is a ruled
 * label/value section. No ember here: the order model records placed /
 * packed / shipped / delivered / cancelled, none of which is a live
 * "dispatching now" state, and ember is live state only.
 */
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
      <section className="container-site section-y">
        <div className="bg-theme-ink/10 h-10 w-40 animate-pulse rounded-md" />
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
      <section className="container-site section-y">
        {!isSignedIn && (
          <Reveal>
            <div className="docket mb-10 flex flex-col items-start gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-7">
              <div>
                <p className="font-display text-theme-ink text-xl md:text-2xl">
                  Sign in to see your real orders.
                </p>
                <p className="text-theme-ink/65 mt-1 text-sm">
                  Until you sign in, this page shows demo orders so you can preview the layout.
                  {authConfigured ? '' : ' (Connect Supabase in .env.local to enable real auth.)'}
                </p>
              </div>
              <button type="button" onClick={() => setAuthOpen(true)} className="stamp shrink-0">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
              </button>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.05}>
          <div className="docket-head">
            <h1 className="font-display text-display-md text-theme-ink">Orders</h1>
            <button
              type="button"
              onClick={onResetDemo}
              className="field-label hover:text-theme-accent py-2 transition-colors"
            >
              Reset demo data
            </button>
          </div>
        </Reveal>

        {orders.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-[color:var(--color-border)] p-8 md:p-10">
            <Package className="text-theme-accent h-6 w-6" aria-hidden="true" />
            <p className="font-display text-theme-ink text-lg">No orders yet.</p>
            <p className="text-theme-ink/70 max-w-lg text-sm">
              When you place your first order, it&rsquo;ll appear here with its tracking status.
            </p>
            <Link href="/category/hyderabadi-specials" className="stamp mt-2">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Start shopping
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <Stagger gap={70} className="grid gap-4">
            {orders.map((o) => {
              const firstLine = o.lines[0];
              const thumb = firstLine?.imageUrl;
              return (
                <Link
                  key={o.id}
                  href={`/orders?id=${o.id}`}
                  className="docket group grid gap-4 p-5 transition-shadow duration-200 hover:shadow-lifted sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  {isUsableImage(thumb) ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[color:var(--color-border)]">
                      <Image src={thumb} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                  ) : (
                    /* Dead or missing image, decided at render — the specimen
                       plate on a glow wash, never a doomed request. */
                    <div
                      className="bg-theme-glow/20 flex h-16 w-16 shrink-0 items-center justify-center rounded-md"
                      aria-hidden="true"
                    >
                      <span className="border-theme-accent block h-6 w-6 rotate-45 border-2 border-dashed opacity-40" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="field-value text-theme-ink/70 text-xs">{o.number}</span>
                      <span
                        className="bg-theme-glow/30 text-theme-ink rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
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
                    <p className="text-theme-ink/60 text-xs">
                      Placed <span className="field-value">{formatDate(o.placedAt)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="field-value text-theme-ink text-base font-bold">
                      {formatMoney(o.total)}
                    </span>
                    <ArrowRight
                      className="text-theme-ink/40 group-hover:text-theme-accent h-4 w-4 transition-colors"
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
          <section id="profile" aria-labelledby="profile-heading" className="mt-16">
            <Reveal>
              <div className="docket-head">
                <h2 id="profile-heading" className="font-display text-display-md text-theme-ink">
                  Your details
                </h2>
              </div>
            </Reveal>

            <dl className="max-w-xl">
              {user.email && (
                <div className="field-row">
                  <dt className="field-label">Email</dt>
                  <dd className="field-value text-theme-ink text-sm">{user.email}</dd>
                </div>
              )}
              {user.phone && (
                <div className="field-row">
                  <dt className="field-label">Phone</dt>
                  <dd className="field-value text-theme-ink text-sm">{user.phone}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => signOut()} className="stamp stamp--ghost">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                className="inline-flex items-center gap-2 rounded-md border border-red-500/40 px-6 py-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete my account
              </button>
            </div>
            <p className="text-theme-ink/55 mt-4 max-w-xl text-[11px]">
              Address book and dietary-preferences fields land in the next sub-phase. Account
              deletion anonymises orders (7-year GST retention) and removes your auth record.
            </p>
          </section>
        )}
      </section>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
