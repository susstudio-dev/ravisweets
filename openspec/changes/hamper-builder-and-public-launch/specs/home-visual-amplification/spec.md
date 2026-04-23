## ADDED Requirements

### Requirement: Separated-layer hero scene
The home hero SHALL implement scroll-coupled layer separation on desktop viewports (≥ 1024 px). Layers MUST move at distinct speeds: background ambient gradient (slowest), hero image (slow), paisley ornaments (medium-fast), kinetic typography (stationary). The effect SHALL be gated off on viewports < 1024 px AND on `prefers-reduced-motion`.

#### Scenario: Desktop separated scroll
- **WHEN** a user on a 1440 px viewport with reduced-motion off scrolls past the hero
- **THEN** the hero image translates up by ≤ 80 px while ornaments drift by ≤ 120 px in a mix of directions, and the headline remains anchored until it scrolls out naturally

#### Scenario: Mobile fallback
- **WHEN** a user on a 390 px viewport scrolls past the hero
- **THEN** no scroll-linked parallax fires; the hero uses the existing static + fade entrance

#### Scenario: Reduced-motion fallback
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** all scroll-linked transforms on hero layers are inert; layers render at their default positions

### Requirement: Horizontal editorial scroll band ("Inside the kitchen")
A new home section SHALL render a horizontally-scrolling band of 5–7 editorial images with captions that advances as the user scrolls vertically past the section. The section MUST have a pinned-feel via `sticky` positioning while the band advances on X. Reduced-motion users receive a plain vertical stack of the same content.

#### Scenario: Scroll-linked horizontal advance
- **WHEN** a user scrolls vertically through the section on a capable viewport
- **THEN** the image strip translates on X in proportion to the scroll progress, with a single dominant image in the viewport at any moment

#### Scenario: Reduced-motion stack
- **WHEN** reduced-motion is set
- **THEN** the section renders as a vertical stack of the images with captions, no sticky, no X-translation

#### Scenario: Touch devices get the stack
- **WHEN** the device is touch-primary (coarse pointer)
- **THEN** the horizontal-scroll pattern is replaced by a horizontally-scrollable touch strip with snap points (native behaviour, not scroll-linked)

### Requirement: Ingredient marquee behind product macro
A new home section SHALL render a large product macro image in the foreground with a slow-moving horizontal marquee of ingredient names (Saffron · Almond · Pistachio · Cardamom · Ghee · Silver leaf · Rose) in large, low-opacity display type running behind it. Foreground image and marquee MUST run at different scroll rates; reduced-motion halts both.

#### Scenario: Differential speeds
- **WHEN** a capable user scrolls through the section
- **THEN** the foreground macro translates slowly while the ingredient marquee scrolls ~2× faster horizontally

#### Scenario: Reduced-motion static
- **WHEN** reduced-motion is set
- **THEN** the ingredient names render as a static band; the foreground macro is stationary

### Requirement: Section-to-section transition system
A lightweight `<SectionEntry>` wrapper SHALL provide a consistent, 120 ms ambient wash of `--theme-glow` as each home-page section enters the viewport. The wash peaks at ≤ 12% opacity and fades out over ~400 ms after entry. Reduced-motion disables the wash.

#### Scenario: Entry wash on scroll
- **WHEN** a new home section enters the viewport (amount ≥ 0.3)
- **THEN** an ambient theme-glow wash briefly appears in its background and fades to transparency within 500 ms total

#### Scenario: Reduced-motion no-op
- **WHEN** reduced-motion is set
- **THEN** no wash renders; section entry is plain

### Requirement: Budget compliance
Every home-amplification moment added under this capability MUST fit inside the established 180 KB First Load JS ceiling and the 25 KB motion-code sub-budget. New motion-related JS for these moments SHALL be ≤ 6 KB gz combined.

#### Scenario: CI budget check
- **WHEN** `size-limit` runs in CI
- **THEN** the combined motion bundle is still ≤ 25 KB gz and the `/` home route is ≤ 180 KB First Load JS

### Requirement: Device performance
Every home-amplification moment MUST sustain 60 fps on a Pixel 4a-class Android device over a 10-second scroll recording. Moments that can't SHALL be scaled back for that device class (via feature-flag or viewport gate), not shipped degraded.

#### Scenario: Frame-rate audit pre-release
- **WHEN** a release candidate is profiled on the baseline device
- **THEN** each added moment is reviewed against the 60 fps floor and scaled back where needed

### Requirement: A/B toggle via feature flag
Each new moment SHALL sit behind a named flag (`home_sep_hero`, `home_editorial_band`, `home_ingredient_marquee`, `home_section_entry`) via the existing `NEXT_PUBLIC_*` / PostHog mechanism. Each flag default is ON; kill-switch capability is preserved.

#### Scenario: Kill-switch disables moment
- **WHEN** a flag is set to `off` via env var
- **THEN** the corresponding moment does not render, and no related JS is shipped to the client
