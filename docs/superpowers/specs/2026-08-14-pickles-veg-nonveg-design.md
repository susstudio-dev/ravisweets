# Pickles: veg / non-veg — design

**Date:** 2026-08-14 · **Owner decision:** krish (chip answers in session)
**Status:** approved in conversation; this document is the written spec.

## Goal

The pickle section gets a first-class veg / non-veg distinction: a Veg | Non-veg
tab strip on the category page, the full Andhra non-veg pickle range in the
catalogue, and the FSSAI food-type mark (green dot / brown triangle) on every
product surface site-wide.

Decisions taken with the owner:

1. **UX shape:** Veg | Non-veg segmented tabs on the pickle category page, plus
   FSSAI marks on product cards everywhere (not a buried filter checkbox, not
   stacked sections).
2. **Catalogue:** add the usual non-veg range (Mutton, Prawn, Fish, Gongura
   Chicken, Gongura Mutton) with placeholder prices flagged for owner review.
3. **Mark scope:** all products, everywhere — green dot for veg, brown triangle
   for non-veg, the FSSAI packaged-food norm.

## Data model

`'non-veg'` becomes a new member of the `DietaryTag` union in
`packages/shared/src/types/product.ts`. **Veg is the absence of the tag** — this
is a mithai house, so vegetarian is the default and non-veg is the exception
that gets marked. No new DB column: `products.dietary_tags` is already `text[]`.

One derivation helper (exported from the shared package alongside the type):

```ts
isNonVeg(product) === product.dietary_tags.includes('non-veg')
```

Every surface (mark, filter, tabs, tests) derives from this single check.
Rejected alternatives: a dedicated `diet_type` column (six pipeline layers plus
a schema migration to store one derivable bit) and slug-keyword inference (an
admin-created non-veg product would silently pass as veg — the one failure this
feature must never have).

Registration points for the new tag value (the pipeline silently strips unknown
tags, so all of these are mandatory):

- `packages/shared/src/types/product.ts` — union member.
- `scripts/generate-catalogue.mjs` — `DIETARY_TAGS` runtime guard set.
- Admin tag-pill lists: `admin-products-new.tsx` `DIETARY` array and the
  corresponding list in the edit drawer (`admin-products.tsx`).

## Catalogue changes (`packages/shared/src/catalogue/products.ts`)

**Fix:** `chicken-pickle` changes `dietary_tags` from `['eggless']` to
`['non-veg']`. "Eggless" on chicken is technically true but reads as a
vegetarian signal.

**Add** five MiniSkus to `picklesGroup()`:

| Slug | Title | Small (200 g) | Large (1 kg) | Allergens |
|---|---|---|---|---|
| `mutton-pickle` | Mutton Pickle | ₹400 | ₹1,600 | Mustard |
| `gongura-mutton-pickle` | Gongura Mutton Pickle | ₹425 | ₹1,700 | Mustard |
| `gongura-chicken-pickle` | Gongura Chicken Pickle | ₹275 | ₹1,100 | Mustard |
| `prawn-pickle` | Royyala Pickle — Prawn Pickle | ₹375 | ₹1,500 | Crustaceans, Mustard |
| `fish-pickle` | Chepala Pickle — Fish Pickle | ₹325 | ₹1,300 | Fish, Mustard |

- All five: `dietary_tags: ['non-veg']`, `builder_eligible: false` (corporate
  hampers stay veg by default — owner can flip per SKU later).
- **Prices are invented placeholders** scaled off Chicken Pickle's ₹250/₹1,000,
  keeping its 4× large-jar ratio. They must be recorded in `PRICING-REVIEW.md`
  with unchecked confirm boxes — via `emit-pricing-review.mjs` if it covers
  hand-authored SKUs, otherwise appended by hand in the same table format under
  a `### pickles` heading.
- Images: `pendingPhoto('<slug>.webp')` (returns `''`; the argument is the shot
  list) plus matching entries in `STILL_UNSHOT` in
  `scripts/photography/shot-list.mjs`. No borrowed stand-in photos.
- Descriptions: house voice, factual, no health or certification claims.
- Titles follow the existing "Telugu name — English gloss" convention where a
  Telugu name exists.

After editing: `pnpm run bake:catalogue && pnpm run generate:seed` (repo is
authority). Never hand-edit `products.generated.ts` or `0014_seed_products.sql`.

**Migration `0024_nonveg_pickles.sql`** (hand-written): the regenerated 0014 is
`on conflict do nothing`, so it inserts the five new rows but cannot retag the
existing chicken-pickle row. 0024 does the targeted update, guarded on the old
value so an admin edit is respected:

```sql
update public.products
   set dietary_tags = array['non-veg']
 where slug = 'chicken-pickle'
   and dietary_tags = array['eggless'];
```

## Filter model (`apps/storefront/src/lib/catalogue/filters.ts`)

One new group `vtype`, surfaced by two controls that share the same URL param —
so they can never disagree:

