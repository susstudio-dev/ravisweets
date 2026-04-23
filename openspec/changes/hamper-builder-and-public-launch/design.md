## Context

The Ravi Sweets storefront is a rich monorepo frontend demo with 32 prerendered routes, an elevated visual layer, a full retail money-path (simulated), and a corporate enquiry form — but no live URL, a sparse catalogue, generic imagery, and nothing letting a corporate buyer preview what they're buying before they fill out a form. The founder's bar for go-public is "impressive enough that people are impressed to work with us." This change closes the four gaps between *built* and *shareable*.

**Current state recap**:
- 32 routes built, all under 180 KB First Load JS.
- 6 sample products with Unsplash placeholders (some mismatched to product name).
- `/corporate` page has a 4-step enquiry form but no interactive preview.
- Home page has a multi-layer parallax hero, flavour atlas, heritage strip, craft strip, press marquee, festival tease, editorial bands — good, but the benchmark tier-leaders (MFK, Apple, Linear) have more scroll-coupled choreography.
- `docker-compose.yml`, `apps/backend` skeleton, `.github/workflows/ci.yml` all in place but deploy is not.
- Site works only on `localhost:3000`.

**Constraints**:
- **180 KB First Load JS ceiling** holds. Every new feature fights for its place inside that budget.
- **25 KB motion-code sub-budget** from the elevate change still applies — home-amp can't explode it.
- **`prefers-reduced-motion` discipline** — every new scroll effect needs a static fallback.
- **Photography-gating requirement** from elevate-storefront-visual-experience: real hero image is blocked on a production shoot; interim imagery carries a "Dev only" watermark. This extends to the hamper builder's preview canvas and the catalogue expansion.
- **GitHub Pages** is free, zero-ops, but *static-only*. All server-rendered-on-demand paths need a static-export-compatible strategy.
- **Lean team**: one-person engineering cadence. The builder's interaction complexity must not bloom into a multi-month build — we ship v1 with click-to-add (not full HTML5 drag-and-drop) and iterate.

## Goals / Non-Goals

**Goals:**
- Corporate buyer can compose a hamper from 4 templates + 24 items in under 2 minutes, see tier-aware price update live, share the URL, and submit an enquiry with the configuration pre-filled.
- Every product in the catalogue has an image that *depicts that product*, validated via a rubric checked into the repo.
- Home page's "unique and attractive" bar: at least three net-new scroll-coupled cinematic moments that a founder showing the site to a colleague would point at and say "that's cool."
- Site reachable at a public URL (GitHub Pages subdomain or custom domain), updated on every push to `main` via GitHub Actions, with a clear README deploy runbook.
- All four additions stay inside the 180 KB First Load JS budget + 25 KB motion sub-budget + reduced-motion compliance.

**Non-Goals:**
- Full HTML5 drag-and-drop with drop-zone hit-testing (click-to-add + explicit "remove" is simpler, accessible-first, and mobile-friendly; `<Reorder>` from motion handles re-arranging).
- Real payments / real admin / real backend (deferred to `build-ravisweets-storefront`).
- Real photography (deferred — photography-gating watermark honoured).
- Multi-currency in builder (Phase 2).
- Server-side builder persistence or sign-in (URL-share is the v1 persistence).
- A/B framework plumbing (flag-only rollout).

## Decisions

