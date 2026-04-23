## Context

The Ravi Sweets storefront scaffold from `build-ravisweets-storefront` shipped a clean, fast, accessible, but **undifferentiated** page — it is the floor, not the ceiling. The founder's feedback is direct: add more scroll motion, make the page look genuinely good, let the theme shift "magically" per sweet, react meaningfully when a shopper picks a sweet, and make the hero impressive — image or something unique. And do the homework: benchmark premium food / dessert / chocolatier / perfumery / motion-leader sites first.

This design answers: how to build the benchmark, how to pick a hero without guessing, how to layer motion responsibly, how to swap colour themes per product without breaking SSR or the performance budget, and how to keep this whole layer accessible and reversible.

**Current state**: Next.js 15 (App Router), Tailwind, shared package with Product/Region types, sample product data, home page with hero + categories + featured + trust + bestsellers + corporate CTA. No motion library. No design tokens beyond Tailwind defaults + 6 brand colours. No per-product theming. Hero is a static gradient + background image.

**Constraints**:
- **Performance budget is sacred**: LCP ≤ 2.5s mobile Slow 4G, INP ≤ 200ms, CLS ≤ 0.1, customer-route JS ≤ 180 KB gzipped. Motion additions must fit inside that — motion code specifically budgeted to ≤ 25 KB gz.
- **Accessibility is sacred**: WCAG 2.1 AA; `prefers-reduced-motion: reduce` MUST disable every non-essential animation and replace with instant state changes.
- **Motion via `transform` and `opacity` only** for anything running at 60 fps. No animating `width`, `height`, `top`, `left`, `margin`, or box-shadow radii in the hot path.
- **SSR/RSC compatible**: initial render must be server-rendered HTML; no flash-of-unstyled-content when theme swaps.
- **Imagery** is the single largest quality lever — ugly photography defeats any amount of motion. Image quality is upstream of this change; we assume production-grade shots will land (Task 8.2 in `build-ravisweets-storefront`).
- **Device variance**: target 60 fps on a 2021 mid-tier Android (Pixel 4a / Redmi Note 11). Anything that can't hold 60 fps on that class either gets a scale-back tier or is gated to capable viewports.

## Goals / Non-Goals

**Goals:**
- Benchmark 12–15 premium food / dessert / chocolatier / gifting / perfumery / motion-leader sites and extract specific, citable patterns.
- Introduce a visual design system (tokens + theme engine + component vocabulary) that supports per-product / per-category "flavour palettes" swapped at route change without layout shift.
- Build a motion library (Reveal, Stagger, Parallax, TextKinetic, SharedElement, Hover primitives) — documented, opinionated, reused everywhere; dev-ergonomic.
- Ship ONE recommended hero treatment with ≥ 2 alternatives specced and an A/B flag.
- Choreograph a memorable product-selection micro-narrative: hover → click → card-to-detail morph → theme shift → garnish accent.
- Respect the performance budget end-to-end; every animation shippable must run at 60 fps on mid-tier Android.
- Respect `prefers-reduced-motion` on every single animated element — no exceptions.

