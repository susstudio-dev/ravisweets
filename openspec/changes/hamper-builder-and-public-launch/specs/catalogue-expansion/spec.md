## ADDED Requirements

### Requirement: Catalogue size and coverage
The catalogue SHALL contain **18–24 products** covering every `CategorySlug`:
- Hyderabadi specials: 5 products
- Sweets: 4 products
- Namkeens: 3 products
- Dry fruits: 3 products
- Combos: 2 products
- Gift hampers: 4 products
- Festival specials: 2 products

Every category page SHALL therefore render ≥ 2 products.

#### Scenario: Every category has products
- **WHEN** any of the seven `/category/[slug]` pages are visited
- **THEN** at least two products are rendered; the previously-possible empty-state is a bug

### Requirement: Image representativeness rubric
Every product's primary image MUST pass the representativeness rubric defined in `research/catalogue-imagery-rubric.md` before landing in the catalogue. The rubric requires:
- Image **depicts the product** named (not a generic sweet tray).
- Image's dominant colour family matches the product's `theme_palette` within a stated tolerance (so the FlavourAtlas shift feels coherent).
- Minimum resolution ≥ 1200px on the long edge.
- No embedded watermarks other than our added "Dev only" badge.
- Source licence is explicit (Unsplash / Pexels / public domain / internal photography).

Every `Product` in `sample-products.ts` (or its promotion to `packages/shared/src/catalogue/`) SHALL carry a `rubric_passed_on` date field and a `source_url` field.

#### Scenario: Rubric failure blocks merge
- **WHEN** a product is added without `rubric_passed_on` or with a non-reachable `source_url`
- **THEN** the `validate-catalogue` CI check fails and the PR cannot be merged

#### Scenario: Placeholder imagery still watermarked
- **WHEN** a product's image is not yet from the real photography shoot
- **THEN** the "Dev only" watermark is visible on every surface that renders that image

### Requirement: Build-time palette extraction
A build-time script SHALL derive each product's `theme_palette` from its primary image using `culori` + `sharp`, unless a `theme_palette_override` is present. Derived palettes MUST satisfy the WCAG AA contrast floor between `--theme-ink` and `--theme-base` (≥ 4.5:1); if the derived ink fails contrast, the script falls back to semantic neutral ink and logs the substitution.

#### Scenario: Derivation runs at build
- **WHEN** `pnpm --filter @ravisweets/storefront build` runs
- **THEN** every product without a `theme_palette_override` has its palette computed from its primary image and written to the catalogue data

#### Scenario: Contrast floor honoured
- **WHEN** a derived palette's `--theme-ink` contrasts < 4.5:1 with `--theme-base`
- **THEN** the script substitutes the semantic neutral ink and emits a console warning naming the product

### Requirement: Builder eligibility flag
Every product SHALL carry a boolean `builder_eligible` flag. Default `true`; set to `false` only for items that cannot be composed into a hamper (e.g., perishable-only items with 3-day shelf-life that don't travel; seasonally unavailable festival SKUs outside window).

#### Scenario: Ineligible item hidden from builder
- **WHEN** a product has `builder_eligible: false`
- **THEN** it does not appear in the `/corporate/builder` palette but may still appear on the retail catalogue

### Requirement: Catalogue data source of truth
The catalogue SHALL live at `packages/shared/src/catalogue/products.ts` (promoted from `apps/storefront/src/lib/sample-products.ts`). Storefront, builder, backend-seed, and validation scripts all import from the single source.

#### Scenario: No duplicate product data
- **WHEN** the repo is searched for product IDs
- **THEN** each product ID appears in exactly one source file

### Requirement: Catalogue validation CI gate
A `validate-catalogue` script SHALL run in the `lint` CI job and assert:
- Every product has the full `Product` schema.
- Every product has `rubric_passed_on` and `source_url`.
- Every image URL returns HTTP 200 on HEAD.
- Derived palette (or override) meets the contrast floor.
- Category-coverage minimums (at least 2 products per category).

#### Scenario: Validation failure blocks merge
- **WHEN** the validation script finds any failure
- **THEN** the `lint` job fails and the PR cannot be merged

### Requirement: Product description quality floor
Every product description MUST be 40–200 words, written in a coherent voice (neither generic nor marketing-puff), and reference specific ingredient, origin, or craft details that a reader could verify.

#### Scenario: Empty / generic descriptions rejected
- **WHEN** a product description is < 40 words OR contains explicit filler like "Lorem ipsum" / "A delicious sweet"
- **THEN** the catalogue validator flags the entry and blocks merge
