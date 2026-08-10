'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Download,
  FlaskConical,
  Hourglass,
  IndianRupee,
  Search,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { useSession } from '@/lib/supabase/session-context';
import type { OrderStatus, PaymentMethod } from '@/lib/orders/types';

/** The `payment` jsonb on an orders row — see supabase/functions/razorpay-order. */
interface PaymentBlob {
  method?: PaymentMethod;
  reference?: string;
  provider?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  paid_at?: string;
}

interface PaymentRow {
  id: string;
  number: string;
  status: OrderStatus;
  payment: PaymentBlob | null;
  discount: number;
  // Integer RUPEES, not paise (see razorpay-order fn header). Never ÷100.
  total: number;
  placed_at: string;
  address_snapshot: { name?: string; email?: string; phone?: string } | null;
}

type PaymentState = 'captured' | 'cod' | 'unpaid' | 'simulated';

const FILTER_OPTIONS: ('all' | PaymentState)[] = ['all', 'captured', 'cod', 'unpaid', 'simulated'];

const STATE_META: Record<PaymentState, { label: string; tint: string; ink: string }> = {
  captured: { label: 'Captured', tint: '#dcefe4', ink: '#1e6b3c' },
  cod: { label: 'COD', tint: '#fff5d4', ink: '#a85a08' },
  unpaid: { label: 'Unpaid', tint: '#fbe2dc', ink: '#7c2010' },
  simulated: { label: 'Simulated', tint: '#e0e8ec', ink: '#3a4a52' },
};

/** razorpay_payment_id is only ever written after signature verification. */
function paymentState(row: PaymentRow): PaymentState {
  const p = row.payment ?? {};
  if (p.razorpay_payment_id) return 'captured';
  if (p.method === 'cod') return 'cod';
  // Every committed order carries a `sim_` placeholder reference from the moment
  // it is placed (checkout-flow writes it BEFORE any payment attempt), so the
  // prefix alone cannot distinguish demo checkouts from real unpaid orders. An
  // online method with no verified capture is genuinely unpaid.
  if (p.method) return 'unpaid';
  if (p.reference?.startsWith('sim_')) return 'simulated';
  return 'unpaid';
}

