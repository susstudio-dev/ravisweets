## ADDED Requirements

### Requirement: `<ScrollScene>` — scroll-scrubbed multi-layer composition
The motion library SHALL provide a `<ScrollScene>` component that accepts named layer props and translates each layer independently based on scroll progress through the scene's viewport window. Layers accept `offsetStart`, `offsetEnd`, `x`, `y`, `opacity`, and `scale` as function-of-progress values. Used on the home hero to orchestrate multi-layer composition (background, subject, foreground).

#### Scenario: Layers translate at different rates
- **WHEN** a user scrolls through a `<ScrollScene>` with three named layers (`bg`, `subject`, `fg`) each with distinct `y` ranges
- **THEN** each layer translates independently, and no layer paints per-frame property (e.g. `top`/`margin`) — only `transform` and `opacity`

#### Scenario: Reduced-motion renders static composition
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** `<ScrollScene>` renders its layers at their final (progress=1) positions with no scroll coupling; no `useTransform` subscriptions are created

#### Scenario: Lazy-loaded off critical bundle
- **WHEN** the home route's First Load JS is measured
- **THEN** `<ScrollScene>` does not appear in the critical bundle; it's loaded via `next/dynamic({ ssr: false })` and fetched only when the scene mounts

### Requirement: `<MaskReveal>` — clip-path image wipe
The motion library SHALL provide a `<MaskReveal>` component that reveals an image via animated `clip-path: inset(...)`. Props: `direction` (`left` / `right` / `up` / `down` / `center`), `duration` (ms), `easing`. Fires once when the element enters the viewport; respects reduced-motion by rendering fully-revealed immediately.

#### Scenario: Wipe from left to right
- **WHEN** a `<MaskReveal direction="left">` enters the viewport
- **THEN** the clip-path animates from `inset(0 100% 0 0)` to `inset(0 0 0 0)` over the duration; easing is `cubic-bezier(0.16, 1, 0.3, 1)` by default

#### Scenario: Reduced-motion reveals immediately
- **WHEN** reduced-motion is on and the element enters the viewport
- **THEN** `clip-path` is set to `inset(0 0 0 0)` on first render without animation

### Requirement: `<PinReveal>` — pinned section with sub-content progression
The motion library SHALL provide a `<PinReveal>` component that uses `position: sticky` + scroll progress to advance through N ordered "beats" of sub-content. Each beat receives a visibility window of progress (e.g. three beats → 0–0.33, 0.33–0.66, 0.66–1.0). Content within the sticky frame transitions using opacity + slight translate as the active beat changes.

#### Scenario: Three-beat section
- **WHEN** the user scrolls through a `<PinReveal beats={3}>` with three child beats
- **THEN** the section pins for ~3× viewport height, and beats 1, 2, 3 become active in sequence as scroll progress crosses 0.33 and 0.66

#### Scenario: Reduced-motion disables pinning
- **WHEN** reduced-motion is on
- **THEN** `position: sticky` is removed; beats render as a plain vertical stack

### Requirement: `<MagneticButton>` — cursor-magnet CTA wrapper
The motion library SHALL provide a `<MagneticButton>` wrapper that translates its child toward the cursor within a 120px radius, with a maximum 6px displacement. Uses spring-damped `useMotionValue` + `useSpring` for feel. Disabled on touch devices and under reduced-motion (falls back to plain hover).

#### Scenario: Cursor pull on desktop
- **WHEN** a desktop user's cursor enters the 120px radius around a `<MagneticButton>`
- **THEN** the child translates toward the cursor, smoothly damped, capping at 6px displacement from centre

#### Scenario: Touch device no-op
- **WHEN** the device reports a coarse pointer (mobile / touch)
- **THEN** no pointer listeners attach; the child renders plain

#### Scenario: Single-primary enforcement
- **WHEN** code-review scans a page that uses `<MagneticButton>`
- **THEN** at most one magnetic button exists per viewport region (enforced in review, not runtime)

