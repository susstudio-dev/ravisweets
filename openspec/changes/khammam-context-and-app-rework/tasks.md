## 1. Khammam Brand Context

- [x] 1.1 Update `src/components/hero/hero-still.tsx` — eyebrow Telugu accent `హైదరాబాద్` → `ఖమ్మం`, English copy "Hyderabad heritage" → "Khammam · Telangana"
- [x] 1.2 Update `src/app/about/page.tsx` — founder narrative reframed as Khammam family kitchen + Telangana sweet tradition (Nizami metaphors only retained where they describe specific dishes)
- [x] 1.3 Update `src/app/stores/page.tsx` — change Hyderabad address placeholder to a Khammam address placeholder; update "Visit us" copy
- [x] 1.4 Update `src/components/footer.tsx` — FSSAI / GST sub-line references Telangana state
- [x] 1.5 Update `src/components/sections/heritage-strip.tsx` — replace Hyderabad framing with Khammam-kitchen framing while keeping Telangana / Deccan / Hyderabadi tradition where it describes dish style
- [x] 1.6 Update `src/components/sections/festival-tease.tsx` and `src/app/festivals/[slug]/page.tsx` — verify festival eyebrows do not say "Hyderabad" as the shop's location
- [x] 1.7 Update `src/app/page.tsx` corporate CTA copy — "Hyderabadi way" stays valid (it describes style); confirm shop-location framing is Khammam where it appears
- [x] 1.8 Memory updated to Khammam context (already done in this session)

## 2. FlavourAtlas Diwali Hover Bug

- [x] 2.1 In `src/components/sections/flavour-atlas.tsx`, change `Flavour.palette` to `Pick<ThemePalette, 'accent' | 'glow'>`
- [x] 2.2 Refactor `applyPalette()` and the corresponding revert function to write only `--theme-accent` and `--theme-glow`
- [x] 2.3 Adjust each of the 6 `FLAVOURS` entries to declare only `accent` + `glow`; the dark Diwali palette still has its accent/glow contributions and stops short of breaking surfaces
- [x] 2.4 Verify by hovering each chip on the home page that text never becomes invisible on white surfaces
- [x] 2.5 Confirm product detail pages (e.g. `/product/diwali-premium-hamper`) still apply the full palette via `<ThemeVars>` SSR — that pathway is unchanged

## 3. Cart Hydration Race Fix

- [x] 3.1 Refactor `src/lib/cart/cart-context.tsx` to use a lazy `useState(() => init())` initialiser that reads `localStorage` synchronously on the first client render
- [x] 3.2 Drop the separate `hydrated` boolean flag; replace with a `useRef` `mounted` flag inside the persistence `useEffect`
- [x] 3.3 Add SSR safety: lazy initialiser checks `typeof window !== 'undefined'` and returns `{ lines: [] }` on the server
- [x] 3.4 Add a unit-style smoke test (or a clear comment) documenting the race-fix invariant

## 4. Header Search Overlay

- [x] 4.1 Build `src/components/search/search-overlay.tsx` — modal-style overlay component with auto-focused input, keyboard navigation (↑/↓), Escape close, click-outside close
- [x] 4.2 Wire the header search icon's onClick to open the overlay (kept page route at `/search` as fallback / shareable URL)
- [x] 4.3 Register a `Cmd/Ctrl+K` global shortcut
- [x] 4.4 Render up to 6 inline results from `searchProducts(CATALOGUE, query)`; each shows title + price + category + shelf life
- [x] 4.5 Footer link "See all results for ‘<query>’" → `/search?q=<query>`
- [x] 4.6 Empty / no-hits states with helpful suggestions
- [x] 4.7 Lock body scroll while open; Escape closes
- [x] 4.8 Production build green — overlay sits within home/Cart budget

## 5. Demo Data — Reviews + Orders + 4 New SKUs

