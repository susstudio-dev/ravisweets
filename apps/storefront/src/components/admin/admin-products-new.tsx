'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { CategorySlug, DietaryTag } from '@ravisweets/shared';
import type { ImageRef } from '@/lib/content/page-media';
import { createProduct } from '@/lib/supabase/products';
import { logAdminAction } from '@/lib/supabase/orders';
import { MediaField } from '@/components/admin/media-picker';
import { mediaPublicUrl } from '@/lib/media/public-url';
import { useMediaAssets } from '@/lib/supabase/site-content-context';

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

const DIETARY: DietaryTag[] = [
  'eggless',
  'sugar-free',
  'vegan',
  'gluten-free',
  'nuts',
  'dairy',
  'contains-ghee',
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminProductsNew() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugDirty, setSlugDirty] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategorySlug>('sweets');
  const [tags, setTags] = useState<DietaryTag[]>(['eggless', 'dairy']);
  const [shelfLife, setShelfLife] = useState(15);
  const [storage, setStorage] = useState('Store in an airtight container in a cool, dry place.');
  const [unitMode, setUnitMode] = useState<'weight' | 'quantity'>('weight');
  const [builderEligible, setBuilderEligible] = useState(true);

  // First variant
  const [variantTitle, setVariantTitle] = useState('250 g');
  const [variantWeight, setVariantWeight] = useState(250);
  const [variantPriceRupees, setVariantPriceRupees] = useState(299);
  const [variantSku, setVariantSku] = useState('');
  const [variantStock, setVariantStock] = useState(40);

  // Primary image — a media-library ref, resolved to a ProductImage on create.
  const [imageRef, setImageRef] = useState<ImageRef>(null);
  const { byId } = useMediaAssets();
  const asset = imageRef ? (byId.get(imageRef.assetId) ?? null) : null;

  // Submit
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(t: DietaryTag) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function effectiveSlug(): string {
    return slugDirty ? slug : slugify(title);
  }

  function effectiveSku(): string {
    if (variantSku.trim()) return variantSku.trim();
    const baseTitle = title.split(/\s+/).slice(0, 2).join('').toUpperCase().slice(0, 8);
    return `RS-${baseTitle || 'NEW'}-${Math.round(variantWeight)}`;
  }

  function valid(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!effectiveSlug()) return 'Slug is required (auto-generated from title).';
    if (!description.trim()) return 'Description is required — at least one paragraph.';
    if (!imageRef) return 'Choose a primary photo from the media library.';
    if (!asset) return 'That photo is no longer in the library — choose another.';
    if (variantPriceRupees <= 0) return 'Variant price must be greater than 0.';
    if (variantStock < 0) return 'Stock cannot be negative.';
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = valid();
    if (v) {
      setError(v);
      return;
    }
    // Resolve the library ref to a concrete ProductImage — same shape the
    // product drawer's gallery editor appends.
    const imageAssetUrl = asset ? mediaPublicUrl(asset.storage_path) : null;
    if (!asset || !imageAssetUrl) {
      setError('Photo could not be resolved — is Supabase configured?');
      return;
    }
    setError(null);
    setBusy(true);
    const productId = `p_${effectiveSlug().replace(/-/g, '_')}_${Date.now().toString(36)}`;
    const variantId = `${productId}_v1`;
    const r = await createProduct({
      id: productId,
      slug: effectiveSlug(),
      title: title.trim(),
      description: description.trim(),
      category,
      dietary_tags: tags,
      shelf_life_days: shelfLife,
      storage_instructions: storage.trim(),
      builder_eligible: builderEligible,
      unit_mode: unitMode,
      primary_image_url: imageAssetUrl,
      primary_image_alt:
        imageRef?.alt || asset.alt || `${title.trim()} — photographed at the Khammam kitchen`,
      primary_image_width: asset.width ?? 1400,
      primary_image_height: asset.height ?? 1400,
      variant: {
        id: variantId,
        title: variantTitle.trim(),
        weight_grams: variantWeight,
        /*
         * RUPEES, not paise — do not reintroduce the `* 100` that was here.
         *
         * The column name invites the paise reading, but every other writer
         * treats it as rupees: 0014_seed_products.sql copies Money.amount in
         * verbatim, and the inline editor calls upsertVariantPrice(v.id,
         * v.price) unscaled. The live rows agree — the dearest SKU reads 3300,
         * which is ₹3,300 and not ₹33. formatMoney prints Money.amount with
         * maximumFractionDigits: 0, so rupees is the unit end to end.
         *
         * This was harmless while nothing read the products table back. Now
         * that the build bakes the catalogue from it, a product added through
         * this form would have shipped to the live shop at 100× its price.
         */
        price_amount: variantPriceRupees,
        sku: effectiveSku(),
        stock_available: variantStock,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setError(`Save failed: ${r.reason}. Check migration 0001 + 0002 + 0003 are run.`);
      return;
    }
    await logAdminAction('create', 'product', productId, null, {
      slug: effectiveSlug(),
      title,
    });
    router.push('/admin/products');
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <Link
          href="/admin/products"
          className="text-theme-ink/65 hover:text-theme-accent inline-flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to products
        </Link>
        <h1 className="font-display text-theme-ink mt-2 text-3xl md:text-4xl">
          Launch a new product
        </h1>
        <p className="text-theme-ink/65 mt-1 text-sm">
          Fill in the basics + first variant. You can add more variants, second images, ingredients,
          and nutrition from the edit drawer right after creation.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-5">
        {/* Basics */}
        <Section title="Basics">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title" required>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Anjeer Katli"
                className={inputCls}
              />
            </Field>
            <Field label="URL slug">
              <input
                type="text"
                value={effectiveSlug()}
                onChange={(e) => {
                  setSlugDirty(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="anjeer-katli"
                className={inputCls + ' font-mono'}
              />
            </Field>
            <Field label="Category" required>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug)}
                className={inputCls}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Shelf life (days)">
              <input
                type="number"
                min={1}
                value={shelfLife}
                onChange={(e) => setShelfLife(Math.max(1, Number(e.target.value) || 1))}
                className={inputCls + ' font-mono'}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description" required>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="One paragraph. Describe the dish, the kitchen craft, the texture, the time it takes to make. The customer is buying the story as much as the box."
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Storage instructions">
                <input
                  type="text"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Dietary tags */}
        <Section title="Dietary tags">
          <div className="flex flex-wrap gap-1.5">
            {DIETARY.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                    on
                      ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)]'
                      : 'text-theme-ink/70 hover:border-theme-accent border-[color:var(--color-border)]'
                  }`}
                >
                  {t.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Image — from the shared media library */}
        <Section title="Primary image" required>
          <MediaField
            label="Primary photo"
            hint="Pick from the media library — new uploads land there and are auto-shrunk."
            kind="product"
            value={imageRef}
            onChange={setImageRef}
          />
        </Section>

        {/* First variant */}
        <Section title="First variant">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Variant label">
              <input
                type="text"
                value={variantTitle}
                onChange={(e) => setVariantTitle(e.target.value)}
                placeholder='250 g · or "Box of 12"'
                className={inputCls}
              />
            </Field>
            <Field label="Weight (g)">
              <input
                type="number"
                min={1}
                value={variantWeight}
                onChange={(e) => setVariantWeight(Math.max(1, Number(e.target.value) || 1))}
                className={inputCls + ' font-mono'}
              />
            </Field>
            <Field label="Price (₹)">
              <input
                type="number"
                min={1}
                value={variantPriceRupees}
                onChange={(e) => setVariantPriceRupees(Math.max(1, Number(e.target.value) || 1))}
                className={inputCls + ' font-mono'}
              />
            </Field>
            <Field label="Stock available">
              <input
                type="number"
                min={0}
                value={variantStock}
                onChange={(e) => setVariantStock(Math.max(0, Number(e.target.value) || 0))}
                className={inputCls + ' font-mono'}
              />
            </Field>
            <Field label={`SKU (auto: ${effectiveSku()})`}>
              <input
                type="text"
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
                placeholder="leave blank to auto-generate"
                className={inputCls + ' font-mono'}
              />
            </Field>
            <div className="flex items-center gap-3">
              <span className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
                Sold by
              </span>
              <div className="bg-surface inline-flex rounded-full border border-[color:var(--color-border)] p-0.5">
                {(['weight', 'quantity'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setUnitMode(m)}
                    aria-pressed={unitMode === m}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                      unitMode === m
                        ? 'bg-theme-accent text-[color:var(--theme-base)]'
                        : 'text-theme-ink/60'
                    }`}
                  >
                    {m === 'weight' ? 'Weight' : 'Pack'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Builder eligibility */}
        <Section title="Hamper builder">
          <label className="flex items-start gap-2 text-sm">
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
                Off for fragile or cold-chain SKUs.
              </span>
            </span>
          </label>
        </Section>

        {/* Submit */}
        <div className="bg-surface-elevated/95 sticky bottom-0 -mx-5 -mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] px-5 py-3 backdrop-blur md:-mx-8 md:-mb-8 md:px-8">
          <div>{error && <p className="text-xs font-semibold text-red-700">{error}</p>}</div>
          <button
            type="submit"
            disabled={busy}
            className="bg-theme-accent shadow-soft hover:shadow-lifted inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {busy ? 'Creating…' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30';

function Section({
  title,
  required,
  children,
}: {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5">
      <h2 className="text-theme-ink/55 text-[11px] font-semibold uppercase tracking-wider">
        {title} {required && <span className="text-theme-accent">·</span>}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-theme-ink/65 text-[11px] font-semibold uppercase tracking-wider">
        {label} {required && <span className="text-theme-accent">·</span>}
      </span>
      {children}
    </label>
  );
}
