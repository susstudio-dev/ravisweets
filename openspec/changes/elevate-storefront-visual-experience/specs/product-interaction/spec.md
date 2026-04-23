## ADDED Requirements

### Requirement: Product-card hover experience
On desktop (fine pointer, non-reduced-motion), hovering a product card SHALL trigger: (a) a `<HoverLift>` translate of -2 px and soft elevation, (b) a tinted ring using the card's flavour `--theme-glow` at low opacity, (c) a `<CursorGlow>` radial gradient that follows the cursor inside the card at ≤ 18% opacity, (d) a subtle ~2% scale on the product image inside its media frame, (e) a small `<Paisley>` mark appearing at a fixed corner of the card as a brand accent. All effects resolve within 200 ms and reverse on leave.

#### Scenario: Paisley accent appears on hover
- **WHEN** a product card is hovered on a fine-pointer device with reduced-motion off
- **THEN** a paisley mark fades in at the card's corner within 200 ms and fades out on leave

#### Scenario: Hover effects disable on touch
- **WHEN** the device is a coarse pointer (mobile, touch)
- **THEN** no cursor-follow glow or hover-based motion runs; the card uses a pressed-state feedback on tap only

#### Scenario: Hover effects disable on reduced-motion
- **WHEN** reduced-motion is on
- **THEN** the card applies only a soft elevation + ring on focus/hover; no transforms or cursor glow

### Requirement: Focus-visible state matches hover intent
Keyboard focus on a product card MUST produce the same lift / ring / glow state as hover (minus the cursor-follow glow, which is pointer-specific), with a visible 2 px `--color-ring` outline and `--theme-glow` tint.

#### Scenario: Keyboard navigation
- **WHEN** a keyboard user tabs onto a product card
- **THEN** the card reaches the same elevation + ring as hover, and the focus outline is clearly visible

### Requirement: Click transition — shared element morph
Clicking a product card SHALL smoothly transition the card's primary image into the product-detail hero image using a shared-element (`layoutId`) morph lasting ~300 ms. The card's title and price gain their own shared-element identities so their positions animate continuously.

#### Scenario: Card-to-detail morph runs
- **WHEN** a product card is clicked on a category listing
- **THEN** the image, title, and price animate from card positions to detail-page positions smoothly, with no layout jump

#### Scenario: Route cold-load does not attempt morph
- **WHEN** a user lands on a product detail via a direct URL (not from a listing)
- **THEN** the detail hero simply renders with a gentle entrance — no morph is attempted from a non-existent source

#### Scenario: Reduced-motion morph becomes cross-fade
- **WHEN** reduced-motion is on
- **THEN** the card click results in a 150 ms opacity cross-fade into the detail page; no position/size morph runs

### Requirement: Quick-view modal (primary card-click target pre-Phase 2)
In v1, the primary click behaviour of a product card SHALL open a **quick-view modal** (parallel-routed intercepted route) that stages the shared-element morph within the same page. A "View full details" link inside the modal MUST be provided and MUST navigate to the full product page.

#### Scenario: Quick-view opens inline
- **WHEN** a product card is clicked
- **THEN** a quick-view modal opens, the card image morphs into the modal hero, modal is dismissable with Escape, click-outside, or close button

### Requirement: Theme shift on product selection
When a product detail page OR quick-view modal becomes active, the site's flavour theme tokens SHALL shift to the selected product's `theme_palette` over ~250 ms (or via `View Transitions API` where supported). Navigation back reverts to the prior theme.

#### Scenario: Theme reverts on close
- **WHEN** a quick-view modal is closed
- **THEN** the theme tokens return to the prior context's palette with the same transition duration

### Requirement: Garnish particle accent (one-shot, not continuous)
Arriving on a product detail (or opening its quick-view) SHALL trigger a **one-shot** garnish accent — 8–14 small static marks (saffron strands / pistachio flecks / edible silver flakes / paisley flourishes, chosen per product) that fade in with stagger near the hero image then settle into a still composition. The paisley variant SHALL reuse the single `<Paisley>` SVG asset from the design system (sized-down, theme-tinted), not a new illustration. The accent MUST NOT loop, MUST NOT block interaction, and MUST disable on reduced-motion.

#### Scenario: Garnish fires once
- **WHEN** a product detail page becomes active
- **THEN** the garnish marks animate in once and remain still thereafter; repeated navigation back does not re-fire within a single session for the same product

#### Scenario: Garnish respects reduced-motion
- **WHEN** reduced-motion is on
- **THEN** garnish marks either do not render, or render as static decorative elements without entrance animation

### Requirement: Add-to-cart acknowledgement
Clicking "Add to cart" SHALL provide a discreet acknowledgement: a brief (≤ 500 ms) "ribbon pull" animation on the button with a success check, a count-up on the cart badge in the header, and a subtle toast near the cart icon ("Added — view cart"). Motion disables on reduced-motion (toast still shows).

#### Scenario: Success is unmistakable but quick
- **WHEN** a user taps add-to-cart
- **THEN** the button's success state appears within 100 ms, the header cart badge increments, a toast appears near it for ~2 seconds, and focus is preserved on the button

#### Scenario: Failure is explicit
- **WHEN** the add-to-cart call fails (out of stock, network error)
- **THEN** the button shows a clear error state and an inline message is displayed; no toast is shown

### Requirement: Variant selection micro-interaction
Changing a variant (e.g., 250 g → 500 g) SHALL animate the price change with a number crossfade (up/down based on direction) and update the stock / delivery messages in place without layout shift.

#### Scenario: Price crossfades on variant change
- **WHEN** a user changes variant
- **THEN** the displayed price animates from the old value to the new over ~250 ms using a crossfade; no visible CLS occurs

### Requirement: Image gallery transitions
The product-detail image gallery SHALL use a crossfade (not a slide) when switching main images, with thumbnail taps triggering a soft highlight ring. Arrow-key navigation works when the gallery has focus.

#### Scenario: Image change is a crossfade, not a slide
- **WHEN** a thumbnail is clicked
- **THEN** the main image crossfades from old to new over ~200 ms with no layout shift

### Requirement: Review reveal pattern
On product pages with reviews, each review card SHALL enter with a `<Reveal>` stagger as it scrolls into view. Past the first N reviews, further reviews MUST lazy-load with a skeleton placeholder.

#### Scenario: Reviews lazy-reveal
- **WHEN** a user scrolls to the reviews section
- **THEN** visible review cards animate in with stagger; further scrolling loads more reviews without jank

### Requirement: Interaction observability
Every distinctive product interaction (hover dwell > 400 ms, card click, quick-view open, theme shift, garnish fire, add-to-cart attempt + outcome, variant change) SHALL emit a PostHog event with non-PII properties (product id, variant id, region). Events are deduplicated at sensible windows (e.g., hover dwell once per card per page view).

#### Scenario: Hover dwell fires once per card
- **WHEN** a user hovers the same card repeatedly within one page view
- **THEN** only the first dwell > 400 ms emits an event