function downloadCsv(rows: PaymentRow[]) {
  const header = [
    'Order number',
    'Order status',
    'Payment state',
    'Method',
    'Reference',
    'Razorpay payment id',
    'Paid/Placed at',
    'Customer',
    'Email',
    'Discount (₹)',
    'Total (₹)',
  ];
  const body = rows.map((r) => [
    r.number,
    r.status,
    paymentState(r),
    r.payment?.method ?? '',
    r.payment?.reference ?? '',
    r.payment?.razorpay_payment_id ?? '',
    new Date(r.payment?.paid_at ?? r.placed_at).toISOString(),
    r.address_snapshot?.name ?? '',
    r.address_snapshot?.email ?? '',
    r.discount,
    r.total,
  ]);
  const escape = (v: unknown) => {
    const s = String(v);
    // Neutralise spreadsheet formula injection: customer-controlled fields
    // (name, email, reference) opening with =, +, -, @, tab or CR would
    // otherwise execute as formulas in Excel/Sheets.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [header.map(escape).join(','), ...body.map((r) => r.map(escape).join(','))].join(
    '\n',
  );
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ravi-payments-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AdminPayments() {
  const { configured, user, role } = useSession();
  const [rows, setRows] = useState<PaymentRow[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!configured || !user || role !== 'admin') {
        setRows([]);
        return;
      }
      const supa = await getSupabase();
      if (!supa) {
        setRows([]);
        return;
      }
      const { data, error } = await supa
        .from('orders')
        .select('id, number, status, payment, discount, total, placed_at, address_snapshot')
        .order('placed_at', { ascending: false })
        .limit(500);
      if (cancelled) return;
      setRows(error || !data ? [] : (data as PaymentRow[]));
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [configured, user, role]);

  const payments = useMemo(() => rows ?? [], [rows]);

  const stats = useMemo(() => {
    let capturedSum = 0,
      capturedCount = 0,
      codSum = 0,
      codCount = 0,
      unpaidCount = 0,
      simulatedCount = 0;
    for (const r of payments) {
      const state = paymentState(r);
      if (state === 'captured') {
        capturedSum += r.total;
        capturedCount++;
      } else if (state === 'cod') {
        // Cancelled COD orders will never be collected — keep them out of the sum.
        if (r.status !== 'cancelled') {
          codSum += r.total;
          codCount++;
        }
      } else if (state === 'unpaid') {
        // A cancelled unpaid order is closed, not awaited — mirror the COD rule.
        if (r.status !== 'cancelled') unpaidCount++;
      } else {
        simulatedCount++;
      }
    }
    return { capturedSum, capturedCount, codSum, codCount, unpaidCount, simulatedCount };
  }, [payments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments
      .filter((r) => filter === 'all' || paymentState(r) === filter)
      .filter((r) =>
        q
          ? r.number.toLowerCase().includes(q) ||
            (r.address_snapshot?.name ?? '').toLowerCase().includes(q) ||
            (r.payment?.reference ?? '').toLowerCase().includes(q) ||
            (r.payment?.razorpay_payment_id ?? '').toLowerCase().includes(q) ||
            (r.payment?.razorpay_order_id ?? '').toLowerCase().includes(q)
          : true,
      );
  }, [payments, filter, query]);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
            Revenue
          </p>
          <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">Payments</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === s
                  ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                  : 'text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent border-[color:var(--color-border)]'
              }`}
            >
              {s === 'all' ? 'All' : STATE_META[s].label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Captured"
          value={`₹${stats.capturedSum.toLocaleString('en-IN')}`}
          sub={`${stats.capturedCount} ${stats.capturedCount === 1 ? 'payment' : 'payments'}`}
        />
        <StatCard
          icon={Banknote}
          label="COD to collect"
          value={`₹${stats.codSum.toLocaleString('en-IN')}`}
          sub={`${stats.codCount} ${stats.codCount === 1 ? 'order' : 'orders'} · excludes cancelled`}
        />
        <StatCard
          icon={Hourglass}
          label="Awaiting online"
          value={String(stats.unpaidCount)}
          sub="No capture recorded"
          accent={stats.unpaidCount > 0}
        />
        <StatCard
          icon={FlaskConical}
          label="Simulated"
          value={String(stats.simulatedCount)}
          sub="Demo checkouts"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative block min-w-0 max-w-md flex-1">
          <Search
            className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by order number, customer, reference, razorpay id…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-surface-elevated text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-full border border-[color:var(--color-border)] px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
          />
        </label>
        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          className="text-theme-ink/75 hover:border-theme-accent hover:text-theme-accent inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-semibold transition-colors"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <div className="bg-surface-elevated overflow-x-auto rounded-2xl border border-[color:var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-theme-glow/10 text-theme-ink/65 text-[11px] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Method</th>
              <th className="px-4 py-3 text-left">State</th>
              <th className="px-4 py-3 text-left">Reference</th>
              <th className="px-4 py-3 text-left">Paid / Placed</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-theme-ink/60 px-4 py-8 text-center text-sm">
                  No payments match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const state = paymentState(r);
                const meta = STATE_META[state];
                const reference = r.payment?.reference ?? '—';
                return (
                  <tr
                    key={r.id}
                    className={`border-t border-[color:var(--color-border)] transition-colors hover:bg-theme-glow/10 ${
                      r.status === 'cancelled' ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-theme-ink font-mono">{r.number}</span>
                      {r.status === 'cancelled' && (
                        <span className="text-theme-ink/45 block text-[10px] uppercase tracking-wider">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="text-theme-ink px-4 py-3">{r.address_snapshot?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-theme-glow/30 text-theme-ink rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {r.payment?.method ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: meta.tint, color: meta.ink }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        title={reference}
                        className="text-theme-ink/75 block max-w-[160px] truncate font-mono text-xs"
                      >
                        {reference}
                      </span>
                    </td>
                    <td className="text-theme-ink/65 px-4 py-3">
                      {new Date(r.payment?.paid_at ?? r.placed_at).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-theme-accent font-mono font-semibold">
                        ₹{r.total.toLocaleString('en-IN')}
                      </span>
                      {r.discount > 0 && (
                        <span className="text-theme-ink/45 block font-mono text-[10px]">
                          −₹{r.discount.toLocaleString('en-IN')} coupon
                        </span>
                      )}
                    </td>
                    <td className="text-theme-ink/40 px-4 py-3 text-right">
                      <Link
                        href="/admin/orders"
                        aria-label={`Open order ${r.number} in Orders`}
                        className="hover:text-theme-accent inline-flex"
                      >
                        <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!configured && (
        <p className="text-theme-ink/55 text-[11px]">
          Supabase is not configured — payments read live from the <code>orders</code> table&apos;s{' '}
          <code>payment</code> jsonb once it is.
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: typeof IndianRupee;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? 'border-theme-accent/30 bg-theme-glow/15'
          : 'bg-surface-elevated border-[color:var(--color-border)]'
      }`}
    >
      <div className="text-theme-ink/55 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        <Icon className="text-theme-accent h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="font-display text-theme-ink mt-2 text-2xl md:text-3xl">{value}</p>
      {sub && <p className="text-theme-ink/55 mt-0.5 text-xs">{sub}</p>}
    </div>
  );
}
