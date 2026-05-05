'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, MapPin, Plus } from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import {
  STORE_LOCATIONS,
  adjustStock,
  listLocationStock,
  type StockAdjustmentReason,
  type StoreLocation,
  type VariantLocationStock,
} from '@/lib/supabase/inventory';
import { useSession } from '@/lib/supabase/session-context';

const REASON_OPTIONS: { value: StockAdjustmentReason; label: string }[] = [
  { value: 'restock', label: 'Restock — kitchen produced new batch' },
  { value: 'sale', label: 'Sale (manual entry)' },
  { value: 'transfer-in', label: 'Transfer in from another location' },
  { value: 'transfer-out', label: 'Transfer out to another location' },
  { value: 'damaged', label: 'Damaged / scrapped' },
  { value: 'expired', label: 'Expired' },
  { value: 'return', label: 'Customer return' },
  { value: 'audit-correction', label: 'Audit correction' },
];

export function AdminLocations() {
  const { configured } = useSession();
  const [rows, setRows] = useState<VariantLocationStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [variantId, setVariantId] = useState<string>('');
  const [location, setLocation] = useState<StoreLocation>('khammam-flagship');
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<StockAdjustmentReason>('restock');
  const [notes, setNotes] = useState<string>('');

  async function refresh() {
    setLoading(true);
    setRows(await listLocationStock());
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Build a (variantId, location) → on_hand map for quick lookup.
  const stockMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(`${r.variant_id}::${r.location}`, r.on_hand);
    return m;
  }, [rows]);

  // Flatten the catalogue into rows of (product, variant) pairs.
  const variants = useMemo(
    () =>
      CATALOGUE.flatMap((p) =>
        p.variants.map((v) => ({
          productTitle: p.title,
          variantTitle: v.title,
          variantId: v.id,
          sku: v.sku,
          legacyTotal: v.stock_available,
        })),
      ),
    [],
  );

  async function onAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!variantId) {
      setFeedback('Pick a variant.');
      return;
    }
    if (delta === 0) {
      setFeedback('Delta cannot be zero.');
      return;
    }
    setBusy(true);
    const r = await adjustStock({ variant_id: variantId, location, delta, reason, notes });
    setBusy(false);
    if (!r.ok) {
      setFeedback(`Save failed: ${r.reason}. Run migration 0005.`);
      return;
    }
    setFeedback(`Adjusted ${variantId} (${location}) by ${delta > 0 ? '+' : ''}${delta}.`);
    setDelta(0);
    setNotes('');
    void refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          <MapPin className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          Multi-location stock
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Stock by store.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-ink/65">
          Three counters: Khammam Flagship, Khammam Second, Kondapur. Each
          adjustment is a row in the immutable ledger so audits are clean.
        </p>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Supabase not configured — connect <code>.env.local</code>.
        </div>
      )}

      {/* Adjustment form */}
      <form onSubmit={onAdjust} className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          New stock adjustment
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
              Variant
            </span>
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            >
              <option value="">Pick a variant…</option>
              {variants.map((v) => (
                <option key={v.variantId} value={v.variantId}>
                  {v.productTitle} · {v.variantTitle} ({v.sku})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
              Location
            </span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as StoreLocation)}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            >
              {STORE_LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
              Delta (+/−)
            </span>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value) || 0)}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm font-mono"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
              Reason
            </span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as StockAdjustmentReason)}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            >
              {REASON_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent px-4 py-2 text-xs font-semibold text-[color:var(--theme-base)] disabled:opacity-50"
          >
            {delta >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            Apply adjustment
          </button>
          {feedback && <p className="text-xs text-theme-ink/70">{feedback}</p>}
        </div>
      </form>

      {/* Stock-by-location table */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          Stock by variant × location
        </h2>
        {loading ? (
          <div className="mt-3 h-12 w-32 animate-pulse rounded bg-theme-ink/10" />
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
            <table className="w-full text-sm">
              <thead className="bg-theme-glow/10 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
                <tr>
                  <th className="px-4 py-3 text-left">Product · Variant</th>
                  {STORE_LOCATIONS.map((l) => (
                    <th key={l.id} className="px-4 py-3 text-right">
                      {l.label.split(' ')[0]}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const a = stockMap.get(`${v.variantId}::khammam-flagship`) ?? 0;
                  const b = stockMap.get(`${v.variantId}::khammam-second`) ?? 0;
                  const c = stockMap.get(`${v.variantId}::kondapur`) ?? 0;
                  const total = a + b + c;
                  return (
                    <tr key={v.variantId} className="border-t border-[color:var(--color-border)]">
                      <td className="px-4 py-2 text-theme-ink">
                        <p className="font-medium">{v.productTitle}</p>
                        <p className="text-[11px] text-theme-ink/55">{v.variantTitle}</p>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{a}</td>
                      <td className="px-4 py-2 text-right font-mono">{b}</td>
                      <td className="px-4 py-2 text-right font-mono">{c}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11px] text-theme-ink/55">
          <Plus className="mr-1 inline h-3 w-3" /> stock is added via the adjustment
          form above. Phase D moves checkout-driven decrements server-side.
        </p>
      </section>
    </div>
  );
}