### Decision 1: Builder's interaction model — click-to-add, explicit-remove, Framer `<Reorder>` for re-arranging
**Choice**: Items in the palette are tappable/clickable. Tap → item enters the "in this hamper" list at the bottom, with a subtle animation from the palette to the list (Framer `layoutId`). Remove via an × next to each item, or drag within the list to re-arrange (mobile-friendly thanks to `<Reorder>`'s long-press touch).
**Why**: Full-canvas HTML5 DnD is a rabbit hole — hit-testing on touch, accessibility, visual feedback across edge cases. Click-to-add is universally accessible, works on mobile out of the box, and the visual-morph sells the "something happened" feeling anyway. `<Reorder>` is already in the motion library, costs nothing extra.
**Alternatives considered**:
- **React-DnD / dnd-kit** — heavyweight; touch support is extra config; poor mobile story. Rejected.
- **Pure HTML5 Drag and Drop** — native, free, but its touch story is essentially nonexistent and its accessibility story is rough. Rejected.
- **Canvas-based hamper visualisation** — high wow, but low-ROI; you need detailed SKU-specific artwork. Deferred to a later iteration.

### Decision 2: Builder's visual "hamper" is a composed SVG/CSS tableau, not a rendered image
**Choice**: The hamper canvas is an isolated React composition — a stylised box shape (SVG or layered div) with selected items shown as small chips or thumbnails arranged in a grid inside the box. NOT a composited PNG/canvas render.
**Why**: Real photorealistic composite rendering needs per-SKU cutout artwork, lighting, and layering — an artwork-heavy pipeline we don't have. A stylised composition is honest, matches the brand's editorial quiet, and is infinitely customisable via tokens. A "Preview image" placeholder inside it signals we'll swap in real renders later.
**Alternatives**:
- **`html2canvas` to export a PNG of the composition** — adds ~30 KB gz. Nice-to-have; not v1.
- **Generative AI render** — intriguing but latency and brand control are issues. Deferred.
- **Pre-rendered hamper templates as static images** — rigid; doesn't support arbitrary compositions.

### Decision 3: URL-share format — compact query string, schema-versioned
**Choice**: Hamper state is serialised into `?t=premium&items=qubani:2,kaju-500:1,diwali:1&ribbon=gold&logo=1&msg=...&v=1`. The `v=1` version stamp gates forward-compat; deserialisation refuses unknown versions with a graceful empty state + toast.
**Why**: URL share is the entire persistence story — no backend. Query string is the minimal common denominator. Keys are short to keep the URL under ~500 chars. Version stamp means a future spec can migrate.
**Alternatives**:
- **Base64-encoded JSON blob** in the query string — opaque URLs are user-hostile. Rejected.
- **localStorage + share-link ID** — no backend to resolve IDs, so IDs would be random and non-portable. Rejected.
- **Hash fragment (#foo)** — not sent in server logs, but breaks SSR snapshotting. Our storefront is client-rendered post-hydration so either works; query string is clearer.

### Decision 4: Tier-aware price is deterministic and visible
**Choice**: The builder shows **per-unit price (current tier)**, **units** (with a stepper; MOQ = 50 for Essence/Premium, 25 for Grande — a union MOQ of 25 for custom builds), **line total**, and a live **tier indicator** ("Premium tier — 100+ unit price unlocked at 100 units"). Tier thresholds are declared in `packages/shared/src/catalogue/pricing.ts` so the data is auditable.
**Why**: The whole point of a builder is to let the buyer feel their way through price → quantity → spec trade-offs. Hiding tier unlocks or showing a black-box total defeats the purpose.

### Decision 5: Enquiry hand-off — state attached to the corporate form, not a separate endpoint
**Choice**: "Submit enquiry" on the builder ships the user to `/corporate#enquiry` with the full hamper configuration serialised into the URL (same format as share). The existing `<CorporateEnquiry>` form reads the incoming state and:
- Pre-selects the hamper tier.
- Pre-fills the "customisation" textarea with a human-readable summary of selected items + count + options.
- Pre-fills quantity from the builder's unit count.
- Shows a small "From builder" chip on the form acknowledging the source.
**Why**: We already have the enquiry form. We already have the Resend + admin-queue plumbing *shape*. Routing the builder through the existing form means one pipe, not two.

### Decision 6: Catalogue expansion — 18–24 SKUs across all 7 categories
**Choice**: Extend to 18–24 SKUs total, spread roughly as: Hyderabadi specials (5), sweets (4), namkeens (3), dry-fruits (3), combos (2), gift-hampers (4), festival-specials (2). Each carries the full `Product` schema + a curated image + `theme_palette` either hand-curated or derived at build-time (the palette-extraction script from the elevate change finally gets built).
**Why**: 18 is the floor for the catalogue to feel plausibly real (a sweet shop has dozens of SKUs); 24 is the ceiling before content-authoring becomes a project in itself. Spread ensures every category page has at least 2 products.

### Decision 7: Imagery — representativeness rubric before volume
**Choice**: Introduce `research/catalogue-imagery-rubric.md` that every product's primary image must pass. Requirements:
- The image **depicts the product** (a Kaju Katli shot that shows almond sweets, not a generic sweet box).
- The image's **dominant colour palette** matches the product's `theme_palette` within a contrast tolerance (for the FlavourAtlas to feel coherent).
- The image has **adequate resolution** (≥ 1200px on the long edge) and **no watermarks** (other than our added "Dev only" badge).
- **Source rights**: free-to-use (Unsplash / Pexels) OR explicit permission OR internal photography.
Each product entry in `sample-products.ts` carries a `rubric_passed_on` field + source URL.
**Alternative**: ignore the rubric, fill in whatever images look good. Rejected — the user's feedback "use the correct images for food items" is exactly the failure of this path today.

### Decision 8: Static-export-compatible dynamic routes
**Choice**: With `output: 'export'`, routes degrade as follows:
- **`/product/[slug]`** — already SSG via `generateStaticParams`; no change.
- **`/category/[slug]`** — already SSG; no change.
- **`/festivals/[slug]`** — already SSG; no change.
- **`/policies/[slug]`** — already SSG; no change.
- **`/(.)product/[slug]` (quick-view intercept)** — Next.js App Router intercepts *require* a server runtime. In static export, the intercept silently doesn't fire, so clicking a card falls through to the full `/product/[slug]` page navigation. We keep the modal code compiled (one user-visible `router.back()` behaviour toggle), but document the degradation.
- **`/orders/[id]`** — currently dynamic (reads from localStorage on mount). For static export, we provide a single generic entry page at `/orders/[id]/page.tsx` with `generateStaticParams: () => []` and `dynamicParams: true` replaced by an empty static + a catch-all client route. Effectively it becomes a SPA shell: static shell page + client-side `useParams()` + localStorage read. This already matches today's behaviour.
- **`/search`** — already static with a client Suspense inside; no change.
- **`/account`**, **`/cart`**, **`/checkout`** — all client-stateful; static. No change.
**Why**: This maps cleanly to our current architecture (localStorage is already the source of truth for cart + orders). The only user-visible regression is the quick-view intercept, which falls through to the full page nav — acceptable for v1.
**Alternative**: drop GitHub Pages in favour of Cloudflare Pages (supports Next.js SSR). Cleaner technically, but adds account/ops complexity. Flagged as a Phase 2 upgrade if the quick-view modal becomes critical to the conversion story.

### Decision 9: GitHub Pages deployment pipeline
**Choice**:
- `next.config.mjs` gains a conditional `output: 'export'` when `BUILD_TARGET=github-pages`.
- `.github/workflows/deploy.yml` — triggered on push to `main`:
  1. Install deps (pnpm cache).
  2. `pnpm --filter @ravisweets/storefront build` with `BUILD_TARGET=github-pages`.
  3. Copy `out/` to the Pages artefact bucket + upload.
  4. Deploy to `github-pages` environment (GitHub's built-in action).
- `apps/storefront/public/.nojekyll` shipped so Jekyll doesn't eat our `_next` asset paths.
- `apps/storefront/public/CNAME` **not** added by default — user needs to decide the custom domain (staging subdomain vs. apex). Design lists three options.
**Why**: Matches GitHub's documented Pages deploy pattern; uses the first-party action, no custom tokens.

### Decision 10: Custom domain — staging subdomain first, not apex
**Choice**: Recommend `ravisweets.github.io/ravisweets` for v1 (free, zero DNS). When ready to go public, promote to `preview.ravisweets.com` as a CNAME'd subdomain. Do NOT flip the apex `ravisweets.com` until real photography lands (the photography-gating rule applies to public rollout, not to the staging surface).
**Why**: Staging first lets the founder + marketing review without committing DNS. Apex flip is a one-line change later.

### Decision 11: Home-page amplification — three named cinematic moments + one supporting system
**Choice**: We add three named moments and one system:
- **Moment 1 — Separated-layer hero scene**: the existing hero's image, ornaments, typography, and ambient gradient all scroll at different speeds, with the image being the slowest (feels "pinned") while ornaments drift faster. Desktop only (gated by viewport + reduced-motion); mobile stays as-is.
- **Moment 2 — Horizontal editorial scroll band ("Inside the kitchen")**: a full-bleed horizontally-scrolling strip of 5–7 images + captions that advances as the user scrolls vertically. Uses `useScroll` + `useTransform` on X translate. Reduced-motion → static stack.
- **Moment 3 — Ingredient marquee behind a product macro**: a new section where a large product image sits in the foreground and a slow-moving marquee of ingredient names (Saffron · Almond · Pistachio · Cardamom · Ghee · Silver leaf · Rose) runs behind it in large, low-opacity display type. Different scroll rates. Reduced-motion → static band.
- **System — section-to-section transitions**: a 120ms wash of `--theme-glow` behind the incoming section on scroll entry (via a single `<SectionEntry>` wrapper). Subtle — not decorative.
**Why**: Each moment is drawn from the research benchmark (Apple, MFK, Linear). Total motion-code delta stays within the 25 KB sub-budget because we reuse existing primitives (`<Parallax>`, `useScroll`, `<Marquee>`).

### Decision 12: Palette extraction finally lands
**Choice**: The build-time palette extraction script (`scripts/extract-palettes.ts`) that the elevate change scoped but deferred — ship it here. Catalogue expansion is the forcing function: manually hand-curating 24 palettes is tedious; auto-extracting them from the primary image is what we planned.
**Why**: Unblocks catalogue growth; exercises the WCAG contrast fallback code path the spec required.

### Decision 13: Validation in CI — rubric + imagery check
**Choice**: A small Node script runs in CI that iterates every product and asserts:
- `rubric_passed_on` field is present.
- Primary image URL is reachable (HEAD 200) at build time.
- Source URL is present.
- `theme_palette` satisfies the WCAG contrast floor.
Failing CI blocks merge. Script lives at `apps/storefront/scripts/validate-catalogue.ts` and runs in the `lint` job of `ci.yml`.
**Why**: Cheap enforcement; stops silent regressions.

## Risks / Trade-offs

- **Risk**: Builder URL exceeds browser URL length (~2000 char ceiling on IE-era; modern browsers tolerate more) on very full hampers. → **Mitigation**: cap item count at 30 per hamper in v1; show a clear error above that; the MOQ-to-item-count ratio makes this practically very unlikely.
- **Risk**: Static-export breaks the quick-view intercept silently. → **Mitigation**: documented in Decision 8. We test the static build locally before every deploy. Full-page nav fallback is fine for v1.
- **Risk**: Home amplification pushes JS budget over 180 KB. → **Mitigation**: existing `size-limit.json` CI gate catches it. Moments are additive components that can be feature-flagged off if a specific one is expensive.
- **Risk**: Palette extraction at build time fails on an intermittent image fetch. → **Mitigation**: script caches extracted palettes to disk; re-runs only on image URL change; hand-curated override field still honoured.
- **Risk**: Image-representativeness rubric is subjective → honest human review still required. → **Mitigation**: rubric document names specific pass criteria + every entry requires a human sign-off date (`rubric_passed_on`); subjectivity is acknowledged, not eliminated.
- **Risk**: Public URL invites real SEO indexing of placeholder watermarked content. → **Mitigation**: `robots.txt` + `noindex` meta tag on every page until photography-gating lifts; domain recommendation is a non-apex subdomain explicitly to avoid apex-SEO pollution.
- **Risk**: Mobile performance of home amplification (three scroll-linked scenes) on a 2021 Android. → **Mitigation**: gate the separated-layer hero + marquee behind `viewport ≥ 1024` (desktop-only); mobile gets the plain hero.
- **Trade-off**: Click-to-add over full DnD in the builder. Accepted. If stakeholder feedback post-launch says the interaction must be drag-and-drop, it's a one-capability follow-up change.
- **Trade-off**: GitHub Pages over Cloudflare Pages / Vercel. Accepted. Free + zero-ops wins for a staging surface. Flip when conversion-critical features (SSR-backed quick-view, server-side analytics) demand it.

## Migration Plan

- **Code**: new routes + new components land additively. Existing routes unchanged. Sample-products refactor is contained.
- **Deploy cutover**: flip on `BUILD_TARGET=github-pages` for the deploy job only; `dev` / `build` / normal CI keep their current behaviour.
- **Rollback**: if the static export exposes a regression, revert the `next.config.mjs` conditional and delete `.github/workflows/deploy.yml`. The site stops deploying; nothing else breaks.
- **Imagery rollback**: the new `Product.rubric_passed_on` field is additive; removing it doesn't break anything. Catalogue contraction (back to 6 SKUs) is a data-only revert.

## Open Questions

1. **Custom domain decision**: do we want `preview.ravisweets.com` (staging subdomain — recommended), `ravisweets.github.io/ravisweets` (GitHub default — no DNS needed), or apex `ravisweets.com` (blocked on photography)?
2. **Catalogue content writing**: who writes the 12–18 new product descriptions? Marketing or engineering?
3. **Image sourcing**: does Ravi Sweets have internal phone-camera shots we can use as a *better* placeholder than Unsplash, even before the professional shoot?
4. **Enquiry submission target**: when the builder hands off to `/corporate#enquiry`, should we change the enquiry's default hamper-tier to "Custom" or auto-map to the closest template? Proposal: auto-map with a "modify" affordance.
5. **Builder analytics**: PostHog event taxonomy for the builder (add / remove / save / share / submit) — inherit the existing elevate-change taxonomy or extend with builder-specific events?
6. **`robots.txt` stance at launch**: fully disallow (`Disallow: /`) until photography lands, or allow indexing but `noindex` meta on pages? Proposal: disallow crawl; rely on direct URL sharing.
