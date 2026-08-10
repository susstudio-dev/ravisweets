'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, ImagePlus, Plus, Save, Search, X } from 'lucide-react';
import {
  CATALOGUE,
  type CategorySlug,
  type DietaryTag,
  type Product,
  type ProductImage,
} from '@ravisweets/shared';
import {
  EMPTY_CATALOGUE_OVERRIDES,
  type CatalogueOverrides,
  listCatalogueOverrides,
  mergeProductOverrides,
  updateProductImages,
  upsertProductBuilderEligible,
  upsertProductCategory,
  upsertProductDescription,
  upsertProductDietaryTags,
  upsertProductFlags,
  upsertProductNutrition,
  upsertProductSale,
  upsertProductShelfLifeDays,
  upsertProductUnitMode,
  upsertVariantPrice,
  upsertVariantStock,
  upsertVariantTitle,
} from '@/lib/supabase/products';
import { MediaPickerDialog } from '@/components/admin/media-picker';
import { mediaPublicUrl } from '@/lib/media/public-url';

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
  // The admin used to render the bundled CATALOGUE and nothing else, so an
  // owner edited a price, the write landed, and the screen kept showing the
  // hardcoded number. Everything below is the merge of bundle + database.
  const [overrides, setOverrides] = useState<CatalogueOverrides>(EMPTY_CATALOGUE_OVERRIDES);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setOverrides(await listCatalogueOverrides());
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rows = useMemo(
    () => CATALOGUE.map((p) => mergeProductOverrides(p, overrides)),
    [overrides],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.includes(q),
    );
  }, [query, rows]);

  // Nothing seeded is a completely different situation from a broken read, and
  // both look like "the bundled prices" on screen — so say which one it is.
  const noRows = configured && loaded && !overrides.error && overrides.products.size === 0;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
            Catalogue
          </p>
          <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">
            Products ({CATALOGUE.length})
          </h1>
          <p className="text-theme-ink/65 mt-1 text-sm">
            {configured
              ? 'Live values from the database, falling back to the bundled catalogue for anything not seeded yet. Inline edit on price, stock, sale, image upload + flags. Click "Add product" to launch a new SKU.'
              : 'Read-only — connect Supabase to edit.'}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-theme-ink shadow-soft hover:shadow-lifted inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add product
        </Link>
      </header>

      <label className="relative block max-w-md">
        <Search
          className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search by title, slug, or category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-surface-elevated text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-full border border-[color:var(--color-border)] px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
        />
      </label>

      {overrides.error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
          {`Live values could not be read (${overrides.error}). Every price, stock count and flag below is the bundled catalogue, not the database — treat them as unverified until this is fixed.`}
        </p>
      )}
      {noRows && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {
            'No products in the database yet — everything below comes from the bundled catalogue, and saves will match zero rows. Apply supabase/migrations/0014_seed_products.sql first (see DEPLOYMENT.md).'
          }
        </p>
      )}

      <div className="bg-surface-elevated overflow-x-auto rounded-2xl border border-[color:var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-theme-glow/10 text-theme-ink/65 text-[11px] font-semibold uppercase tracking-wider">
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
              // Per-row only once SOMETHING is seeded — when the table is empty
              // the banner above already says it, 83 times over is just noise.
              const missingRow = overrides.products.size > 0 && !overrides.products.has(p.id);
              return (
                <tr
                  key={p.id}
                  onClick={() => setActive(p)}
                  className="hover:bg-theme-glow/10 cursor-pointer border-t border-[color:var(--color-border)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-theme-ink font-medium">{p.title}</p>
                    <p className="text-theme-ink/55 text-[11px]">/product/{p.slug}</p>
                  </td>
                  <td className="text-theme-ink/65 px-4 py-3 capitalize">
                    {p.category.replace(/-/g, ' ')}
                  </td>
                  <td className="text-theme-ink/65 px-4 py-3">{p.variants.length}</td>
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
                      {overrides.products.get(p.id)?.archived && <WarnTag>Archived</WarnTag>}
                      {missingRow && <WarnTag>Not in DB</WarnTag>}
                    </div>
                  </td>
                  <td className="text-theme-ink/40 px-4 py-3 text-right">
                    <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <ProductDrawer
          // Keyed so picking a different row from the table behind the panel
          // remounts it — without this the drawer keeps the previous product's
          // form state and offers to save it onto the new one.
          key={active.id}
          product={active}
          seeded={overrides.products.has(active.id)}
          onSaved={refresh}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}

