# Admin product removal — design

**Date:** 2026-08-24
**Status:** approved, ready to implement

The admin can add a product but not remove one. This adds removal in two forms:
a reversible **Archive**, and a permanent **Delete** restricted to SKUs the admin
itself created.

---

## 1. Why this is bigger than a button

Three facts about this codebase decide the whole shape of the change.

### 1.1 The admin list reads the bundle, not the database

`admin-products.tsx` builds its rows from `CATALOGUE.map(...)`. `CATALOGUE` is
`GENERATED_CATALOGUE` (baked from Supabase at build time by
`scripts/generate-catalogue.mjs`), falling back to `HARDCODED_CATALOGUE` only
when the bake produced nothing.

Two consequences, both pre-existing:

- A product created via `/admin/products/new` lives only in the database, so it
  is **invisible in the admin list until the next Publish**.
- The catalogue bake reads with the **anon** key, and RLS
  (`0001_init.sql:150`) hides archived rows from anon. So an archived product
  leaves `GENERATED_CATALOGUE` — and therefore leaves the admin list too.

Archive would therefore be a **one-way door**: hide a product and nothing in the
UI can ever bring it back. Recovery would need a SQL console.

### 1.2 Archiving currently does nothing at all

`generate-catalogue.mjs:514-544` refuses to rewrite the catalogue when the
database reports fewer `/products/` photographs than the committed file. An
archived product takes its photos with it, so the guard fires. The bare `return`
is swallowed by `build-cloudflare.mjs:126-137`.

Net effect today: **Publish reports success, the deploy goes green, the product
stays live** — and every unbaked price/title/category edit since the last
successful bake is held back with it. The only signal is a `warn` line whose
text blames un-applied migrations, which is the wrong diagnosis.

### 1.3 The seed set is the entire catalogue

`HARDCODED_CATALOGUE` opens with 23 literals and then spreads 14 generated
groups (`products.ts:578-603`) whose helpers mint ids programmatically. Its true
size is **151** — verified by diffing `0014_seed_products.sql` (emitted *from*
`HARDCODED_CATALOGUE`) against `products.generated.ts`:

```
GENERATED_CATALOGUE products:        151
0014 seed products:                  151
live-but-not-seed  (deletable):        0
seed-but-not-live:                     0
```

The sets are identical.

---

## 2. Ship order — a correctness constraint, not a preference

The two halves are individually harmful and only jointly correct.

| Shipped alone | Result |
|---|---|
| Generator guard fix (§6) | Archived products leave `CATALOGUE`; the admin list maps `CATALOGUE`; the row vanishes from /admin with no way back → **one-way door** |
| Union list (§3) | Archive reports success, the generator refuses to rewrite, the build swallows it, deploy goes green → **silent no-op**, plus every other pending edit held back |

**§3 and §6 land in the same commit.** Both failure modes look like success from
the UI, the network tab, and the build log.

---

## 3. The admin list becomes bundle ∪ database

The archived row is **already in the admin's read payload** —
`listCatalogueOverrides()` runs on the browser client with the staff JWT, so
`is_admin()` is true and RLS returns archived rows. What is missing is
*identity*: `PRODUCT_OVERRIDE_COLUMNS` selects no `slug`/`title`, so a row with
no bundled counterpart cannot be rendered.

**Changes to `lib/supabase/products.ts`:**

- `PRODUCT_OVERRIDE_COLUMNS` gains `slug, title`. Rewrite the block comment
  above it: these are selected to *identify* rows with no bundled counterpart,
  and are deliberately **not** merged in `mergeProductOverrides` — otherwise seed
  data would overwrite hand-authored bundle copy.
- `VARIANT_OVERRIDE_COLUMNS` gains `product_id, weight_grams, sku,
  price_currency`.
- `CatalogueOverrides` gains `variantsByProduct: Map<string, VariantOverride[]>`.
  Add it to `EMPTY_CATALOGUE_OVERRIDES` and to the error return.
