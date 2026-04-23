## ADDED Requirements

### Requirement: Builder route and entry points
The builder SHALL live at `/corporate/builder`. It MUST be reachable from (a) the `/corporate` landing page via a primary CTA, (b) the three hamper-tier cards on `/corporate` (each deep-links to the builder with that tier's template pre-loaded), and (c) a direct URL with a shared configuration.

#### Scenario: Direct URL loads shared configuration
- **WHEN** a user visits `/corporate/builder?t=premium&items=kaju-500:2,qubani:1&ribbon=gold&logo=1&v=1`
- **THEN** the builder renders the Premium template pre-filled with the shared items, ribbon colour, and logo-print option already applied

#### Scenario: Unknown schema version rejected gracefully
- **WHEN** a user visits the builder with `?v=2` or missing version
- **THEN** the builder loads an empty state, surfaces a non-blocking toast "This link uses an unsupported format — start fresh?", and does not crash

### Requirement: Templates
The builder SHALL offer exactly four templates as starting points: `essence`, `premium`, `grande`, and `blank`. Each template defines an initial item list, ribbon colour, and packaging finish. The three non-blank templates MUST mirror the `/corporate` page's catalogue tiers (Essence / Premium / Grande).

#### Scenario: Template selection replaces current hamper
- **WHEN** a user picks a template while items are already in the hamper
- **THEN** a confirmation dialog asks before replacing; on confirm, the hamper is reset to the template

### Requirement: Item palette
The builder SHALL display every catalogue item that is flagged `builder_eligible: true` grouped by category (Hyderabadi specials / sweets / namkeens / dry fruits / add-ons). Each palette entry MUST show the product name, small image, per-unit price at the current tier, and a filter/search affordance. Palette MUST be keyboard-navigable.

#### Scenario: Add item via keyboard
- **WHEN** a user tabs to a palette item and presses Enter or Space
- **THEN** the item is added to the hamper with the same transition as a click, and focus remains on the palette entry

#### Scenario: Palette excludes ineligible items
- **WHEN** the builder renders
- **THEN** products with `builder_eligible: false` (e.g., current out-of-stock SKUs) do not appear

### Requirement: Hamper canvas and item management
The hamper canvas SHALL show selected items in a stylised composed view — an SVG/CSS box outline with selected items arranged as chips inside. Items MUST support: remove (× button), quantity adjustment (+/-), and re-ordering (drag within the list). A "clear all" affordance MUST be present.

#### Scenario: Quantity change updates price live
- **WHEN** a user increments an item's quantity from 1 to 2
- **THEN** the hamper total, per-unit-at-scale, and tier-indicator all recalculate within 50 ms

#### Scenario: Drag-to-reorder respects reduced-motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** re-ordering is keyboard-operated (↑/↓ arrow keys when focused on an item) and the visual animation is an instant position snap, not a spring

### Requirement: Customisation options
The builder SHALL support these customisation options: **ribbon colour** (5 preset swatches), **box finish** (3 options: matte cream / lacquered brass / silk-wrap), **logo-printing toggle** (with a text explainer about +10-day lead time), and a **personalised message** (plain text, 240 char max, validated for profanity on best-effort basis).

#### Scenario: Logo-printing toggle surfaces lead-time impact
- **WHEN** a user toggles logo printing on
- **THEN** a visible "Lead time: +10 business days" chip appears near the toggle and persists while the option is on

#### Scenario: Personalised message over limit
- **WHEN** a user types past 240 characters
- **THEN** the textarea enforces the limit, a character counter shows overflow in red, and focus is retained

### Requirement: Tier-aware pricing
The builder SHALL compute and display: **per-unit price at current tier**, **total units**, **line total**, and a **tier indicator** ("Essence · unlock Premium tier at 100 units"). Tier thresholds and pricing tables MUST come from a single source in `packages/shared/src/catalogue/pricing.ts`.

#### Scenario: MOQ warning below 25 units
- **WHEN** total unit count is below the custom-build MOQ (25)
- **THEN** a visible "Minimum order 25 units — reach it by adding …" warning surfaces and the "Submit enquiry" button is disabled

#### Scenario: Tier upgrade acknowledgement
- **WHEN** total unit count crosses a tier threshold (e.g., 50 → 100)
- **THEN** a brief, non-blocking toast celebrates the new tier and the per-unit price updates with a crossfade

### Requirement: Share via URL
The builder SHALL provide a "Share this hamper" button that copies the current state's URL to the clipboard and confirms with a toast. The URL MUST be schema-versioned (`v=1`) and MUST NOT exceed 500 characters for a hamper of up to 30 items.

#### Scenario: Copy to clipboard
- **WHEN** a user clicks "Share this hamper"
- **THEN** the current URL (including every parameter) is copied to clipboard and a toast "Link copied — share with your team" appears for ~2 seconds

#### Scenario: URL stays under length cap
- **WHEN** a user builds a hamper with 30 items, maximum customisation, and a 240-char message
- **THEN** the serialised URL is ≤ 500 characters (achieved via short keys + item-id aliases)

### Requirement: Enquiry hand-off
The builder SHALL provide a "Submit enquiry" button that routes to `/corporate#enquiry` with the hamper configuration serialised. The existing `<CorporateEnquiry>` form MUST read the configuration on mount and pre-fill: hamper tier, quantity, customisation textarea (human-readable summary of items + options), and a visible "From builder" chip.

#### Scenario: Hand-off preserves state
- **WHEN** a user submits from the builder with a specific configuration
- **THEN** the enquiry form opens with all relevant fields pre-filled and the "From builder" chip visible next to the tier picker

#### Scenario: Builder URL accessible from enquiry
- **WHEN** an admin reviews the submitted enquiry
- **THEN** the enquiry payload contains the original builder URL so the admin can reproduce the exact hamper

### Requirement: Mobile parity
The builder MUST be fully operable on a 360×640 mobile viewport. The palette and hamper canvas SHALL stack vertically on small viewports with a sticky "Cart/summary" bar at the bottom showing current units + total price + CTA.

#### Scenario: Mobile sticky summary
- **WHEN** a user scrolls on a mobile viewport
- **THEN** the summary bar remains visible and tappable at the bottom of the viewport

### Requirement: Accessibility
The builder MUST pass WCAG 2.1 AA: focus-visible outlines on every interactive element, aria-live announcements when items are added/removed, keyboard operability for palette / canvas / customisation, and colour contrast ≥ 4.5:1 for body text against every flavour-theme palette.

#### Scenario: Screen reader add announcement
- **WHEN** a user adds an item via screen reader
- **THEN** an `aria-live="polite"` region announces "Added Kaju Katli 500g — 3 items in hamper"

### Requirement: Performance budget
The `/corporate/builder` route MUST stay within the storefront's 180 KB First Load JS ceiling. Route-specific JavaScript SHALL be ≤ 18 KB gz.

#### Scenario: Bundle audit
- **WHEN** `pnpm build` runs
- **THEN** the reported `/corporate/builder` First Load JS is ≤ 180 KB and route-specific JS is ≤ 18 KB