**Non-Goals:**
- No sound, haptics, confetti, or gamification. Off-brand for a premium heritage gift brand.
- No full brand identity redesign (new logo, new tagline, new packaging) — that is a separate change, owned by marketing/design agency.
- No dark mode in this change (future change; the theme engine's architecture will not preclude it).
- No internationalisation of copy (already handled by `customer-storefront`).
- No new commerce features.
- No bespoke cursor that hijacks accessibility or obscures OS affordances. A *subtle* cursor-follow glow is permitted; a custom-drawn cursor replacing the system cursor is rejected.

## Decisions

### Decision 1: Motion library — Motion One / Framer Motion, not GSAP as default
**Choice**: Use **Motion for React** (née Framer Motion, now `motion` v11+) as the default motion primitive. Reserve **GSAP ScrollTrigger** only for edge cases (complex scrubbed scroll timelines) where Motion's `useScroll`/`useTransform` don't model the sequence cleanly. Both are tree-shakeable.
**Why**: Motion/Framer is idiomatic for Next.js App Router + RSC (client components with `"use client"`), first-class layout animations (critical for the card-to-detail morph), variants + stagger built in, a tiny subset (`motion/mini`) available if we need to drop weight. GSAP is more powerful but heavier + imperative + license-checkable; introducing it for all motion would over-engineer.
**Alternatives considered**:
- **Pure CSS keyframes + IntersectionObserver** — cheapest, but authoring complex staggers and shared-element transitions gets tedious and error-prone. Rejected as the default; retained for utility reveals where CSS is enough.
- **React Spring** — great physics model but ecosystem smaller and layout animations weaker than Framer's `layoutId`. Rejected.
- **GSAP everywhere** — too heavy (core ~25 KB, ScrollTrigger +10 KB) to be the default given our budget.
- **Popmotion / Auto-Animate** — too limited for the choreography we need.

### Decision 2: AOS-style reveal is a component, not a library
**Choice**: Build a `<Reveal>` component (and its sibling `<Stagger>`) that wraps Framer Motion's `whileInView`. Do NOT ship the `aos` npm library — it's 14 KB, CSS-based, doesn't compose with our theme engine, and doesn't respect prefers-reduced-motion as rigorously as we want.
**Why**: one primitive, reused everywhere, tied into the motion system's budget and reduced-motion rules. Devs never write raw animation code in page files.
**Alternatives considered**: AOS library (rejected for the reasons above), custom IntersectionObserver hook (kept internally to power `<Reveal>`).

### Decision 3: Per-product "flavour palette" via CSS custom properties
**Choice**: Each product carries a `theme_palette` object (`base`, `accent`, `glow`, `ink`, `grain_opacity`). When a product page loads OR a user dwells on a product card for > 400 ms, a `<ThemeProvider>` updates a fixed set of CSS variables on `:root` (`--theme-base`, `--theme-accent`, `--theme-glow`, `--theme-ink`). Tailwind utility classes are set up to consume those variables so component styles re-theme automatically.
**Why**: CSS-var swaps are GPU-cheap, work with SSR (initial value is seeded from route data server-side, zero FOUC), don't invalidate React trees, and compose with any component without per-component prop plumbing.
**Alternatives considered**:
- React context + inline styles on every themable component — works but verbose, SSR-hydration-fragile, and more boilerplate.
- Tailwind theme plugin regenerating classes at runtime — way too heavy.
- Overriding theme by re-rendering the whole subtree with a new provider — fine but unnecessary; CSS vars are the simpler primitive.

### Decision 4: Palette derivation at build time, not runtime
**Choice**: Per-product palettes are derived from the dominant colours of the product's hero image at **build time** (a small Node script using `culori` + `sharp` samples the image, clusters dominant hues, fits them into a 5-swatch palette, writes the result into the product's metadata file / Medusa product attribute). Hand-curated palette overrides are honoured if present.
**Why**: no runtime cost on the storefront; no CORS headaches; deterministic output; designer-overridable. "Magical" is better when it's intentional.
**Alternatives considered**:
- Runtime Canvas-based dominant-colour extraction — costs ~20–40 ms per image and hits CORS.
- LLM-generated palette per product — overkill and non-deterministic.
- Hand-picked palettes only — fine for 20 products, not for 200. Hybrid default: auto-derive with hand override.

### Decision 5: Hero — recommended direction and fallback ladder
**Choice (recommended)**: **Cinematic still photograph + scroll-coupled parallax + text-kinetic headline** for desktop. Mobile receives the same still with simpler entrance motion (no parallax, just fade + subtle scale). Reduced-motion receives the still photograph with a fade-in only.
**Why**: a breathtaking still is the cheapest route to "impressive" when the photography is done right, it is accessible, it is printable across all marketing surfaces, and it LCP-optimises easily (one image, preloaded). Video and 3D can look cheap if the asset is mediocre; a still compounds with the photo shoot you're already planning.
**Alternatives specced (kept in the spec for A/B readiness, not built in v1 unless the still disappoints)**:
- **Ambient video loop** (silent, autoplay-muted, 6–8 s, ≤ 500 KB AV1/VP9, poster image for LCP) — use if we have real kitchen/craft footage worth showing.
- **WebGL "ghee glaze" shader** (subtle animated sheen on a still-image layer using a tiny fragment shader via `regl` or `ogl`) — lazy-loaded; gates on hero-capable viewport.
- **3D render of Qubani ka Meetha bowl** with slow camera drift (`@react-three/fiber`, lazy, desktop-gated, reduced-motion disabled) — high wow factor, high asset cost (3D scan or photogrammetry).
- **Kinetic type-first** (headline as the hero, imagery secondary) — strong if we commit to an editorial tone; works well with the per-product palette theme.

Routing: feature flag `hero_variant` with values `still`, `video`, `shader`, `3d`, `kinetic` — Phase 1 ships `still`; product / marketing can A/B later.

### Decision 6: Card-to-detail transition uses Framer `layoutId`
**Choice**: The product-card image and detail-page hero image share a `layoutId` so clicking the card smoothly morphs the image from its card position to the product detail's hero. Title gets its own shared layout, position-animated separately. Route transition uses Next.js App Router's `loading.tsx` + a persistent layout island that owns the shared element.
**Why**: `layoutId` is Framer's single strongest feature; competitive premium sites (Linear, Rauno, Diagram, several Arc Browser marketing pages) use exactly this pattern for a reason — it feels native and costs very little.
**Risks / mitigations**: shared-element morphs across App Router route changes can be fiddly. Mitigation: keep the card and the detail hero inside a common layout segment during the transition (Parallel Routes or client-side modal preview), and test `View Transitions API` as a progressive enhancement on Chromium.

