## Context

Today's storefront walks end-to-end (home → quick-view → detail → cart → checkout → order → account) + corporate (landing → builder → enquiry hand-off) + festivals + policies + search. 47 prerendered routes, home sits at **180 KB First Load JS — exactly at the budget ceiling**, static export works for GitHub Pages, typecheck clean, strict OpenSpec validation green on four prior changes.

A first-pass stakeholder walkthrough surfaced three specific polish gaps (see proposal.md for the full "why"):

1. **`/shop` is dead** — the only confirmed broken link in outbound nav.
2. **Motion feels basic** — we have the common AOS-style vocabulary (fade-up / stagger / parallax) but none of the distinctive moments that make the site memorable.
3. **No single shareable signature image** — the home page has plenty of imagery but no one frame that says "this is the brand."

This design doc answers: how to fix #1 without re-architecting, how to add depth to #2 without blowing the budget, and how to place #3 without forcing a new photography shoot.

**Constraints**:
- **180 KB First Load JS on `/`** — we're at the ceiling; every addition fights.
- **Motion sub-budget**: the elevate change's 25 KB gz cap on motion code still holds.
- **Reduced-motion discipline** — every new primitive gets a no-op or opacity-only fallback.
- **Photography-gating** — new signature image is stock, watermarked "Dev only" until the real shoot lands.
- **Static-export compatibility** — the site deploys via GitHub Pages; no additions can rely on server runtime.

## Goals / Non-Goals

**Goals:**
- Zero dead links in the app, enforced via a CI check that runs on every PR.
- At least four distinctively-different motion moments beyond today's vocabulary, each ≤ 2 KB gz added to the critical bundle.
- A single signature image moment that becomes the default "share this page" screenshot.
- Home page stays within 180 KB First Load JS (or the budget is formally raised to 185 KB with evidence LCP/INP/CLS still hold).

**Non-Goals:**
- Rebuilding the motion library from scratch — we extend, not replace.
- New commerce features, backends, or payment flows.
- Full a11y audit — we maintain reduced-motion + keyboard access on every new thing but don't do a formal pass in this change.
- Photography shoot — real-photography swap is still blocked on the external gate.

## Decisions

### Decision 1: Build `/shop` as a real catalogue hub, not a redirect to a category
**Choice**: `/shop` renders a flat all-products grid with category chips at the top (Hyderabadi / Sweets / Namkeens / Dry fruits / Combos / Gift hampers / Festival), a prominent search entry point, and a "browse by category" strip below.
**Why**: Users expect `/shop` to exist on an ecommerce site. Silently routing the CTA to `/category/sweets` (or wherever) wastes a discoverability surface and makes the site feel incomplete.
**Alternative considered**: Route the CTA to `/category/hyderabadi-specials` and skip the new page. Rejected — leaves the `/shop` namespace broken for anyone who types it, and introduces a different class of surprise.

### Decision 2: Themed `not-found.tsx` at the app root
**Choice**: Add `src/app/not-found.tsx` using the same visual language as existing themed 404s (`/product/[slug]/not-found.tsx`). Paisley mark, display headline, "back to home" CTA, optional search link.
**Why**: Next's default 404 is stark and off-brand; the app already has one themed 404 for product-not-found, so adding the global one is a 40-line file.

### Decision 3: Link-integrity CI check is a pure-string grep, not a crawl
**Choice**: `apps/storefront/scripts/link-check.mjs` — a small Node script that:
1. Enumerates every file under `src/app/**/page.tsx` to build the set of known routes (including dynamic segments and generateStaticParams-derived slugs).
2. Greps `href="/..."` (double-quote + leading-slash) across `src/**/*.{ts,tsx}`.
3. Normalises dynamic segments (`/category/hyderabadi-specials` → matches `/category/[slug]`).
4. Reports any href whose resolved path has no matching route.
5. Exit 1 on failure. Wired into the `lint` job of `ci.yml`.
**Why**: Real-crawler alternatives (a headless browser visiting every link) are slow, flaky on CI, and require a running server. Static analysis catches the exact failure mode (broken internal links) at zero CI cost.
**Scope**: Only `href` attributes starting with `/` — anchors (`#...`), query-only (`?...`), mailto/tel/external are out of scope.
**Edge cases**: query-strings on internal paths (e.g. `/corporate/builder?t=premium`) are resolved by dropping the `?` before matching.

