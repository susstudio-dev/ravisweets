## ADDED Requirements

### Requirement: Motion primitives live in one library
A motion library SHALL live at `apps/storefront/src/lib/motion/` (primitives) and `apps/storefront/src/components/motion/` (components). Page files MUST import motion from this library only; direct imports of `motion/react` or `framer-motion` outside this path are forbidden.

#### Scenario: No ad-hoc motion imports in pages
- **WHEN** the repo is linted
- **THEN** no file under `src/app/**` or `src/components/**` (excluding `src/components/motion/**`) imports `motion/react` or `framer-motion` directly

### Requirement: Scroll-triggered reveal primitive
The library SHALL provide a `<Reveal>` component that animates its children on scroll into view: default behaviour is a 12px upward translate + opacity fade, duration 400 ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`. Props: `as`, `direction` (up / down / left / right / none), `distance` (px), `delay` (ms), `duration` (ms), `once` (default true), `amount` (0..1 viewport threshold).

#### Scenario: Default reveal fires once
- **WHEN** a `<Reveal>` scrolls into view with default props
- **THEN** it animates once and does not re-fire on subsequent re-entries unless `once={false}`

#### Scenario: Reveal honours reduced-motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** `<Reveal>` renders with full opacity immediately without any transform; no per-frame work is scheduled

### Requirement: Stagger primitive
The library SHALL provide a `<Stagger>` container that staggers its direct children's entrance animations. Props: `gap` (ms between children, default 60), `initialDelay` (ms), `direction` (up / down / left / right). Stagger MUST pause when off-screen and MUST fire only the children that enter the viewport.

#### Scenario: Grid stagger on listing
- **WHEN** a product grid of 8 cards is rendered inside `<Stagger gap={50}>`
- **THEN** cards appear in sequence with 50 ms between them, starting from the first card to enter the viewport

### Requirement: Parallax primitive
The library SHALL provide a `<Parallax>` component wrapping `useScroll` / `useTransform`. It uses **transform only** (translate / scale) — never `top`/`left`/`margin`. Default `offset` is 30 px; configurable. Active only when `prefers-reduced-motion` is off AND the element is within the viewport.

#### Scenario: Parallax avoids layout thrash
- **WHEN** a page is profiled during scroll
- **THEN** parallax produces no layout or paint events per frame; only compositor transforms change

### Requirement: Text kinetic primitive
The library SHALL provide a `<TextKinetic>` component that animates text entrance by word or character with opacity + subtle y-translate, used for the hero headline and section leads. Respects reduced-motion.

#### Scenario: Character-level stagger for the hero headline
- **WHEN** the hero headline mounts for the first time
- **THEN** characters enter with a 15 ms stagger, opacity 0 → 1 and y 8px → 0, settling under 600 ms

### Requirement: Shared-element transition primitive
The library SHALL provide a `<SharedElement>` component layering Framer Motion `layoutId`. Used for the product-card → product-detail image morph and the product-card → quick-view dialog morph. On reduced-motion, the morph collapses to a 150 ms cross-fade.

#### Scenario: Card image morphs to detail hero
- **WHEN** a shopper clicks a product card on a category listing
- **THEN** the card's primary image animates (position + size) into the product detail's hero image slot within ~300 ms, feeling continuous

### Requirement: Hover interaction primitives
The library SHALL provide hover primitives: `<HoverLift>` (translateY -2 px + soft elevation + tinted `--theme-glow` ring), `<HoverTilt>` (subtle 3D rotate based on cursor position, max 6°), `<CursorGlow>` (radial gradient following cursor inside the container at ≤ 18% opacity). All three are disabled on touch devices and on reduced-motion.

#### Scenario: Cursor glow off on touch
- **WHEN** the device is coarse-pointer (touch)
- **THEN** `<CursorGlow>` renders static children with no per-move event listeners attached

### Requirement: Page / route transition
Route transitions SHALL use the **View Transitions API** where available (Chromium 111+); in browsers without support, fall back to a 200 ms opacity cross-fade on the main content area. No transition exceeds 400 ms.

#### Scenario: View Transitions API progressive enhancement
- **WHEN** a supported browser navigates between routes
- **THEN** the View Transitions API is used to cross-fade the page and preserve shared-element identity where declared

#### Scenario: Unsupported browser fallback
- **WHEN** the browser lacks View Transitions support
- **THEN** the main content opacity cross-fades over ~200 ms and no broken behaviour is visible

### Requirement: `prefers-reduced-motion` is mandatory, not optional
Every motion primitive MUST consult a `useReducedMotion()` hook. In reduced-motion mode:
- Entrances collapse to a 150 ms opacity fade (no transform).
- Parallax and scroll-linked transforms become static.
- Shared-element morphs become cross-fades.
- Stagger gaps collapse to zero (all children appear together).
- Text-kinetic primitives render plain text immediately.
- Cursor-follow glow does not render.

#### Scenario: Reduced-motion snapshot tests
- **WHEN** the reduced-motion test suite runs
- **THEN** each primitive's resolved output under reduced-motion matches a committed snapshot; regressions fail CI

### Requirement: Performance budget for motion code
Motion-related JavaScript on the **critical route** (home, category, product-detail) MUST total ≤ **25 KB gzipped**, broken down as:
- `motion/react` (framer-motion) core and used features: ≤ 18 KB gz.
- Custom motion components (`Reveal`, `Stagger`, `Parallax`, `TextKinetic`, `SharedElement`, `Hover*`, `CursorGlow`) combined: ≤ 7 KB gz.
Shader, 3D, and video hero variants are lazy-loaded only and excluded from the critical-route budget.

#### Scenario: Motion bundle check in CI
- **WHEN** CI runs the size-limit check
- **THEN** the `motion` entry does not exceed 25 KB gz on the critical route; regressions fail the PR

### Requirement: 60 fps floor on mid-tier Android
Every animation shipped MUST hold **60 fps** on a 2021 mid-tier Android device (Pixel 4a-class / Redmi Note 11-class). Any animation that drops below is either rebuilt or scaled back for low-end.

#### Scenario: Frame-rate audit before release
- **WHEN** a release candidate is profiled on the baseline device
- **THEN** each animated surface holds 60 fps over a 10-second recording; drops are logged and fixed

### Requirement: Transform / opacity only for 60-fps animations
Hot-path animations (everything running on scroll, hover, or continuously) MUST animate `transform` and/or `opacity` only. Animating `width`, `height`, `top`, `left`, `margin`, `padding`, `color`, `background-color`, `box-shadow` on the hot path is forbidden.

#### Scenario: Lint gate
- **WHEN** a PR introduces an animation of a disallowed property on the hot path
- **THEN** a custom lint rule (or code-review checklist) flags the change

### Requirement: IntersectionObserver is pooled
Reveal / Stagger / Parallax primitives MUST share a pool of `IntersectionObserver` instances rather than each component creating its own. The pool caps at a bounded number of observers per threshold.

#### Scenario: Observer count bounded
- **WHEN** a page contains 50 `<Reveal>` components
- **THEN** no more than a small constant number of `IntersectionObserver` instances are created across them (e.g., ≤ 4, keyed by threshold)

### Requirement: Motion utilities opt-out safely from Server Components
Motion primitives MUST live in client components (`"use client"`). Page authors SHALL use them as ordinary React components; Server Components MUST NOT import motion primitives.

#### Scenario: Server Component boundary respected
- **WHEN** the build runs
- **THEN** no Server Component file imports from `src/lib/motion/` or `src/components/motion/`; violation fails the build