- New `productFromOverride(id, o, overrides): Product | null` — synthesises a
  `Product` from a database row with no bundled twin. Returns `null` when the row
  has no variants, mirroring `generate-catalogue.mjs:331-334`. Defaults copy
  `createProduct`. `archived` is **not** on the result: `Product` has no such
  field, and the generated catalogue can never contain an archived row. Callers
  read it from `overrides.products.get(id)?.archived`.

**Changes to `admin-products.tsx`:** the `rows` memo becomes a union keyed by id —
bundled products merged as today, then database-only rows appended and sorted by
id to match the generator's ordering. A `showArchived` toggle beside the search
input; archived rows hidden by default. `Products ({CATALOGUE.length})` becomes
`rows.length`.

Row tags: existing `Not in DB` and `Archived` are unchanged; add `Not published`
for database-only rows. Archived rows get an inline **Unarchive** button which
**must** call `e.stopPropagation()` — the `<tr onClick>` opens the drawer
otherwise.

> The union depends on `is_admin()` being true. A stale JWT or a failed read
> makes archived rows invisible again. The existing `overrides.error` banner is
> the only signal — do not remove it.

---

## 4. The two controls

Both live in a danger zone below the drawer footer, never in the table row — a
destructive control inside a click-through row is a misclick generator.

**Archive / Unarchive** — every product. Calls the existing
`upsertProductFlags(id, { archived })`, which already ends in `.select('id')` +
`wrote()`. Confirm copy states that variants, reviews and stock stay intact and
that it leaves the shop at the next Publish.

Archive is **not** folded into `runSave()`. It is a state change with its own
confirm and its own audit action; behind "Save changes" an accidental Enter key
retires a product.

**Delete forever** — enabled only when the product is not a seed product, gated
to `hasRole('founder','admin')`, confirmed by typing the slug.

```ts
const SEED_IDS = new Set(HARDCODED_CATALOGUE.map((p) => p.id)); // 151 entries
const deletable = !SEED_IDS.has(product.id);
```

**Today this arms for zero products.** It lights up only for SKUs created through
`/admin/products/new` after this ships. That is the correct rule:
`generate-product-seed.mjs` emits `0014` from `HARDCODED_CATALOGUE` with
`on conflict do nothing` and no `archived` column, so **re-pasting 0014
resurrects any deleted seed product** with `archived` back at `false`. Deleting a
seed product is undone by an unrelated deploy step.
`bake-catalogue-from-source.mjs` resurrects them too.

> Implement the **predicate**, not the sentence. "23 seed products are protected"
> is wrong; it is 151. Someone implementing the sentence arms Delete on the whole
> live catalogue.

New write:

```ts
export async function deleteProduct(productId: string): Promise<WriteResult> {
  const { data, error } = await supa
    .from('products').delete().eq('id', productId).select('id');
  return wrote(data, error, 'Product delete');
}
```

`.select('id')` is load-bearing. PostgREST answers an RLS-invisible DELETE with
204 and `error: null` (`write-result.ts:19-22`). Do **not** copy the
`return !error` shape from `coupons.ts:137`. `products.ts:471`'s rollback delete
has this bug — leave it (best-effort) but comment it so nobody cites it.

No migration is needed: `0001_init.sql:152` `for all` already covers DELETE.

---

## 5. Blast radius

`inspectProductRemoval(productId, variantIds)` runs on drawer open for deletable
rows and **again immediately before the delete** (the first result is stale by
then — a variant added since is invisible to it). `report.error !== null` counts
as BLOCK, never as clean.

**BLOCK:**

| Check | Why |
|---|---|
| `product_batches` | FSSAI lot/expiry — regulated traceability |
| `stock_adjustments` | Append-only ledger; RLS grants insert only, yet the FK cascade destroys it because referential actions bypass RLS |
| Unpaid `placed` orders | The owner still has to pack and price it |
| Corporate template reference | `pricing.ts:118` does `if (!info) continue` — the line survives in the shared URL and prices at ₹0, silently under-charging |
| Seed product | §4 |

