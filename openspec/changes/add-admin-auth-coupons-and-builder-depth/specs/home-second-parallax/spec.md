## ADDED Requirements

### Requirement: Home page has a second parallax panel below the hero

The home page SHALL render a `<SweetEssencePanel>` component immediately below the existing hero, with its own scroll-target container so its parallax is independent of the hero's. The panel SHALL be full-bleed on desktop and disabled (static fallback) on mobile (`< 1024px`).

#### Scenario: Desktop scroll past hero
- **WHEN** a desktop user scrolls down past the hero
- **THEN** the Sweet Essence panel enters view and its image, overlay marks, and text translate at three distinct rates as it scrolls through

#### Scenario: Mobile viewport
- **WHEN** the viewport width is below 1024px
- **THEN** the Sweet Essence panel renders as a static full-width image with text below; no parallax transforms apply

### Requirement: Three independent parallax rates within the panel

The panel SHALL apply at minimum three different `useTransform` rates: image (slowest, e.g. -90px), overlay marks (fastest, e.g. -200px), and text or eyebrow (slowest+, e.g. +30px). Rates SHALL be visually distinguishable on a slow scroll.

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** all parallax transforms are skipped; the panel renders as a static composition

### Requirement: Panel imagery uses a macro sweet image distinct from the hero

The Sweet Essence panel SHALL use a different image source from the hero's image. The image SHALL be a macro close-up of a sweet (e.g. saffron strands in syrup, or pistachio close-up) and SHALL retain the "Dev only" watermark until production photography lands.

#### Scenario: Image source diverges from hero
- **WHEN** the home page renders
- **THEN** the hero image URL and the Sweet Essence panel image URL are different files

### Requirement: Panel has tactile copy and a single CTA

The panel SHALL display: an eyebrow (Telugu accent + English location), a short headline (max 8 words), one paragraph of body copy (max 35 words), and one CTA button linking to `/about` or `/category/sweets`.

#### Scenario: Click the CTA
- **WHEN** user clicks the panel CTA
- **THEN** Next.js navigates to the linked route with `scroll: true`
