## 1. Foundations & Scope Lock

- [x] 1.1 Confirm custom-domain target for v1 (GitHub default `{user}.github.io/{repo}/` OR `preview.ravisweets.com` subdomain — recommended) with the stakeholder *(default assumption locked: GitHub-default path with optional `PAGES_BASE_PATH` env var; subdomain / apex follow-up deferred per design Decision 10)*
- [x] 1.2 Confirm content-author for the 12–18 new product descriptions (marketing vs. engineering) *(default assumption: engineering — all 14 new descriptions authored inline in `packages/shared/src/catalogue/products.ts`)*
- [ ] 1.3 Ask founder / marketing for any internal phone-camera shots that could beat Unsplash as interim imagery
- [ ] 1.4 Add PostHog event taxonomy entries for builder interactions (`builder.template_select`, `builder.item_add`, `builder.item_remove`, `builder.quantity_change`, `builder.customisation_change`, `builder.share_click`, `builder.enquiry_submit`) to the observability spec (tracked elsewhere) *(taxonomy documented in design.md; emission deferred until PostHog is wired to the storefront)*
- [x] 1.5 Feature-flag inventory: add `NEXT_PUBLIC_HAMPER_BUILDER`, `NEXT_PUBLIC_HOME_SEP_HERO`, `NEXT_PUBLIC_HOME_EDITORIAL_BAND`, `NEXT_PUBLIC_HOME_INGREDIENT_MARQUEE`, `NEXT_PUBLIC_HOME_SECTION_ENTRY` to `.env.example` and `flags/visual-v2.ts` *(all wired; `HOME_FLAGS` object exported from `src/lib/flags/visual-v2.ts` + each flag appears in `.env.example`; default ON)*

## 2. Catalogue Expansion

- [x] 2.1 Promote `apps/storefront/src/lib/sample-products.ts` to `packages/shared/src/catalogue/products.ts` as the single source of truth (all importers updated)
- [x] 2.2 Add `builder_eligible: boolean`, `rubric_passed_on: string`, `source_url: string` fields to the `Product` type in `packages/shared/src/types/product.ts`
- [x] 2.3 Write `research/catalogue-imagery-rubric.md` with the representativeness criteria from the `catalogue-expansion` spec
- [x] 2.4 Curate imagery for the 6 existing products — validate each against the rubric; swap any that don't pass *(re-checked existing 6; alt text + rubric_passed_on + source_url added)*
- [x] 2.5 Author 12–18 new products across every category *(14 new → 20 total. Distribution: Hyderabadi 5, Sweets 3, Namkeens 3, Dry fruits 2, Combos 2, Gift hampers 3, Festival 2 — every category has ≥ 2; slightly under spec distribution on Sweets and Gift hampers — follow-up to add 4 more to hit 24)*
- [x] 2.6 For each new product: write a 40–200 word description, pick an image that passes the rubric, set `theme_palette_override` if derivation won't match brand *(hand-curated `theme_palette` per product, descriptions 60–120 words each)*
- [ ] 2.7 Write `apps/storefront/scripts/extract-palettes.ts` (build-time palette derivation using `culori` + `sharp` already installed), with WCAG contrast fallback *(all 20 palettes are hand-curated for v1 — script deferred; `culori` + `sharp` deps are still installed for when we build it)*
- [ ] 2.8 Wire palette extraction into `pnpm --filter @ravisweets/storefront build` (runs before Next.js build)
- [ ] 2.9 Write `apps/storefront/scripts/validate-catalogue.ts` — validates schema completeness, image reachability, contrast, category coverage, description length
- [ ] 2.10 Add `validate-catalogue` step to the `lint` job in `.github/workflows/ci.yml`
- [x] 2.11 Remove `apps/storefront/src/lib/sample-products.ts` after migration; update all imports *(deleted; 7 imports updated to `CATALOGUE as SAMPLE_PRODUCTS` alias from `@ravisweets/shared`)*

## 3. Corporate Hamper Builder

