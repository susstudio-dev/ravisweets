'use client';

import { useMemo } from 'react';
import { CATALOGUE } from '@ravisweets/shared';

export function AdminInventory() {
  const rows = useMemo(
    () =>
      CATALOGUE.flatMap((p) =>
        p.variants.map((v) => ({
          sku: v.sku,
          productTitle: p.title,
          variantTitle: v.title,
          stock: v.stock_available,
          threshold: 25,
        })),
      ).sort((a, b) => a.stock - b.stock),
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          Stock
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          Showing {rows.length} variants. Sorted by lowest stock first. Inline editing arrives once
          the variants table is in Supabase.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
        <table className="w-full text-sm">
          <thead className="bg-theme-glow/10 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
            <tr>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Variant</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Threshold</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const low = r.stock <= r.threshold;
              return (
                <tr
                  key={r.sku}
                  className="border-t border-[color:var(--color-border)] hover:bg-theme-glow/10"
                >
                  <td className="px-4 py-3 font-mono text-xs text-theme-ink/65">{r.sku}</td>
                  <td className="px-4 py-3 text-theme-ink">{r.productTitle}</td>
                  <td className="px-4 py-3 text-theme-ink/65">{r.variantTitle}</td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      low ? 'text-red-700' : 'text-theme-ink/85'
                    }`}
                  >
                    {r.stock}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-theme-ink/55">
                    {r.threshold}
                  </td>
                  <td className="px-4 py-3">
                    {low ? (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700">
                        Reorder
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
