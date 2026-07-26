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
        <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
          Stock
        </p>
        <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">Inventory</h1>
        <p className="text-theme-ink/65 mt-1 text-sm">
          Showing {rows.length} variants. Sorted by lowest stock first. Inline editing arrives once
          the variants table is in Supabase.
        </p>
      </header>

      <div className="bg-surface-elevated overflow-x-auto rounded-2xl border border-[color:var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-theme-glow/10 text-theme-ink/65 text-[11px] font-semibold uppercase tracking-wider">
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
                  className="hover:bg-theme-glow/10 border-t border-[color:var(--color-border)]"
                >
                  <td className="text-theme-ink/65 px-4 py-3 font-mono text-xs">{r.sku}</td>
                  <td className="text-theme-ink px-4 py-3">{r.productTitle}</td>
                  <td className="text-theme-ink/65 px-4 py-3">{r.variantTitle}</td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      low ? 'text-red-700' : 'text-theme-ink/85'
                    }`}
                  >
                    {r.stock}
                  </td>
                  <td className="text-theme-ink/55 px-4 py-3 text-right font-mono">
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