### Decision 7: Scroll motion — scroll-linked for key layers, scroll-triggered for everything else
**Choice**:
- **Scroll-linked** (parallax, headline kinetic): `useScroll` + `useTransform` from Framer — only applied to the hero and section backgrounds, capped at 2–3 layers per viewport.
- **Scroll-triggered** (reveals, staggered grids, text fades, card slides): `<Reveal>` using IntersectionObserver — no per-frame work, fires once, cleaned up after.
**Why**: scroll-linked animations are GPU-expensive and scale badly when overused; restricting them to a couple of orchestrated moments protects the frame budget. Reveals are cheap and can blanket the page.

### Decision 8: Reduced-motion strategy is explicit, not implicit
**Choice**: Wrap every motion primitive in a `useReducedMotion()` check. If reduced-motion is set, entrances collapse to opacity fade-in only (`duration: 150 ms`), parallax disables, scroll-linked transforms become static, shared-element becomes a plain cross-fade. No animated element relies on `@media (prefers-reduced-motion)` via CSS alone — this is enforced at the component level so every wrapper tests it.
**Why**: CSS-only approaches miss Framer's JS-driven transforms. A single hook pattern gives us one thing to audit.

### Decision 9: Typography pairing and an optional Indic accent
**Choice**: Keep **Fraunces** (display serif, variable, warm, editorial) + **Inter** (body sans). Evaluate adding **"Tiro Devanagari / Tiro Telugu"** as an accent face for a subtle Hyderabadi signature (the brand wordmark, category labels, or pull quotes) — ship only if it adds < 15 KB gzipped on the critical route.
**Why**: Fraunces has the heritage feel without being staid; Inter is the most-tested body sans in the ecosystem. A Tiro accent is the cheapest way to signal Hyderabad without kitsch.

### Decision 10: Grain / texture overlay for warmth
**Choice**: A single 12 KB SVG noise filter (or a 2 KB pre-generated PNG) applied via CSS `background-image` on the hero and large surfaces. Opacity ≤ 6%. Disabled on reduced-motion and on Save-Data.
**Why**: the cheapest trick in high-end editorial design to soften digital flatness. Used by Aesop, Maison Francis Kurkdjian, half of Awwwards-winning food sites.

### Decision 11: Performance budget for motion code specifically
**Choice**:
- Motion primitives (`motion/react`) ≤ 18 KB gz on the critical route.
- Custom motion components (`Reveal`, `Stagger`, `Parallax`, `TextKinetic`, `SharedElement`, `Hover*`) ≤ 7 KB gz combined.
- Shader / 3D / video variants are **not** included on the critical route; they are lazy-loaded via `next/dynamic({ ssr: false })` and gated on viewport + capability + flag.
**Why**: preserves the 180 KB First Load JS ceiling with meaningful headroom.

### Decision 12: Benchmark dossier is an artifact, not a moodboard
**Choice**: The benchmark is a Markdown document (`research/benchmark.md`) with one entry per site, captured on a dated basis with URL, screenshots (or `captured_on` + page key), the specific patterns we are borrowing (hero, motion, color, typography, product-card, transitions, navigation), a 0–5 score on "how much do we want to borrow this", and a one-line rationale. Moodboard images (if any) go into `research/moodboard/` with sources attached.
**Why**: keeps inspiration auditable and re-reviewable. Prevents silent drift from "researched" to "I saw something cool once."

### Decision 13: Build the system first, retrofit the page second
**Choice**: Ship `lib/motion/`, `lib/theme/`, and `components/motion/` first. Then retrofit `app/page.tsx`, `components/header.tsx`, `components/footer.tsx`, `components/product-card.tsx`. Finally, build the hero variant(s) and the card-to-detail transition.
**Why**: building the library while simultaneously redesigning the page leads to a sprawling mess where design choices bake into one-off code. Library-first protects reusability.

### Decision 14: Cursor-follow glow is subtle and opt-out
**Choice**: On hover of a product card (desktop, non-reduced-motion), a soft radial gradient follows the cursor inside the card at low opacity (≤ 18%). It does **not** replace the cursor. It snaps off on leave. On touch devices, it never runs.
**Why**: the "something happens" ask — without hijacking the system cursor or hurting accessibility.

## Risks / Trade-offs

