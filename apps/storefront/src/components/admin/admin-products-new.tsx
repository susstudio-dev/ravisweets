'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { CategorySlug, DietaryTag } from '@ravisweets/shared';
import { createProduct, uploadProductImage } from '@/lib/supabase/products';
import { logAdminAction } from '@/lib/supabase/orders';

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

  // Image
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

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

  // We need to upload before create so we don't have a half-created
  // product without an image. The bucket is keyed by product id, but for
  // a not-yet-created product we use the slug as a placeholder folder.
  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr(null);
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('Larger than 5 MB. Compress and retry.');
      return;
    }
    setUploading(true);
    const folder = effectiveSlug() || 'unsorted';
    const r = await uploadProductImage(folder, file);
    setUploading(false);
    e.target.value = '';
    if (!r.ok) {
      setUploadErr(r.reason);
      return;
    }
    setImageUrl(r.url);
    if (!imageAlt) setImageAlt(`${title || 'Product'} — photographed at the Khammam kitchen`);
  }

  function valid(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!effectiveSlug()) return 'Slug is required (auto-generated from title).';
    if (!description.trim()) return 'Description is required — at least one paragraph.';
    if (!imageUrl.trim()) return 'Upload or paste a primary image URL.';
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
      primary_image_url: imageUrl,
      primary_image_alt: imageAlt || `${title} — photographed at the Khammam kitchen`,
      variant: {
        id: variantId,
        title: variantTitle.trim(),
        weight_grams: variantWeight,
        price_amount: variantPriceRupees * 100,
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-ink/65 hover:text-theme-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to products
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Launch a new product
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          Fill in the basics + first variant. You can add more variants, second
          images, ingredients, and nutrition from the edit drawer right after
          creation.
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
                      : 'border-[color:var(--color-border)] text-theme-ink/70 hover:border-theme-accent'
                  }`}
                >
                  {t.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Image */}
        <Section title="Primary image" required>
          <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-theme-glow/10 p-3">
            <div className="flex items-center gap-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-[color:var(--color-border)] bg-white object-contain p-1.5"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-white text-[10px] font-semibold uppercase tracking-wider text-theme-ink/40">
                  no image
                </div>
              )}
              <div className="min-w-0 flex-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-theme-accent px-3 py-1.5 text-[11px] font-semibold text-[color:var(--theme-base)]">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                    onChange={onUploadFile}
                    disabled={uploading}
                    className="sr-only"
                  />
                  {uploading ? 'Uploading…' : 'Upload from device'}
                </label>
                <p className="mt-1 text-[10px] text-theme-ink/55">
                  PNG / JPG / WebP / AVIF / SVG · max 5 MB
                </p>
                {uploadErr && (
                  <p className="mt-1 text-[11px] font-medium text-red-700">{uploadErr}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <Field label="…or paste URL">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ravisweets.com/wp-content/uploads/..."
                className={inputCls + ' text-xs font-mono'}
              />
            </Field>
            <Field label="Alt text (accessibility)">
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder={`${title || 'Product'} — photographed at the Khammam kitchen`}
                className={inputCls}
              />
            </Field>
          </div>
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
                onChange={(e) =>
                  setVariantPriceRupees(Math.max(1, Number(e.target.value) || 1))
                }
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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
                Sold by
              </span>
              <div className="inline-flex rounded-full border border-[color:var(--color-border)] bg-surface p-0.5">
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
              className="mt-0.5 h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
            />
            <span>
              <span className="font-medium text-theme-ink">Available in the corporate hamper builder</span>
              <span className="block text-[11px] text-theme-ink/55">
                Off for fragile or cold-chain SKUs.
              </span>
            </span>
          </label>
        </Section>

        {/* Submit */}
        <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] bg-surface-elevated/95 px-5 py-3 backdrop-blur md:-mx-8 md:-mb-8 md:px-8">
          <div>
            {error && (
              <p className="text-xs font-semibold text-red-700">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
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
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
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
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
        {label} {required && <span className="text-theme-accent">·</span>}
      </span>
      {children}
    </label>
  );
}