**WARN (delete still allowed):** reviews + helpful votes (customer-written, read
live, gone on next page load, not restored by re-inserting the product — the most
irreversible item here); `variant_location_stock`; past paid orders.

`orders.lines` is a self-contained jsonb snapshot with no FK, so receipts still
render. But `hsn_code` lives only on `variants` and is not in the snapshot, so a
deleted product makes that order's **GST invoice unreproducible** against the
7-year retention promise at `account-view.tsx:78`.

**Applies to Archive as well as Delete** — both remove the product from
`CATALOGUE` at the next bake:

- `order-detail.tsx:186-191` — the unguarded receipt link 404s
  (`generateStaticParams` maps `CATALOGUE`, static export, no `dynamicParams`).
  **Fix in this change:** render a `<span>` when the slug is not in `CATALOGUE`.
- `admin-festivals.tsx` — a removed id renders no chip but still counts toward
  the 12 cap. **Fix in this change:** filter both to ids present in `CATALOGUE`.
- `cart-context.tsx:41-45` — the line vanishes from the subtotal silently and is
  persisted forever. *Flagged, not fixed here.*
- `site-content-context.tsx:141-153` — a **live** app-wide read of
  `.eq('archived', false)` on a 60s interval. Archiving drops the image overlay
  for live visitors within ~60s, while the product is still on the shelf.
  *Flagged; state it in the confirm copy.*
- `sitemap.ts:87-92` drops the URL with no 410. The house remedy is a manual
  `public/_redirects` line, both bare and `/*` forms. Both confirms name this as
  a manual follow-up.

---

## 6. `scripts/generate-catalogue.mjs`

**Fix the guards to compare over the surviving id set.** Import the committed
`GENERATED_CATALOGUE` (the script already runs under `tsx`), intersect with the
ids the database still returns, and count photographs over that intersection
only. Same shape for the non-veg guard. Fall back to the existing text regexes if
the import fails — fail soft, always. A deliberate removal then trips nothing,
while a database that *lost photos on a product it still has* — the incident the
guard was written for — still refuses.

**Replace the safety the photo guard was incidentally providing.** There is no
product-count floor above zero; the unguarded band is `1..N-1`, a decimated shop
rather than a blank one. After the existing empty checks:

- log every departing product by id;
- refuse to write when more than `max(3, ceil(committed.length * 0.1))` products
  would leave, unless `ALLOW_CATALOGUE_REMOVALS=true`.

**A new env var, not `ALLOW_CATALOGUE_REGRESSION`.** Both existing guards are
gated on that one variable, so reusing it to permit a deliberate removal disarms
the photography guard in the same motion.

---

## 7. Audit logging

`logAdminAction(action, entityType, entityId, before, after)`. `entity_id` is
`text` with no FK to products, so a delete's log row survives the row it
describes.

- `archive-product` / `unarchive-product` — `{archived:false}` → `{archived:true}`
- `delete-product` — `before` carries the product identity, `variantIds`, and the
  cascade report; `after` is `null`

**Log the delete before issuing it.** After the delete the counts are
unverifiable. If the delete then fails, a stale log entry is a smaller problem
than a destroyed FSSAI ledger with no record; follow with `delete-product-failed`
on the failure branch. For the delete specifically, check the audit insert
landed and warn through `fail()` if it did not — `logAdminAction` swallows its
own failure, and an unlogged irreversible cascade is the worst outcome here.

---

## 8. Out of scope — flagged, not built

- **`razorpay-order/index.ts:281`** — `chargeRupees` falls back to the
  browser-supplied total when a line cannot be priced, and `:151-155` uses the
  service-role key so RLS never hides an archived product's variants. Needs
  fail-closed + an `archived` join. Separate edge-function deploy.