### Decision 4: Six new motion primitives, each with a single-sentence purpose
The existing library is good for "content appears." The new primitives are for "content *does* something":

- **`<ScrollScene>`** — a composition where multiple stacked layers translate independently as scroll progress advances within the scene's viewport window. Used on the home hero to have the background, subject, and foreground elements move at different rates. Wraps `useScroll` + multiple `useTransform`; lazy-loaded via `next/dynamic` to keep critical bundle lean.
- **`<MaskReveal>`** — clip-path-animated image reveal. `clip-path: inset()` interpolates from "fully covered" to "uncovered" when the element enters viewport. Used on the Signature Moment hero image. Tiny cost (~0.4 KB gz).
- **`<PinReveal>`** — a section that pins while its sub-content advances. Built atop `position: sticky` + `useScroll`; each child receives a visibility window (e.g. 0–0.33, 0.33–0.66, 0.66–1). Used for the "kitchen rules" or "how a hamper is made" moments where a single section can host a 3-beat story.
- **`<MagneticButton>`** — wraps a button and translates it gently toward the cursor within a 120px radius (max 6px displacement), snaps back on leave. Desktop + non-touch only; reduced-motion renders plain. ~0.6 KB gz.
- **`<TiltCard>`** — 3D perspective tilt on hover (up to 8° on each axis, governed by cursor position relative to the card). Used opt-in by passing `tilt` to `HoverLift`. Touch + reduced-motion → plain static card. ~0.7 KB gz.
- **`<TextChain>`** — line-by-line and character-by-character reveal chain with per-unit emphasis weighting (e.g. the bold italic words land on a slightly harder easing curve). Extends `TextKinetic`. ~0.5 KB gz.

### Decision 5: Scroll-linked ambient chapter wash on the home page
**Choice**: Home page has four implicit "chapters":
1. **Arrival** (hero + flavour atlas) — house palette (cream / saffron).
2. **Kitchen** (editorial scroll band + heritage + signature moment) — deeper amber / brass tints.
3. **Commerce** (featured + bestsellers + gifting guide) — standard house palette.
4. **Commitment** (craft + festival + corporate CTA) — darker evening tones.

A `ScrollChapterProvider` at the home-page root tracks the viewport's position against these chapter boundaries and smoothly interpolates the `--theme-*` CSS variables. Transitions are cross-faded over ~500 ms with `requestAnimationFrame`. On reduced-motion, chapter boundaries snap rather than cross-fade.
**Why**: Makes the page feel like it has *acts*, not just sections. Also showcases the per-product theme engine the elevate change shipped — currently it only fires on FlavourAtlas hover or on product pages.
**Alternative considered**: Trigger the chapter wash on scroll-into-view for each section (like the existing SectionEntry). Rejected — the combined effect of many per-section washes is visually noisy; four orchestrated chapter boundaries feel deliberate.

### Decision 6: Lazy-load the heaviest new primitives
**Choice**: `ScrollScene` and `PinReveal` are lazy-loaded via `next/dynamic({ ssr: false })`. `MaskReveal`, `MagneticButton`, `TiltCard`, `TextChain` stay static imports because each is < 1 KB.
**Why**: `ScrollScene` and `PinReveal` each have real scroll-coupling cost — better to pay that only on pages that need them. `next/dynamic` adds ~1 KB of loader overhead; breaking even happens around ~2 KB of component code.

### Decision 7: Signature Moment placement: between FlavourAtlas and Featured
**Choice**: The Signature Moment lands at scroll-position ~2/3 of the way through the "arrival" chapter. By then the user has seen the hero, played with FlavourAtlas (the page retunes as they hover), and is primed for the *identity* frame. After this, they transition into commerce (Featured + Bestsellers).
**Why**: Placement is the design decision here. Too early (under the hero) and it feels redundant. Too late (end of page) and most users never see it. Between FlavourAtlas and Featured is where attention is highest and product-browsing hasn't started.

