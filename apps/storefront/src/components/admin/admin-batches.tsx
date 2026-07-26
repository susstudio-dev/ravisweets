'use client';

import { useEffect, useMemo, useState } from 'react';
import { Beaker, Plus } from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import {
  STORE_LOCATIONS,
  createBatch,
  listBatches,
  type ProductBatch,
  type StoreLocation,
} from '@/lib/supabase/inventory';
import { useSession } from '@/lib/supabase/session-context';

/** Returns a fresh ISO date in `YYYY-MM-DD` form, optionally offset by N days. */
function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function AdminBatches() {
  const { configured } = useSession();
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [variantId, setVariantId] = useState<string>('');
  const [lotNumber, setLotNumber] = useState<string>('');
  const [madeOn, setMadeOn] = useState<string>(isoDate(0));
  const [expiresOn, setExpiresOn] = useState<string>(isoDate(15));
  const [quantity, setQuantity] = useState<number>(50);
  const [location, setLocation] = useState<StoreLocation>('khammam-flagship');
  const [notes, setNotes] = useState<string>('');

  const variants = useMemo(
    () =>
      CATALOGUE.flatMap((p) =>
        p.variants.map((v) => ({
          productTitle: p.title,
          variantTitle: v.title,
          variantId: v.id,
          sku: v.sku,
          shelfLifeDays: p.shelf_life_days,
        })),
      ),
    [],
  );

  async function refresh() {
    setLoading(true);
    setBatches(await listBatches());
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  // When a variant is picked, auto-set the expires_on to made_on + shelf_life.
  useEffect(() => {
    const v = variants.find((x) => x.variantId === variantId);
    if (!v) return;
    const made = new Date(madeOn);
    made.setDate(made.getDate() + v.shelfLifeDays);
    setExpiresOn(made.toISOString().slice(0, 10));
  }, [variantId, madeOn, variants]);

  // Auto-suggest a lot number when the variant is picked.
  useEffect(() => {
    if (!variantId || lotNumber) return;
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    setLotNumber(`${variantId.slice(-6).toUpperCase()}-${stamp}`);
  }, [variantId, lotNumber]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!variantId) return setFeedback('Pick a variant.');
    if (!lotNumber.trim()) return setFeedback('Lot number is required.');
    if (quantity <= 0) return setFeedback('Quantity must be > 0.');
    setBusy(true);
    const r = await createBatch({
      variant_id: variantId,
      lot_number: lotNumber.trim(),
      made_on: madeOn,
      expires_on: expiresOn,
      quantity,
      location,
      notes,
    });
    setBusy(false);
    if (!r.ok) {
      setFeedback(`Save failed: ${r.reason}. Run migration 0005.`);
      return;
    }
    setFeedback(`Batch ${lotNumber} created.`);
    setLotNumber('');
    setNotes('');
    void refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Beaker className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          Batches
        </p>
        <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">
          Kitchen production log.
        </h1>
        <p className="text-theme-ink/65 mt-2 max-w-2xl text-sm">
          Every kitchen run is a batch with a lot number, made-on, and expires-on. Phase D adds FIFO
          order picking — orders consume from the oldest batch first. For now this is the FSSAI
          audit log.
        </p>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Supabase not configured — connect <code>.env.local</code>.
        </div>
      )}

      <form
        onSubmit={onCreate}
        className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5"
      >
        <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
          Log a new batch
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Variant
            </span>
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm"
            >
              <option value="">Pick a variant…</option>
              {variants.map((v) => (
                <option key={v.variantId} value={v.variantId}>
                  {v.productTitle} · {v.variantTitle}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Lot number
            </span>
            <input
              type="text"
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              placeholder="auto"
              className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Made on
            </span>
            <input
              type="date"
              value={madeOn}
              onChange={(e) => setMadeOn(e.target.value)}
              className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Expires on
            </span>
            <input
              type="date"
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
              className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Quantity
            </span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Location
            </span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as StoreLocation)}
              className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm"
            >
              {STORE_LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-3">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kitchen team note (e.g. 'extra cardamom this batch')"
              className="bg-surface rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="bg-theme-accent inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[color:var(--theme-base)] disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Log batch
          </button>
          {feedback && <p className="text-theme-ink/70 text-xs">{feedback}</p>}
        </div>
      </form>

      {/* Batch list — sorted by expiry */}
      <section>
        <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
          All batches (FIFO order — soonest expiry first)
        </h2>
        {loading ? (
          <div className="bg-theme-ink/10 mt-3 h-12 w-32 animate-pulse rounded" />
        ) : batches.length === 0 ? (
          <p className="text-theme-ink/55 mt-3 rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm">
            No batches logged yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {batches.map((b) => {
              const remaining = Math.max(0, b.quantity - b.consumed);
              const daysToExpiry = Math.round(
                (new Date(b.expires_on).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
              );
              const expiringSoon = daysToExpiry <= 3;
              return (
                <li
                  key={b.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
                    expiringSoon
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'bg-surface-elevated border-[color:var(--color-border)]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-theme-ink font-mono text-xs font-semibold">{b.lot_number}</p>
                    <p className="text-theme-ink/65 text-[11px]">
                      {b.variant_id} · {b.location}
                    </p>
                    <p className="text-theme-ink/55 mt-1 text-[11px]">
                      Made {b.made_on} · Expires {b.expires_on}
                      {expiringSoon && (
                        <span className="ml-1 font-semibold text-red-700">
                          · {daysToExpiry <= 0 ? 'expired' : `${daysToExpiry}d left`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-theme-ink font-mono text-base font-semibold">{remaining}</p>
                    <p className="text-theme-ink/55 text-[10px] uppercase tracking-wider">
                      of {b.quantity}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
