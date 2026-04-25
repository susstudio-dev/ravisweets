## ADDED Requirements

### Requirement: Four-step stepper UI
The hamper builder SHALL present its flow as a 4-step stepper: **(1) Pick a starting point**, **(2) Compose**, **(3) Customise**, **(4) Review**. The active step is reflected in the URL as `?step=<id>`. Each step is a panel; only one step's panel is visible at a time. Completed steps are reachable via breadcrumb chips at the top.

#### Scenario: First-time visitor lands on step 1
- **WHEN** a user visits `/corporate/builder` with no prior state in URL
- **THEN** the stepper is on step 1 ("Pick a starting point") showing the four templates and a "Start blank" option

#### Scenario: URL with items routes to step 2
- **WHEN** a user visits `/corporate/builder?items=kk:500:1,qb:500:1&v=1`
- **THEN** the stepper opens on step 2 ("Compose") with those items already in the canvas

#### Scenario: Breadcrumb chips jump between visited steps
- **WHEN** the user clicks a breadcrumb chip for a previously visited step
- **THEN** the active step changes and the URL `?step=` updates

### Requirement: Top-down hamper visualisation
The hamper canvas SHALL render as a stylised top-down view (looking into the box) with the chosen ribbon laid as a strip at the top edge, item icons arranged in a grid inside the box outline, and the box-finish texture as the background fill. The current side-view-with-ribbon-stripe rendering is replaced.

#### Scenario: Top-down composition
- **WHEN** the user picks the Premium template and views the canvas
- **THEN** the canvas shows a rectangular box outline (top-down) with ribbon strip across the top, items as small circles/icons placed in a grid inside

#### Scenario: Box finish reflects in background
- **WHEN** the user selects "Lacquered brass" finish
- **THEN** the canvas background fill updates to a brass-tinted texture; ribbon retains its independent colour

### Requirement: Drag-to-reorder inside the canvas
Items inside the hamper canvas SHALL be reorderable via drag using motion's `<Reorder>` primitive. Touch users get a long-press-to-grab handle. Reordering preserves the item list order in URL state. Reduced-motion: keyboard reorder via ↑/↓ on a focused item.

#### Scenario: Mouse drag reorders
- **WHEN** the user drags an item card from position 1 to position 3
- **THEN** the items rerender in the new order; URL state's items list reflects the swap

#### Scenario: Touch reorder via long-press
- **WHEN** a touch user long-presses an item's drag-handle (≥ 300 ms)
- **THEN** the item enters drag mode and can be moved with finger drag

#### Scenario: Keyboard reorder for reduced-motion
- **WHEN** reduced-motion is set and the user focuses an item card and presses ↓
- **THEN** the item swaps with the next item; ↑ does the inverse

### Requirement: Palette item hover-preview
Palette items in step 2 SHALL show a hover-preview tooltip after a 300 ms hover delay. The preview shows: larger product image, ingredients list, dietary tag chips, weight/variant. The preview closes on pointer-leave or when the item is added.

#### Scenario: Hover delay before preview
- **WHEN** a user hovers a palette item
- **THEN** the hover-preview opens after 300 ms (not instantly — prevents flicker on quick scans)

#### Scenario: Preview shows non-trivial information
- **WHEN** the preview opens for, e.g., Kaju Katli
- **THEN** the user sees: image (larger than the palette thumb), ingredient list ("Cashews · Sugar · Ghee · Cardamom · Edible silver leaf"), dietary chips ("Eggless · Nuts · Dairy"), weight / variant info

#### Scenario: Preview closes on add
- **WHEN** the user clicks "Add" while the preview is open
- **THEN** the preview closes immediately and the item enters the canvas

### Requirement: Tier-upgrade celebration
Crossing a tier threshold (Essence → Premium at 100 units, Premium → Grande at 500 units) SHALL trigger a one-shot celebration: a non-blocking toast naming the new tier ("Premium tier unlocked — 5% off per unit") and a brief paisley-confetti effect (4–6 small `<Paisley>` SVG marks drift across the price-summary panel, fading to 0 within 250 ms). Reduced-motion: only the toast.

#### Scenario: Premium tier unlocks at 100 units
- **WHEN** the user increments unit count from 99 to 100
- **THEN** a toast "Premium tier unlocked — 5% off per unit" appears for ~3 s, and 4-6 paisley marks briefly drift across the price summary

#### Scenario: Reduced-motion gets toast only
- **WHEN** reduced-motion is set and a tier crosses
- **THEN** the toast appears; no paisley flourish

### Requirement: Inline tooltips on MOQ, lead-time, tier discounts
The builder SHALL surface inline tooltips next to: the MOQ-below warning, the logo-print lead-time chip, and the tier discount label. Each explains the rule in plain language.

#### Scenario: MOQ tooltip
- **WHEN** a user is below the 25-unit MOQ and hovers the warning
- **THEN** a tooltip explains: "Custom hampers have a minimum order of 25 units. Below this, our kitchen can't ring-fence the production slot."

#### Scenario: Lead-time tooltip
- **WHEN** the user enables logo printing and hovers the "+10 business days" chip
- **THEN** a tooltip explains: "Logo printing requires our packaging supplier to print, dry, and assemble custom boxes — adds 10 business days to the standard lead time."

#### Scenario: Tier discount tooltip
- **WHEN** the user hovers the tier indicator
- **THEN** a tooltip explains the tier thresholds + discount rates ("Essence 25-99 / Premium 100-499 / Grande 500+")

### Requirement: Performance budget
The reworked builder MUST stay within the storefront's 185 KB First Load JS ceiling. Confetti + hover-preview tooltip MAY be lazy-loaded via `next/dynamic` if needed.

#### Scenario: Bundle audit
- **WHEN** `pnpm build` runs
- **THEN** `/corporate/builder` First Load JS is ≤ 185 KB
