'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { DEMO_COUPONS } from '@/lib/coupons/validate';
import {
  deleteCoupon,
  listCoupons,
  setCouponActive,
  upsertCoupon,
} from '@/lib/supabase/coupons';
import { logAdminAction } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';
import type { Coupon, CouponTarget, CouponType } from '@/lib/coupons/types';

const TYPE_OPTIONS: CouponType[] = ['percent', 'flat', 'free_shipping', 'bogo'];
const TARGET_OPTIONS: CouponTarget[] = ['cart', 'collection', 'product', 'hamper'];

function emptyCoupon(): Coupon {
  return {
    code: '',
    type: 'percent',
    value: 10,
    targetScope: 'cart',
    constraints: {},
    validFrom: new Date().toISOString(),
    stackable: false,
    priority: 10,
    active: true,
  };
}

export function AdminCoupons() {
  const { configured } = useSession();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    if (configured) {
      const live = await listCoupons();
      // Surface demo set when DB is empty so admins can see the full UX.
      setCoupons(live.length > 0 ? live : DEMO_COUPONS);
    } else {
      setCoupons(DEMO_COUPONS);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  async function save(next: Coupon) {
    if (!configured) {
      window.alert('Supabase not configured — saves require backend.');
      return;
    }
    const r = await upsertCoupon(next);
    if (!r.ok) {
      window.alert(`Save failed: ${r.reason}`);
      return;
    }
    await logAdminAction('upsert', 'coupon', next.code, null, next);
    setCreating(false);
    setEditing(null);
    await load();
  }

  async function toggleActive(c: Coupon) {
    if (!configured) return;
    const ok = await setCouponActive(c.code, !c.active);
    if (ok) {
      await logAdminAction('toggle-active', 'coupon', c.code, { active: c.active }, { active: !c.active });
      await load();
    }
  }

  async function remove(c: Coupon) {
    if (!configured) return;
    if (!window.confirm(`Delete coupon ${c.code}? This cannot be undone.`)) return;
    const ok = await deleteCoupon(c.code);
    if (ok) {
      await logAdminAction('delete', 'coupon', c.code, c, null);
      await load();
    }
  }

  if (!coupons) {
    return <div className="h-8 w-32 animate-pulse rounded bg-theme-ink/10" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
            Discounts
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
            Coupons
          </h1>
          <p className="mt-1 text-sm text-theme-ink/65">
            {configured
              ? 'Live from Supabase. Saves trigger an audit log entry. Cart UX picks up changes on next page load.'
              : 'Showing demo set. Connect Supabase to manage real coupons.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          disabled={!configured}
          className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New coupon
        </button>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
        <table className="w-full text-sm">
          <thead className="bg-theme-glow/10 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-left">Target</th>
              <th className="px-4 py-3 text-left">Constraints</th>
              <th className="px-4 py-3 text-left">Window</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr
                key={c.code}
                className="border-t border-[color:var(--color-border)] hover:bg-theme-glow/10"
              >
                <td className="px-4 py-3 font-mono font-semibold text-theme-ink">{c.code}</td>
                <td className="px-4 py-3 capitalize text-theme-ink/65">
                  {c.type.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3 text-right font-mono text-theme-ink">
                  {c.type === 'percent'
                    ? `${c.value}%${c.maxDiscountCap ? ` (cap ₹${c.maxDiscountCap / 100})` : ''}`
                    : c.type === 'flat'
                    ? `₹${c.value / 100}`
                    : c.type === 'free_shipping'
                    ? 'Free shipping'
                    : 'BOGO'}
                </td>
                <td className="px-4 py-3 capitalize text-theme-ink/65">{c.targetScope}</td>
                <td className="px-4 py-3 text-xs text-theme-ink/65">
                  {[
                    c.constraints.minSubtotal && `Min ₹${c.constraints.minSubtotal / 100}`,
                    c.constraints.firstOrderOnly && 'First order',
                    c.constraints.regions?.join(','),
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-theme-ink/65">
                  {new Date(c.validFrom).toLocaleDateString('en-IN')}
                  {c.validTo && ` → ${new Date(c.validTo).toLocaleDateString('en-IN')}`}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    disabled={!configured}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed ${
                      c.active
                        ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25'
                        : 'bg-theme-ink/10 text-theme-ink/55 hover:bg-theme-ink/15'
                    }`}
                  >
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    aria-label={`Edit ${c.code}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    disabled={!configured}
                    aria-label={`Toggle ${c.code}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-accent disabled:opacity-30"
                  >
                    <Power className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    disabled={!configured}
                    aria-label={`Delete ${c.code}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-theme-ink/55 hover:bg-red-500/10 hover:text-red-700 disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <CouponForm
          initial={editing ?? emptyCoupon()}
          isNew={creating}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}

function CouponForm({
  initial,
  isNew,
  onCancel,
  onSave,
}: {
  initial: Coupon;
  isNew: boolean;
  onCancel: () => void;
  onSave: (c: Coupon) => Promise<void> | void;
}) {
  const [c, setC] = useState<Coupon>(initial);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof Coupon>(key: K, value: Coupon[K]) {
    setC((prev) => ({ ...prev, [key]: value }));
  }

  function updateConstraints<K extends keyof Coupon['constraints']>(
    key: K,
    value: Coupon['constraints'][K],
  ) {
    setC((prev) => ({ ...prev, constraints: { ...prev.constraints, [key]: value } }));
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-form-title"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-lifted"
    >
      <div className="flex items-center justify-between">
        <h2 id="coupon-form-title" className="font-display text-2xl font-semibold text-theme-ink">
          {isNew ? 'New coupon' : `Edit ${c.code}`}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="rounded-full p-1.5 text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!c.code.trim()) return;
          setBusy(true);
          await onSave({ ...c, code: c.code.trim().toUpperCase() });
          setBusy(false);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code">
            <input
              type="text"
              required
              disabled={!isNew}
              placeholder="DIWALI500"
              value={c.code}
              onChange={(e) => update('code', e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 font-mono text-sm uppercase text-theme-ink placeholder:text-theme-ink/40 disabled:opacity-60 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Type">
            <select
              value={c.type}
              onChange={(e) => update('type', e.target.value as CouponType)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={c.type === 'percent' ? 'Value (% off)' : c.type === 'flat' ? 'Value (paise)' : 'Value'}
          >
            <input
              type="number"
              required
              value={c.value}
              onChange={(e) => update('value', Number(e.target.value))}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Max discount cap (paise, optional)">
            <input
              type="number"
              value={c.maxDiscountCap ?? ''}
              onChange={(e) =>
                update('maxDiscountCap', e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Target scope">
            <select
              value={c.targetScope}
              onChange={(e) => update('targetScope', e.target.value as CouponTarget)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            >
              {TARGET_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <input
              type="number"
              value={c.priority}
              onChange={(e) => update('priority', Number(e.target.value))}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Min subtotal (paise)">
            <input
              type="number"
              value={c.constraints.minSubtotal ?? ''}
              onChange={(e) =>
                updateConstraints('minSubtotal', e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Per-user limit">
            <input
              type="number"
              value={c.perUserLimit ?? 1}
              onChange={(e) => update('perUserLimit', Number(e.target.value))}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Global usage limit">
            <input
              type="number"
              value={c.usageLimit ?? ''}
              onChange={(e) =>
                update('usageLimit', e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Valid from">
            <input
              type="datetime-local"
              required
              value={c.validFrom.slice(0, 16)}
              onChange={(e) => update('validFrom', new Date(e.target.value).toISOString())}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
          <Field label="Valid to (optional)">
            <input
              type="datetime-local"
              value={c.validTo ? c.validTo.slice(0, 16) : ''}
              onChange={(e) =>
                update('validTo', e.target.value ? new Date(e.target.value).toISOString() : undefined)
              }
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={c.constraints.firstOrderOnly ?? false}
              onChange={(e) => updateConstraints('firstOrderOnly', e.target.checked)}
              className="h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
            />
            First-order only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={c.stackable}
              onChange={(e) => update('stackable', e.target.checked)}
              className="h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
            />
            Stackable with other coupons
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={c.active}
              onChange={(e) => update('active', e.target.checked)}
              className="h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
            />
            Active
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[color:var(--color-border)] pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[color:var(--color-border)] px-5 py-2 text-sm font-semibold text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !c.code.trim()}
            className="rounded-full bg-theme-accent px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : isNew ? 'Create coupon' : 'Save changes'}
          </button>
        </div>
      </form>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
        {label}
      </span>
      {children}
    </label>
  );
}
