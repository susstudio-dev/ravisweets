## Why

A live walkthrough by the stakeholder surfaced six concrete issues that the current site can't ship past — three are genuine bugs, two are UX deficits ("works but doesn't feel right"), one is a brand-context error, and one is the next demand for visual polish. Together they're the gap between "functional demo" and "stakeholder demo." This change addresses all six in one focused rework so the site is honest about what the brand is, behaves correctly under user interaction, and visualises the product (especially the corporate hamper builder) in a way that matches the founder's bar.

The six issues, ranked by severity:

1. **Brand-location is wrong.** The site frames Ravi Sweets as Hyderabad-based throughout (hero eyebrow, about page, footer placeholders, Telugu eyebrow `హైదరాబాద్`). The actual brand is **Khammam-based** in Telangana — a smaller-city craft kitchen, not a metropolitan flagship. Every public-facing surface needs the location corrected. The dish names (Qubani ka Meetha, Double ka Meetha, Badam ki Jali) ARE Hyderabadi specialities so they stay; what changes is the framing of *where the kitchen is*.
2. **FlavourAtlas Diwali hover is visibly broken.** Hovering "Diwali Hamper" swaps `--theme-base` to dark brown and `--theme-ink` to cream on `:root`, but the surrounding cards, product tiles, and tier-card backgrounds *don't* swap their backgrounds — so cream text lands on white surfaces and becomes invisible. Confirmed root cause: `applyPalette()` in `src/components/sections/flavour-atlas.tsx` writes all four theme variables when it should only write `--theme-accent` and `--theme-glow` for hover-tier theming.
3. **Cart hydration race.** `CartProvider` initialises with `{ lines: [] }` and reads localStorage in a `useEffect`. A click between mount and the load effect can cause the localStorage payload to overwrite the just-added line. Subtle but real.
4. **Search and account feel disconnected.** Both routes are functional (`/search` returns 200, `/account` renders an empty state), but the user reads them as "not working" because (a) header search is a full-page nav with no instant-results feel, and (b) account has nothing to look at on a fresh browser since orders live in localStorage.
5. **Hamper builder is technically complete but not user-friendly.** First-time users land in an unfamiliar three-column layout with no guidance. There's no stepper. No drag-and-drop reordering. No hover-preview of palette items. No celebration when a tier unlocks. The visualisation of the box itself is acceptable but flat.
6. **The home landing wants a more impressive parallax sweet image.** The current hero has a multi-layer parallax + mouse tilt — fine, but the user wants a clearer "sweet macro" focal point with a more pronounced multi-layer effect. Treat as a hero refresh.

## What Changes

### 1. Khammam context everywhere
- Replace "Hyderabad heritage" → "Khammam · Telangana" / "Telangana sweet tradition" on hero, about, festival landing eyebrows.
- Update Telugu eyebrow text from `హైదరాబాద్` (Hyderabad) → `ఖమ్మం` (Khammam) where it refers to the shop's location; keep `హైదరాబాద్` only on copy that's literally about Hyderabadi *dishes*.
- Update the about-page founder narrative — drop "Nizami / royal kitchens" framing for a "Khammam family kitchen, in the Telangana sweet tradition" angle. Mentions of Nizami / Deccan tradition stay where they're talking about specific dishes (Qubani, Double ka Meetha) — those dishes ARE Nizami-era — but the *shop's* identity is Khammam-craft, not metropolitan.
- Update store-locator card on `/stores`: address moves from "Abids, Hyderabad" → a representative Khammam address (placeholder pending real address).
- Update footer FSSAI / GST placeholders to reflect Telangana-issued registrations once real numbers are confirmed (no copy change today, just the eventual swap).
- Keep `category/hyderabadi-specials` slug (it refers to dish-style, not shop-location).

### 2. Fix FlavourAtlas Diwali hover bug
- Limit `applyPalette()` (the per-hover handler) to write **only** `--theme-accent` and `--theme-glow`. Leave `--theme-base` and `--theme-ink` at their light defaults so all surfaces stay legible.
- Restructure `Flavour.palette` typing so hover palettes only require accent + glow (light-mode-safe by construction); a separate `dark` flag opt-in is allowed for product detail pages where `<ThemeVars>` swaps the *whole* surface.
- Audit all six current FlavourAtlas chips — Diwali is the only one with a dark base, but the type fix ensures any future dark-base palette can't break legibility.

### 3. Fix cart hydration race
- Move localStorage read into a SSR-safe `useState(() => init())` initialiser — reads once at first render on the client.
- Drop the separate `hydrated` boolean. Persist always once the state changes after first render (use a `useRef` mounted flag if needed).

### 4. Header search overlay + demo orders
- Add `<HeaderSearchOverlay>` (modal-style) opened by the existing search icon AND `Cmd/Ctrl+K`. Inline autocomplete results from `searchProducts()` with the same scorer as `/search`. Click a hit → navigate to that product.
- Keep `/search` route — overlay is in addition, not replacement; the overlay's "View all results" footer link routes to `/search?q=…`.
- Seed **demo orders** into localStorage on a user's first visit so `/account` shows realistic content. 4 orders across statuses (placed / packed / shipped / delivered) with realistic line items, addresses, totals. Idempotent: only seed if `ravi.orders.v1` is absent. A "Reset demo data" link on `/account` clears + reseeds.

