## Why

The Phase 1 storefront scaffold (from `build-ravisweets-storefront`) is functional and fast but **does not feel premium** — it looks like a competent e-commerce template, not a luxury gifting brand rooted in Hyderabad's Nizami heritage. The founder's bar is higher: the page should *feel* magical; selecting a sweet should feel like something happens; the hero must be genuinely impressive. Competitors in the premium segment (Bombay Sweet Shop, Anand Sweets' premium line, Loveleaf, Truffles & Co, and international references like La Maison du Chocolat, Pierre Hermé, Maison Francis Kurkdjian, Aesop) are all investing in motion, color intentionality, and distinctive hero treatments — Ravi Sweets needs to meet that bar or lose the premium gifting customer before they click "add to cart." This change elevates the storefront's visual experience without blowing the performance budget and without guessing: every visual decision is benchmarked against a researched competitive set.

## What Changes

- **Benchmark first, design second**: produce a researched snapshot of 12–15 premium food / dessert / chocolatier / gifting / perfumery / motion-leader sites with captured patterns (hero treatment, scroll motion, hover behaviour, color system, typography pairing, product-card interactions, navigation, transitions). No design decision lands without at least one benchmarked reference.
- **Introduce a visual design system**: design tokens for color (with a **per-product / per-category "flavour theme"** variable layer), typography (display serif + body sans, with optional devanagari/telugu accent type for Hyderabadi provenance), spacing, radius, elevation, grain/texture overlays, and a canonical component vocabulary (button, chip, card, sheet, dialog, product-media frame, section header, marquee).
- **Build a motion system** (not ad-hoc animations): scroll-triggered reveals (AOS-style entrance, stagger, directional), parallax on key layers, text kinetic entrances, micro-interactions on all interactive elements, page and route transitions, and **mandatory `prefers-reduced-motion` fallbacks**. All motion runs on `transform` / `opacity` only; CI fails on layout-thrashing properties. The motion system is budget-aware: total animation-related JS ≤ 25 KB gzipped.
- **Ship a genuinely impressive hero**: explore and decide between (a) cinematic photography with hand-choreographed parallax & reveal, (b) short ambient video loop (silent, autoplay-muted, ≤ 500 KB), (c) WebGL/canvas shader for a subtle "ghee glaze" shimmer, (d) 3D render of a signature product (Qubani ka Meetha bowl) with camera drift, (e) kinetic type-first hero with photography as a secondary layer. The design doc picks a recommended direction and names the fallback. A/B-ready via feature flag.
- **"When they select a sweet, something happens"**: define and build a product-selection micro-narrative — hover gives a 3D card lift with cursor-follow glow; click transitions to product detail using a **shared-element (FLIP) animation** so the product image morphs from the card into the detail hero; the page's color theme then shifts to that sweet's flavour theme (saffron, pistachio, rose, chocolate, qubani-amber, etc.); and a subtle garnish particle effect triggers once on arrival.
- **Per-product / per-category "magical" color theming**: each product declares a `theme_palette` (base, accent, glow, ink) derived from its dominant photograph tones; the site's CSS custom properties swap as the user navigates, creating a sense that "the store changes flavour as you move." Controlled via a central theme engine, not per-component hacks.
- **Non-goals**: rebuild the information architecture, add new commerce features, change payment flow, redesign admin console, add gamification / confetti / sound effects (rejected as off-brand for a premium heritage brand).

## Capabilities

### New Capabilities
- `design-research-benchmark`: a researched, citation-backed dossier of premium food / dessert / gifting / perfumery / motion-leader sites with extracted patterns, scored on dimensions we plan to borrow, so design decisions are grounded and auditable.
- `visual-design-system`: design tokens (colour layers including a per-product `theme_palette`, typography, spacing, radii, elevation, grain), a canonical component vocabulary, and a theme engine that swaps palettes as the user navigates between products/categories.
- `motion-system`: a reusable, budget-aware motion library covering entrance reveals (AOS-style), stagger, parallax, text kinetics, micro-interactions, page/route transitions, and `prefers-reduced-motion` fallbacks.
- `hero-experience`: a recommended hero treatment (with ≥ 2 alternatives specced and a fallback), built for cinematic impact on desktop, gracefully degraded on low-end mobile, and A/B-testable via a feature flag.
- `product-interaction`: the end-to-end micro-narrative when a shopper engages with a product — hover, click, card→detail transition, theme shift, garnish accent, and the add-to-cart acknowledgement.

### Modified Capabilities
<!-- None. The customer-storefront spec from build-ravisweets-storefront is not yet archived;
     its performance-budget and accessibility requirements remain authoritative and are not relaxed
     here. Tie-ins to that spec (motion inside 180 KB First Load JS; prefers-reduced-motion honoured
     on every new interaction) are enforced inside the motion-system spec in this change and will be
     folded into the customer-storefront spec via a delta when both changes are archived together. -->


## Impact

- **Code affected**: `apps/storefront/src/app/layout.tsx`, `src/app/page.tsx`, `src/components/*`, `src/app/globals.css`, new `src/lib/motion/`, new `src/lib/theme/`, new `src/components/motion/` (Reveal, Stagger, Parallax, TextKinetic, SharedElement), new `src/components/hero/` (variants), `tailwind.config.ts`.
- **Dependencies added (tentative, finalised in design.md)**: `framer-motion` OR `motion` (lightweight v11+), `gsap` (only if ScrollTrigger is needed for one-off cases), `@react-three/fiber` + `@react-three/drei` (only if 3D hero is picked), `culori` or `colord` for palette extraction/derivation. Every addition is weighed against the 180 KB First Load JS budget and the ≤ 25 KB motion-code budget.
- **Bundle impact**: expected first-load JS rise of ~15–25 KB gzipped for motion primitives; shader/3D heroes loaded lazily and only on hero-capable viewports (width ≥ 1024, Save-Data off, reduced-motion off). Below that, fall back to a still cinematic image with micro-parallax.
- **Assets required**: hero photograph OR video OR 3D asset set (depending on decision); per-product dominant-color extraction (auto-derived at build time from hero image using `culori` or a tiny build-time script); typography licenses (Fraunces + Inter already licensed; evaluate if a Hyderabadi/Telugu display accent is desired).
- **Downstream changes unlocked**: festival-theme campaigns (overlay seasonal motion/colours), product launch animations, Diwali-specific hero (gold-leaf shimmer), corporate-gifting landing with dedicated motion tone, loyalty-page unlockable "magic mode."
- **Stakeholders**: founder (final direction on hero), marketing (brand voice + imagery), engineering (motion & perf), accessibility reviewer (reduced-motion + focus/contrast).
- **Risks**: motion debt (devs adding ad-hoc animations outside the system), imagery quality (a bad hero photo breaks the whole premise), bundle creep (every fancy library adds kilobytes), device variance (shaders stutter on old Androids). All addressed in design.md with mitigations.