- **Risk**: Imagery doesn't match the ambition. A brilliant motion system on mediocre photos looks worse than plain design on brilliant photos. → **Mitigation**: block the hero's A/B "go live" until production photography lands. Use high-quality stock/reference as interim with a visible "placeholder" watermark in dev.
- **Risk**: Motion debt — engineers adding `framer-motion` `motion.div` calls everywhere outside the system. → **Mitigation**: ESLint rule (or a simple code-review checklist) forbidding direct `motion.*` imports outside `components/motion/` and `lib/motion/`; the system re-exports the primitives.
- **Risk**: Bundle creep as features compound. → **Mitigation**: `size-limit` entries specifically for `lib/motion/*` and `lib/theme/*`; CI fails on regressions of > 2 KB without an explicit waiver.
- **Risk**: Device variance — shader/3D can stutter on a 2019 Android. → **Mitigation**: hero variants `shader` and `3d` are desktop-gated (width ≥ 1024 AND `navigator.deviceMemory ≥ 4` AND reduced-motion off AND Save-Data off); otherwise fall back to `still` automatically.
- **Risk**: Per-product theme swap causes a jarring flash. → **Mitigation**: SSR seeds the `:root` CSS vars from route data, so the first paint already carries the correct theme; on client-side navigation, use `View Transitions API` where available to cross-fade the theme change over ~250 ms.
- **Risk**: Shared-element `layoutId` fights with App Router route changes. → **Mitigation**: first implementation uses a parallel-routes **product quick-view** modal for the image morph on the listing page; full card-to-detail morph across a page transition is a second iteration using View Transitions API.
- **Risk**: Benchmark dossier becomes a giant swipe-file with no decisions. → **Mitigation**: spec requires every entry to have a "borrow/skip" decision and every pattern we borrow to point to a spec requirement that enshrines it.
- **Risk**: Prefers-reduced-motion regressions slip in. → **Mitigation**: a single `useReducedMotion()` hook used by every primitive; a test file that renders each primitive under reduced-motion and snapshot-tests its resolved output.
- **Trade-off**: Choosing a still hero over video/3D in v1 trades maximum wow for reliability and LCP — accepted, but we keep the alternatives specced so Phase 2 can A/B upgrade.
- **Trade-off**: CSS-var theming means theme values cannot be read from JS without a `getComputedStyle` call; fine for our use cases.

## Migration Plan

- Implement `lib/motion/` and `lib/theme/` in isolation with unit tests.
- Land a single page (home) on the new system behind a feature flag `visual_v2`. Old CSS-only home remains under `visual_v1` until cutover.
- Roll out product pages, then category pages, then checkout static bits (checkout should remain minimally animated — revenue > whimsy).
- Cutover: flip `visual_v2` to 100% after two weeks of clean perf/error metrics.
- Rollback: disable flag; the old code path is retained for one release cycle, then removed.

## Resolved Inputs (2026-04-22)

1. **Hero direction — COMMITTED**: cinematic still photograph + scroll-coupled parallax + TextKinetic headline. Variants `video` / `shader` / `3d` / `kinetic-type` stay specced for A/B but are not built in v1.
2. **Professional photography — NOT YET SCHEDULED**: this is a material Phase-1 blocker for the production hero. Until a real shoot lands, use a clearly-watermarked placeholder asset flagged "dev only" and gate the public launch of the real hero on the shoot landing. Added as a task in `tasks.md`.
3. **Indic accent face — YES**: ship **Tiro Devanagari** and/or **Tiro Telugu** (subset, `display: swap`) for wordmark, category labels, and pull-quotes. Budget constraint unchanged: total font payload ≤ 75 KB gz on the critical route.
4. **Signature motif — PAISLEY**: single hand-drawn SVG paisley, token-driven colour, used as (a) section-divider line-art, (b) subtle hover/focus accent on premium surfaces, (c) a garnish option per product, (d) part of the favicon / wordmark lockup. Codified in the visual-design-system spec.
5. **Route transition — QUICK-VIEW MODAL FIRST**: App Router parallel/intercepted routes, shared-element `layoutId` morph. View Transitions API is a later progressive enhancement, not the primary v1 mechanism.
6. **3D Phase-2 appetite — YES (not v1)**: open to budgeting a photogrammetry scan of a signature sweet (e.g., Qubani ka Meetha bowl) for a future `hero_variant: 3d` A/B test. Logged as a Phase-2 follow-up.

## Open Questions

1. **Photography shoot scheduling and brief sign-off** — owner, date, budget, location. Blocks the real hero's go-live.
2. **Paisley artwork ownership** — in-house illustrator / agency / commissioned from a Hyderabadi artist? (A commissioned original is recommended for brand provenance.)
3. **Tiro accent script choice** — Devanagari vs. Telugu vs. both? Telugu is a stronger Hyderabad signal; Devanagari is more nationally legible. Recommend Telugu for hero/wordmark and Devanagari on widely-shared surfaces; confirm with marketing.