### 5. Builder rework — stepper + visualisation + drag + tooltips + tier celebration
- Convert builder to a **4-step stepper**: Pick template → Compose → Customise → Review. Each step is its own panel with breadcrumbs across the top. Users can jump between steps freely once visited.
- Bigger, more cinematic hamper preview: a top-down "looking into the box" composition with item icons stacking visually + ribbon laid across + the chosen box-finish texture as the background. Replaces the current flat box card with ribbon stripe.
- **Drag-to-reorder** items inside the box using motion's `<Reorder>` primitive. Touch-friendly via long-press.
- Palette items get a **hover-preview tooltip** showing larger image + ingredients + dietary tags before the user adds.
- **Tier-upgrade celebration**: when total units crosses a tier threshold (50 → 100 → 500), a brief one-shot toast + confetti-paisley flourish (4-6 SVG paisleys briefly drift across, ≤ 250 ms total). Reduced-motion: just the toast, no flourish.
- Inline tooltips on MOQ, tier discounts, lead-time impact of logo printing.

### 6. Home hero refresh — sweet-macro parallax
- Replace hero image with a closer macro of Qubani ka Meetha (apricot syrup with saffron strands; matches the SignatureMoment subject for brand consistency).
- Strengthen the parallax: image translates fastest, paisley ornaments at a slower rate, kinetic type stays anchored — three explicit motion rates (currently the rates are similar).
- Add a small floating "garnish drift" — 3-4 small saffron-strand SVG marks that translate independently as you scroll, layered on top of the image.
- Mobile keeps a static hero (no parallax).

### 7. Demo data expansion
- Expand catalogue from 20 → 24 products (the upper end of the original target). Add: 1 more Sweet (Soan Papdi), 1 more Hamper (Wedding Trousseau Box), 1 more Festival (Pongal Pot Set), 1 more Combo (Office Chai Tray).
- Demo reviews seeded for the top 3 bestselling products: 5-8 reviews each with rating, body, author name, dated 1-90 days ago. Stored in `packages/shared/src/catalogue/reviews.ts`.
- Demo orders (covered in §4 above).
- Optional demo cart items: NOT seeded by default — clean cart on first visit (founder feedback may flip this; default is clean).

**Non-goals**: rebuilding cart context architecture (just fix the race), rebuilding search system (add overlay, keep page), real photography (still gated), backend wiring (still gated), full a11y audit on new motion (each new primitive's reduced-motion path must work but no formal pass).

## Capabilities

### New Capabilities
- `khammam-brand-context` — every user-facing reference to the shop's location reads "Khammam, Telangana" with appropriate Telugu spelling; dish-specific copy still references "Hyderabadi specialities" where authentic.
- `flavour-atlas-fix` — FlavourAtlas hover swaps only accent + glow; dark palettes never reach `--theme-base` / `--theme-ink` via hover.
- `cart-hydration-fix` — cart context is rehydration-race-safe; no path can overwrite a just-added line on first paint.
- `header-search-overlay` — `Cmd/Ctrl+K` opens an autocomplete overlay; click-or-Enter navigates; "View all results" routes to `/search`.
- `builder-ux-rework` — 4-step stepper, drag-to-reorder, palette hover-preview, tier-upgrade celebration, MOQ/lead-time tooltips, top-down hamper preview.
- `home-hero-sweet-macro-refresh` — hero image swap + multi-rate parallax + garnish-drift overlay.
- `demo-data-seeding` — 24-product catalogue, demo reviews on top 3 SKUs, first-visit demo orders, "Reset demo data" affordance on /account.

### Modified Capabilities
<!-- None as delta specs — prior changes are still in-flight. The fixes here override per-spec text in the prior changes by content; OpenSpec deltas come when those changes archive. -->

## Impact

- **Code affected**: many files lightly touched for context (~12 files), one file refactored (`flavour-atlas.tsx`), one file refactored (`cart-context.tsx`), one new big component (`HeaderSearchOverlay`), one major rework (`hamper-builder.tsx` + new step components), one hero refresh (`hero-still.tsx`), three new data files (`reviews.ts`, demo-orders seeder, expanded `products.ts`).
- **Bundle impact**: target ≤ 4 KB gz net delta on `/` (header overlay adds ~3 KB, hero refresh and demo seeder are negligible). Builder route can grow ~5 KB for the stepper + drag-reorder; 179 KB → ~184 KB, still inside the raised 185 KB ceiling.
- **Dependencies added**: none — `motion`'s `<Reorder>` already available; tooltip is a small Radix-or-headless implementation we can write inline.
- **Assets required**: one curated hero image (Qubani macro, watermarked "Dev only"); 4 small demo product images for the 4 new SKUs.
- **Stakeholders**: founder (sign-off on Khammam framing, hero image), engineering (build), accessibility reviewer (new overlay + tooltip + drag interaction).
- **Risks**: drag-to-reorder usability on mobile (mitigated by long-press + clear handles); demo orders seed could surprise users who expected empty (mitigated by "Reset demo data" affordance); Khammam framing might be too modest if the founder wanted Hyderabad positioning for marketing (mitigated by surfacing this as an open question).