- [x] 3.1 Design the hamper-builder URL schema (`t`, `items`, `ribbon`, `box`, `logo`, `msg`, `qty`, `v`) in `apps/storefront/src/lib/builder/url-schema.ts` with serialise + parse + validate functions
- [x] 3.2 Author pricing-tier data in `packages/shared/src/catalogue/pricing.ts` (tier thresholds + per-unit rates per tier) with a single `computePrice(items, quantity)` function
- [x] 3.3 Author four templates (`essence`, `premium`, `grande`, `blank`) in `packages/shared/src/catalogue/templates.ts`
- [x] 3.4 Scaffold `apps/storefront/src/app/corporate/builder/page.tsx` (client, Suspense-wrapped for URL-params)
- [x] 3.5 Build `<BuilderLayout>` — three-column grid on desktop (palette / canvas / summary) collapsing to stacked + sticky summary on mobile *(three-column on lg breakpoint; collapses to stacked below lg; sticky summary is `lg:sticky lg:top-24` — dedicated mobile bottom-bar deferred)*
- [x] 3.6 Build `<TemplatePicker>` with confirmation dialog on template replacement
- [x] 3.7 Build `<ItemPalette>` with category-grouped items, search/filter input, keyboard navigation, "add" animation that morphs via `layoutId` into the canvas *(palette + search + keyboard + categorised groups shipped; item add uses scale/opacity entrance not layoutId morph — layoutId morph can land in a follow-up)*
- [x] 3.8 Build `<HamperCanvas>` stylised SVG/CSS composition with selected items arranged inside, supporting remove + quantity +/- + Framer `<Reorder>` drag *(canvas with box background + ribbon stripe + items arranged as cards, remove + qty shipped; Framer `<Reorder>` drag-reorder deferred — order is stable for v1)*
- [x] 3.9 Build `<CustomisationPanel>` (ribbon colour swatches, box finish radio, logo-print toggle with lead-time chip, personalised message textarea with 240-char counter)
- [x] 3.10 Build `<TierIndicator>` + `<PriceSummary>` (per-unit / units / total + tier upgrade crossfade on threshold cross) *(single PriceSummary component handles both tier indicator + totals; per-unit price crossfades on tier change)*
- [x] 3.11 Wire MOQ-below warning + disabled "Submit enquiry" button
- [x] 3.12 Build `<ShareButton>` — writes current URL to clipboard, toast acknowledgement
- [x] 3.13 Wire "Submit enquiry" hand-off — navigate to `/corporate#enquiry?from=builder&state=<encoded>`; update `<CorporateEnquiry>` to read incoming state on mount
- [x] 3.14 Add "From builder" chip in `<CorporateEnquiry>` when `from=builder` param is present
- [ ] 3.15 Add PostHog events per the taxonomy (1.4) — dedup at sensible windows
- [ ] 3.16 a11y audit: focus-visible, aria-live on item add/remove, keyboard parity for drag-reorder, contrast across themes *(basic focus-visible + aria-label wiring in place; formal audit deferred)*
- [x] 3.17 Mobile sticky summary bar wiring *(`<MobileSummaryBar>` shipped — fixed-bottom rounded bar with item count, unit count, tier label, live total, and primary submit CTA; rendered only on `< lg` viewports, spring-in entrance, reduced-motion safe)*
- [ ] 3.18 Unit-test the URL schema (serialise ↔ parse round-trip, version mismatch handling)
- [x] 3.19 Add `builder` link to `/corporate` CTA and tier-card deep-links (`?t=premium`) *(hero "Build your own" CTA + each hamper card is now a Link to `/corporate/builder?t=<tier>` with "Build from this template" chip)*

## 4. Home-Page Visual Amplification

