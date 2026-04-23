## 1. Foundations & Scope Lock

- [ ] 1.1 Confirm custom-domain target for v1 (GitHub default `{user}.github.io/{repo}/` OR `preview.ravisweets.com` subdomain — recommended) with the stakeholder
- [ ] 1.2 Confirm content-author for the 12–18 new product descriptions (marketing vs. engineering)
- [ ] 1.3 Ask founder / marketing for any internal phone-camera shots that could beat Unsplash as interim imagery
- [ ] 1.4 Add PostHog event taxonomy entries for builder interactions (`builder.template_select`, `builder.item_add`, `builder.item_remove`, `builder.quantity_change`, `builder.customisation_change`, `builder.share_click`, `builder.enquiry_submit`) to the observability spec (tracked elsewhere)
- [ ] 1.5 Feature-flag inventory: add `NEXT_PUBLIC_HAMPER_BUILDER`, `NEXT_PUBLIC_HOME_SEP_HERO`, `NEXT_PUBLIC_HOME_EDITORIAL_BAND`, `NEXT_PUBLIC_HOME_INGREDIENT_MARQUEE`, `NEXT_PUBLIC_HOME_SECTION_ENTRY` to `.env.example` and `flags/visual-v2.ts`

## 2. Catalogue Expansion

- [ ] 2.1 Promote `apps/storefront/src/lib/sample-products.ts` to `packages/shared/src/catalogue/products.ts` as the single source of truth (all importers updated)
- [ ] 2.2 Add `builder_eligible: boolean`, `rubric_passed_on: string`, `source_url: string` fields to the `Product` type in `packages/shared/src/types/product.ts`
- [ ] 2.3 Write `research/catalogue-imagery-rubric.md` with the representativeness criteria from the `catalogue-expansion` spec
- [ ] 2.4 Curate imagery for the 6 existing products — validate each against the rubric; swap any that don't pass
- [ ] 2.5 Author 12–18 new products across every category (Hyderabadi specials to 5, sweets to 4, namkeens to 3, dry fruits to 3, combos to 2, gift hampers to 4, festival specials to 2)
- [ ] 2.6 For each new product: write a 40–200 word description, pick an image that passes the rubric, set `theme_palette_override` if derivation won't match brand
- [ ] 2.7 Write `apps/storefront/scripts/extract-palettes.ts` (build-time palette derivation using `culori` + `sharp` already installed), with WCAG contrast fallback
- [ ] 2.8 Wire palette extraction into `pnpm --filter @ravisweets/storefront build` (runs before Next.js build)
- [ ] 2.9 Write `apps/storefront/scripts/validate-catalogue.ts` — validates schema completeness, image reachability, contrast, category coverage, description length
- [ ] 2.10 Add `validate-catalogue` step to the `lint` job in `.github/workflows/ci.yml`
- [ ] 2.11 Remove `apps/storefront/src/lib/sample-products.ts` after migration; update all imports

## 3. Corporate Hamper Builder

- [ ] 3.1 Design the hamper-builder URL schema (`t`, `items`, `ribbon`, `box`, `logo`, `msg`, `qty`, `v`) in `apps/storefront/src/lib/builder/url-schema.ts` with serialise + parse + validate functions
- [ ] 3.2 Author pricing-tier data in `packages/shared/src/catalogue/pricing.ts` (tier thresholds + per-unit rates per tier) with a single `computePrice(items, quantity)` function
- [ ] 3.3 Author four templates (`essence`, `premium`, `grande`, `blank`) in `packages/shared/src/catalogue/templates.ts`
- [ ] 3.4 Scaffold `apps/storefront/src/app/corporate/builder/page.tsx` (client, Suspense-wrapped for URL-params)
- [ ] 3.5 Build `<BuilderLayout>` — three-column grid on desktop (palette / canvas / summary) collapsing to stacked + sticky summary on mobile
- [ ] 3.6 Build `<TemplatePicker>` with confirmation dialog on template replacement
- [ ] 3.7 Build `<ItemPalette>` with category-grouped items, search/filter input, keyboard navigation, "add" animation that morphs via `layoutId` into the canvas
- [ ] 3.8 Build `<HamperCanvas>` stylised SVG/CSS composition with selected items arranged inside, supporting remove + quantity +/- + Framer `<Reorder>` drag
- [ ] 3.9 Build `<CustomisationPanel>` (ribbon colour swatches, box finish radio, logo-print toggle with lead-time chip, personalised message textarea with 240-char counter)
- [ ] 3.10 Build `<TierIndicator>` + `<PriceSummary>` (per-unit / units / total + tier upgrade crossfade on threshold cross)
- [ ] 3.11 Wire MOQ-below warning + disabled "Submit enquiry" button
- [ ] 3.12 Build `<ShareButton>` — writes current URL to clipboard, toast acknowledgement
- [ ] 3.13 Wire "Submit enquiry" hand-off — navigate to `/corporate#enquiry?from=builder&state=<encoded>`; update `<CorporateEnquiry>` to read incoming state on mount
- [ ] 3.14 Add "From builder" chip in `<CorporateEnquiry>` when `from=builder` param is present
- [ ] 3.15 Add PostHog events per the taxonomy (1.4) — dedup at sensible windows
- [ ] 3.16 a11y audit: focus-visible, aria-live on item add/remove, keyboard parity for drag-reorder, contrast across themes
- [ ] 3.17 Mobile sticky summary bar wiring
- [ ] 3.18 Unit-test the URL schema (serialise ↔ parse round-trip, version mismatch handling)
- [ ] 3.19 Add `builder` link to `/corporate` CTA and tier-card deep-links (`?t=premium`)

