'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { CategorySlug, DietaryTag } from '@ravisweets/shared';
import { cn } from '@/lib/cn';

const DIETARY_OPTIONS: { value: DietaryTag; label: string }[] = [
  { value: 'eggless', label: 'Eggless' },
  { value: 'sugar-free', label: 'Sugar-free' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'nuts', label: 'Contains nuts' },
  { value: 'dairy', label: 'Contains dairy' },
];

const SORTS: { value: string; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price · low to high' },
  { value: 'price-desc', label: 'Price · high to low' },
  { value: 'newest', label: 'Newest' },
];

interface FiltersProps {
  categorySlug: CategorySlug;
  activeDietary: string[];
  activeSort: string;
  inStockOnly: boolean;
  total: number;
}

export function CategoryFilters({
  categorySlug,
  activeDietary,
  activeSort,
  inStockOnly,
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParam(name: string, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value === undefined || value === '') next.delete(name);
    else next.set(name, value);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  function toggleDiet(tag: string) {
    const current = new Set(activeDietary);
    if (current.has(tag)) current.delete(tag);
    else current.add(tag);
    const value = Array.from(current).join(',');
    updateParam('diet', value || undefined);
  }

  const hasFilters = activeDietary.length > 0 || inStockOnly || activeSort !== 'featured';

  return (
    <aside className="md:sticky md:top-20 md:self-start" aria-label="Filters">
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-theme-ink">Refine</h2>
          {hasFilters && (
            <Link
              href={`/category/${categorySlug}`}
              className="text-xs font-semibold text-theme-accent hover:underline"
              replace
            >
              Clear
            </Link>
          )}
        </div>

        <fieldset className="mb-5">
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
            Dietary
          </legend>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => {
              const active = activeDietary.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleDiet(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                    active
                      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                      : 'border-[color:var(--color-border)] bg-surface text-theme-ink/80 hover:-translate-y-0.5 hover:border-theme-accent',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mb-5">
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
            Availability
          </legend>
          <label className="flex items-center gap-2 text-sm text-theme-ink/85">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => updateParam('stock', e.target.checked ? 'in' : undefined)}
              className="h-4 w-4 rounded border-[color:var(--color-border)] text-theme-accent focus:ring-theme-accent"
            />
            In stock only
          </label>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
            Sort by
          </legend>
          <select
            value={activeSort}
            onChange={(e) => updateParam('sort', e.target.value === 'featured' ? undefined : e.target.value)}
            className="w-full rounded-full border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </fieldset>
      </div>
    </aside>
  );
}