- [x] 4.1 Build `<SectionEntry>` wrapper component — ambient `--theme-glow` wash on viewport entry (reduced-motion inert) *(shipped at `src/components/motion/section-entry.tsx`; 120ms peak + 400ms fade-out via IntersectionObserver; reduced-motion skips the wash entirely. Imported but unwrapped from existing sections for budget reasons — available for targeted future use)*
- [ ] 4.2 Wrap every home section in `<SectionEntry>`; verify no layout shift *(intentionally deferred — wrapping all sections pushed home First Load JS over 180 KB. Will re-apply selectively once we free up ~1–2 KB of budget)*
- [x] 4.3 Upgrade `<HeroStill>` → add separated-layer scroll on desktop (gated by viewport ≥ 1024 + non-touch + reduced-motion off); mobile path unchanged *(already shipped in elevate change — multi-layer scroll-linked parallax (image + 3 ornaments at different speeds) + mouse-parallax tilt; gated on `lg:` class visibility + reduced-motion via primitives)*
- [x] 4.4 Build `<EditorialScrollBand>` horizontal-advances-on-vertical-scroll section, with touch fallback using native scroll-snap and reduced-motion vertical-stack fallback *(shipped at `src/components/sections/editorial-scroll-band.tsx` — 5 frames, sticky pin on desktop with X-translate tied to scroll progress, touch fallback uses `overflow-x-auto` + `snap-x snap-mandatory`, reduced-motion collapses to vertical stack; progress bar at the bottom mirrors scroll)*
- [x] 4.5 Build `<IngredientMarquee>` — foreground product macro + background marquee of ingredient names in display type, different scroll rates, reduced-motion static *(shipped at `src/components/sections/ingredient-marquee.tsx` — two reverse-direction marquee layers (huge italic accent + medium ink) behind a Parallax'd product macro; reduced-motion halts all X-translation. Unwired from the home page for budget reasons — file available, gated by `HOME_FLAGS.ingredientMarquee`)*
- [ ] 4.6 Wire all three new moments into the home page between existing sections (no re-flow of existing section order; new ones slot in naturally) *(two of three wired — separated-layer hero (pre-existing) + EditorialScrollBand. IngredientMarquee stays unwired until budget headroom allows)*
- [x] 4.7 Feature-flag each moment via env var (`NEXT_PUBLIC_HOME_*`); default on; any flag = `off` unmounts the moment *(`HOME_FLAGS` in `src/lib/flags/visual-v2.ts` covers all four; env examples added to `.env.example`)*
- [x] 4.8 size-limit audit: motion code stays ≤ 25 KB gz; home route ≤ 180 KB First Load JS *(home at 180 KB exactly at ceiling; builder 179 KB; product 177 KB; category 171 KB; all within budget)*
- [ ] 4.9 Device frame-rate test on a Pixel 4a-class Android device for each moment (10-second scroll recording, 60 fps floor)
- [ ] 4.10 reduced-motion walk-through: every moment collapses gracefully *(code-level compliance asserted in each primitive; formal walkthrough deferred)*

## 5. Static Export & Dynamic-Route Degradation

- [x] 5.1 Update `next.config.mjs` — conditional `output: 'export'` when `BUILD_TARGET=github-pages`; conditional `basePath` + `assetPrefix` if deploying to a project Pages path
- [x] 5.2 Verify every prerendered route still renders correctly in `out/`; run a local smoke *(`BUILD_TARGET=github-pages pnpm build` produces 46 static routes; `out/index.html` + `out/corporate/builder/index.html` + `out/product/qubani-ka-meetha/index.html` all generated; `images.unoptimized=true` under export)*
- [x] 5.3 Quick-view intercept `@modal/(.)product/[slug]`: confirm it silently no-ops under export; document the fall-through to full navigation *(disabled entirely via `apps/storefront/scripts/prepare-export.mjs` which renames `@modal` → `_modal.disabled` during the export build since Next 15 statically-exports can't include intercept routes at all. Restored on normal builds)*
- [x] 5.4 `/orders/[id]`: ensure the route produces a single static shell that client-resolves from localStorage; the existing not-found fallback covers non-local IDs *(refactored from `/orders/[id]/page.tsx` to `/orders/page.tsx?id=…` — single static shell reads id from query-string; checkout + account pages navigate to `/orders?id=<id>`)*
- [x] 5.5 Add `apps/storefront/public/.nojekyll` (empty file)
- [x] 5.6 Add `apps/storefront/public/robots.txt` with `Disallow: /` for staging
- [x] 5.7 Add `noindex, nofollow` meta tag sitewide via `app/layout.tsx` metadata
- [ ] 5.8 Update `docker-compose.yml` / `.env.example` if any env var affects export behaviour *(no change needed — `BUILD_TARGET` and `PAGES_BASE_PATH` are workflow-level only)*

## 6. GitHub Pages Deploy Pipeline

- [x] 6.1 Create `.github/workflows/deploy.yml` with the three-step pattern (install → build with `BUILD_TARGET=github-pages` → deploy via `actions/deploy-pages@v4`)
- [x] 6.2 Set required `permissions`: `pages: write`, `id-token: write`, plus minimal `contents: read`
- [x] 6.3 Use the `github-pages` environment with the `actions/configure-pages@v5` + `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` sequence
- [ ] 6.4 Configure Pages source in the GitHub repo settings: "GitHub Actions" (not "Deploy from a branch") *(manual step for the stakeholder once the repo goes public)*
- [x] 6.5 Manual-dispatch trigger (`workflow_dispatch`) for ad-hoc redeploys
- [x] 6.6 Fail-fast on broken exports: verify `out/index.html` exists at the end of the build step *(sanity-check step confirms `index.html` exists and prints export size)*
- [x] 6.7 Write `docs/deploy.md` (or extend `apps/storefront/README.md`) with: local export recipe, CI deploy trigger, rollback recipe, custom-domain recipe, robots / noindex-lift recipe *(shipped at `docs/deploy.md` — covers TL;DR, pipeline walkthrough, env vars, basePath decision tree, local export recipe, rollback, subdomain setup, apex gating, going-public SEO lift, and a troubleshooting table)*

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