### Decision 8: Signature image curation criteria
**Choice**: The image must pass all four:
1. **Single dominant subject** — one sweet, one bowl, one hamper. No "spread."
2. **Macro or shallow-DoF** — the viewer's eye has somewhere to land.
3. **Warm directional light** — consistent with the brand palette (saffron / amber / cream).
4. **Negative space right or bottom** — so the text overlay has room to breathe.

For v1 we recommend a Qubani ka Meetha macro (apricot syrup, saffron strands on top, in a small copper or brass bowl) *or* a hand-plated Diwali hamper shot with brass accents. Curate via the existing imagery rubric. Watermark "Dev only" until real shoot.

### Decision 9: Signature Moment framing treatment
**Choice**: Full-bleed image with:
- Soft bottom-to-top gradient mask (ink at bottom, transparent to ~50%).
- A small paisley at the bottom-left (brand anchor).
- Sparse typography overlay: eyebrow (Indic accent / Tiro Telugu), single-line italic display headline, one 1–2 line body paragraph, single subtle CTA ("See how we make it" → `/about`).
- Enters via `MaskReveal` on viewport entry; headline enters via `TextChain`.
- Reduced-motion: plain still + instant text, no reveal animation.
**Why**: Restraint. The moment works because it's *quiet* — one image, little else.

### Decision 10: Budget ceiling review
**Choice**: Stick with 180 KB First Load JS on `/`. If the home page crosses after all additions, lazy-load one additional heavy component (starting with `FlavourAtlas` — it's also client-interactive and a candidate for deferring). If still over, formally raise the budget to 185 KB and document the LCP/INP/CLS evidence in this change's tasks.md. Do not silently let it drift.

## Risks / Trade-offs

- **Risk**: Six new primitives feel like too many and produce a motion cacophony. → **Mitigation**: design doc (Decision 4) names specific use sites per primitive — `ScrollScene` only on the hero, `PinReveal` only on one kitchen-rules section, etc. "Used sparingly, not everywhere" is the rule.
- **Risk**: Magnetic button + cursor glow compounded on the same element feels overengineered. → **Mitigation**: CTAs pick one or the other, never both. Enforced in code review.
- **Risk**: Link-check false-positives block merges. → **Mitigation**: scope the check to path-prefixed hrefs only; add an `// link-check:ignore` escape hatch for exceptional cases.
- **Risk**: JS budget blown despite lazy-loading. → **Mitigation**: Decision 10 — lazy-load more (starting with FlavourAtlas), or formally raise to 185 KB with evidence.
- **Risk**: Signature image fails without real photography. → **Mitigation**: curation rubric + "Dev only" watermark ensures the placeholder is honest, not flat-out fake.
- **Risk**: Scroll-linked chapter wash on mobile burns battery / janks on low-end Android. → **Mitigation**: gate the chapter interpolation on desktop + reduced-motion-off; mobile gets the existing per-section theme behaviour (no wash).
- **Trade-off**: `/shop` as a real page costs a bit of build time + JS, but pays off in discoverability. Accepted.

## Migration Plan

No migrations required — all additions are additive. The link-check is a new CI job that starts catching issues on the PR that adds it. Rollback for any individual addition is a revert; no data-model changes.

## Open Questions

1. **Preferred signature image subject** — Qubani ka Meetha macro (recommended) or Diwali hamper? Either works with the curation rubric.
2. **`/shop` sort default** — featured (current home default) or bestsellers? Proposal: featured.
3. **MagneticButton on primary or secondary CTAs** — primary only (single CTA per viewport), or any CTA? Proposal: primary only on hero / signature moment / corporate CTA.
4. **Chapter boundaries** — hand-tuned by scroll position (e.g. percentages of the page) or triggered by named section elements via `IntersectionObserver`? Proposal: named elements (more resilient to content reflow).
5. **Link-check escape hatch syntax** — `// link-check:ignore` inline comment, or a repo-level allowlist? Proposal: both, with the inline comment being the default.
