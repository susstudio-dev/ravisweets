## ADDED Requirements

### Requirement: v1 hero — cinematic still with parallax + kinetic headline (COMMITTED)
The committed v1 hero (flag value `still`) SHALL be a **cinematic still photograph** of a signature product (recommended subject: Qubani ka Meetha in a brass bowl, dramatic directional light, shallow depth of field) combined with:
- Scroll-linked parallax on the image (max 30 px translate).
- A `<TextKinetic>` headline with character stagger on mount.
- A subtle `<Grain>` overlay (≤ 6% opacity) disabled on reduced-motion.
- An eyebrow pretitle in the brand accent colour.
- Dual CTAs (primary "Shop Hyderabadi specials", secondary "Corporate gifting").
- Soft amber-warm radial gradient behind the headline for depth.

#### Scenario: Hero LCP is the photograph
- **WHEN** the home page loads
- **THEN** the LCP element is the hero photograph, preloaded via `<link rel="preload" as="image">` with `fetchpriority="high"` and served in AVIF/WebP with a responsive `srcset`

#### Scenario: Reduced-motion hero is accessible
- **WHEN** reduced-motion is on
- **THEN** the hero renders the still photograph and static headline with a single 150 ms opacity fade; no parallax, no character stagger, no grain

### Requirement: Hero variant ladder (specced, A/B-ready)
The hero capability SHALL model **five variants** behind a `hero_variant` feature flag: `still` (recommended default), `video`, `shader`, `3d`, `kinetic-type`. Only `still` is built and shipped in v1; the other variants are specced so a future implementation can A/B-test them without re-architecting.

#### Scenario: Only `still` renders in v1
- **WHEN** the hero variant flag is unset or `still`
- **THEN** the cinematic still hero renders

#### Scenario: Unknown variant falls back to `still`
- **WHEN** the flag has a value not in the supported enum
- **THEN** the still hero renders and a warning is logged once

### Requirement: Video hero variant
When implemented, the `video` variant SHALL use a silent, autoplay-muted, looping video (6–8 seconds, AV1 or VP9, ≤ 500 KB, with a poster image for LCP). It MUST render the poster instantly and swap to the video only after first paint AND only when `prefers-reduced-motion` is off AND `Save-Data` is off AND the viewport width is ≥ 768 px.

#### Scenario: Poster serves LCP
- **WHEN** the video variant is active
- **THEN** the poster image is the LCP element; the video begins playback only after load and capability checks pass

#### Scenario: Video respects Save-Data
- **WHEN** the browser reports `Save-Data: on` OR `prefers-reduced-motion: reduce`
- **THEN** the video never loads and the poster remains as the hero

### Requirement: Shader hero variant ("ghee glaze" shimmer)
When implemented, the `shader` variant SHALL overlay a still photograph with a lightweight WebGL fragment shader producing a slow-moving specular sheen reminiscent of ghee on a sweet. Implemented with `ogl` or `regl` (≤ 10 KB gz), lazy-loaded via `next/dynamic({ ssr: false })`, gated on: desktop viewport ≥ 1024 px AND `navigator.deviceMemory ≥ 4` (when available) AND `prefers-reduced-motion` off AND `Save-Data` off.

#### Scenario: Shader gates off for low-end mobile
- **WHEN** the device is a 2019-era Android (deviceMemory < 4) or mobile viewport
- **THEN** the shader overlay does not load and the still hero is shown

#### Scenario: Shader lazy-loaded after LCP
- **WHEN** the page loads
- **THEN** the shader bundle is fetched only after the main LCP paint and does not inflate the critical-route bundle

### Requirement: 3D hero variant
When implemented, the `3d` variant SHALL render a 3D model of a signature product (e.g., a brass bowl or hamper) with a slow camera drift using `@react-three/fiber`. Restricted to desktop (viewport ≥ 1024 px), lazy-loaded, fully gated on `prefers-reduced-motion` being off. Falls back to `still` otherwise.

#### Scenario: 3D disabled on reduced-motion
- **WHEN** reduced-motion is set
- **THEN** the 3D variant does not load; still hero renders

### Requirement: Kinetic-type hero variant
When implemented, the `kinetic-type` variant SHALL make typography the lead element — a large, animated headline (word-by-word entrance with per-word easing variants, mild rotational tilt, scroll-coupled tracking shift) over a minimal colour field derived from the active flavour palette. A small secondary still or illustrated mark serves as the visual anchor.

#### Scenario: Kinetic-type does not degrade LCP
- **WHEN** the kinetic-type hero renders
- **THEN** the largest element (typography) is a single text block that paints within the LCP budget; no decorative graphic delays LCP

### Requirement: Hero asset budget
Regardless of variant, the hero MUST respect:
- Main visible asset ≤ 250 KB gzipped (image) or ≤ 500 KB (video file).
- Additional hero-specific JS ≤ 12 KB gz on critical route for the `still` variant; `shader`/`3d` allowed to exceed this only via lazy-load after LCP.
- Fonts involved in the hero headline MUST already be in the font payload budget.

#### Scenario: Hero asset audit
- **WHEN** a release candidate is audited
- **THEN** the hero's critical-path asset + JS totals are reported against the budget and any breach fails the release gate

### Requirement: Hero caption honesty
The hero MUST NOT include claims (e.g., "award-winning", "since 1920") unless they are verifiably true and referenced on the "About" page. The hero headline SHALL be brand-true, not marketing puff.

#### Scenario: Unverified claim is blocked
- **WHEN** a hero copy revision includes an unsubstantiated claim
- **THEN** the change is rejected in review until evidence is added under the About page and referenced

### Requirement: Photography gating for public launch
Because the v1 hero is a still photograph, the **public launch of the real hero** SHALL be gated on production-grade photography landing. Until then, the hero MUST render a placeholder image clearly watermarked "dev only" when served outside production, and the `visual_v2` flag MUST NOT be enabled at 100% in production with a placeholder hero.

#### Scenario: Placeholder asset is visibly marked
- **WHEN** the hero renders in any non-production environment with a placeholder asset
- **THEN** a "dev only" watermark is overlaid in a corner of the image

#### Scenario: 100% rollout blocked on placeholder
- **WHEN** `visual_v2` is proposed for 100% production rollout
- **THEN** the rollout is blocked unless the currently-served hero asset is flagged as a production-approved photograph (not a placeholder)

### Requirement: Hero is theme-aware
The hero MUST consume the active flavour theme's tokens (`--theme-accent`, `--theme-glow`) so the CTA underline, eyebrow accent, and ambient gradient shift when a different product's palette is active (e.g., on a campaign landing page themed to a specific sweet).

#### Scenario: Festival page hero retheme
- **WHEN** the Diwali festival page sets the active theme to `festival-diwali`
- **THEN** the hero's accent and glow reflect that theme's tokens without a full re-implementation
