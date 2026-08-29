'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ImagePlus,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  CATALOGUE,
  HARDCODED_CATALOGUE,
  TEMPLATES,
  type CategorySlug,
  type DietaryTag,
  type Product,
  type ProductImage,
} from '@ravisweets/shared';
import {
  EMPTY_CATALOGUE_OVERRIDES,
  type CatalogueOverrides,
  type ProductRemovalReport,
  deleteProduct,
  inspectProductRemoval,
  listCatalogueOverrides,
  mergeProductOverrides,
  productFromOverride,
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

/**
 * Products that must never be permanently deleted — only archived.
 *
 * These are the SKUs `HARDCODED_CATALOGUE` defines, which is also what
 * `generate-product-seed.mjs` emits into 0014_seed_products.sql. That seed
 * inserts `on conflict do nothing` and does not mention `archived`, so
 * re-pasting it RESURRECTS any of these that were deleted, with archived back
 * at false. `bake-catalogue-from-source.mjs` brings them back too. A delete
 * here is a change that quietly undoes itself on someone else's deploy, which
 * is worse than no delete at all.
 *
 * Note the size: `HARDCODED_CATALOGUE` opens with 23 object literals and then
 * spreads fourteen generated groups whose helpers mint ids programmatically.
 * It is 151 products — the entire live catalogue. So this set currently
 * protects everything, and Delete arms only for SKUs created through
 * /admin/products/new after the fact. Use the predicate, never the number.
 */
const SEED_IDS = new Set(HARDCODED_CATALOGUE.map((p) => p.id));

/**
 * Products a corporate hamper template is built from, and the template that
 * names each one.
 *
 * These references are hand-maintained ids in
 * packages/shared/src/catalogue/templates.ts with no foreign key behind them,
 * and the quote builder skips any it cannot resolve (`if (!info) continue`).
 * So removing one of these does not raise anything — it silently drops a line
 * from the hamper while the template still advertises it, and the corporate
 * quote goes out UNDER-PRICED. Blocking is the only safe answer; the template
 * has to be edited first.
 */
const TEMPLATE_PRODUCT_IDS = new Map<string, string>(
  Object.values(TEMPLATES).flatMap((t) => t.items.map((i) => [i.productId, t.title] as const)),
);

const CATEGORY_OPTIONS: { value: CategorySlug; label: string }[] = [
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
  'non-veg',
];
import { logAdminAction } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';

export function AdminProducts() {
  const { configured } = useSession();
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [active, setActive] = useState<Product | null>(null);
  /** Product ids whose archive/restore is in flight, so their rows can say so. */
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  /**
   * Deleted in this session. They linger in the bundled CATALOGUE until the
   * next Publish, and without this they would be indistinguishable from a
   * product the 0014 seed was never applied for.
   */
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<string>>(new Set());
  /**
   * Outcome of the last removal, kept on screen rather than shouted once.
   * `kind` is load-bearing: a failure rendered in the same gold wash as a
   * success reads as a success.
   */
  const [notice, setNotice] = useState<{ text: string; kind: 'info' | 'error' } | null>(null);
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

  /**
   * Flip `archived` and re-read. Shared by the row's Restore button and the
   * drawer's danger zone so there is one write, one audit action and one error
   * channel rather than two of each.
   *
   * `upsertProductFlags` already ends in `.select('id')` + `wrote()`, so a
   * write that RLS made invisible reports as a failure instead of a cheerful
   * no-op.
   */
  const setArchived = useCallback(
    async (p: Product, next: boolean): Promise<boolean> => {
      // A Set, not a single id: two rows can be restored at once, and a shared
      // slot would leave the loser's row stuck reading "Restoring…" forever.
      setBusyIds((prev) => new Set(prev).add(p.id));
      setNotice(null);
      try {
        const r = await upsertProductFlags(p.id, { archived: next });
        if (!r.ok) {
          setNotice({ text: `${next ? 'Archive' : 'Restore'} failed: ${r.reason}`, kind: 'error' });
          return false;
        }
        await logAdminAction(
          next ? 'archive-product' : 'unarchive-product',
          'product',
          p.id,
          { archived: !next },
          { archived: next },
        );
        await refresh();
        // Only a product that has been through a Publish is actually on the
        // live site; one created here and archived before its first bake
        // never was.
        const live = CATALOGUE.some((c) => c.id === p.id);
        setNotice({
          text: next
            ? live
              ? `${p.title} archived. It stays on ravisweets.com until the next Publish.`
              : `${p.title} archived. It had not been published yet, so nothing changes for shoppers.`
            : `${p.title} restored. It returns to the shop at the next Publish.`,
          kind: 'info',
        });
        return true;
      } catch (err) {
        setNotice({
          text: `${next ? 'Archive' : 'Restore'} failed: ${err instanceof Error ? err.message : String(err)}`,
          kind: 'error',
        });
        return false;
      } finally {
        // finally, not a line per exit: a throw here used to leave the row
        // permanently disabled with no way back but a page reload.
        setBusyIds((prev) => {
          const nextSet = new Set(prev);
          nextSet.delete(p.id);
          return nextSet;
        });
      }
    },
    [refresh],
  );

  // BUNDLE ∪ DATABASE, and the union is not a nicety.
  //
  // This list used to be `CATALOGUE.map(...)` — the catalogue baked at build
  // time. Two kinds of row exist only in the database and were therefore
  // invisible here:
  //
  //   1. Anything created in /admin/products/new, until the next Publish. The
  //      owner added a product and the screen they were standing on did not
  //      list it.
  //   2. Anything ARCHIVED. The bake reads with the anon key and RLS hides
  //      archived rows from anon, so an archived product leaves the generated
  //      catalogue at the next Publish. Without the union, archiving is a
  //      one-way door — the product is gone from the shop AND from this list,
  //      and only a SQL console could bring it back.
  //
  // The archived row is already in `overrides`: this read carries the staff
  // JWT, so `is_admin()` is true and RLS returns it. It just had no name to
  // render under until PRODUCT_OVERRIDE_COLUMNS started selecting slug/title.
  const rows = useMemo(() => {
    const merged = CATALOGUE.map((p) => mergeProductOverrides(p, overrides));
    const bundled = new Set(CATALOGUE.map((p) => p.id));
    const dbOnly: Product[] = [];
    for (const [id, o] of overrides.products) {
      if (bundled.has(id)) continue;
      dbOnly.push(productFromOverride(id, o, overrides));
    }
    // By id, matching how generate-catalogue.mjs orders products it does not
    // find in the curated list.
    dbOnly.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return [...merged, ...dbOnly];
  }, [overrides]);

  const bundledIds = useMemo(() => new Set(CATALOGUE.map((p) => p.id)), []);

  const filtered = useMemo(() => {
    // Archived products are hidden by default — they are retired stock, and a
    // list that mixes them in reads as though the shop still sells them.
    const visible = showArchived
      ? rows
      : rows.filter((p) => !overrides.products.get(p.id)?.archived);
    if (!query.trim()) return visible;
    const q = query.toLowerCase();
    return visible.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.includes(q),
    );
  }, [query, rows, showArchived, overrides]);

  const archivedCount = useMemo(
    () => rows.filter((p) => overrides.products.get(p.id)?.archived).length,
    [rows, overrides],
  );

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
            {/* Counts what the table below actually shows. `rows.length`
                would keep asserting 151 over a list of 146 after archiving
                five — the one number the owner reads as "the whole shop". */}
            Products ({filtered.length}
            {filtered.length !== rows.length ? ` of ${rows.length}` : ''})
          </h1>
          <p className="text-theme-ink/65 mt-1 text-sm">
            {configured
              ? 'Live values from the database, falling back to the bundled catalogue for anything not seeded yet. Inline edit on price, stock, sale, image upload + flags. Open a product to archive or delete it. Adding, archiving and deleting all reach shoppers only at the next Publish.'
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

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-md">
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
        {/* Only offered once something is actually archived — an empty toggle
            is a question nobody asked. */}
        {archivedCount > 0 && (
          <label className="text-theme-ink/70 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent h-4 w-4 rounded"
            />
            Show archived ({archivedCount})
          </label>
        )}
      </div>

      {/* aria-live so archiving — which unmounts the drawer and drops focus
          back to the body — is announced rather than only drawn. Matches
          publish-panel.tsx's outcome region. */}
      <div aria-live="polite" className="empty:hidden">
        {notice && (
          <p
            className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-medium ${
              notice.kind === 'error'
                ? 'border-red-300 bg-red-50 text-red-800'
                : 'text-theme-ink/85 border-[color:var(--color-border)] bg-theme-glow/10'
            }`}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
              className={`shrink-0 ${notice.kind === 'error' ? 'text-red-800/60 hover:text-red-800' : 'text-theme-ink/50 hover:text-theme-ink'}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </p>
        )}
      </div>

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
              // A product deleted in this session is still in the bundled
              // CATALOGUE until the next Publish, so it re-renders here as a
              // normal row. Without this it would take the `Not in DB` tag —
              // whose drawer banner tells the owner to apply the 0014 seed —
              // seconds after they deleted it on purpose. Same state, opposite
              // meanings, and the wrong instruction is the one on screen.
              const justDeleted = deletedIds.has(p.id);
              const missingRow =
                !justDeleted && overrides.products.size > 0 && !overrides.products.has(p.id);
              const archived = overrides.products.get(p.id)?.archived ?? false;
              // The mirror of `missingRow`: in the database, not in the bundle.
              // Either it was created here and has not been baked yet, or it is
              // archived and has already been baked out.
              const unpublished = !missingRow && !bundledIds.has(p.id);
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
                      {justDeleted && <WarnTag>Deleted</WarnTag>}
                      {archived && <WarnTag>Archived</WarnTag>}
                      {missingRow && <WarnTag>Not in DB</WarnTag>}
                      {unpublished && !archived && <WarnTag>Not published</WarnTag>}
                      {/* Reachable via createProduct's best-effort rollback:
                          product inserted, variant insert failed, cleanup
                          delete never landed. It is unsellable and it holds a
                          unique slug, so the owner needs a way to see it. */}
                      {!justDeleted && !missingRow && p.variants.length === 0 && (
                        <WarnTag>No SKUs</WarnTag>
                      )}
                    </div>
                  </td>
                  <td className="text-theme-ink/40 px-4 py-3 text-right">
                    {archived ? (
                      <button
                        type="button"
                        // stopPropagation is load-bearing: the <tr> opens the
                        // drawer, and without this the restore fires and the
                        // panel flies open over the result.
                        onClick={(e) => {
                          e.stopPropagation();
                          void setArchived(p, false);
                        }}
                        disabled={!configured || busyIds.has(p.id)}
                        // Sets its own ink: the cell is text-theme-ink/40 for a
                        // decorative arrow, which on the only control an
                        // archived row exposes would fail contrast.
                        className="text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
                        {busyIds.has(p.id) ? 'Restoring…' : 'Restore'}
                      </button>
                    ) : (
                      <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                    )}
                  </td>
                </tr>
              );
            })}
            {/* Archiving the last visible product is a new way for this table
                to empty out, and column headings over a blank box explain
                nothing. Name the reason and offer the way back. */}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-theme-ink/65 px-4 py-8 text-center text-sm">
                  {archivedCount > 0 && !showArchived ? (
                    <>
                      Nothing to show.{' '}
                      {rows.length === archivedCount
                        ? `All ${archivedCount} product(s) are archived.`
                        : 'No product matches your search.'}{' '}
                      <button
                        type="button"
                        onClick={() => setShowArchived(true)}
                        className="text-theme-accent font-semibold underline underline-offset-2"
                      >
                        Show archived ({archivedCount})
                      </button>
                    </>
                  ) : (
                    'No product matches your search.'
                  )}
                </td>
              </tr>
            )}
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
          deleted={deletedIds.has(active.id)}
          archived={overrides.products.get(active.id)?.archived ?? false}
          published={bundledIds.has(active.id)}
          deletable={!SEED_IDS.has(active.id)}
          onArchive={(next) => setArchived(active, next)}
          onRemoved={(message, deletedId) => {
            setActive(null);
            // setArchived already refreshed and posted its own notice; a delete
            // has not, so it passes one here.
            if (message) setNotice({ text: message, kind: 'info' });
            if (deletedId) setDeletedIds((prev) => new Set(prev).add(deletedId));
            void refresh();
          }}
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
  deleted,
  archived,
  published,
  deletable,
  onArchive,
  onRemoved,
  onSaved,
  onClose,
}: {
  product: Product;
  /** Whether this product has a row in `products`. Nothing saves when false. */
  seeded: boolean;
  /** Destroyed in this session, so `seeded: false` has a different cause. */
  deleted: boolean;
  /** Current `products.archived`. Not on Product — the type has no such field. */
  archived: boolean;
  /**
   * Whether this product is in the bundled catalogue, i.e. whether it has ever
   * been through a Publish. A product created here and archived before its
   * first bake was never on ravisweets.com, so the copy must not claim it is.
   */
  published: boolean;
  /** False for seed products, which may only ever be archived. See SEED_IDS. */
  deletable: boolean;
  /** Flips `archived`; resolves false if the write did not land. */
  onArchive: (next: boolean) => Promise<boolean>;
  /**
   * Close the drawer. The optional message becomes the list's notice, and
   * `deletedId` marks a row as destroyed-this-session so it is not mislabelled
   * "Not in DB" while it lingers in the bundled catalogue until the next bake.
   */
  onRemoved: (message?: string, deletedId?: string) => void;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { configured, hasRole } = useSession();
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
  /*
   * SALE PRICE IS RUPEES — the same unit as variant.price.amount.
   *
   * This used to scale by 100 in both directions, on the strength of the
   * `-- paise` comment in 0003_product_sale_pricing.sql. The consumer decides
   * the unit, and computeEffectivePrice (packages/shared/src/types/product.ts)
   * does `Math.min(product.sale_price, variant.price.amount)` — where the
   * variant amount is rupees, as generate-catalogue.mjs documents at length.
   *
   * So a ₹200 sale on a ₹279 product was written as 20000, and Math.min then
   * clamped it back to 279: the product rendered "on sale" at full price with
   * 0% off. Flat sale pricing had never worked. Percent-off was unaffected —
   * it derives from the regular price and never touches this column.
   *
   * A row still holding a paise value stays inert after this change (it is far
   * larger than the regular price, so Math.min keeps clamping) rather than
   * suddenly discounting by 100x. Re-enter any flat sale price to fix it.
   */
  const [salePriceRupees, setSalePriceRupees] = useState<number>(
    typeof product.sale_price === 'number'
      ? product.sale_price
      : Math.round((product.variants[0]?.price.amount ?? 0) * 0.85),
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

  /* ─── removal ─────────────────────────────────────────────────────────── */

  const [removing, setRemoving] = useState(false);
  /**
   * Synchronous re-entrancy latch. State is too slow to gate an irreversible
   * action — two clicks in one tick both read `removing === false`.
   */
  const inFlight = useRef(false);
  /**
   * False once the drawer is gone. Every `await` in a removal flow is a point
   * where the owner may have closed the panel, and resuming past that would
   * pop a confirm over a dismissed dialog or setState on a dead component.
   */
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  /** Typed slug, the confirmation for a delete that cannot be undone. */
  const [confirmSlug, setConfirmSlug] = useState('');
  const [report, setReport] = useState<ProductRemovalReport | null>(null);
  /** Only founders and admins may permanently destroy catalogue rows. */
  const mayDelete = deletable && hasRole('founder', 'admin');

  // Probe the blast radius when the drawer opens on a deletable product, so
  // the button can arm — or refuse with a reason on screen — before the owner
  // has typed anything. Re-probed immediately before the delete, because this
  // result is stale by then.
  useEffect(() => {
    if (!configured || !mayDelete) return;
    let live = true;
    void inspectProductRemoval(product.id).then((r) => {
      if (live) setReport(r);
    });
    return () => {
      live = false;
    };
  }, [configured, mayDelete, product.id]);

  /**
   * Why a delete is refused, or null when it is allowed.
   *
   * A failed probe is a BLOCK, never a pass: "this product has no FSSAI
   * batches" and "I could not find out whether it does" look identical in a
   * zero, and only one of them is safe to destroy records over.
   */
  /**
   * Set when a corporate hamper template is built from this product.
   *
   * REFUSES A DELETE; WARNS ON AN ARCHIVE. Both produce the same catalogue
   * removal at the next bake — RLS hides archived rows from the anon key the
   * generator reads with — and since seed products can never be deleted,
   * archive is the only removal anyone can perform on the live catalogue. But
   * archive is reversible and is the emergency lever (a contaminated batch,
   * a mispriced SKU), so it states the cost and lets the owner decide. Delete
   * cannot be taken back, so it refuses.
   *
   * The consequence is silent under-charging rather than an error: the quote
   * builder skips any item id it cannot resolve, so the template goes on
   * advertising a hamper it no longer prices in full.
   */
  const templateBlock = (() => {
    const t = TEMPLATE_PRODUCT_IDS.get(product.id);
    return t
      ? `The "${t}" corporate hamper template is built from this product. Removing it drops that line from the hamper while the template still advertises it, so quotes go out under-priced. Edit packages/shared/src/catalogue/templates.ts first.`
      : null;
  })();

  /**
   * Why a delete is refused, or null when nothing refuses it.
   *
   * A null report is NOT a refusal message — it means the probe has not
   * answered yet, which is a loading state and must not be dressed as a
   * warning. The caller renders that case separately; the delete button stays
   * not rendered at all until `canDelete` is true, and `destroy()` re-checks
   * against a fresh probe regardless.
   */
  function blockedReason(r: ProductRemovalReport | null): string | null {
    if (templateBlock) return templateBlock;
    if (!r) return null;
    if (r.error) return `Could not check what this would delete (${r.error}).`;
    if (r.batches > 0)
      return `${r.batches} FSSAI batch record(s) hang off this product's SKUs. Those are regulated traceability records and the delete would cascade through them.`;
    if (r.stockAdjustments > 0)
      return `${r.stockAdjustments} stock-ledger entr(ies) hang off this product's SKUs. That ledger is append-only by policy, but a delete cascades through it anyway.`;
    if (r.ordersOpen > 0)
      return `${r.ordersOpen} order(s) containing this product have not been packed yet. Fulfil or cancel them first — the SKU rows carry the GST tariff code those invoices need.`;
    return null;
  }

  /** A probe that has not answered is never a pass — only `report` proves it. */
  const canDelete = report !== null && blockedReason(report) === null;

  async function archiveOrRestore() {
    const next = !archived;
    if (
      next &&
      // Archiving a hamper component under-prices every corporate quote that
      // template feeds, so the consequence is spelled out — but archive is
      // reversible and is the only way to pull a product in a hurry, so this
      // warns rather than refuses. Delete, which is not reversible, still
      // blocks outright. Restoring is always safe and asks nothing.
      !window.confirm(
        templateBlock
          ? `${templateBlock}\n\nArchive ${product.title} anyway? You can restore it here.`
          : // One sentence otherwise, matching every other confirm in this
            // admin. The panel behind it already explains the mechanics; a
            // paragraph in a native alert only trains the owner to click
            // through the one that matters.
            published
            ? `Archive ${product.title}? It stays on ravisweets.com until the next Publish. You can restore it here.`
            : `Archive ${product.title}? You can restore it here.`,
      )
    )
      return;
    if (inFlight.current) return;
    inFlight.current = true;
    setRemoving(true);
    setError(null);
    try {
      const ok = await onArchive(next);
      // Archiving closes the panel — the product is retired and there is
      // nothing left to edit on it. Restoring keeps it open: the `archived`
      // prop updates from the parent's refresh and the owner usually carries
      // on editing. Either way the notice comes from onArchive.
      if (ok && next && mounted.current) onRemoved();
    } catch (err) {
      fail(`Archive failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      inFlight.current = false;
      if (mounted.current) setRemoving(false);
    }
  }

  async function destroy() {
    if (!configured) return;
    // RE-ENTRANCY GUARD ON A REF, NOT ON `removing`.
    //
    // `removing` is React state, so a second click landing in the same tick —
    // or any time before the first render after setRemoving(true) — still sees
    // the old value and passes. For an irreversible cascade that is a deleted
    // product and a second delete racing behind it. A ref updates
    // synchronously and closes the window entirely.
    if (inFlight.current) return;
    inFlight.current = true;
    setRemoving(true);
    setError(null);
    try {
      await runDestroy();
    } catch (err) {
      fail(`Delete failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      inFlight.current = false;
      if (mounted.current) setRemoving(false);
    }
  }

  /** The body of destroy(), so the guard/try/finally above stays readable. */
  async function runDestroy() {
    // Re-probe: the report on screen was taken when the drawer opened, and a
    // variant added since is invisible to it — along with every batch and
    // ledger row hanging off that variant.
    const fresh = await inspectProductRemoval(product.id);
    // Closed mid-probe. Stop before the confirm — popping a modal over a panel
    // the owner has already dismissed, and then deleting, is indefensible.
    if (!mounted.current) return;
    setReport(fresh);
    const blocked = blockedReason(fresh);
    if (blocked) {
      fail(`Delete refused. ${blocked}`);
      return;
    }
    if (confirmSlug.trim() !== product.slug) {
      fail(`Type the slug "${product.slug}" exactly to confirm.`);
      return;
    }
    // Only things the cascade actually DESTROYS belong in this list. Past
    // orders do not: orders.lines is a jsonb snapshot with no foreign key, so
    // deleting the product does not touch them. Listing them as casualties and
    // then saying receipts survive contradicts itself inside one dialog.
    const destroyed = [
      `its ${fresh.variantIds.length} SKU(s)`,
      fresh.reviews > 0 && `${fresh.reviews} customer review(s)`,
      fresh.locationStock > 0 && `${fresh.locationStock} branch stock row(s)`,
    ].filter(Boolean) as string[];
    const orderNote =
      fresh.ordersTotal > 0
        ? `\n\n${fresh.ordersTotal} past order(s) name this product. Those receipts keep rendering — order lines are snapshots — but their links to it stop working, and the GST tariff code lives only on the SKU rows about to be deleted.`
        : '';
    if (
      !window.confirm(
        `Permanently delete ${product.title}? This destroys ${destroyed.join(', ')}, and cannot be undone.${orderNote}`,
      )
    )
      return;

    // Log BEFORE the delete: once the cascade has run, these counts exist
    // nowhere else. A stale log entry (delete logged, then delete failed) is a
    // far smaller problem than a destroyed FSSAI ledger with no record of it.
    const logged = await logAdminAction(
      'delete-product',
      'product',
      product.id,
      {
        product: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          category: product.category,
        },
        variantIds: fresh.variantIds,
        cascaded: fresh,
      },
      null,
    );
    // Refuse rather than proceed unlogged. The likeliest cause is a JWT that
    // lost its admin role — in which case the delete would fail anyway — and
    // the alternative is an irreversible cascade nobody can account for.
    if (!logged) {
      fail(
        'Delete stopped: the audit log could not be written, so this deletion would leave no record. ' +
          'Sign out and back in to refresh your admin token, then try again.',
      );
      return;
    }
    const r = await deleteProduct(product.id);
    if (!r.ok) {
      await logAdminAction(
        'delete-product-failed',
        'product',
        product.id,
        { reason: r.reason },
        null,
      );
      fail(`Delete failed: ${r.reason}`);
      return;
    }
    onRemoved(
      published
        ? `${product.title} deleted permanently. It leaves the shop at the next Publish — add a redirect in apps/storefront/public/_redirects for /product/${product.slug} so the old URL does not 404.`
        : `${product.title} deleted permanently. It had never been published, so no live URL is affected.`,
      product.id,
    );
  }

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
          (saleMode === 'flat' && salePriceRupees !== (product.sale_price ?? -1))));
    if (saleChanged) {
      const r = await upsertProductSale(product.id, {
        on_sale: onSale,
        sale_price: onSale && saleMode === 'flat' ? salePriceRupees : null,
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
          sale_price: saleMode === 'flat' ? salePriceRupees : null,
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
          // Closing mid-removal would strand an in-flight irreversible write
          // behind a dismissed panel.
          disabled={removing}
          className="text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink rounded-full p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
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
                placeholder={`${product.title} — made fresh at Ravi Sweets`}
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
              {/* Rupees throughout — variant.price.amount is NOT paise. The
                  strikethrough used to divide by 100 and the percent branch by
                  100 twice, so a ₹279 product previewed as ₹3 struck through
                  and ₹0 on sale. Same unit confusion as the write path above. */}
              <span className="text-theme-ink/55 line-through">
                {`₹${product.variants[0]?.price.amount ?? 0}`}
              </span>
              <span className="font-display text-theme-accent ml-2 text-base">
                {saleMode === 'percent'
                  ? `₹${Math.round(((product.variants[0]?.price.amount ?? 0) * (100 - salePercent)) / 100)}`
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
          {/* Two different reasons the row is absent, and only one of them is
              fixed by a seed paste. Telling someone who just deleted a product
              to re-apply 0014 points them at undoing their own decision. */}
          {deleted
            ? 'This product was deleted. It stays in the bundled catalogue until the next Publish, which is why it is still listed — nothing here can be saved.'
            : "Nothing here can be saved — this product isn't in the database yet. Apply supabase/migrations/0014_seed_products.sql first (see DEPLOYMENT.md)."}
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
          disabled={removing}
          className="text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Close
        </button>
      </div>

      {/* Removal lives here and never in the table row: the row is a
          click-through that opens this panel, and a destructive control inside
          it is a misclick generator. */}
      <section className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/5 p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700">
          Remove this product
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void archiveOrRestore()}
            disabled={!configured || removing || !seeded}
            className={`text-theme-ink/85 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              // Red on hover only when the press actually retires something.
              // Restore brings a product back, and colouring it destructive
              // contradicts the row-level Restore, which hovers to the accent.
              archived
                ? 'hover:border-theme-accent hover:text-theme-accent'
                : 'hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-700'
            }`}
          >
            {archived ? (
              <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {removing ? 'Working…' : archived ? 'Restore product' : 'Archive product'}
          </button>
          {archived && <WarnTag>Archived</WarnTag>}
        </div>

        {/* A warning, not a barrier: archive is reversible and is the only way
            to pull a product quickly, so it states the cost and lets the owner
            decide. The delete below still refuses outright. */}
        {!archived && templateBlock && (
          <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800">
            {templateBlock}
          </p>
        )}
        <p className="text-theme-ink/65 mt-2 text-[11px]">
          Archiving hides the product and nothing more — variants, reviews and stock stay intact,
          and you can restore it from this screen. It leaves the shop at the next{' '}
          <strong>Publish</strong>
          {published ? '; until then it is still on ravisweets.com' : ''}.
        </p>

        {/* The permanent option. Disabled for every seed product, which today
            is the whole catalogue — see SEED_IDS. */}
        <div className="mt-4 border-t border-red-500/20 pt-4">
          {!deletable ? (
            <p className="text-theme-ink/65 text-[11px]">
              <strong>Permanent delete is not available for this product.</strong> It is defined in
              the bundled catalogue (<code>packages/shared/src/catalogue/products.ts</code>), which
              also generates the seed migration — so a delete here would be undone the next time
              anyone applies the seed or re-bakes from source. Remove it from that file and re-run{' '}
              <code>generate:seed</code> instead. Archive is the reversible option above.
            </p>
          ) : !hasRole('founder', 'admin') ? (
            <p className="text-theme-ink/65 text-[11px]">
              Permanent delete is restricted to founder and admin accounts.
            </p>
          ) : (
            <>
              <p className="text-theme-ink/65 text-[11px]">
                Permanent delete destroys the product, its{' '}
                {report?.variantIds.length ?? product.variants.length} SKU(s), and every
                review attached to it. <strong>This cannot be undone.</strong>
              </p>

              {report && !report.error && (
                <ul className="text-theme-ink/70 mt-2 space-y-0.5 text-[11px]">
                  <li>Reviews: {report.reviews}</li>
                  <li>Branch stock rows: {report.locationStock}</li>
                  <li>FSSAI batches: {report.batches}</li>
                  <li>Stock-ledger entries: {report.stockAdjustments}</li>
                  <li>
                    Orders referencing it: {report.ordersTotal}
                    {report.ordersOpen > 0 && ` (${report.ordersOpen} not yet packed)`}
                  </li>
                </ul>
              )}

              {blockedReason(report) ? (
                <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800">
                  {blockedReason(report)}
                </p>
              ) : !canDelete ? (
                // Not a warning — the probe simply has not answered. With
                // Supabase unconfigured it never will, so say which it is
                // rather than spinning forever in amber.
                <p className="text-theme-ink/55 mt-3 text-[11px]">
                  {configured
                    ? 'Checking what this would delete…'
                    : 'Connect Supabase to check what this would delete.'}
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-theme-ink/70 text-[11px] font-semibold">
                    Type <code>{product.slug}</code> to confirm
                    <input
                      type="text"
                      value={confirmSlug}
                      onChange={(e) => setConfirmSlug(e.target.value)}
                      autoComplete="off"
                      // Ring, not just a border hue: this is the field that
                      // arms an irreversible delete, and every other input on
                      // the screen pairs outline-none with a visible ring.
                      className="bg-surface-elevated text-theme-ink mt-1 block w-64 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-normal focus-visible:border-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void destroy()}
                    disabled={removing || confirmSlug.trim() !== product.slug}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {removing ? 'Deleting…' : 'Delete forever'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <p className="text-theme-ink/55 mt-4 text-[11px]">
        Note: edits land in the <code>products</code> + <code>variants</code> tables and this screen
        reads them straight back. The storefront ships the catalogue bundled at build, so anything
        changed here — price, copy, archive, delete — reaches shoppers only after the next Publish.
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
