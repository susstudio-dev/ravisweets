'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Plus, Save, Search, X } from 'lucide-react';
import { CATALOGUE, type CategorySlug, type DietaryTag, type Product } from '@ravisweets/shared';
import {
  upsertProductBuilderEligible,
  upsertProductCategory,
  upsertProductDescription,
  upsertProductDietaryTags,
  upsertProductFlags,
  upsertProductNutrition,
  upsertProductPrimaryImage,
  upsertProductSale,
  upsertProductShelfLifeDays,
  upsertProductUnitMode,
  uploadProductImage,
  upsertVariantPrice,
  upsertVariantStock,
  upsertVariantTitle,
} from '@/lib/supabase/products';

const CATEGORY_OPTIONS: { value: CategorySlug; label: string }[] = [
  { value: 'hyderabadi-specials', label: 'Hyderabadi specials' },
  { value: 'sweets', label: 'Sweets' },
  { value: 'sweet-bites', label: 'Sweet bites' },
  { value: 'healthy-sweets', label: 'Healthy sweets' },
  { value: 'namkeens', label: 'Namkeens' },
  { value: 'savouries', label: 'Savouries' },
  { value: 'dry-fruits', label: 'Dry fruits' },
  { value: 'pickles', label: 'Pickles' },
  { value: 'powders', label: 'Podis & powders' },
  { value: 'biscuits', label: 'Biscuits' },
  { value: 'combos', label: 'Combos' },
  { value: 'gift-hampers', label: 'Gift hampers' },
  { value: 'festival-specials', label: 'Festival specials' },
];

const DIETARY_OPTIONS: DietaryTag[] = [
  'eggless',
  'sugar-free',
  'vegan',
  'gluten-free',
  'nuts',
  'dairy',
  'contains-ghee',
];
import { logAdminAction } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';