- **`templates.ts:84`** — references `p_saffron_pistachios`, which exists in
  neither catalogue (the real id is `p_dry_pistachios`). Grande advertises 8
  items, renders 7, prices 7. **Live under-charging bug, unrelated to this
  change.** Add a test asserting every `TEMPLATES` item id resolves in
  `CATALOGUE`.
- **`0026_protect_seed_products.sql`** — a `BEFORE DELETE` trigger refusing to
  drop protected rows. Recommended defence-in-depth; the only guard that also
  holds against a service-role caller. The UI must **not** depend on it having
  been pasted. Note an RLS-based version would not work: permissive policies OR
  together and `0001_init.sql:152` already grants `for all`.
- **`cart-context.tsx`** prune + "no longer available" notice.
- **`VariantOverride.price_amount`'s doc comment says paise; it is rupees**
  (`generate-catalogue.mjs:281-306` documents the verification). Correct the
  comment; change no arithmetic. *(Done in this change — comment only.)*
- **FLAT SALE PRICES ARE SILENTLY A NO-OP.** Found while verifying the rupees
  contract above. `admin-products.tsx:1067` writes
  `sale_price = salePriceRupees * 100`, but `computeEffectivePrice`
  (`packages/shared/src/types/product.ts:158`) compares it against
  `variant.price.amount`, which is rupees:

  ```
  admin writes   ₹200 → 20000
  Math.min(20000, 279)  = 279     ← clamps to the regular price
  percentOff            = 0
  ```

  So a flat sale renders as "on sale" at full price with 0% off. Percent-off
  sales are unaffected (they derive from `regular`). Fix by dropping every
  ×100/÷100 on this field in the drawer — `:601`, `:1063`, `:1067`, `:1085`,
  `:1444`. **Not touched here: it changes money behaviour and wants its own
  decision.**

## 8a. Found during review, fixed here

- **`surviving` must come from the raw rows, not `products`.** `mapProduct`
  returns null for a bad category or zero variants, so a row the database still
  has would be filed as a deliberate removal and both guards would go blind to
  it.
- **Both sides of each guard comparison must be scoped to the same set.**
  Scoping only `was` lets a newly added product mask a real regression.
- **The snapshot must be read before `loadHardcodedCatalogue()`,** which blanks
  the output file on its recovery paths.
- **Archive must respect the corporate-template block too** — not just delete.
  Since seed products can never be deleted, archive is the only removal anyone
  can perform, and it produces the same catalogue removal at the next bake.
- **A `products` row with no variants must still be listed** (`No SKUs` tag).
  `productFromOverride` returning null made it unreachable — no row, no drawer,
  no way to archive or delete — while it kept its unique slug. Reachable via
  `createProduct`'s best-effort rollback.
- **A product deleted this session must not be tagged `Not in DB`,** whose
  drawer banner tells the owner to apply the 0014 seed — the opposite of what
  they just chose.
- **`destroy()` needs a synchronous re-entrancy latch,** not a state flag: two
  clicks in one tick both read `removing === false`.
- **Every removal flow needs `try/finally` and a mounted check** — a rejection
  stranded the button on "Deleting…", and closing mid-flight still popped the
  confirm and ran the delete.
- **The pre-delete audit write must be checked.** `logAdminAction` now returns
  whether the row landed, and the delete refuses rather than proceeding
  unlogged.
- **`ordersUnpaid` renamed `ordersOpen`** — `order_status` has no paid state
  and `payment` is opaque jsonb, so "unpaid" was unrepresentable.

---

## 9. Verification

- `pnpm run generate:catalogue` against a project with one product archived:
  the emitted file's product count drops by exactly one, `git diff` touches only
  that product, and the archived row still appears in /admin with Unarchive.
- Every destructive call ends in `.select('id')` and goes through `wrote()`.
- Delete stays disabled on all 151 seed products.
