'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  IndianRupee,
  Package,
  Sparkles,
  TrendingUp,
  Users,
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

      {/* KPI strip — 8 cards in two rows of 4 on xl, stacked on mobile. */}
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
          sub={`${stats.orders7d} orders · ${stats.deltaPctVsPrev7d}`}
        />
        <StatCard
          icon={BarChart3}
          label="Revenue · 30 days"
          value={`₹${stats.revenue30d.toLocaleString('en-IN')}`}
          sub={`${stats.orders30d} orders`}
        />
        <StatCard
          icon={Sparkles}
          label="Avg order value"
          value={`₹${stats.aov.toLocaleString('en-IN')}`}
          sub={stats.orders30d > 0 ? '30-day basis' : 'Awaiting orders'}
        />
        <StatCard
          icon={Package}
          label="Pending fulfilment"
          value={String(stats.pending)}
          sub="Placed + packed"
          accent
        />
        <StatCard
          icon={Users}
          label="Repeat-rate · 90d"
          value={`${stats.repeatRate}%`}
          sub={`${stats.repeatBuyers} of ${stats.uniqueBuyers90d} customers`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock SKUs"
          value={String(stats.lowStock.length)}
          sub={stats.lowStock.length === 0 ? 'All good' : 'Need reorder'}
          accent={stats.lowStock.length > 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Carts not converted"
          value={String(stats.cancelled30d)}
          sub="Cancelled · 30 days"
        />
      </div>

      {/* Sparkline — last 14 days revenue */}
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-theme-ink">
            <BarChart3 className="mr-1.5 inline h-4 w-4 text-theme-accent" aria-hidden="true" />
            Revenue · last 14 days
          </h2>
          <p className="text-xs font-semibold text-theme-ink/55">
            Peak ₹{stats.peakDay.toLocaleString('en-IN')}
          </p>
        </div>
        <Sparkline points={stats.spark14d} />
      </section>

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
  address?: { email?: string };
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
    revenuePrev7d = 0,
    revenue30d = 0,
    orders30d = 0,
    pending = 0,
    cancelled30d = 0;
  const skuTallies = new Map<string, { id: string; title: string; units: number; revenue: number }>();
  const buyers30d = new Map<string, number>(); // email → order count
  const dailyRevenue = new Map<string, number>(); // YYYY-MM-DD → paise

  for (const o of orders) {
    if (o.status === 'placed' || o.status === 'packed') pending++;

    if (o.placedAt >= startOfToday.getTime()) {
      revenueToday += o.total.amount;
      ordersToday++;
    }

    const ageMs = now - o.placedAt;

    if (ageMs <= 7 * dayMs) {
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
    } else if (ageMs <= 14 * dayMs) {
      revenuePrev7d += o.total.amount;
    }

    if (ageMs <= 30 * dayMs) {
      revenue30d += o.total.amount;
      orders30d++;
      if (o.status === 'cancelled') cancelled30d++;
      const email = o.address?.email?.toLowerCase();
      if (email) buyers30d.set(email, (buyers30d.get(email) ?? 0) + 1);
    }

    if (ageMs <= 14 * dayMs) {
      const day = new Date(o.placedAt).toISOString().slice(0, 10);
      dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + o.total.amount);
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

  // 14-day spark — fill missing days with 0 so the line shows true gaps.
  const spark14d: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * dayMs);
    const key = d.toISOString().slice(0, 10);
    spark14d.push(Math.round((dailyRevenue.get(key) ?? 0) / 100));
  }
  const peakDay = spark14d.length > 0 ? Math.max(...spark14d) : 0;

  // AOV — 30-day basis (more stable than 7d for low-volume).
  const aov = orders30d > 0 ? Math.round(revenue30d / orders30d) : 0;

  // Repeat-rate — % of distinct buyers in last 90d who have 2+ orders.
  // Reuses the 30-day buyer map for simplicity (Phase D upgrades to 90d).
  const uniqueBuyers90d = buyers30d.size;
  const repeatBuyers = Array.from(buyers30d.values()).filter((n) => n >= 2).length;
  const repeatRate =
    uniqueBuyers90d > 0 ? Math.round((repeatBuyers * 100) / uniqueBuyers90d) : 0;

  // Δ vs prior 7d for the headline 7-day revenue card.
  const deltaPctVsPrev7d =
    revenuePrev7d > 0
      ? `${revenue7d >= revenuePrev7d ? '+' : ''}${Math.round(((revenue7d - revenuePrev7d) * 100) / revenuePrev7d)}% vs prior 7d`
      : 'New baseline';

  return {
    revenueToday,
    ordersToday,
    revenue7d,
    orders7d,
    revenue30d,
    orders30d,
    pending,
    cancelled30d,
    aov,
    repeatBuyers,
    uniqueBuyers90d,
    repeatRate,
    deltaPctVsPrev7d,
    spark14d,
    peakDay,
    topSkus,
    lowStock,
  };
}

/**
 * Inline sparkline — pure SVG, no chart deps. Each point is one day.
 * The line is drawn as a polyline; an area fill underneath uses the
 * theme accent at 18% opacity.
 */
function Sparkline({ points }: { points: number[] }) {
  if (points.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-theme-ink/55">
        No order data in the last 14 days.
      </p>
    );
  }
  const w = 720;
  const h = 120;
  const pad = 8;
  const max = Math.max(...points, 1);
  const stepX = (w - pad * 2) / Math.max(1, points.length - 1);
  const polyline = points
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((v / max) * (h - pad * 2));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${pad},${h - pad} ${polyline} ${(pad + (points.length - 1) * stepX).toFixed(1)},${h - pad}`;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" role="img" aria-label="Revenue trend">
        <polygon points={area} fill="var(--theme-accent)" opacity="0.16" />
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--theme-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((v, i) => {
          const x = pad + i * stepX;
          const y = h - pad - ((v / max) * (h - pad * 2));
          return (
            <circle key={i} cx={x} cy={y} r={v === max ? 3.5 : 2} fill="var(--theme-accent)" />
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] font-mono text-theme-ink/45">
        <span>14 days ago</span>
        <span>today</span>
      </div>
    </div>
  );
}