### Requirement: `<TiltCard>` — 3D perspective tilt
The motion library SHALL provide a `<TiltCard>` wrapper that applies a perspective-3D rotation on pointer hover, driven by cursor position relative to the card's centre. Maximum rotation 8° per axis. `HoverLift` accepts a `tilt` prop that composes this in. Disabled on touch + reduced-motion.

#### Scenario: Tilt on cursor hover
- **WHEN** a desktop user hovers inside a `<TiltCard>`
- **THEN** the card's `transform` applies `perspective(900px) rotateX(...) rotateY(...)` where angles derive from cursor offset from centre (clamped to ±8°)

#### Scenario: Reset on leave
- **WHEN** the pointer leaves the card
- **THEN** the rotations animate back to 0 over ~200 ms

### Requirement: `<TextChain>` — line-by-line / character-by-character chain
The motion library SHALL extend `<TextKinetic>` with a `<TextChain>` variant that splits text into ordered units (lines or characters) and applies a per-unit reveal with optional emphasis weighting. Units marked with `emphasis` attribute land on a harder easing curve for visual accent.

#### Scenario: Line-by-line reveal
- **WHEN** `<TextChain split="line">` enters the viewport with three lines, the second marked `emphasis`
- **THEN** lines enter in order; the emphasised line uses easing with a pronounced overshoot, others use the standard emphasised easing

#### Scenario: Reduced-motion renders plain
- **WHEN** reduced-motion is on
- **THEN** the full text renders without any chain animation

### Requirement: Scroll-linked ambient chapter wash on home
The home page SHALL define four named scroll chapters with intersection-triggered boundaries. As the viewport crosses a chapter boundary, the `--theme-*` CSS variables interpolate smoothly over ~500 ms to the next chapter's palette. Chapter boundaries are named DOM elements flagged with `data-chapter="<id>"`, so content reflow doesn't break boundary math.

#### Scenario: Chapter transition on scroll
- **WHEN** the viewport intersects the "Kitchen" chapter's boundary element
- **THEN** the `--theme-base`, `--theme-accent`, `--theme-glow`, `--theme-ink` CSS variables interpolate to the Kitchen palette over ~500 ms

#### Scenario: Reduced-motion snaps, not fades
- **WHEN** reduced-motion is set and a chapter boundary is crossed
- **THEN** the theme variables snap to the new chapter's values instantly without interpolation

#### Scenario: Mobile uses per-section fallback
- **WHEN** the viewport is < 768 px wide (mobile)
- **THEN** the scroll-linked chapter wash is disabled; the page uses its existing section-level theming

### Requirement: Combined motion budget
The six new primitives + scroll-chapter-wash combined MUST add ≤ **4 KB gzipped** to the home route's First Load JS. The existing motion sub-budget from the elevate change (≤ 25 KB gz total motion code on the critical route) still holds.

#### Scenario: Bundle audit
- **WHEN** `size-limit` runs on the home route
- **THEN** the critical-bundle delta attributable to this change's motion additions is ≤ 4 KB gz

### Requirement: Motion depth composition rules
Motion primitives MUST compose without producing visual cacophony. Code review SHALL enforce:
- At most **one** `<MagneticButton>` per viewport region.
- `TiltCard` and `HoverLift` compose (tilt is an opt-in prop on lift), but a card using `TiltCard` MUST NOT also use `CursorGlow` simultaneously (one or the other).
- `PinReveal` and `ScrollScene` MUST NOT be nested; they each own a scroll window.

#### Scenario: Review flags over-composition
- **WHEN** a PR stacks `TiltCard` + `CursorGlow` on the same card
- **THEN** the reviewer flags this under the composition rules above, and the submitter simplifies to one

### Requirement: Consumer gate per primitive
Each new primitive SHALL sit behind either a feature flag (for page-level toggles) or an opt-in prop (for per-instance use). No primitive is auto-applied site-wide without an explicit consumer call.

#### Scenario: Magnetic button is opt-in
- **WHEN** a CTA renders without wrapping it in `<MagneticButton>`
- **THEN** no magnetic behaviour attaches; the CTA is a plain `<button>`