- `GroupId` gains `'vtype'`; `FilterState.vtype: string[]`;
  `PARAM.vtype = 'type'` (URL: `type=veg`, `type=nonveg`).
- Options: `veg` → "Veg", `nonveg` → "Non-veg". **OR-bucket semantics**
  (added to `OR_GROUPS`): the two values partition one axis, so ticking both
  equals ticking none — never a zero grid.
- `matchesOption`: `veg` → `!isNonVeg(p)`, `nonveg` → `isNonVeg(p)`.
- `activeFilterCount` includes `vtype.length`; parse/write round-trip like every
  other group (unknown values dropped).

**Panel visibility rule:** in `ProductFilters`, the vtype group renders only
when *both* options have a nonzero facet count, **or** something in the group is
already selected (a selected chip must stay clearable — the existing empty-grid
principle). Net effect: it appears on /shop (mixed catalogue) and on Pickles,
and never inside an all-veg category.

## Veg | Non-veg tabs (`category-browser.tsx`)

`CategoryBrowser` renders a segmented row above the "SHOWING X OF Y" line when
the category's **unfiltered** product set contains both types — data-driven, so
today only Pickles shows it, and any future mixed category gets it for free.

- Tabs: **All · Veg · Non-veg**, each with its live count (counts honour the
  other active filter groups, same measure as `facetCounts`).
- Single-select writer over the shared param: All → `vtype: []`,
  Veg → `['veg']`, Non-veg → `['nonveg']`. Ticking both chips in the panel
  reads back as All (OR semantics make that exact).
- Styling: the storefront's underline-tab vocabulary (the auth-modal `TabButton`
  pattern — `field-label`, `border-b-2`, active `border-theme-accent
  text-theme-accent`), square-cut per the docket idiom, buttons with
  `aria-pressed`. State goes through `useProductFilters` → URL, never component
  state.

## FSSAI mark (`<VegMark>`)

New shared component `apps/storefront/src/components/veg-mark.tsx`: inline SVG,
square outline with a filled green circle (veg) or brown triangle (non-veg,
post-2022 FSSAI symbol). Statutory colours are **fixed** (green ≈ `#1F6238`,
brown ≈ `#8B4513`) — never the product palette; identity may vary, compliance
marks may not. Rendered on a small `--theme-base` backing plate so it reads on
cream and dark. `aria-label` "Vegetarian" / "Non-vegetarian"; two sizes
(card ~14 px, detail ~18 px).

Placements:

| Surface | Placement | Notes |
|---|---|---|
| `ProductCard` | top-right of the image plate | top-left stays the Sale > Bestseller > New stack; propagates to shop, category, search page, related, festivals, send-sweets |
| Product detail page | beside the title | dietary chips in THE RECORD render `non-veg` as text anyway |
| `search-overlay` rows | before the title | text rows, mark is the only visual |
| Cart line items | beside the line title | a mixed veg/non-veg cart is where the mark matters most |
| `trending-shelf` ShelfCard, `hero-batch` No.1 plate | same corner treatment | these duplicate their own card markup; **uncommitted in-flight files — attribute before committing** |

Deliberately skipped: corporate builder `item-palette` (builder is all-veg once
non-veg SKUs are `builder_eligible: false`; a green dot on every cell is noise).
The mark asserts food type only — the site's "never claim FSSAI certified while
the licence is pending" stance is untouched.

## Prose

`CATEGORY_META.pickles` (category page server component) gets a sentence
acknowledging the two ranges: the veg achaar shelf and the slow-cooked non-veg
jars. No other copy changes.

## Testing

- **Filter model** (`filters.test.ts`): vtype OR semantics (both ticked = all),
  `matchesOption` derivation, URL parse/write round-trip, panel visibility rule
  (hidden when one-sided, shown when selected), tab-count math.
- **Catalogue guard test** (repo's existing guard-test style): every known
  non-veg slug (`chicken-pickle`, `mutton-pickle`, `gongura-mutton-pickle`,
  `gongura-chicken-pickle`, `prawn-pickle`, `fish-pickle`) carries `'non-veg'`;
  no product combines `'non-veg'` with `'vegan'` or `'eggless'`; prawn/fish
  declare their allergens. Mislabeling non-veg as veg is the failure class this
  locks down.
- Visual verification of card/tab/mark on the running app before completion.

## Deploy notes (owner action, later)

1. Dashboard SQL paste: regenerated `0014` (new rows), then `0024`. If the DB is
   ever reseeded from scratch the standing order still applies:
   0014 → 0022 → 0021 (→ 0024). `0023` (security) is pending independently.
2. Rebuild + publish (static export) so the storefront bakes the new catalogue.
3. Owner reviews the five placeholder prices in `PRICING-REVIEW.md`.

## Out of scope

- Real photography for the five new SKUs (shot list updated instead).
- A "Vegetarian" option in the "Suitable for" filter group (the vtype group
  covers it; revisit if shoppers ask).
- Structured-data / schema.org changes.
- Any change to the pending-FSSAI-licence compliance copy.
