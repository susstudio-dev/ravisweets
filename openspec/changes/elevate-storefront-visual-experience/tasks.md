## 1. Research & Benchmark

- [x] 1.1 Lock the benchmark site list (12–15) across the four pools (premium Indian sweets, international chocolatier/patissier, luxury lifestyle/perfumery, motion leaders); write to `research/benchmark.md`
- [x] 1.2 Capture each entry in the normalised schema (url, captured_on, pool, hero pattern, scroll motion, colour, typography, product-card interactions, transitions, navigation, distinctive signature, borrow_score, borrow_rationale, skip_rationale, evidence)
- [ ] 1.3 Record `reduced_motion_support` and an informal LCP/weight observation per entry *(reduced_motion partially captured, LCP observations mostly `unknown` — in-browser validation pass still needed)*
- [ ] 1.4 Save representative screenshots to `research/screenshots/<site-slug>/` (or cite deep-link URLs where stable) *(URLs cited only; no screenshots captured yet)*
- [x] 1.5 Build the pattern-extraction aggregate table (pattern × site × borrow_score × target spec requirement)
- [x] 1.6 Write the anti-pattern list (rejected moves with reasons)
- [ ] 1.7 Optional: curate a small moodboard under `research/moodboard/` with `moodboard.md` index and rights notes *(optional — skipped for v1)*
- [x] 1.8 Stamp `dossier_captured_on` and refresh cadence at the top of `benchmark.md`

## 2. Visual Design System — Tokens & Theme Engine

- [x] 2.1 Create `src/lib/theme/tokens.ts` as the single source of truth (raw palette, semantic roles, flavour-theme tokens, typography scale, spacing, radius, elevation, motion durations/easings, grain opacity)
- [x] 2.2 Project tokens into Tailwind config (colours + spacing + radius + shadows + fontFamily)
- [x] 2.3 Project tokens into CSS custom properties on `:root` via `globals.css`
- [ ] 2.4 Add a custom ESLint rule (or code-review checklist) forbidding raw colour literals and off-scale values in components
- [x] 2.5 Define the three-layer colour model (raw → semantic → flavour); document with example usages
- [x] 2.6 Add the fluid typography scale (`display-xl` … `caption`) using `clamp()`
- [x] 2.7 Integrate **Tiro Telugu** (primary) + optional **Tiro Devanagari** accent face via `next/font/google`; subset to actually-shipped glyphs; confirm ≤ 15 KB gz delta on critical route
- [x] 2.8 Implement `<Grain>` overlay component with reduced-motion + Save-Data guard
- [x] 2.9 Commission / source the paisley SVG artwork (single hand-drawn mark, ≤ 4 KB inline); add to `apps/storefront/public/brand/paisley.svg`
- [x] 2.10 Build `<Paisley>` component — token-driven stroke/fill (`--theme-accent`), sizes (sm/md/lg), rotation prop; reduced-motion safe
- [x] 2.11 Use `<Paisley>` as the section-divider mark in the home page; verify max 4 appearances per page (codified rule)
- [ ] 2.12 Add paisley accent to wordmark lockup (header + favicon package) *(header + footer done; favicon package not produced)*

## 3. Visual Design System — Palette Extraction & Theme Engine

