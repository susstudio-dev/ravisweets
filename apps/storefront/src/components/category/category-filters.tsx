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
      <div className="docket p-5">
        <div className="docket-head">
          <h2 className="font-display text-theme-ink text-lg">Refine</h2>
          {hasFilters && (
            <Link
              href={`/category/${categorySlug}`}
              className="text-theme-accent text-xs font-semibold hover:underline"
              replace
            >
              Clear
            </Link>
          )}
        </div>

        <fieldset className="mb-5 border-b border-[color:var(--color-border)] pb-5">
          <legend className="field-label mb-2">Dietary</legend>
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
                    'focus-visible:ring-theme-accent min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
                    active
                      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                      : 'bg-surface text-theme-ink/80 hover:border-theme-accent hover:text-theme-ink border-[color:var(--color-border)]',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mb-5 border-b border-[color:var(--color-border)] pb-5">
          <legend className="field-label mb-2">Availability</legend>
          <label className="text-theme-ink/85 flex min-h-[36px] items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => updateParam('stock', e.target.checked ? 'in' : undefined)}
              className="text-theme-accent focus:ring-theme-accent h-4 w-4 rounded-md border-[color:var(--color-border)]"
            />
            In stock only
          </label>
        </fieldset>

        <fieldset>
          <legend className="field-label mb-2">Sort by</legend>
          <select
            value={activeSort}
            onChange={(e) =>
              updateParam('sort', e.target.value === 'featured' ? undefined : e.target.value)
            }
            className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
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
