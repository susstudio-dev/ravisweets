## ADDED Requirements

### Requirement: Hero image is a sweet macro
The home hero image SHALL be a close-up macro of a signature sweet (recommended: Qubani ka Meetha — saffron strands, apricot syrup, copper bowl) — NOT a Diwali hamper from above. The choice matches the SignatureMoment subject for brand consistency.

#### Scenario: Hero image swap
- **WHEN** a user visits the home page
- **THEN** the hero image is the sweet macro; the prior wide-shot hamper image is replaced
- **AND** the "Dev only" watermark remains visible until production photography lands

### Requirement: Three explicit motion rates
On viewports ≥ 1024 px with reduced-motion off, the hero SHALL exhibit three distinct scroll-coupled motion rates:
1. **Hero image** — translateY 0 → −90 px, scale 1 → 1.10 across scroll progress 0..1.
2. **Paisley ornaments** — translateY 0 → +70 px (opposite direction).
3. **Kinetic type / headline** — stays anchored (no scroll translation).

#### Scenario: Rates are distinct
- **WHEN** the user scrolls through the hero on a desktop viewport
- **THEN** the image, ornaments, and type advance at different rates so the depth feels layered, not synchronised

### Requirement: Garnish drift overlay
The hero SHALL include 3-4 small saffron-strand SVG marks layered above the image. Each translates independently as scroll progresses, at roughly half the image's translation rate, creating a "macro depth" sensation.

#### Scenario: Garnish drift on desktop
- **WHEN** a desktop user scrolls through the hero
- **THEN** the garnish marks visibly drift relative to the image; their movement is subtle (≤ 30 px) and uses transform-only

#### Scenario: Reduced-motion / mobile fallback
- **WHEN** reduced-motion is set OR the viewport is < 1024 px
- **THEN** the garnish marks render statically; no scroll-coupled drift

### Requirement: Mobile hero is static
On viewports < 1024 px the hero MUST render the image, ornaments, and type without any scroll-coupled motion (existing fade-in entrance is acceptable).

#### Scenario: Mobile static hero
- **WHEN** a 360 × 640 viewport renders the hero
- **THEN** scrolling produces no parallax — only the natural page scroll

### Requirement: Performance budget retained
The hero refresh MUST NOT increase the home route's First Load JS beyond the raised 185 KB ceiling. The new garnish-drift overlay's JS MUST be ≤ 0.5 KB gz (it's just a fixed list of `<motion.svg>` with `useTransform`).

#### Scenario: Bundle audit
- **WHEN** `pnpm build` runs
- **THEN** `/` First Load JS stays ≤ 185 KB; the hero refresh's net delta is ≤ 1 KB gz