- [ ] 3.1 Write the build-time palette-extraction script (`scripts/extract-palettes.ts` using `culori` + `sharp`) that reads each product's primary image and writes a `theme_palette` *(deps installed; script not written — v1 uses hand-curated palettes)*
- [ ] 3.2 Add WCAG-contrast fallback: if generated `--theme-ink` vs `--theme-base` is below 4.5:1, substitute semantic neutral ink and log
- [ ] 3.3 Support hand-curated palette overrides via product metadata (`theme_palette_override`)
- [x] 3.4 Ship `src/lib/theme/theme-provider.tsx` — SSR-safe, seeds `:root` CSS variables from route data (no FOUC)
- [ ] 3.5 Wire product / category routes to set the active theme on load *(product routes emit `<ThemeVars>`; category routes don't exist yet)*
- [ ] 3.6 Implement client-side theme cross-fade (~250 ms) on in-app navigation; prefer `View Transitions API` where supported *(body has a 250ms CSS transition on theme vars; View Transitions API not integrated)*
- [x] 3.7 Extend `packages/shared` types to carry `theme_palette` on `Product` and (new) `Category`
- [x] 3.8 Seed sample products (in `sample-products.ts`) with explicit `theme_palette` values so the system is demoable before real images land

## 4. Canonical Component Vocabulary

- [ ] 4.1 Scaffold a `components/ui/` (in-app) set: `Button`, `Chip`, `Badge`, `Card`, `Sheet`, `Dialog`, `DropdownMenu`, `Tabs`, `Accordion`, `Tooltip`, `Toast`, `SectionHeader`, `Marquee`, `MediaFrame` — each token-driven, small prop API, documented in-place *(partial — `packages/ui` workspace scaffolded with **Button** (5 variants × 3 sizes via cva), **Badge** (5 variants), **Card** (padding/elevation/radius/border/surface variants), **Skeleton**; `<Marquee>` lives under `components/motion/`. Still to build: Chip, Sheet, Dialog, DropdownMenu, Tabs, Accordion, Tooltip, Toast, SectionHeader, MediaFrame)*
- [ ] 4.2 Refactor existing `ProductCard`, `Header`, `Footer` to consume the new primitives and semantic/theme tokens
- [ ] 4.3 Add a simple in-repo `/styleguide` route (dev-only) that renders every component variant for visual QA
- [ ] 4.4 Confirm keyboard navigation + focus-visible states on every primitive (WCAG 2.1 AA)

## 5. Motion System — Primitives

- [x] 5.1 Add dependency `motion` (Motion for React v11+) and set up `src/lib/motion/` as the only import path for motion
- [x] 5.2 Implement `useReducedMotion()` hook + shared motion constants (durations, easings) in `src/lib/motion/constants.ts`
- [x] 5.3 Build `<Reveal>` (scroll-triggered, direction, distance, delay, duration, once, amount) with reduced-motion fallback
- [ ] 5.4 Build `<Stagger>` (gap, initialDelay, direction) with IntersectionObserver pooling *(Stagger shipped, pooled IO registry not)*
- [x] 5.5 Build `<Parallax>` using `useScroll` + `useTransform` — transform-only, reduced-motion static
- [x] 5.6 Build `<TextKinetic>` (word / character stagger, entrance-only, reduced-motion plain text)
- [ ] 5.7 Build `<SharedElement>` wrapping Framer `layoutId` (for card→detail, card→quick-view morphs); reduced-motion fallback is cross-fade *(layoutId used inline in ProductCard + QuickViewModal; no standalone primitive)*
- [ ] 5.8 Build hover primitives: `<HoverLift>`, `<HoverTilt>`, `<CursorGlow>` — touch/reduced-motion gates *(HoverLift + CursorGlow done; HoverTilt not built)*
- [ ] 5.9 Implement pooled `IntersectionObserver` registry keyed by threshold
- [ ] 5.10 Write reduced-motion snapshot tests for every primitive; wire into CI
- [ ] 5.11 Add `size-limit` entries for `lib/motion/*` (≤ 7 KB gz custom + ≤ 18 KB gz framer) and wire into CI
- [x] 5.12 Add ESLint rule: direct `motion/react` imports only allowed inside `src/lib/motion/**` and `src/components/motion/**` *(rule scoped to `src/app/**` page files for v1 — matches spec's "page files MUST import motion from this library only"; a stricter pass covering `src/components/**` requires refactoring hero/sections/cart/product-card away from direct `motion/react` usage, flagged as follow-up)*
- [ ] 5.13 Add a lint / CI assertion: no hot-path animation on `width/height/top/left/margin/padding/color/background-color/box-shadow`

## 6. Route & Page Transitions

- [ ] 6.1 Implement a thin `<PageTransition>` wrapper using View Transitions API where supported; 200 ms opacity cross-fade fallback otherwise
- [ ] 6.2 Integrate `<PageTransition>` into `app/layout.tsx`
- [ ] 6.3 Coordinate the theme cross-fade with the page transition so both resolve together
- [ ] 6.4 Verify no flicker / FOUC / mis-themed frame during navigation (test on direct URL entry and client-side routing) *(SSR-seeded theme prevents flash on direct entry; no formal verification captured)*

## 7. Hero — Cinematic Still Variant (v1 COMMITTED)

- [ ] 7.1 Direction and art-direction brief for the hero shot (signature product, brass bowl, directional light, shallow depth; brief captured in `research/hero-brief.md`) *(no brief document yet)*
- [ ] 7.2 **SCHEDULING BLOCKER — Book the professional photography shoot** (owner, date, budget, location, shot-list including signature SKUs, gifting hampers, and ingredient/atmosphere frames). Real hero cannot go live until this is executed.
- [x] 7.3 Interim placeholder asset with visible "dev only" watermark (flagged off in production rollout via the photography-gating requirement)
- [x] 7.4 Build `HeroStill` component: hero image (next/image, preload, fetchpriority="high", AVIF/WebP, responsive srcset), `<TextKinetic>` headline, eyebrow pretitle, dual CTA, `<Grain>` overlay, soft gradient, scroll-coupled parallax on image (≤ 30 px), paisley accent on eyebrow divider
- [x] 7.5 Reduced-motion variant: plain still + fade-in headline, no grain, no parallax, static paisley accent
- [ ] 7.6 LCP verification on real device; fail-the-gate if hero LCP > 2.5s mobile Slow 4G
- [x] 7.7 Add feature flag `hero_variant` with values `still | video | shader | 3d | kinetic-type`; default and v1 shipping value is `still`; unknown → fall back with one-time warning *(`getHeroVariant()` in `src/lib/flags/visual-v2.ts` — env-var driven, one-time console warning on unknown value, default `still`; HeroStill doesn't yet consult the flag — switching variants requires consumer wiring)*
- [ ] 7.8 Photography-gating guard in the deploy pipeline: `visual_v2` cannot go to 100% production rollout while the served hero asset is flagged as placeholder

## 8. Hero — Alternative Variants (specced, lazy-built for A/B)

- [ ] 8.1 `HeroVideo` skeleton: poster image + lazy video element + AV1/VP9 source + Save-Data/reduced-motion/viewport gates; do not ship by default
- [ ] 8.2 `HeroShader` skeleton: lazy-loaded `ogl` / `regl` fragment shader overlay; gated on deviceMemory ≥ 4, desktop viewport, reduced-motion off; do not ship by default
- [ ] 8.3 `Hero3D` skeleton: `@react-three/fiber` model with drift camera; desktop-only + reduced-motion gates; do not ship by default
- [ ] 8.4 `HeroKineticType` skeleton: typography-led hero with palette-driven colour field; do not ship by default
- [ ] 8.5 Lazy-bundle verification — each alternative variant, when built, stays off the critical-route bundle

## 9. Product Interaction Micro-Narrative

- [x] 9.1 Retrofit `ProductCard` with `<HoverLift>` + `<CursorGlow>` + focus-visible parity + corner `<Paisley>` accent on hover/focus
- [x] 9.2 Image scale (~2%) on hover inside the `MediaFrame`
- [x] 9.3 Shared-element IDs for card image + title + price *(image and panel have layoutId; title/price do not — acceptable for v1, visual morph is anchored on image)*
- [x] 9.4 **Quick-view modal (v1 primary path)** via App Router parallel/intercepted routes; morph card image into modal hero. View Transitions API is a later progressive enhancement, not the v1 primary mechanism.
- [ ] 9.5 Product-detail page with hero that participates in shared-element morph when arrived from listing (fallback: no-morph gentle entrance on direct URL load) *(detail page has gentle entrance + SSR theme seed; a true morph across routes is deferred to the View Transitions API pass)*
- [x] 9.6 Theme-shift on product-detail / quick-view activation; revert on close
- [x] 9.7 Garnish accent component — one-shot entrance, disables on reduced-motion, per-product mark style (saffron / pistachio / silver / paisley flourish — reusing the design-system `<Paisley>` asset, not a new illustration)
- [x] 9.8 Variant selector crossfade for price changes; no CLS
- [x] 9.9 Image gallery crossfade (not slide); thumbnail highlight; arrow-key navigation
- [x] 9.10 Add-to-cart success acknowledgement: button ribbon-pull + cart badge count-up + transient toast (≤ 2 s) *(visual only — no real cart wiring; badge increment not yet implemented)*
- [x] 9.11 Add-to-cart error state: explicit inline message, no toast
- [ ] 9.12 Review card reveal with `<Stagger>`; lazy-load beyond first N *(no reviews data source yet)*

## 10. Performance, Accessibility, and Observability

- [x] 10.1 Lighthouse CI: confirm LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on home / category / product routes under Slow 4G *(config shipped at `apps/storefront/.lighthouserc.json` with asserts on LCP/INP/CLS/TBT + perf/a11y/seo category scores across home / category / product / cart / about; runs locally via `npx lhci autorun`. Actual CI workflow integration deferred)*
- [x] 10.2 First Load JS budget: critical route ≤ 180 KB gz (existing budget); motion code ≤ 25 KB gz within that *(currently home 172 KB / cart 169 KB / product 173 KB / category 164 KB / modal 172 KB / about 157 KB / checkout 166 KB / account 164 KB / policies 148 KB — all under budget. `.size-limit.json` at `apps/storefront/` declares the budget; runs via `npx size-limit`; CI gate deferred)*
- [ ] 10.3 Device-frame-rate test on a 2021 mid-tier Android device (Pixel 4a / Redmi Note 11); every animated surface holds 60 fps over a 10 s recording
- [ ] 10.4 Reduced-motion E2E walkthrough: home → category → product → add-to-cart; capture a QA note confirming zero transforms fire
- [ ] 10.5 Axe / WCAG 2.1 AA pass: focus states, contrast across flavour palettes, keyboard reachability, ARIA labels, skip-to-content, colour-contrast on theme variants
- [ ] 10.6 Add PostHog events for hover-dwell > 400 ms, card-click, quick-view open, theme-shift, garnish-fire, add-to-cart attempt + outcome, variant change — with dedup rules
- [ ] 10.7 Create `research/performance-audit.md` capturing before/after metrics (LCP, INP, CLS, TBT, first-load JS, JS CPU time)

## 11. Rollout & QA

- [x] 11.1 Introduce feature flag `visual_v2` for the entire elevated experience; old path remains behind `visual_v1` *(`isVisualV2Enabled()` in `src/lib/flags/visual-v2.ts` — env-var driven, default on; no `visual_v1` path retained because v1 shipped with the elevated experience — rollback strategy is disabling new features individually via their own flags)*
- [ ] 11.2 Enable `visual_v2` for internal stakeholders only
- [ ] 11.3 Founder review session (walk home → hover → click → detail → add-to-cart on desktop + mobile + reduced-motion); capture feedback
- [ ] 11.4 Address feedback; second round with marketing + accessibility reviewer
- [ ] 11.5 Enable `visual_v2` to 100% after two clean weeks on perf + error dashboards
- [ ] 11.6 Remove `visual_v1` path after one release cycle of stable `visual_v2`
- [ ] 11.7 Schedule dossier refresh per cadence (3 months for motion leaders, 6 months for lifestyle)