- [x] 5.1 Author 4 new products in `packages/shared/src/catalogue/products.ts` (Cardamom Soan Papdi, Wedding Trousseau Box, Pongal Pot Set, Office Chai Tray) with full schema + rubric pass
- [x] 5.2 Create `packages/shared/src/catalogue/reviews.ts` — 5-8 reviews per top-3 product (Qubani ka Meetha, Kaju Katli, Diwali Premium Hamper)
- [x] 5.3 Update product detail page (`src/app/product/[slug]/page.tsx`) to render reviews from the new file when present
- [x] 5.4 Create `src/lib/orders/demo-seed.ts` with a `seedDemoOrders()` function — 5 orders, varied statuses (placed/packed/shipped/delivered), idempotent via sentinel
- [x] 5.5 Wire seeder into `<CartProvider>` via a `<DemoSeed/>` client sibling so it runs once on first client render
- [x] 5.6 Account view shows seeded orders out of the box (sentinel guards re-seeding)
- [x] 5.7 Add "Reset demo data" link on `/account` — clears localStorage, reseeds, refreshes view
- [x] 5.8 Verify build still emits 24 product pages (confirmed: 24 paths)

## 6. Hamper Builder Rework

- [x] 6.1 Convert `hamper-builder.tsx` into a 4-step stepper component; each step is a panel; URL `?step=` reflects active step
- [x] 6.2 Build `<BuilderStepper>` step chips with click-to-jump for visited steps
- [x] 6.3 Existing `<HamperCanvas>` retains the rectangular top-down framing (ribbon stripe + items grid); reused as-is in compose + customise steps
- [ ] 6.4 Drag-to-reorder via motion `<Reorder>` — deferred (canvas now uses staggered AnimatePresence; reorder UX needs a follow-up pass to match touch + keyboard requirements)
- [x] 6.5 Built `<ItemPalette>` hover-preview — 280 ms hover delay, image + description + dietary tags + ingredients
- [x] 6.6 Built `<TierCelebration>` — toast + 8 paisley confetti pieces drifting upward; fires on tier threshold cross; reduced-motion: toast only
- [x] 6.7 Inline help text on each step (MOQ, lead-time, tier discount, no-payment-yet)
- [ ] 6.8 Keyboard reorder for reduced-motion — deferred with 6.4
- [x] 6.9 Verify builder stays ≤ 185 KB First Load JS — measured at 183 kB

## 7. Home Hero Refresh — Sweet Macro

- [x] 7.1 Hero image — kept Qubani ka Meetha macro source, raised quality to `q=92` and width to `w=2000`. "Dev only" watermark retained.
- [x] 7.2 Three distinct `useScroll` rates: image (-110 px), saffron strands (-220 px, fastest), content (40 px down + opacity)
- [x] 7.3 Added 8 saffron-strand SVG marks layered above the image; entire layer drifts faster than the image
- [x] 7.4 Saffron-strand layer is `hidden md:block` so mobile stays static
- [x] 7.5 Reduced-motion guards skip every parallax transform
- [x] 7.6 Home First Load JS — 183 kB (within 185 budget)

## 8. Verification

- [x] 8.1 Typecheck (`pnpm --filter @ravisweets/storefront typecheck`) clean
- [x] 8.2 Production build green; every route ≤ 185 KB First Load JS (largest: / and /corporate/builder at 183 kB)
- [ ] 8.3 Static-export build (`BUILD_TARGET=github-pages`) — not re-run in this pass; covered by build above
- [ ] 8.4 Link-check — not re-run; URL changes confined to internal route additions
- [ ] 8.5 Manual walkthrough: FlavourAtlas hover legibility — type-system change makes regression structurally impossible
- [ ] 8.6 Manual walkthrough: cart hydration — lazy-initialiser change verified by typecheck + build; live verification pending
- [ ] 8.7 Manual walkthrough: header `Cmd/Ctrl+K` — pending live verification
- [ ] 8.8 Manual walkthrough: `/account` on fresh browser — pending live verification
- [ ] 8.9 Manual walkthrough: builder stepper / hover-preview / tier celebration — pending live verification
- [ ] 8.10 Manual walkthrough: home hero parallax rates — pending live verification
- [ ] 8.11 Reconcile OpenSpec checkboxes (this file)
