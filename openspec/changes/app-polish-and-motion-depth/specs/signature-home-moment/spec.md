## ADDED Requirements

### Requirement: `<SignatureMoment>` component exists
The storefront SHALL provide a `<SignatureMoment>` component at `src/components/sections/signature-moment.tsx` that renders a full-bleed, single-image home-page section with sparse typographic overlay. The component is rendered exactly once on the home page, placed between the `<FlavourAtlas>` section and the "Featured" product grid.

#### Scenario: Placement on home page
- **WHEN** the home page renders
- **THEN** `<SignatureMoment>` is the section immediately following `<FlavourAtlas>` and immediately preceding the "Featured" products grid; no other section sits between them

### Requirement: Visual framing
The Signature Moment SHALL render:
- A full-bleed background image (cover-fit, AVIF/WebP via `next/image`).
- A gradient mask from opaque at the bottom to transparent at ~50% height (ink colour, honours the active flavour theme).
- A small paisley mark at the bottom-left corner (3–4 KB inline SVG, theme-tinted).
- An eyebrow line using the Indic accent face (Tiro Telugu) + a secondary English eyebrow.
- A single italic display-md headline (one line on desktop, wraps to at most two on mobile).
- A 1–2-line supporting paragraph.
- A subtle secondary CTA ("See how we make it" → `/about`).
- A "Dev only" watermark while the placeholder image is stock, per photography-gating requirement.

#### Scenario: Full-bleed image visible on first paint
- **WHEN** the home page scrolls to the Signature Moment
- **THEN** the section fills the viewport width edge-to-edge (no container constraints), with the image as the visible background

#### Scenario: Dev-only watermark present until shoot lands
- **WHEN** the Signature Moment renders and the image is a placeholder
- **THEN** a visible "Dev only" badge appears in a corner; the badge is removed only when a production image is curated via the imagery rubric

### Requirement: Entrance choreography
On viewport entry, the image SHALL reveal via `<MaskReveal direction="left">` (left-to-right clip-path wipe, ~650 ms). The headline enters via `<TextChain split="word">` with the emphasised italic phrase landing last. Reduced-motion: image renders fully revealed, text renders instantly — no wipe, no chain.

#### Scenario: Mask-reveal fires on entry
- **WHEN** the Signature Moment scrolls into view on a capable viewport
- **THEN** the image clip-path animates from `inset(0 100% 0 0)` to `inset(0 0 0 0)` over ~650 ms, and the headline words enter in sequence

#### Scenario: Reduced-motion no animation
- **WHEN** reduced-motion is on
- **THEN** the image is fully revealed on first paint and the headline is fully rendered; no `MaskReveal` or `TextChain` animation fires

### Requirement: Image curation criteria
The Signature Moment's primary image MUST pass the existing catalogue imagery rubric (`research/catalogue-imagery-rubric.md`) AND these additional signature-specific criteria:
1. **Single dominant subject** — one sweet, bowl, or hamper; no "spread" compositions.
2. **Macro or shallow-DoF** — a clear focal point where the viewer's eye lands.
3. **Warm directional light** — consistent with the brand's saffron/amber/cream palette.
4. **Negative space right OR bottom** — to accommodate the text overlay.
5. **Rubric pass date** (`rubric_passed_on`) and source URL are recorded in the component's metadata file (`src/components/sections/signature-moment.meta.ts`).

#### Scenario: Image fails a criterion → swap required
- **WHEN** a proposed Signature Moment image has the product floating dead-centre with no negative space
- **THEN** the reviewer rejects the image and a different shot is selected; merge is blocked until a passing image is identified

### Requirement: Respect performance budget
`<SignatureMoment>` MUST add ≤ **2 KB gzipped** to the home route's First Load JS. The image asset itself MUST be ≤ **300 KB** in its delivered AVIF/WebP form for desktop, smaller for mobile via responsive srcset. It MUST NOT regress the home route's LCP.

#### Scenario: Component bundle size
- **WHEN** the home route's bundle is audited
- **THEN** the net addition attributable to `<SignatureMoment>` component JS (excluding the image asset) is ≤ 2 KB gz

#### Scenario: LCP stays within budget
- **WHEN** Lighthouse runs against the home route (mobile Slow 4G)
- **THEN** LCP remains ≤ 2.5 s; the Signature Moment's image is not the LCP element (the HeroStill image remains the LCP target)

### Requirement: Accessibility
`<SignatureMoment>` MUST be fully accessible:
- Image `alt` describes the subject, not decorative "image of product".
- Headline + paragraph are real semantic headings/paragraphs (not images of text).
- CTA has a visible focus outline and a meaningful accessible label.
- Colour contrast between overlay text and the masked gradient region is ≥ 4.5:1.

#### Scenario: Text-over-image contrast
- **WHEN** the overlay text is rendered against the darkest point of the gradient
- **THEN** measured colour contrast meets or exceeds WCAG AA 4.5:1 for body text
