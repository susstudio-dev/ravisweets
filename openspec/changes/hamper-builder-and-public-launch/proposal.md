## Why

The storefront demo is now functional end-to-end (browse → cart → checkout → order → account) and the elevated visual layer is in place, but three things are blocking us from putting it in front of a real stakeholder:

1. **The corporate CTA dead-ends at a form.** Corporate buyers want to *see* what they're buying before they spend 30 minutes filling out an enquiry. Without a hands-on preview, the enquiry-to-conversion ratio on corporate leads will be low, and HR/admin buyers — who decide in meetings with photos — will bounce. A **hamper builder** that lets a buyer compose, preview, tier-price, save-and-share a hamper in under two minutes is the single highest-leverage feature we can ship for the corporate track right now.
2. **The catalogue is too small and the imagery is mismatched.** Six sample products with generic Unsplash placeholders don't carry the "premium Hyderabadi gifting" narrative — half the shots don't even show the product they're labelled as. This undercuts every surface we've polished above it. We need a **wider catalogue (18–24 SKUs)** covering the full category taxonomy AND imagery that is at least *correctly matched* to each product (the real photography shoot is still the larger gate, but getting the placeholder layer right is cheap).
3. **Nothing is live.** The site only exists on `localhost:3000`. Founders can't share a link. Designers can't review. The first stakeholder QA will happen in someone's VS Code. **Publishing to GitHub Pages** as a free, zero-ops static host unblocks that entirely and also forces us to solve the dynamic-route honesty problem (what happens to `/orders/[id]` and the quick-view intercept in a static world?). A Cloudflare Pages / Vercel switch later is a DNS flip.

And fourth, alongside these three: the founder's bar for the home page is that it must feel **unique and attractive — impressive enough that people want to work with us**. The current home is good but doesn't carry that weight yet. We push the parallax and cinematic moments past what's there now, *inside the existing 180 KB JS budget* and respecting `prefers-reduced-motion`.

## What Changes

- Ship a **Corporate Hamper Builder** at `/corporate/builder`:
  - Start from one of four templates (Essence / Premium / Grande / Blank) or from an existing enquiry's saved state.
  - Drag-or-tap items from a component palette (sweets, namkeens, dry fruits, accompaniments) into a stylised hamper canvas.
  - Live MOQ-aware tiered price updates; "below MOQ" warning when under the 50-unit threshold.
  - Customisation panel: ribbon colour, box finish, logo-print toggle, personalised message text.
  - "Share this build" — fully-serialised configuration in the URL so a buyer can send a link to their boss or their account manager.
  - "Submit enquiry" — routes to the existing `/corporate#enquiry` form with the configuration pre-filled and the hamper summary attached.
- **Expand the catalogue** from 6 to 18–24 SKUs covering every `CategorySlug`; enforce an image-representativeness rubric so each product's imagery actually depicts that product (not a generic sweet box). Real photography remains the gate for public launch per existing photography-gating spec; interim imagery stays watermarked "Dev only".
- **Amplify the home page**: scroll-coupled hero scene progression with separated layers (product, ornaments, type, background ambient), a horizontal editorial scroll band ("Inside the kitchen"), an ingredient marquee running behind a product macro on the featured strip, and dramatic section-to-section transitions. Every addition passes the existing 180 KB First Load JS gate and the motion-system's reduced-motion + transform-only disciplines.
- **Publish to GitHub Pages** via Next.js `output: 'export'` static-export mode, a GitHub Actions deploy workflow, a `.nojekyll` file, honest handling of the dynamic routes (quick-view intercept and `/orders/[id]` degrade to SPA shells on the static build), and a custom-domain CNAME plan for `ravisweets.com` or a staging subdomain.

**Non-goals**:
- Real payment capture, real admin, real Medusa backend (all still ahead in `build-ravisweets-storefront`).
- Drag-and-drop beyond simple click-to-add (a full DnD with Framer Motion's layout primitives is exceptional polish; we ship the click-to-add + hover-lift pattern in v1 and gate the richer interaction on stakeholder feedback).
- Real photography shoot (existing scheduling blocker — hero and hamper-builder preview remain placeholder-watermarked until that lands).
- Multi-currency pricing in the builder (Phase 2 when international opens).
- Corporate-account authentication or saved configurations server-side (URL-share is the entire persistence story for v1).

## Capabilities

### New Capabilities
- `corporate-hamper-builder`: the `/corporate/builder` playground — templates, item palette, canvas, customisation, tier-aware price, URL-share, enquiry hand-off.
- `catalogue-expansion`: a codified image-representativeness rubric + expanded product data (18–24 SKUs) + helpers to import/validate the catalogue.
- `home-visual-amplification`: named cinematic moments on the home page (separated-layer hero, horizontal editorial scroll, ingredient marquee, section-to-section transitions) with rigor on budget and a11y.
- `github-pages-deploy`: Next.js static-export configuration, GitHub Actions workflow, graceful degradation of dynamic routes, custom-domain plan, preview-environment hygiene.

### Modified Capabilities
<!-- None. The corporate-gifting spec from build-ravisweets-storefront is not yet archived, so we can't land a delta spec against it here. The new corporate-hamper-builder capability is additive and sits alongside the existing corporate-gifting surface; requirements overlap is explicit in design.md. -->

## Impact

- **Code affected**: new `apps/storefront/src/app/corporate/builder/page.tsx` + `src/components/corporate/builder/*`; extended `src/lib/sample-products.ts` (or promoted to `src/lib/catalogue/` with image validation helpers); new `src/components/home/*` cinematic-moment components; updated `apps/storefront/next.config.mjs` (static export conditional on env var); new `.github/workflows/deploy.yml`; possibly updated `CNAME` file at the storefront public root.
- **Bundle impact**: the builder is a focused client route — target ≤ 18 KB gz route-specific JS + stays under the 180 KB First Load shared ceiling. Home-page amplifications add ~4–6 KB of new scroll-linked transforms; must stay inside the elevate change's 25 KB motion budget. Static-export removes some server runtime paths, likely *reducing* the shared chunk slightly.
- **Dependencies added (tentative, finalised in design.md)**: none required — URL serialisation via built-in `URLSearchParams`, drag-reordering via Framer Motion's existing `<Reorder>` primitives (already in the `motion` package), image-representativeness rubric is a pure Markdown + TypeScript check.
- **Assets required**: curated replacement imagery (still stock — specifically verified) for each product + hamper-builder template previews + 1–2 cinematic home-page still layers. All watermarked "Dev only" until real shoot lands.
- **Downstream changes unlocked**: stakeholder review (founder + marketing) at a shareable URL; public soft-launch behind a staging subdomain; corporate-enquiry A/B between "straight form" and "builder-first" entry; richer analytics on builder interactions (which items get added most, where people abandon).
- **Stakeholders**: founder (sign-off on home amp + go-public), marketing (catalogue content + imagery curation), engineering (build + deploy), accessibility reviewer (new motion moments).
- **Risks**: static-export incompatibility with the quick-view intercept pattern (covered in design.md with a fallback plan), image-rights on non-Unsplash sources, home-amp regressing the budget (covered by existing CI gate on `size-limit.json`), builder UX complexity hurting mobile performance. All addressed in design.md with mitigations.