export function AdminProducts() {
  const { configured } = useSession();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return CATALOGUE;
    const q = query.toLowerCase();
    return CATALOGUE.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
            Catalogue
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
            Products ({CATALOGUE.length})
          </h1>
          <p className="mt-1 text-sm text-theme-ink/65">
            {configured
              ? 'Inline edit on price, stock, sale, image upload + flags. Click "Add product" to launch a new SKU.'
              : 'Read-only — connect Supabase to edit.'}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add product
        </Link>
      </header>

      <label className="relative block max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-ink/40"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search by title, slug, or category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-[color:var(--color-border)] bg-surface-elevated px-9 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
        />
      </label>

      <div className="overflow-x-auto rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
        <table className="w-full text-sm">
          <thead className="bg-theme-glow/10 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Variants</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stock_available, 0);
              return (
                <tr
                  key={p.id}
                  onClick={() => setActive(p)}
                  className="cursor-pointer border-t border-[color:var(--color-border)] transition-colors hover:bg-theme-glow/10"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-theme-ink">{p.title}</p>
                    <p className="text-[11px] text-theme-ink/55">/product/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-theme-ink/65 capitalize">
                    {p.category.replace(/-/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-theme-ink/65">{p.variants.length}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-mono ${totalStock <= 25 ? 'text-red-700' : 'text-theme-ink/85'}`}
                    >
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && <Tag>Featured</Tag>}
                      {p.bestseller && <Tag>Bestseller</Tag>}
                      {p.new && <Tag>New</Tag>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-theme-ink/40">
                    <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && <ProductDrawer product={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function ProductDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const { configured } = useSession();
  const [flags, setFlags] = useState({
    featured: product.featured,
    bestseller: product.bestseller,
    new: product.new,
  });
  const [unitMode, setUnitMode] = useState<'weight' | 'quantity'>(
    product.unit_mode ?? 'weight',
  );
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState<CategorySlug>(product.category);
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(product.dietary_tags);
  const [shelfLifeDays, setShelfLifeDays] = useState(product.shelf_life_days);
  const [builderEligible, setBuilderEligible] = useState(product.builder_eligible);

  // Per-100g nutrition — admin enters whatever they have from the FSSAI sheet.
  const initialNutrition = product.nutrition ?? {};
  const [nutrition, setNutrition] = useState<{
    calories: string;
    protein_g: string;
    fat_g: string;
    sugar_g: string;
    fibre_g: string;
    carbs_g: string;
    sodium_mg: string;
  }>({
    calories: initialNutrition.calories?.toString() ?? '',
    protein_g: initialNutrition.protein_g?.toString() ?? '',
    fat_g: initialNutrition.fat_g?.toString() ?? '',
    sugar_g: initialNutrition.sugar_g?.toString() ?? '',
    fibre_g: initialNutrition.fibre_g?.toString() ?? '',
    carbs_g: initialNutrition.carbs_g?.toString() ?? '',
    sodium_mg: initialNutrition.sodium_mg?.toString() ?? '',
  });

  // Sale state — admin can toggle a product on sale and choose between a
  // flat sale price (in rupees) or a percent-off discount.
  const [onSale, setOnSale] = useState(product.on_sale ?? false);
  const [saleMode, setSaleMode] = useState<'percent' | 'flat'>(
    typeof product.sale_price === 'number' ? 'flat' : 'percent',
  );
  const [salePercent, setSalePercent] = useState<number>(product.sale_percent_off ?? 10);
  // sale_price is stored in paise; admin enters rupees for ergonomics.
  const [salePriceRupees, setSalePriceRupees] = useState<number>(
    typeof product.sale_price === 'number'
      ? Math.round(product.sale_price / 100)
      : Math.round(((product.variants[0]?.price.amount ?? 0) * 0.85) / 100),
  );
  const [saleEndsAt, setSaleEndsAt] = useState<string>(
    product.sale_ends_at ? product.sale_ends_at.slice(0, 16) : '',
  );
  const [saleLabel, setSaleLabel] = useState<string>(product.sale_label ?? '');

  const primaryImage = product.images[0];
  const [imageUrl, setImageUrl] = useState(primaryImage?.url ?? '');
  const [imageAlt, setImageAlt] = useState(primaryImage?.alt ?? product.title);
  const [variants, setVariants] = useState(
    product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price.amount,
      stock: v.stock_available,
    })),
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleDietary(t: DietaryTag) {
    setDietaryTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function save() {
    if (!configured) {
      window.alert('Supabase not configured — saves require backend.');
      return;
    }
    setBusy(true);
    setSaved(false);

    // Update flags
    if (
      flags.featured !== product.featured ||
      flags.bestseller !== product.bestseller ||
      flags.new !== product.new
    ) {
      const r = await upsertProductFlags(product.id, flags);
      if (!r.ok) {
        window.alert(`Flag save failed: ${r.reason}`);
        setBusy(false);
        return;
      }
      await logAdminAction(
        'update-flags',
        'product',
        product.id,
        { featured: product.featured, bestseller: product.bestseller, new: product.new },
        flags,
      );
    }

    // Update unit_mode if changed (requires migration 0002)
    if (unitMode !== (product.unit_mode ?? 'weight')) {
      const r = await upsertProductUnitMode(product.id, unitMode);
      if (!r.ok) {
        window.alert(`unit_mode save failed: ${r.reason}. Run migration 0002.`);
        setBusy(false);
        return;
      }
      await logAdminAction(
        'update-unit-mode',
        'product',
        product.id,
        { unit_mode: product.unit_mode ?? 'weight' },
        { unit_mode: unitMode },
      );
    }

    if (description !== product.description) {
      const r = await upsertProductDescription(product.id, description);
      if (!r.ok) {
        window.alert(`Description save failed: ${r.reason}`);
        setBusy(false);
        return;
      }
      await logAdminAction('update-description', 'product', product.id, { description: product.description }, { description });
    }

    if (category !== product.category) {
      const r = await upsertProductCategory(product.id, category);
      if (!r.ok) {
        window.alert(`Category save failed: ${r.reason}`);
        setBusy(false);
        return;
      }
      await logAdminAction('update-category', 'product', product.id, { category: product.category }, { category });
    }

    const tagsChanged =
      dietaryTags.length !== product.dietary_tags.length ||
      dietaryTags.some((t) => !product.dietary_tags.includes(t));
    if (tagsChanged) {
      const r = await upsertProductDietaryTags(product.id, dietaryTags);
      if (!r.ok) {
        window.alert(`Dietary tags save failed: ${r.reason}`);
        setBusy(false);
        return;
      }
      await logAdminAction('update-dietary-tags', 'product', product.id, { dietary_tags: product.dietary_tags }, { dietary_tags: dietaryTags });
    }

    if (shelfLifeDays !== product.shelf_life_days) {
      const r = await upsertProductShelfLifeDays(product.id, shelfLifeDays);
      if (!r.ok) {
        window.alert(`Shelf life save failed: ${r.reason}`);
        setBusy(false);
        return;
      }
      await logAdminAction('update-shelf-life', 'product', product.id, { shelf_life_days: product.shelf_life_days }, { shelf_life_days: shelfLifeDays });
    }

    if (builderEligible !== product.builder_eligible) {
      const r = await upsertProductBuilderEligible(product.id, builderEligible);
      if (!r.ok) {
        window.alert(`Builder-eligible save failed: ${r.reason}`);
        setBusy(false);
        return;
      }
      await logAdminAction('update-builder-eligible', 'product', product.id, { builder_eligible: product.builder_eligible }, { builder_eligible: builderEligible });
    }

    if (imageUrl !== (primaryImage?.url ?? '') || imageAlt !== (primaryImage?.alt ?? '')) {
      if (imageUrl.trim()) {
        const r = await upsertProductPrimaryImage(product.id, imageUrl, imageAlt);
        if (!r.ok) {
          window.alert(`Image save failed: ${r.reason}`);
          setBusy(false);
          return;
        }
        await logAdminAction('update-primary-image', 'product', product.id, { url: primaryImage?.url, alt: primaryImage?.alt }, { url: imageUrl, alt: imageAlt });
      }
    }

    // Nutrition — single jsonb write. Empty strings → omitted.
    const next: Record<string, number> = {};
    for (const [k, v] of Object.entries(nutrition)) {
      const n = Number(v);
      if (v && Number.isFinite(n) && n >= 0) next[k] = n;
    }
    const prev = product.nutrition ?? {};
    const nutritionChanged = JSON.stringify(prev) !== JSON.stringify(next);
    if (nutritionChanged) {
      const r = await upsertProductNutrition(product.id, next);
      if (!r.ok) {
        window.alert(`Nutrition save failed: ${r.reason}. Run migration 0004.`);
        setBusy(false);
        return;
      }
      await logAdminAction('update-nutrition', 'product', product.id, prev, next);
    }

    // Sale state — single multi-field write so partial saves don't show
    // a strikethrough without a price (or vice-versa).
    const saleChanged =
      onSale !== (product.on_sale ?? false) ||
      saleEndsAt !== (product.sale_ends_at?.slice(0, 16) ?? '') ||
      saleLabel !== (product.sale_label ?? '') ||
      (onSale &&
        ((saleMode === 'percent' && salePercent !== (product.sale_percent_off ?? -1)) ||
          (saleMode === 'flat' && salePriceRupees * 100 !== (product.sale_price ?? -1))));
    if (saleChanged) {
      const r = await upsertProductSale(product.id, {
        on_sale: onSale,
        sale_price: onSale && saleMode === 'flat' ? salePriceRupees * 100 : null,
        sale_percent_off: onSale && saleMode === 'percent' ? salePercent : null,
        sale_ends_at: onSale && saleEndsAt ? new Date(saleEndsAt).toISOString() : null,
        sale_label: onSale && saleLabel.trim() ? saleLabel.trim() : null,
      });
      if (!r.ok) {
        window.alert(`Sale save failed: ${r.reason}. Run migration 0003.`);
        setBusy(false);
        return;
      }
      await logAdminAction(
        'update-sale',
        'product',
        product.id,
        {
          on_sale: product.on_sale ?? false,
          sale_price: product.sale_price ?? null,
          sale_percent_off: product.sale_percent_off ?? null,
        },
        {
          on_sale: onSale,
          mode: saleMode,
          sale_price: saleMode === 'flat' ? salePriceRupees * 100 : null,
          sale_percent_off: saleMode === 'percent' ? salePercent : null,
        },
      );
    }

    // Update each variant if changed
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]!;
      const original = product.variants[i]!;
      if (v.title !== original.title) {
        const r = await upsertVariantTitle(v.id, v.title);
        if (!r.ok) {
          window.alert(`Title save failed for ${v.sku}: ${r.reason}`);
          setBusy(false);
          return;
        }
        await logAdminAction(
          'update-title',
          'variant',
          v.id,
          { title: original.title },
          { title: v.title },
        );
      }
      if (v.price !== original.price.amount) {
        const r = await upsertVariantPrice(v.id, v.price);
        if (!r.ok) {
          window.alert(`Price save failed for ${v.title}: ${r.reason}`);
          setBusy(false);
          return;
        }
        await logAdminAction(
          'update-price',
          'variant',
          v.id,
          { price: original.price.amount },
          { price: v.price },
        );
      }
      if (v.stock !== original.stock_available) {
        const r = await upsertVariantStock(v.id, v.stock);
        if (!r.ok) {
          window.alert(`Stock save failed for ${v.title}: ${r.reason}`);
          setBusy(false);
          return;
        }
        await logAdminAction(
          'update-stock',
          'variant',
          v.id,
          { stock: original.stock_available },
          { stock: v.stock },
        );
      }
    }

    setBusy(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-lifted"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-theme-ink">{product.title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-1.5 text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-1 font-mono text-xs text-theme-ink/55">/product/{product.slug}</p>

      {/* Description */}
      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
        Description
      </h3>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        className="mt-2 w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm leading-relaxed text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
      />

      {/* Category + shelf life — paired row */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategorySlug)}
            className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Shelf life (days)
          </span>
          <input
            type="number"
            min={1}
            value={shelfLifeDays}
            onChange={(e) => setShelfLifeDays(Math.max(1, Number(e.target.value) || 1))}
            className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm font-mono text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          />
        </label>
      </div>

      {/* Dietary tags */}
      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
        Dietary tags
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DIETARY_OPTIONS.map((t) => {
          const on = dietaryTags.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleDietary(t)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold capitalize transition-colors ${
                on
                  ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                  : 'border-[color:var(--color-border)] text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent'
              }`}
            >
              {t.replace(/-/g, ' ')}
            </button>
          );
        })}
      </div>

      {/* Primary image — upload file OR paste URL */}
      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
        Primary image
      </h3>
      <div className="mt-2 grid gap-2">
        <ImageUpload
          productId={product.id}
          currentUrl={imageUrl}
          onUploaded={(url) => setImageUrl(url)}
        />
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
            …or paste a URL
          </span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://ravisweets.com/wp-content/uploads/..."
            className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-xs font-mono text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Alt text (accessibility)
          </span>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder={`${product.title} — photographed at the Khammam kitchen`}
            className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          />
        </label>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt}
            className="mt-1 h-28 w-28 rounded-lg border border-[color:var(--color-border)] bg-theme-glow/15 object-contain p-2"
          />
        )}
      </div>

      {/* Nutrition — per 100g, all optional. Surfaces below ingredients on
          the product detail page when ANY field is set. */}
      <div className="mt-6 rounded-2xl border border-[color:var(--color-border)] bg-surface p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          Nutrition (per 100g)
        </p>
        <p className="mt-0.5 text-[11px] text-theme-ink/55">
          Fill from the FSSAI nutrition sheet for this batch. Leave blank to hide
          the panel on the storefront.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {(
            [
              { k: 'calories', label: 'Calories (kcal)' },
              { k: 'protein_g', label: 'Protein (g)' },
              { k: 'fat_g', label: 'Fat (g)' },
              { k: 'sugar_g', label: 'Sugar (g)' },
              { k: 'fibre_g', label: 'Fibre (g)' },
              { k: 'carbs_g', label: 'Carbs (g)' },
              { k: 'sodium_mg', label: 'Sodium (mg)' },
            ] as const
          ).map((f) => (
            <label key={f.k} className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                {f.label}
              </span>
              <input
                type="number"
                min={0}
                step="any"
                value={nutrition[f.k]}
                onChange={(e) => setNutrition((p) => ({ ...p, [f.k]: e.target.value }))}
                className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm font-mono text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Sale pricing — admin-toggleable per product. Drives the strikethrough
          + sale badge on every storefront card and detail page. */}
      <div className="mt-6 rounded-2xl border border-[color:var(--color-border)] bg-surface p-4">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
          />
          <span>
            <span className="font-display text-base font-semibold text-theme-ink">
              Put this product on sale
            </span>
            <span className="block text-[11px] text-theme-ink/55">
              Storefront shows a strikethrough on the regular price + a "Sale" badge.
              Optional auto-end timestamp hides the sale without a manual write.
            </span>
          </span>
        </label>

        {onSale && (
          <div className="mt-4 grid gap-3 pl-6">
            {/* Mode toggle */}
            <div className="inline-flex w-fit rounded-full border border-[color:var(--color-border)] bg-surface-elevated p-1">
              {(['percent', 'flat'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSaleMode(m)}
                  aria-pressed={saleMode === m}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    saleMode === m
                      ? 'bg-theme-accent text-[color:var(--theme-base)]'
                      : 'text-theme-ink/60 hover:text-theme-ink'
                  }`}
                >
                  {m === 'percent' ? '% off' : 'Flat ₹ price'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {saleMode === 'percent' ? (
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                    Discount %
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={salePercent}
                    onChange={(e) =>
                      setSalePercent(Math.min(99, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm font-mono text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                    Sale price (₹)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={salePriceRupees}
                    onChange={(e) =>
                      setSalePriceRupees(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm font-mono text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </label>
              )}
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                  Sale ends (optional)
                </span>
                <input
                  type="datetime-local"
                  value={saleEndsAt}
                  onChange={(e) => setSaleEndsAt(e.target.value)}
                  className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                Sale badge label (optional)
              </span>
              <input
                type="text"
                value={saleLabel}
                onChange={(e) => setSaleLabel(e.target.value.slice(0, 32))}
                placeholder='e.g. "Diwali pre-order" or "Clearance"'
                className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
            </label>

            {/* Live preview of the strikethrough */}
            <div className="rounded-lg bg-theme-glow/15 px-3 py-2 text-xs">
              <span className="text-theme-ink/55">Preview · </span>
              <span className="text-theme-ink/55 line-through">
                {`₹${Math.round((product.variants[0]?.price.amount ?? 0) / 100)}`}
              </span>
              <span className="ml-2 font-display text-base font-semibold text-theme-accent">
                {saleMode === 'percent'
                  ? `₹${Math.round(((product.variants[0]?.price.amount ?? 0) * (100 - salePercent)) / 100 / 100)}`
                  : `₹${salePriceRupees}`}
              </span>
              <span className="ml-2 rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {saleLabel || (saleMode === 'percent' ? `${salePercent}% off` : 'Sale')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Builder eligibility */}
      <label className="mt-6 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={builderEligible}
          onChange={(e) => setBuilderEligible(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
        />
        <span>
          <span className="font-medium text-theme-ink">Available in the corporate hamper builder</span>
          <span className="block text-[11px] text-theme-ink/55">
            Uncheck for fragile / cold-chain SKUs (e.g. Gulab Jamun, full hampers themselves).
          </span>
        </span>
      </label>

      {/* Unit mode toggle — drives the variant-picker label on the storefront */}
      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
        Sold by
      </h3>
      <div className="mt-2 inline-flex rounded-full border border-[color:var(--color-border)] bg-surface p-1">
        {(['weight', 'quantity'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setUnitMode(m)}
            aria-pressed={unitMode === m}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
              unitMode === m
                ? 'bg-theme-accent text-[color:var(--theme-base)]'
                : 'text-theme-ink/60 hover:text-theme-ink'
            }`}
          >
            {m === 'weight' ? 'Weight (250 g · 1 kg)' : 'Pack count (Box of 12)'}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-theme-ink/55">
        Storefront variant chips will say {unitMode === 'weight' ? '"Size"' : '"Pack"'}.
      </p>

      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
        Variants — title, price &amp; stock
      </h3>
      <ul className="mt-2 flex flex-col gap-2">
        {variants.map((v, i) => (
          <li key={v.id} className="rounded-lg border border-[color:var(--color-border)] bg-surface p-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                Variant label
              </span>
              <input
                type="text"
                value={v.title}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i]!, title: e.target.value };
                  setVariants(next);
                }}
                placeholder={unitMode === 'weight' ? '250 g' : 'Box of 12'}
                className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
            </label>
            <p className="mt-1 font-mono text-[11px] text-theme-ink/55">SKU {v.sku}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                  Price (₹)
                </span>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i]!, price: Number(e.target.value) };
                    setVariants(next);
                  }}
                  className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm font-mono text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
                  Stock
                </span>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i]!, stock: Number(e.target.value) };
                    setVariants(next);
                  }}
                  className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-sm font-mono text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
        Flags
      </h3>
      <div className="mt-2 flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.featured}
            onChange={(e) => setFlags({ ...flags, featured: e.target.checked })}
            className="h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
          />
          Featured (appears on home / corporate)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.bestseller}
            onChange={(e) => setFlags({ ...flags, bestseller: e.target.checked })}
            className="h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.new}
            onChange={(e) => setFlags({ ...flags, new: e.target.checked })}
            className="h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
          />
          New arrival
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[color:var(--color-border)] pt-4">
        <button
          type="button"
          onClick={save}
          disabled={busy || !configured}
          className="inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent"
        >
          Close
        </button>
      </div>

      <p className="mt-4 text-[11px] text-theme-ink/55">
        Note: storefront catalogue is currently bundled at build. Live edits land here in
        <code> products </code> + <code>variants</code> tables and become visible on the storefront
        once Phase 3&rsquo;s build-time fetch + webhook rebuild is wired.
      </p>
    </aside>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-theme-glow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-accent">
      {children}
    </span>
  );
}

interface ImageUploadProps {
  productId: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}

/**
 * File picker that uploads to Supabase Storage `product-images` and
 * surfaces the resulting public URL via `onUploaded`. The drawer's URL
 * input is the source of truth — this component just writes to it.
 */
function ImageUpload({ productId, currentUrl, onUploaded }: ImageUploadProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError('File is larger than 5 MB. Compress and retry.');
      return;
    }
    setBusy(true);
    const r = await uploadProductImage(productId, file);
    setBusy(false);
    e.target.value = '';
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    onUploaded(r.url);
  }

  return (
    <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-theme-glow/10 p-3">
      <div className="flex items-center gap-3">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg border border-[color:var(--color-border)] bg-white object-contain p-1"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-white text-[10px] font-semibold uppercase tracking-wider text-theme-ink/40">
            no image
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Upload product photo
          </p>
          <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-theme-accent px-3 py-1.5 text-[11px] font-semibold text-[color:var(--theme-base)] transition-colors hover:bg-theme-accent/85">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
              onChange={onFile}
              disabled={busy}
              className="sr-only"
            />
            {busy ? 'Uploading…' : 'Choose file'}
          </label>
          <p className="mt-1 text-[10px] text-theme-ink/55">
            PNG / JPG / WebP / AVIF / SVG · max 5 MB. Stored in Supabase Storage,
            served from the public `product-images` bucket.
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-[11px] font-medium text-red-700">{error}</p>}
    </div>
  );
}
