'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Download, LayoutGrid, List, Search } from 'lucide-react';
import { useAdminOrders } from '@/lib/admin/use-admin-orders';
import { transitionOrderStatus, logAdminAction, sendOrderEmail } from '@/lib/supabase/orders';
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

const KANBAN_COLUMNS: OrderStatus[] = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'];

const COLUMN_META: Record<OrderStatus, { label: string; tint: string; ink: string }> = {
  placed: { label: 'New', tint: '#fff5d4', ink: '#a85a08' },
  packed: { label: 'Packed', tint: '#f4e4ba', ink: '#634008' },
  shipped: { label: 'In transit', tint: '#dcefe4', ink: '#1e6b3c' },
  delivered: { label: 'Delivered', tint: '#e0e8ec', ink: '#3a4a52' },
  cancelled: { label: 'Cancelled', tint: '#fbe2dc', ink: '#7c2010' },
};

/** Allowed status transitions — kanban drop zones validate against this. */
const ALLOWED_NEXT: Record<OrderStatus, OrderStatus[]> = {
  placed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

function downloadCsv(orders: Order[]) {
  const header = [
    'Order number',
    'Status',
    'Placed at',
    'Customer',
    'Email',
    'Phone',
    'Pincode',
    'City',
    'Subtotal (₹)',
    'Shipping (₹)',
    'Discount (₹)',
    'Total (₹)',
    'Items',
  ];
  const rows = orders.map((o) => [
    o.number,
    o.status,
    new Date(o.placedAt).toISOString(),
    o.address.name,
    o.address.email,
    o.address.phone,
    o.address.pincode,
    o.address.city,
    // Money.amount is integer rupees (see razorpay-order fn) — export as-is.
    o.subtotal.amount,
    o.shipping.amount,
    o.discount?.amount ?? 0,
    o.total.amount,
    o.lines.map((l) => `${l.productTitle} × ${l.quantity}`).join(' | '),
  ]);
  const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join(
    '\n',
  );
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ravi-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AdminOrders() {
  const orders = useAdminOrders() ?? [];
  const { configured } = useSession();
  const [filter, setFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'table' | 'kanban'>('kanban');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState<OrderStatus | null>(null);

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
      if (ok) {
        await logAdminAction('transition', 'order', active.id, before, after);
        void sendOrderEmail(active.id, next);
      }
    }
    setActive({ ...active, status: next });
    setBusy(false);
    // Force a refetch by mounting cycle — simplest: nudge the query state.
    setQuery((q) => q);
  }

  /** Drag-and-drop transition from kanban — same path as the drawer button. */
  async function transitionOrderById(id: string, next: OrderStatus) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    if (!ALLOWED_NEXT[order.status].includes(next)) return;
    const before = { status: order.status };
    saveOrder({ ...order, status: next });
    if (configured) {
      const ok = await transitionOrderStatus(order.id, next);
      if (ok) {
        await logAdminAction('transition', 'order', order.id, before, { status: next });
        void sendOrderEmail(order.id, next);
      }
    }
    setQuery((q) => q);
  }

  /** Bulk-advance every selected order one step (placed → packed, etc). */
  async function bulkAdvance() {
    if (selected.size === 0) return;
    if (
      !window.confirm(
        `Advance ${selected.size} orders by one step (placed→packed→shipped→delivered)?`,
      )
    )
      return;
    setBusy(true);
    for (const id of selected) {
      const o = orders.find((x) => x.id === id);
      if (!o) continue;
      const next = ALLOWED_NEXT[o.status][0];
      if (!next) continue;
      saveOrder({ ...o, status: next });
      if (configured) {
        const ok = await transitionOrderStatus(o.id, next);
        if (ok)
          await logAdminAction(
            'bulk-advance',
            'order',
            o.id,
            { status: o.status },
            { status: next },
          );
      }
    }
    setSelected(new Set());
    setBusy(false);
    setQuery((q) => q);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
            Operations
          </p>
          <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">Orders</h1>
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
                  : 'text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent border-[color:var(--color-border)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative block min-w-0 max-w-md flex-1">
          <Search
            className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by order number, customer, email, phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-surface-elevated text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-full border border-[color:var(--color-border)] px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        {/* View toggle + actions */}
        <div className="flex items-center gap-2">
          <div className="bg-surface-elevated inline-flex rounded-full border border-[color:var(--color-border)] p-0.5">
            <button
              type="button"
              onClick={() => setView('kanban')}
              aria-pressed={view === 'kanban'}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                view === 'kanban'
                  ? 'bg-theme-accent text-[color:var(--theme-base)]'
                  : 'text-theme-ink/60 hover:text-theme-ink'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                view === 'table'
                  ? 'bg-theme-accent text-[color:var(--theme-base)]'
                  : 'text-theme-ink/60 hover:text-theme-ink'
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Table
            </button>
          </div>
          <button
            type="button"
            onClick={() => downloadCsv(filtered)}
            className="text-theme-ink/75 hover:border-theme-accent hover:text-theme-accent inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk action bar — visible when one or more orders are selected */}
      {selected.size > 0 && (
        <div className="border-theme-accent/40 bg-theme-glow/15 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2 text-sm">
          <span className="text-theme-ink font-semibold">{selected.size} selected</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={bulkAdvance}
              disabled={busy}
              className="bg-theme-ink hover:bg-theme-accent rounded-full px-3 py-1 text-xs font-semibold text-[color:var(--theme-base)] transition-colors disabled:opacity-50"
            >
              Advance one step
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-theme-ink/65 hover:text-theme-ink rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {KANBAN_COLUMNS.map((col) => {
            const meta = COLUMN_META[col];
            const columnOrders = filtered.filter((o) => o.status === col);
            const isDropTarget = dragOver === col;
            return (
              <div
                key={col}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) void transitionOrderById(id, col);
                }}
                className={`flex flex-col gap-2 rounded-2xl border-2 p-3 transition-all ${
                  isDropTarget
                    ? 'border-theme-accent bg-theme-glow/15'
                    : 'bg-surface-elevated border-[color:var(--color-border)]'
                }`}
              >
                <header className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: meta.tint, color: meta.ink }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-theme-ink/55 text-xs font-semibold tabular-nums">
                    {columnOrders.length}
                  </span>
                </header>
                <ul className="flex flex-col gap-2">
                  {columnOrders.map((o) => (
                    <li
                      key={o.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', o.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => setActive(o)}
                      className="bg-surface shadow-soft hover:shadow-lifted cursor-grab rounded-xl border border-[color:var(--color-border)] p-3 text-sm transition-all hover:-translate-y-0.5 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-theme-ink truncate font-mono text-xs font-semibold">
                            {o.number}
                          </p>
                          <p className="text-theme-ink/85 truncate text-[13px]">{o.address.name}</p>
                          <p className="text-theme-ink/55 truncate text-[11px]">
                            {o.address.city} · {o.address.pincode}
                          </p>
                        </div>
                        <span className="text-theme-accent font-mono text-xs font-semibold">
                          ₹{o.total.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-theme-ink/50 mt-1.5 text-[10px] uppercase tracking-wider">
                        {new Date(o.placedAt).toLocaleDateString('en-IN')} · {o.lines.length}{' '}
                        {o.lines.length === 1 ? 'item' : 'items'}
                      </p>
                    </li>
                  ))}
                  {columnOrders.length === 0 && (
                    <li className="text-theme-ink/40 rounded-xl border border-dashed border-[color:var(--color-border)] p-3 text-center text-[11px]">
                      Drop orders here
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {view === 'table' && (
        <div className="bg-surface-elevated overflow-x-auto rounded-2xl border border-[color:var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-theme-glow/10 text-theme-ink/65 text-[11px] font-semibold uppercase tracking-wider">
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
                  <td colSpan={6} className="text-theme-ink/60 px-4 py-8 text-center text-sm">
                    No orders match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setActive(o)}
                    className="hover:bg-theme-glow/10 cursor-pointer border-t border-[color:var(--color-border)] transition-colors"
                  >
                    <td className="text-theme-ink px-4 py-3 font-mono">{o.number}</td>
                    <td className="text-theme-ink px-4 py-3">{o.address.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-theme-glow/30 text-theme-ink rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {o.status}
                      </span>
                    </td>
                    <td className="text-theme-ink/65 px-4 py-3">
                      {new Date(o.placedAt).toLocaleString('en-IN')}
                    </td>
                    <td className="text-theme-accent px-4 py-3 text-right font-mono font-semibold">
                      ₹{o.total.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="text-theme-ink/40 px-4 py-3 text-right">
                      <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <aside
          aria-labelledby="order-drawer-title"
          className="bg-surface-elevated shadow-lifted fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-[color:var(--color-border)] p-6"
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="text-theme-ink/55 hover:text-theme-accent text-xs font-semibold"
          >
            ← Close
          </button>
          <h2 id="order-drawer-title" className="font-display text-theme-ink mt-3 text-2xl">
            {active.number}
          </h2>
          <p className="text-theme-ink/65 mt-1 text-xs">
            Placed {new Date(active.placedAt).toLocaleString('en-IN')}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
                Status
              </dt>
              <dd className="font-display text-theme-ink mt-1 text-base capitalize">
                {active.status}
              </dd>
            </div>
            <div>
              <dt className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
                Payment
              </dt>
              <dd className="font-display text-theme-ink mt-1 text-base uppercase">
                {active.payment.method}
              </dd>
            </div>
          </dl>

          <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
            Address
          </h3>
          <p className="text-theme-ink/85 mt-2 text-sm">
            {active.address.name}
            <br />
            {active.address.line1}
            {active.address.line2 ? `, ${active.address.line2}` : ''}
            <br />
            {active.address.city}, {active.address.state} {active.address.pincode}
            <br />
            {active.address.phone} · {active.address.email}
          </p>

          <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
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
            <div className="text-theme-ink/65 flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">₹{active.subtotal.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-theme-ink/65 flex justify-between">
              <span>Shipping</span>
              <span className="font-mono">₹{active.shipping.amount.toLocaleString('en-IN')}</span>
            </div>
            {(active.discount?.amount ?? 0) > 0 && (
              <div className="text-theme-ink/65 flex justify-between">
                <span>Discount</span>
                <span className="font-mono">
                  −₹{(active.discount?.amount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="font-display text-theme-ink mt-2 flex justify-between text-base">
              <span>Total</span>
              <span className="text-theme-accent font-mono">
                ₹{active.total.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <ActionButton
              disabled={busy || active.status !== 'placed'}
              onClick={() => transition('packed')}
            >
              Mark as packed
            </ActionButton>
            <ActionButton
              disabled={busy || active.status !== 'packed'}
              onClick={() => transition('shipped')}
            >
              Mark as shipped
            </ActionButton>
            <ActionButton
              disabled={busy || active.status !== 'shipped'}
              onClick={() => transition('delivered')}
            >
              Mark as delivered
            </ActionButton>
            <ActionButton
              variant="danger"
              disabled={
                busy ||
                active.status === 'shipped' ||
                active.status === 'delivered' ||
                active.status === 'cancelled'
              }
              onClick={() => transition('cancelled')}
            >
              Cancel order
            </ActionButton>
          </div>
          {!configured && (
            <p className="text-theme-ink/55 mt-3 text-[11px]">
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
          : 'text-theme-ink/80 hover:border-theme-accent hover:text-theme-accent border-[color:var(--color-border)]'
      }`}
    >
      {children}
    </button>
  );
}