## 4. Home-Page Visual Amplification

- [ ] 4.1 Build `<SectionEntry>` wrapper component — ambient `--theme-glow` wash on viewport entry (reduced-motion inert)
- [ ] 4.2 Wrap every home section in `<SectionEntry>`; verify no layout shift
- [ ] 4.3 Upgrade `<HeroStill>` → add separated-layer scroll on desktop (gated by viewport ≥ 1024 + non-touch + reduced-motion off); mobile path unchanged
- [ ] 4.4 Build `<EditorialScrollBand>` horizontal-advances-on-vertical-scroll section, with touch fallback using native scroll-snap and reduced-motion vertical-stack fallback
- [ ] 4.5 Build `<IngredientMarquee>` — foreground product macro + background marquee of ingredient names in display type, different scroll rates, reduced-motion static
- [ ] 4.6 Wire all three new moments into the home page between existing sections (no re-flow of existing section order; new ones slot in naturally)
- [ ] 4.7 Feature-flag each moment via env var (`NEXT_PUBLIC_HOME_*`); default on; any flag = `off` unmounts the moment
- [ ] 4.8 size-limit audit: motion code stays ≤ 25 KB gz; home route ≤ 180 KB First Load JS
- [ ] 4.9 Device frame-rate test on a Pixel 4a-class Android device for each moment (10-second scroll recording, 60 fps floor)
- [ ] 4.10 reduced-motion walk-through: every moment collapses gracefully

## 5. Static Export & Dynamic-Route Degradation

- [ ] 5.1 Update `next.config.mjs` — conditional `output: 'export'` when `BUILD_TARGET=github-pages`; conditional `basePath` + `assetPrefix` if deploying to a project Pages path
- [ ] 5.2 Verify every prerendered route still renders correctly in `out/`; run a local smoke (`cd apps/storefront/out && python -m http.server 8080`)
- [ ] 5.3 Quick-view intercept `@modal/(.)product/[slug]`: confirm it silently no-ops under export; document the fall-through to full navigation
- [ ] 5.4 `/orders/[id]`: ensure the route produces a single static shell that client-resolves from localStorage; the existing not-found fallback covers non-local IDs
- [ ] 5.5 Add `apps/storefront/public/.nojekyll` (empty file)
- [ ] 5.6 Add `apps/storefront/public/robots.txt` with `Disallow: /` for staging
- [ ] 5.7 Add `noindex, nofollow` meta tag sitewide via `app/layout.tsx` metadata
- [ ] 5.8 Update `docker-compose.yml` / `.env.example` if any env var affects export behaviour

## 6. GitHub Pages Deploy Pipeline

- [ ] 6.1 Create `.github/workflows/deploy.yml` with the three-step pattern (install → build with `BUILD_TARGET=github-pages` → deploy via `actions/deploy-pages@v4`)
- [ ] 6.2 Set required `permissions`: `pages: write`, `id-token: write`, plus minimal `contents: read`
- [ ] 6.3 Use the `github-pages` environment with the `actions/configure-pages@v5` + `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` sequence
- [ ] 6.4 Configure Pages source in the GitHub repo settings: "GitHub Actions" (not "Deploy from a branch")
- [ ] 6.5 Manual-dispatch trigger (`workflow_dispatch`) for ad-hoc redeploys
- [ ] 6.6 Fail-fast on broken exports: verify `out/index.html` exists at the end of the build step
- [ ] 6.7 Write `docs/deploy.md` (or extend `apps/storefront/README.md`) with: local export recipe, CI deploy trigger, rollback recipe, custom-domain recipe, robots / noindex-lift recipe

## 7. Custom Domain (Staging First)

- [ ] 7.1 Confirm chosen domain (see 1.1) with stakeholder
- [ ] 7.2 If GitHub default: no action needed beyond the workflow above
- [ ] 7.3 If subdomain (e.g., `preview.ravisweets.com`): add `CNAME` file to `apps/storefront/public/CNAME` AND add DNS `CNAME preview → {user}.github.io`
- [ ] 7.4 Verify HTTPS is active (GitHub issues a Let's Encrypt cert automatically for verified custom domains)
- [ ] 7.5 Document the photography-gating guard — apex flip is explicitly deferred

## 8. Stakeholder Review & Launch

- [ ] 8.1 Internal QA pass on the deployed staging URL: every route 200s, images load, theme shifts correctly, quick-view falls through to full page, orders resolve from localStorage, builder round-trips via URL share
- [ ] 8.2 Founder review session — walk home + builder + corporate + about + festivals on desktop + mobile + reduced-motion
- [ ] 8.3 Capture feedback in a design-review note; split into "fix-before-merge" and "next-iteration"
- [ ] 8.4 Apply fix-before-merge items; re-deploy
- [ ] 8.5 Announce staging URL to marketing + accessibility reviewer; run a second pass
- [ ] 8.6 Schedule the photography shoot (still the biggest blocker for apex go-live) — owner, date, budget, shot list

## 9. Post-Launch Follow-Ups

- [ ] 9.1 Collect two weeks of PostHog data on builder funnel (template_select → item_add → share OR enquiry_submit); capture drop-off points
- [ ] 9.2 Feedback review: if drag-and-drop on the canvas is repeatedly requested, scope a follow-up change using `react-dnd` or similar
- [ ] 9.3 When real photography lands: flip `robots.txt` + remove `noindex` + (optionally) promote to apex `ravisweets.com` CNAME
- [ ] 9.4 Evaluate moving from GitHub Pages to Cloudflare Pages or Vercel if/when SSR features become conversion-critical (quick-view intercept, server-side analytics, real payments)
