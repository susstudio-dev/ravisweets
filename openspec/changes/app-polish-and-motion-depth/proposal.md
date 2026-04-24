## Why

A first-pass walkthrough of the storefront surfaces three specific, actionable gaps between *works* and *genuinely impressive*:

1. **One confirmed broken link in the user-facing nav.** The home page's "This season's featured → Shop all" CTA points to `/shop`, which has no page under `app/`. Every other href in the app resolves. This is the only dead destination — but it's on the most-viewed page and needs fixing before any stakeholder demo. While we're there, we add a themed 404 page (there isn't one yet) and a link-integrity CI check so a similar regression can't merge silently again.
2. **Motion is competent but basic.** We shipped a reasonable motion library in the elevate change (`Reveal`, `Stagger`, `Parallax`, `TextKinetic`, `HoverLift`, `CursorGlow`, `MouseParallax`, `Marquee`, `ScrollProgress`, `Garnish`) and one distinctive moment (`EditorialScrollBand`). That's a solid floor. The **ceiling** — the scroll-scrubbed scene choreography, pin-and-reveal, magnetic buttons, 3D card tilt, masked image reveals, scroll-linked ambient colour washes, chained text reveals — is what separates "nice storefront" from "I want to work with this brand." The founder's bar is explicitly the latter.
3. **No single image anchors the home-page identity.** The top-of-page hero is one moment; from there on, the home is a sequence of sections, each with its own imagery, but none is *the* image — the shot that lands in a WhatsApp forward, in a pitch deck, in the founder's head when they think about the site. We add a dedicated **signature image moment** mid-page: full-bleed, one shot, sparse overlay, strong gradient framing, placed where brand identity lands before product browsing begins.

All three fit in one change because they share a theme — the *last mile of polish* between a working demo and a shareable URL — and because touching any one of them at this stage without the others leaves obvious gaps. They also all respect existing constraints (180 KB First Load JS ceiling, prefers-reduced-motion compliance, photography-gating watermark).

## What Changes

- **Create `/shop`** as a real catalogue hub — an all-products grid with category chips, search entry point, and cross-links to each specialised category page. Convert the home "Shop all" CTA to point there. Prefer building the destination over silently re-routing; `/shop` is a standard ecommerce surface a user expects to find.
- **Add a themed `not-found.tsx`** at the app root so unknown URLs get a branded error, not Next's default.
- **Add a link-integrity CI check** — a small script that crawls every `href="/..."` in the codebase, diffs against the actual route tree, and fails the `lint` job on a dead link. Cheap, catches the failure mode exactly.
- **Extend the motion system** with six new primitives that push beyond the "translate + opacity" baseline:
  - `ScrollScene` — scroll-scrubbed composition (hero image *assembles* from layered stills as the viewer scrolls).
  - `MaskReveal` — clip-path-animated image reveal (image wipes in from a direction when entering viewport).
  - `PinReveal` — a section that pins while its sub-content advances (content within a fixed frame animates as scroll passes).
  - `MagneticButton` — a CTA wrapper that gently pulls toward the cursor within a radius (desktop + reduced-motion safe).
  - `TiltCard` — 3D perspective tilt on hover (used to extend `HoverLift`; opt-in via prop so existing cards don't break).
  - `TextChain` — line-by-line and character-by-character reveal chains with emphasis weighting.
- **Wire a scroll-linked ambient colour wash** on the home page so the flavour-theme tokens drift across four scene "chapters" as you scroll (hero → kitchen → heritage → corporate), not only on Flavour Atlas interaction. Each chapter has a different tint; transitions are cross-faded via CSS-variable interpolation.
- **Ship a `<SignatureMoment>` section** on the home between Flavour Atlas and Featured Products: full-bleed image (cinematic Qubani ka Meetha or Diwali hamper close-up), soft bottom gradient, paisley corner, single italic display line + short supporting paragraph + subtle CTA. `Dev only` watermark honoured.
- **Non-goals**: rebuilding the existing motion library (we extend, not replace), professional photography shoot (still gated per photography rule), formal accessibility regression pass (separate concern), adding new commerce flows, adding non-English locales.

## Capabilities

### New Capabilities
- `route-hygiene-and-404`: the `/shop` catalogue hub + themed `not-found.tsx` + link-integrity CI check that prevents regression.
- `motion-depth-extensions`: six new motion primitives (ScrollScene, MaskReveal, PinReveal, MagneticButton, TiltCard, TextChain) + scroll-linked ambient colour wash across home-page chapters.
- `signature-home-moment`: the mid-page signature-image section with framing, placement, and curation criteria.

### Modified Capabilities
<!-- None land as delta specs here. The existing specs from elevate-storefront-visual-experience and hamper-builder-and-public-launch are still in-flight changes (unarchived), so delta deltas are awkward. The new capabilities listed above are additive; the shared constraints (180 KB First Load JS ceiling, prefers-reduced-motion) carry over implicitly. -->

## Impact

- **Code affected**: new `apps/storefront/src/app/shop/page.tsx` + `apps/storefront/src/app/not-found.tsx`; new `src/components/motion/{scroll-scene,mask-reveal,pin-reveal,magnetic-button,tilt-card,text-chain}.tsx`; new `src/lib/theme/scroll-chapters.ts` + wiring in `src/app/layout.tsx` (or the home page root); new `src/components/sections/signature-moment.tsx`; updated `src/app/page.tsx` to consume new primitives and the new section; new `apps/storefront/scripts/link-check.mjs` + its CI hook in `.github/workflows/ci.yml`; home-page hero CTA updated to deep-link at `/shop`.
- **Bundle impact**: target ≤ 4 KB gz added to the home route (we're at 180 KB — the budget ceiling). Motion primitives added to the library ≤ 7 KB gz combined; most consumers opt in per-prop, so unused primitives tree-shake. If the `/` route can't stay at ≤ 180 KB, we raise the formal budget to **185 KB** in this change's design doc with evidence that LCP / INP / CLS stay within spec.
- **Dependencies added**: none required — `motion` + `culori` already installed; magnetic/tilt/mask-reveal are pure CSS + `useMotionValue` + `useTransform`.
- **Assets required**: one curated signature image (stock, watermarked "Dev only") for the new home moment; replaces no existing asset.
- **Downstream changes unlocked**: cleaner stakeholder demo; `/shop` surface lets the product page's "related products" section eventually filter by affinity; the new motion primitives unlock a second-pass polish on product / corporate / festival pages in future changes.
- **Stakeholders**: founder + marketing (approve signature image), engineering (build + CI wire), accessibility reviewer (reduced-motion compliance on the six new primitives).
- **Risks**:
  - JS budget squeeze (we're at ceiling) — mitigated by lazy-loading `ScrollScene` / `PinReveal` via `next/dynamic` and keeping `TiltCard` / `MagneticButton` as opt-in per call site.
  - Motion overload (too many new effects feels try-hard) — mitigated by principled placement: exactly one cinematic moment per scroll region; new primitives used sparingly, not everywhere.
  - Link-check false positives (anchor-only hrefs `#enquiry` / query-only / external `https://...`) — mitigated by scoping the check to path-prefixed `href` values only.
