'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  IndianRupee,
  Package,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import { useAdminOrders } from '@/lib/admin/use-admin-orders';

export function AdminDashboard() {
  const orders = useAdminOrders();
  const stats = useMemo(() => computeStats(orders ?? []), [orders]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          Today
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          Operating snapshot — refresh the page to update. Numbers are demo until Supabase lifts.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Revenue today"
          value={`₹${stats.revenueToday.toLocaleString('en-IN')}`}
          sub={`${stats.ordersToday} orders`}
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue · 7 days"
          value={`₹${stats.revenue7d.toLocaleString('en-IN')}`}
          sub={`${stats.orders7d} orders`}
        />
        <StatCard
          icon={Package}
          label="Pending fulfilment"
          value={String(stats.pending)}
          sub="Placed + packed"
          accent
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock SKUs"
          value={String(stats.lowStock.length)}
          sub={stats.lowStock.length === 0 ? 'All good' : 'Need reorder'}
          accent={stats.lowStock.length > 0}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-theme-ink">
              <Sparkles className="mr-1.5 inline h-4 w-4 text-theme-accent" aria-hidden="true" />
              Top SKUs · 7 days
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-theme-ink/65 hover:text-theme-accent"
            >
              View all <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>
          {stats.topSkus.length === 0 ? (
            <EmptyState>No order data yet.</EmptyState>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {stats.topSkus.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-[color:var(--color-border)] bg-surface px-4 py-2 text-sm"
                >
                  <span className="font-medium text-theme-ink">{s.title}</span>
                  <span className="font-mono text-theme-ink/60">
                    {s.units} units · ₹{s.revenue.toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-theme-ink">
              <Boxes className="mr-1.5 inline h-4 w-4 text-theme-accent" aria-hidden="true" />
              Low stock
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-theme-ink/65 hover:text-theme-accent"
            >
              Inventory →
            </Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <EmptyState>Nothing below threshold.</EmptyState>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {stats.lowStock.slice(0, 5).map((s) => (
                <li
                  key={s.sku}
                  className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm"
                >
                  <span className="font-medium text-theme-ink">{s.title}</span>
                  <span className="font-mono text-red-700">{s.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
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
  icon: typeof TrendingUp;
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
          : 'border-[color:var(--color-border)] bg-surface-elevated'
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
        <Icon className="h-3.5 w-3.5 text-theme-accent" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-theme-ink md:text-3xl">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-theme-ink/55">{sub}</p>}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-lg border border-dashed border-[color:var(--color-border)] p-4 text-center text-sm text-theme-ink/55">
      {children}
    </p>
  );
}

interface OrderShape {
  id: string;
  status: string;
  placedAt: number;
  total: { amount: number };
  lines: { productId: string; productTitle: string; quantity: number; lineTotal: { amount: number } }[];
}

function computeStats(orders: OrderShape[]) {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  let revenueToday = 0,
    ordersToday = 0,
    revenue7d = 0,
    orders7d = 0,
    pending = 0;
  const skuTallies = new Map<string, { id: string; title: string; units: number; revenue: number }>();

  for (const o of orders) {
    if (o.status === 'placed' || o.status === 'packed') pending++;
    if (o.placedAt >= startOfToday.getTime()) {
      revenueToday += o.total.amount;
      ordersToday++;
    }
    if (now - o.placedAt <= 7 * dayMs) {
      revenue7d += o.total.amount;
      orders7d++;
      for (const line of o.lines) {
        const t = skuTallies.get(line.productId) ?? {
          id: line.productId,
          title: line.productTitle,
          units: 0,
          revenue: 0,
        };
        t.units += line.quantity;
        t.revenue += line.lineTotal.amount;
        skuTallies.set(line.productId, t);
      }
    }
  }

  const topSkus = Array.from(skuTallies.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const lowStock = CATALOGUE.flatMap((p) =>
    p.variants
      .filter((v) => v.stock_available <= 25)
      .map((v) => ({
        sku: v.sku,
        title: `${p.title} · ${v.title}`,
        stock: v.stock_available,
      })),
  );

  return { revenueToday, ordersToday, revenue7d, orders7d, pending, topSkus, lowStock };
}