function ProductDrawer({
  product,
  seeded,
  onSaved,
  onClose,
}: {
  product: Product;
  /** Whether this product has a row in `products`. Nothing saves when false. */
  seeded: boolean;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { configured } = useSession();
  const [flags, setFlags] = useState({
    featured: product.featured,
    bestseller: product.bestseller,
    new: product.new,
  });
  const [unitMode, setUnitMode] = useState<'weight' | 'quantity'>(product.unit_mode ?? 'weight');
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

  // Ordered gallery — every entry comes from the shared media library and the
  // whole array persists in one updateProductImages write on Save.
  const [images, setImages] = useState<ProductImage[]>(product.images.map((im) => ({ ...im })));
  const [pickerOpen, setPickerOpen] = useState(false);
  // The product exists only in the bundled CATALOGUE, so nothing typed into
  // this drawer can be saved (needs the 0014 seed). Now known from the list's
  // read BEFORE the first keystroke rather than only after a wasted save; a
  // zero-row image write still flips it on for a row that disappeared since.
  const [notSeeded, setNotSeeded] = useState(!seeded);
  // The reason the last save stopped, kept on screen after the alert is
  // dismissed — an alert you clicked past is not a record of anything.
  const [error, setError] = useState<string | null>(null);
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

  function moveImage(i: number, delta: -1 | 1) {
    setImages((prev) => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const swap = next[i]!;
      next[i] = next[j]!;
      next[j] = swap;
      return next;
    });
  }

  /**
   * Report a write that did not land. Returns false so every call site is a
   * single `return fail(...)` — the alert is the interrupt, the banner is the
   * record that survives dismissing it.
   */
  function fail(message: string): false {
    setError(message);
    window.alert(message);
    return false;
  }

  async function save() {
    if (!configured) {
      window.alert('Supabase not configured — saves require backend.');
      return;
    }
    setBusy(true);
    setSaved(false);
    setError(null);
    setNotSeeded(!seeded);

    const landed = await runSave();
    setBusy(false);
    // Refresh the table whether or not we made it to the end: stopping partway
    // means the writes BEFORE the failure did land, and leaving pre-save
    // numbers on screen is the exact lie this whole change exists to remove.
    onSaved();
    if (landed) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    }
  }

  /** True only when every write we attempted actually changed a row. */
  async function runSave(): Promise<boolean> {
    // Update flags
    if (
      flags.featured !== product.featured ||
      flags.bestseller !== product.bestseller ||
      flags.new !== product.new
    ) {
      const r = await upsertProductFlags(product.id, flags);
      if (!r.ok) return fail(`Flag save failed: ${r.reason}`);
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
      if (!r.ok) return fail(`unit_mode save failed: ${r.reason}. Run migration 0002.`);
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
      if (!r.ok) return fail(`Description save failed: ${r.reason}`);
      await logAdminAction(
        'update-description',
        'product',
        product.id,
        { description: product.description },
        { description },
      );
    }

    if (category !== product.category) {
      const r = await upsertProductCategory(product.id, category);
      if (!r.ok) return fail(`Category save failed: ${r.reason}`);
      await logAdminAction(
        'update-category',
        'product',
        product.id,
        { category: product.category },
        { category },
      );
    }

    const tagsChanged =
      dietaryTags.length !== product.dietary_tags.length ||
      dietaryTags.some((t) => !product.dietary_tags.includes(t));
    if (tagsChanged) {
      const r = await upsertProductDietaryTags(product.id, dietaryTags);
      if (!r.ok) return fail(`Dietary tags save failed: ${r.reason}`);
      await logAdminAction(
        'update-dietary-tags',
        'product',
        product.id,
        { dietary_tags: product.dietary_tags },
        { dietary_tags: dietaryTags },
      );
    }

    if (shelfLifeDays !== product.shelf_life_days) {
      const r = await upsertProductShelfLifeDays(product.id, shelfLifeDays);
      if (!r.ok) return fail(`Shelf life save failed: ${r.reason}`);
      await logAdminAction(
        'update-shelf-life',
        'product',
        product.id,
        { shelf_life_days: product.shelf_life_days },
        { shelf_life_days: shelfLifeDays },
      );
    }

    if (builderEligible !== product.builder_eligible) {
      const r = await upsertProductBuilderEligible(product.id, builderEligible);
      if (!r.ok) return fail(`Builder-eligible save failed: ${r.reason}`);
      await logAdminAction(
        'update-builder-eligible',
        'product',
        product.id,
        { builder_eligible: product.builder_eligible },
        { builder_eligible: builderEligible },
      );
    }

    // Persist the full ordered gallery in one write. A zero-row match means
    // the product has no DB row yet — say so instead of a false "Saved ✓".
    let imagesMatched = true;
    const imagesChanged = JSON.stringify(images) !== JSON.stringify(product.images);
    if (imagesChanged) {
      const r = await updateProductImages(product.id, images);
      if (!r.ok) return fail(`Image save failed: ${r.reason}`);
      imagesMatched = r.matched;
      if (!r.matched) setNotSeeded(true);
      if (r.matched) {
        await logAdminAction(
          'update-images',
          'product',
          product.id,
          { images: product.images },
          { images },
        );
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
      if (!r.ok) return fail(`Nutrition save failed: ${r.reason}. Run migration 0004.`);
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
      if (!r.ok) return fail(`Sale save failed: ${r.reason}. Run migration 0003.`);
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
        if (!r.ok) return fail(`Title save failed for ${v.sku}: ${r.reason}`);
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
        if (!r.ok) return fail(`Price save failed for ${v.title}: ${r.reason}`);
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
        if (!r.ok) return fail(`Stock save failed for ${v.title}: ${r.reason}`);
        await logAdminAction(
          'update-stock',
          'variant',
          v.id,
          { stock: original.stock_available },
          { stock: v.stock },
        );
      }
    }

    return imagesMatched;
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      className="bg-surface-elevated shadow-lifted fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-[color:var(--color-border)] p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-theme-ink text-2xl">{product.title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink rounded-full p-1.5"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-theme-ink/55 mt-1 font-mono text-xs">/product/{product.slug}</p>

      {/* Description */}
      <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
        Description
      </h3>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 mt-2 w-full rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2"
      />

      {/* Category + shelf life — paired row */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategorySlug)}
            className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
            Shelf life (days)
          </span>
          <input
            type="number"
            min={1}
            value={shelfLifeDays}
            onChange={(e) => setShelfLifeDays(Math.max(1, Number(e.target.value) || 1))}
            className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2"
          />
        </label>
      </div>

      {/* Dietary tags */}
      <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
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
                  : 'text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent border-[color:var(--color-border)]'
              }`}
            >
              {t.replace(/-/g, ' ')}
            </button>
          );
        })}
      </div>

      {/* Photos — ordered gallery, every entry from the shared media library */}
      <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
        Photos
      </h3>
      <div className="mt-2 flex flex-col gap-2">
        {images.length === 0 && (
          <p className="text-theme-ink/55 text-[11px]">
            No photos yet — add one from the library below.
          </p>
        )}
        {images.map((im, i) => (
          <div
            key={`${im.url}-${i}`}
            className="bg-surface flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={im.url}
              alt={im.alt}
              className="h-14 w-14 shrink-0 rounded-lg border border-[color:var(--color-border)] bg-white object-contain p-1"
            />
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                Alt text
              </span>
              <input
                type="text"
                value={im.alt}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = { ...next[i]!, alt: e.target.value };
                  setImages(next);
                }}
                placeholder={`${product.title} — photographed at the Khammam kitchen`}
                className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2"
              />
            </label>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => moveImage(i, -1)}
                disabled={i === 0}
                aria-label={`Move photo ${i + 1} up`}
                className="text-theme-ink/55 hover:border-theme-accent hover:text-theme-accent rounded-full border border-[color:var(--color-border)] p-1 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveImage(i, 1)}
                disabled={i === images.length - 1}
                aria-label={`Move photo ${i + 1} down`}
                className="text-theme-ink/55 hover:border-theme-accent hover:text-theme-accent rounded-full border border-[color:var(--color-border)] p-1 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setImages(images.filter((_, x) => x !== i))}
              className="text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent shrink-0 rounded-full border border-[color:var(--color-border)] px-3 py-1 text-[11px] font-semibold transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="bg-theme-accent hover:shadow-soft inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold text-[color:var(--theme-base)] transition-all"
        >
          <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
          Add from library
        </button>
      </div>

      {/* Nutrition — per 100g, all optional. Surfaces below ingredients on
          the product detail page when ANY field is set. */}
      <div className="bg-surface mt-6 rounded-2xl border border-[color:var(--color-border)] p-4">
        <p className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
          Nutrition (per 100g)
        </p>
        <p className="text-theme-ink/55 mt-0.5 text-[11px]">
          Fill from the FSSAI nutrition sheet for this batch. Leave blank to hide the panel on the
          storefront.
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
              <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                {f.label}
              </span>
              <input
                type="number"
                min={0}
                step="any"
                value={nutrition[f.k]}
                onChange={(e) => setNutrition((p) => ({ ...p, [f.k]: e.target.value }))}
                className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Sale pricing — admin-toggleable per product. Drives the strikethrough
          + sale badge on every storefront card and detail page. */}
      <div className="bg-surface mt-6 rounded-2xl border border-[color:var(--color-border)] p-4">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent mt-0.5 h-4 w-4 rounded"
          />
          <span>
            <span className="font-display text-theme-ink text-base">Put this product on sale</span>
            <span className="text-theme-ink/55 block text-[11px]">
              Storefront shows a strikethrough on the regular price + a "Sale" badge. Optional
              auto-end timestamp hides the sale without a manual write.
            </span>
          </span>
        </label>

        {onSale && (
          <div className="mt-4 grid gap-3 pl-6">
            {/* Mode toggle */}
            <div className="bg-surface-elevated inline-flex w-fit rounded-full border border-[color:var(--color-border)] p-1">
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
                  <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
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
                    className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2"
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-1">
                  <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                    Sale price (₹)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={salePriceRupees}
                    onChange={(e) => setSalePriceRupees(Math.max(1, Number(e.target.value) || 1))}
                    className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2"
                  />
                </label>
              )}
              <label className="flex flex-col gap-1">
                <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                  Sale ends (optional)
                </span>
                <input
                  type="datetime-local"
                  value={saleEndsAt}
                  onChange={(e) => setSaleEndsAt(e.target.value)}
                  className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                Sale badge label (optional)
              </span>
              <input
                type="text"
                value={saleLabel}
                onChange={(e) => setSaleLabel(e.target.value.slice(0, 32))}
                placeholder='e.g. "Diwali pre-order" or "Clearance"'
                className="bg-surface-elevated text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2"
              />
            </label>

            {/* Live preview of the strikethrough */}
            <div className="bg-theme-glow/15 rounded-lg px-3 py-2 text-xs">
              <span className="text-theme-ink/55">Preview · </span>
              <span className="text-theme-ink/55 line-through">
                {`₹${Math.round((product.variants[0]?.price.amount ?? 0) / 100)}`}
              </span>
              <span className="font-display text-theme-accent ml-2 text-base">
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
          className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent mt-0.5 h-4 w-4 rounded"
        />
        <span>
          <span className="text-theme-ink font-medium">
            Available in the corporate hamper builder
          </span>
          <span className="text-theme-ink/55 block text-[11px]">
            Uncheck for fragile / cold-chain SKUs (e.g. Gulab Jamun, full hampers themselves).
          </span>
        </span>
      </label>

      {/* Unit mode toggle — drives the variant-picker label on the storefront */}
      <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
        Sold by
      </h3>
      <div className="bg-surface mt-2 inline-flex rounded-full border border-[color:var(--color-border)] p-1">
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
      <p className="text-theme-ink/55 mt-1 text-[11px]">
        Storefront variant chips will say {unitMode === 'weight' ? '"Size"' : '"Pack"'}.
      </p>

      <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
        Variants — title, price &amp; stock
      </h3>
      <ul className="mt-2 flex flex-col gap-2">
        {variants.map((v, i) => (
          <li
            key={v.id}
            className="bg-surface rounded-lg border border-[color:var(--color-border)] p-3"
          >
            <label className="flex flex-col gap-1">
              <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
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
                className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2"
              />
            </label>
            <p className="text-theme-ink/55 mt-1 font-mono text-[11px]">SKU {v.sku}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
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
                  className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
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
                  className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2"
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="text-theme-ink/55 mt-6 text-[11px] font-semibold uppercase tracking-wider">
        Flags
      </h3>
      <div className="mt-2 flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.featured}
            onChange={(e) => setFlags({ ...flags, featured: e.target.checked })}
            className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent h-4 w-4 rounded"
          />
          Featured (appears on home / corporate)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.bestseller}
            onChange={(e) => setFlags({ ...flags, bestseller: e.target.checked })}
            className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent h-4 w-4 rounded"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={flags.new}
            onChange={(e) => setFlags({ ...flags, new: e.target.checked })}
            className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent h-4 w-4 rounded"
          />
          New arrival
        </label>
      </div>

      {notSeeded && (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {
            "Nothing here can be saved — this product isn't in the database yet. Apply supabase/migrations/0014_seed_products.sql first (see DEPLOYMENT.md)."
          }
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[color:var(--color-border)] pt-4">
        <button
          type="button"
          onClick={save}
          disabled={busy || !configured}
          className="bg-theme-accent shadow-soft hover:shadow-lifted inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold"
        >
          Close
        </button>
      </div>

      <p className="text-theme-ink/55 mt-4 text-[11px]">
        Note: edits land in the <code>products</code> + <code>variants</code> tables and this screen
        reads them straight back. The storefront still ships the catalogue bundled at build, so a
        change here reaches shoppers only after Phase 3&rsquo;s build-time fetch + webhook rebuild
        is wired.
      </p>

      <MediaPickerDialog
        open={pickerOpen}
        kind="product"
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) =>
          setImages((prev) => [
            ...prev,
            {
              url: mediaPublicUrl(asset.storage_path)!,
              alt: asset.alt || product.title,
              width: asset.width ?? 1400,
              height: asset.height ?? 1400,
            },
          ])
        }
      />
    </aside>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-theme-glow/30 text-theme-accent rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
      {children}
    </span>
  );
}

/** Same chip, but for a state the owner needs to act on rather than admire. */
function WarnTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
      {children}
    </span>
  );
}
