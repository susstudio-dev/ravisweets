'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useAdminOrders } from '@/lib/admin/use-admin-orders';
import { transitionOrderStatus, logAdminAction } from '@/lib/supabase/orders';
import { saveOrder } from '@/lib/orders/store';
import { useSession } from '@/lib/supabase/session-context';
import type { Order, OrderStatus } from '@/lib/orders/types';

const STATUS_OPTIONS: ('all' | OrderStatus)[] = [
  'all',
  'placed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

export function AdminOrders() {
  const orders = useAdminOrders() ?? [];
  const { configured } = useSession();
  const [filter, setFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return orders
      .filter((o) => filter === 'all' || o.status === filter)
      .filter((o) =>
        query.trim()
          ? o.number.toLowerCase().includes(query.toLowerCase()) ||
            o.address.name.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .sort((a, b) => b.placedAt - a.placedAt);
  }, [orders, filter, query]);

  async function transition(next: OrderStatus) {
    if (!active) return;
    if (active.status === 'shipped' && next === 'cancelled') {
      window.alert('Cannot cancel an order that has already shipped.');
      return;
    }
    setBusy(true);
    const before = { status: active.status };
    const after = { status: next };
    // Always update local mirror first so the drawer reflects immediately.
    saveOrder({ ...active, status: next });
    if (configured) {
      const ok = await transitionOrderStatus(active.id, next);
      if (ok) await logAdminAction('transition', 'order', active.id, before, after);
    }
    setActive({ ...active, status: next });
    setBusy(false);
    // Force a refetch by mounting cycle — simplest: nudge the query state.
    setQuery((q) => q);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
            Operations
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
            Orders
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === s
                  ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                  : 'border-[color:var(--color-border)] text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <label className="relative block max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-ink/40"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search by order number or customer name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-[color:var(--color-border)] bg-surface-elevated px-9 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
        />
      </label>

      <div className="overflow-x-auto rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
        <table className="w-full text-sm">
          <thead className="bg-theme-glow/10 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Placed</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-theme-ink/60">
                  No orders match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setActive(o)}
                  className="cursor-pointer border-t border-[color:var(--color-border)] transition-colors hover:bg-theme-glow/10"
                >
                  <td className="px-4 py-3 font-mono text-theme-ink">{o.number}</td>
                  <td className="px-4 py-3 text-theme-ink">{o.address.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-theme-glow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-ink">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-theme-ink/65">
                    {new Date(o.placedAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-theme-accent">
                    ₹{o.total.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-theme-ink/40">
                    <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <aside
          aria-labelledby="order-drawer-title"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-lifted"
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="text-xs font-semibold text-theme-ink/55 hover:text-theme-accent"
          >
            ← Close
          </button>
          <h2 id="order-drawer-title" className="mt-3 font-display text-2xl font-semibold text-theme-ink">
            {active.number}
          </h2>
          <p className="mt-1 text-xs text-theme-ink/65">
            Placed {new Date(active.placedAt).toLocaleString('en-IN')}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                Status
              </dt>
              <dd className="mt-1 font-display text-base font-semibold capitalize text-theme-ink">
                {active.status}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                Payment
              </dt>
              <dd className="mt-1 font-display text-base font-semibold uppercase text-theme-ink">
                {active.payment.method}
              </dd>
            </div>
          </dl>

          <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Address
          </h3>
          <p className="mt-2 text-sm text-theme-ink/85">
            {active.address.name}
            <br />
            {active.address.line1}
            {active.address.line2 ? `, ${active.address.line2}` : ''}
            <br />
            {active.address.city}, {active.address.state} {active.address.pincode}
            <br />
            {active.address.phone} · {active.address.email}
          </p>

          <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Items
          </h3>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {active.lines.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span>
                  {l.productTitle} <span className="text-theme-ink/55">· {l.variantTitle}</span>
                </span>
                <span className="font-mono">
                  × {l.quantity} · ₹{l.lineTotal.amount.toLocaleString('en-IN')}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-[color:var(--color-border)] pt-4 text-sm">
            <div className="flex justify-between text-theme-ink/65">
              <span>Subtotal</span>
              <span className="font-mono">₹{active.subtotal.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-theme-ink/65">
              <span>Shipping</span>
              <span className="font-mono">₹{active.shipping.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 flex justify-between font-display text-base font-semibold text-theme-ink">
              <span>Total</span>
              <span className="font-mono text-theme-accent">
                ₹{active.total.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <ActionButton disabled={busy || active.status !== 'placed'} onClick={() => transition('packed')}>
              Mark as packed
            </ActionButton>
            <ActionButton disabled={busy || active.status !== 'packed'} onClick={() => transition('shipped')}>
              Mark as shipped
            </ActionButton>
            <ActionButton disabled={busy || active.status !== 'shipped'} onClick={() => transition('delivered')}>
              Mark as delivered
            </ActionButton>
            <ActionButton
              variant="danger"
              disabled={busy || active.status === 'shipped' || active.status === 'delivered' || active.status === 'cancelled'}
              onClick={() => transition('cancelled')}
            >
              Cancel order
            </ActionButton>
          </div>
          {!configured && (
            <p className="mt-3 text-[11px] text-theme-ink/55">
              Connected to localStorage demo orders. When Supabase is configured, transitions also
              persist to the <code>orders</code> table and write to <code>audit_log</code>.
            </p>
          )}
        </aside>
      )}
    </div>
  );
}

function ActionButton({
  children,
  variant = 'default',
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === 'danger'
          ? 'border-red-500/40 text-red-700 hover:bg-red-500/10'
          : 'border-[color:var(--color-border)] text-theme-ink/80 hover:border-theme-accent hover:text-theme-accent'
      }`}
    >
      {children}
    </button>
  );
}
