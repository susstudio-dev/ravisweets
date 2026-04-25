## ADDED Requirements

### Requirement: Same product can occupy multiple lines with different variants

The hamper builder SHALL support a single product appearing as multiple `HamperItem` rows when each row has a different `variantId`. Each row SHALL have a stable `lineId` so canvas card identity survives variant swaps.

#### Scenario: Add 250g and 500g of the same product
- **WHEN** user adds Kaju Katli 250g, then adds Kaju Katli 500g via "Add another size"
- **THEN** the canvas displays two distinct cards, each with its own `lineId`, qty stepper, and price

#### Scenario: Add identical variant twice is rejected as duplicate
- **WHEN** user attempts to add a second card for Kaju Katli 250g when one already exists
- **THEN** the canvas reuses the existing card (qty stepper increments by 1), no duplicate `lineId` is created

### Requirement: Variant picker is mandatory before adding to box

When a product has more than one variant, clicking "Add" in the palette SHALL open a variant picker sheet listing all variants with their weights, prices, and stock status. The product is added only after a variant is selected. Single-variant products SHALL skip the sheet and add directly.

#### Scenario: Multi-variant product opens picker
- **WHEN** user clicks "Add" on Kaju Katli (250g, 500g, 1kg variants)
- **THEN** a sheet appears showing the three variants with prices; nothing is added until the user picks one

#### Scenario: Single-variant product adds directly
- **WHEN** user clicks "Add" on a product with only one variant
- **THEN** the variant is added immediately without a picker

### Requirement: Per-variant stock validation

The builder SHALL validate that `(qtyPerHamper × totalUnits) <= variant.stock_available` for each line. Lines that would exceed stock SHALL show an inline warning with the maximum feasible `totalUnits` for that variant, and the Submit Enquiry CTA SHALL disable until resolved.

#### Scenario: Stock blocks the order
- **WHEN** Kaju Katli 500g has 80 units in stock and user wants 2 per hamper × 50 hampers = 100 units
- **THEN** the line shows "Only 40 hampers possible at this size — try 250g" and the Submit button disables

#### Scenario: Stock sufficient
- **WHEN** every line's stock requirement is met
- **THEN** no warning is shown and Submit is enabled (subject to other constraints like MOQ)

### Requirement: Per-unit price recomputes from sum of variants

The builder SHALL compute `perUnit = Σ(variant.price × line.qtyPerHamper)` and SHALL display it live as variants and quantities change. The total SHALL be `perUnit × totalUnits` (with tier discount applied).

#### Scenario: Add a variant updates per-unit
- **WHEN** user adds Kaju Katli 250g (₹299) at qty 1, then adds Kaju Katli 500g (₹549) at qty 1
- **THEN** per-unit becomes ₹848; total at 50 hampers becomes ₹42,400 before tier discount

### Requirement: Builder URL schema bumps to v2 with v1→v2 migration

`BUILDER_SCHEMA_VERSION` SHALL be bumped from 1 to 2. The serialiser SHALL write `v=2` URLs. The parser SHALL recognise `v=1` URLs and migrate them by synthesising `lineId = ${productId}_${variantId}` for each item.

#### Scenario: v1 URL loads in v2 builder
- **WHEN** a shareable URL with `v=1` and items in the v1 shape is opened
- **THEN** the parser produces a v2 config with synthesised `lineId`s; the canvas renders correctly; the next save writes `v=2`

#### Scenario: Unknown future version is rejected
- **WHEN** a URL with `v=99` is opened
- **THEN** the existing schema-mismatch toast appears and the builder loads a fresh Premium template

### Requirement: Variant swap on canvas card preserves line position

A dropdown on each canvas card SHALL allow swapping the variant in place. The swap SHALL preserve the `lineId` and `qtyPerHamper`; only the `variantId` changes. Animation SHALL use motion's `layoutId` so the card morphs in place rather than removes and re-adds.

#### Scenario: Swap 250g to 500g on existing card
- **WHEN** user opens the variant dropdown on a Kaju Katli 250g card and selects 500g
- **THEN** the same card animates the price + label change without re-mounting; `lineId` is unchanged
