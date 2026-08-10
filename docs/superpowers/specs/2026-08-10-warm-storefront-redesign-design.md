# Warm Storefront Redesign — "The Sweet Counter"

**Date:** 2026-08-10 · **Requested by:** krish · **Status:** Proposed (implementation follows this doc)

## 1. Why

Krish asked us to study two reference stores and close the gap:

- **Food on Farm** (foodonfarmpickles.com) — Andhra pickles D2C. Warm cream ground
  (`#FEFDEB`), Poppins 16px everywhere, a story-style circular category rail directly
  under the nav, founder-photo hero with four trust badges and a big ORDER NOW,
  product cards with photo → benefit chips → star rating + count → weight pills →
  full-width ADD TO CART with the price inside the button. ~11,000px home, almost all
  of it product or proof, very little prose.
- **Sweet Karam Coffee** (sweetkaramcoffee.in) — South-Indian snacks D2C. Jost 15px,
  cream ground, flash-sale countdown bar, best-seller carousel ("Loved by 5 Lakh+
  Happy Families"), category tile rail, festive drop grid, testimonial band, floating
  reviews tab + cart + WhatsApp.

The brief, in krish's words: home should be **more product-inclined and customer
friendly, not too much text; their font is good; navigation should be easy**.

### Where we stand today

The current world ("The Batch Card") is deliberate and well-built — one design
system, AA-enforced palette, tested token sync — but it is tuned for *authority*,
not *appetite*:

| Dimension | References | Ravi Sweets today |
|---|---|---|
| Ground | Warm cream | Cool NCR grey `#E9EAE4` ("never cream" was a design rule) |
| Type | Poppins / Jost, sentence case, friendly | Archivo compressed + Courier mono, heavy ALL-CAPS tracking |
| Product imagery | Appetizing photos everywhere | **Zero real images** — every card is a placeholder glyph |
| Category access | Visible bubble/tile rail on home | Hidden behind a SHOP mega-menu click |
| Trust | Ratings + counts on cards, testimonial bands, trust icon rows | One spec table with ~85 words of notes |
| CTAs | Big, pill, price-in-button | Small rectangular uppercase stamps |
| Merch energy | Offer bar + countdown, badges, festive drop | Quiet evergreen shipping strip |

## 2. Direction

**Keep the Batch Card's bones, warm the world, put products first.** We do not
clone Food on Farm; we keep what is ownable (stamp-blue accent — hue-clearance
tested against 9 competitors; the record/proof grammar; the manila festival card)
and change what fights the brief (cool ground, industrial type, square shapes,
text-led home).

This reverses two documented owner decisions ("never cream", "no friendly face") —
that reversal is exactly what the owner is now asking for, so comments, the
direction contract in `layout.tsx`, and tests are updated alongside, not bypassed.

## 3. Design decisions

### 3.1 Colour — warm the paper, keep the ink

Light register ("the counter paper"):

- `base` `#E9EAE4` → **`#FAF4E7`** warm halwai cream
- `surfaceElevated` `#F6F7F3` → **`#FFFCF4`**
- `inkMuted` `#565F68` → **`#5E594B`** (warm pencil; stays ≥4.5:1 on both grounds)
- `varak` → `#9A9384`, `varakRule` → `#736C5B` (warm steel; ≥3:1 rules)
- **Unchanged:** ink `#161C24`, accent `#2046C8` (stamp blue stays the brand's
  ownable colour — warmth comes from the ground, not the CTA hue), accentDeep,
  manila field `#EBC77E`, EMBER, BRAND_RED.

Dark register warms the same way (carbon → "burnt jaggery"): base `#2B2620`,
elevated `#37312A`, ink `#F1EDE4`, muted `#B0A898`, accent = the new cream.
Product palettes (badam/gulkand/kesar) get matching warm bases; the shared
duplicate `packages/shared/src/catalogue/palettes.ts` is synced — including its
**stale `HAMPER.accent #F2732F`**, a bug the storefront copy already fixed.

All `palette.test.ts` contrast pairs and `globals-sync.test.ts` must stay green.

### 3.2 Typography — Poppins carries the interface

- **Poppins 400/500/600/700** replaces Archivo for display + body (both references
  run a friendly geometric sans wholesale; krish called it out specifically).
- **Courier Prime stays** for recorded values only (batch numbers, dates, spec
  tables) — it is the Batch Card's signature garnish. **Prices move to Poppins
  bold** — a price is something you read comfortably, not a typed artifact.
- Anek Telugu unchanged.
- Remove `wdth` variation settings (Poppins has no width axis); display tracking
  relaxes from −0.028em to −0.01em; `.field-label` tracking eases 0.14em → 0.08em.
- Nav goes sentence case at 13px semibold (was 11px uppercase, 0.18em tracking).

### 3.3 Shape — sweet-box radii, pill CTAs

- Radii scale: 3/6/8/10/14/18 → **6/8/12/16/20/24** (call sites resolve automatically).
- `.docket` card radius 8 → 12px; `.stamp` becomes a **pill** (references both use
  pill CTAs); everything else keeps the contact-not-float elevation.

### 3.4 Navigation — categories one glance away

- **New Category Rail** on home directly under the hero: 8 circular palette-tinted
  tiles (Hyderabadi specials, Sweets, Namkeens, Savouries, Pickles, Dry fruits,
  Combos, Gift hampers) with specimen glyphs until photos exist; horizontal scroll
  on mobile — the Food on Farm bubble pattern.
- Desktop flat nav gains **Gift hampers** (the money link both references promote);
  labels go sentence case. Mega menu, mobile drawer, search, cart all stay.

### 3.5 Home — product-first section order

1. **Hero** (existing HeroBatch — warms automatically via tokens; copy already short)
2. **Category rail** *(new)*
3. **Today's bestsellers** grid (existing, 8 cards)
4. **Trust strip** *(new)* — the verbose 4-row spec `<dl>` (~85 words) compresses to
   four icon badges with one short line each: No preservatives ever · Made fresh,
   same-day dispatch · One family kitchen since 1983 · Delivered across India.
5. **Festival band** (existing FestivalNextBand)
6. **Customer reviews band** *(new, data-driven)* — renders approved product reviews
   from Supabase; **hides entirely when no approved reviews exist**. No fabricated
   testimonials, ever.
7. **Corporate gifting CTA** (existing, kept)

Net text on the page goes *down* while sections go up — matching the references'
"lots to see, little to read" feel.

### 3.6 Product card

- Price set in Poppins bold 16px (drop the typewriter mono for prices).
- Everything else stays: palette-tinted plate, badges, quick-add morph button.

### 3.7 Footer

- Adds a **"Talk to us"** contact block (WhatsApp + phone — same numbers as the
  mobile drawer) so the customer-friendly exit exists on every page at every width.

## 4. What we are NOT doing (and why)

- **Not changing the accent to orange/red.** Food on Farm's orange collides with
  ember (live-state ink) and with 3 of the 9 measured competitor hues; blue is the
  one colour we own in this category. Warmth comes from the ground.
- **Not adding a countdown/flash-sale bar.** PromoStrip already supports admin
  campaigns from /admin/promotions; inventing an offer would be fake urgency.
- **Not adding fake ratings, review counts, or "Loved by X families" claims.** We
  render real approved reviews or nothing.
- **Not adding a blog/recipes section.** No content pipeline exists to feed it.
- **Not touching checkout/cart/admin.**

## 5. The elephant: product photography

The single biggest gap vs both references is **real product photos** — every card
on ravisweets.com currently renders a placeholder glyph because the old WordPress
image host died. The code already overlays owner-uploaded images everywhere
(`productImages` from the admin media library → cards, hero cutouts, PDP).

**Action for krish:** shoot/collect photos for at least the 8 bestsellers and
upload via /admin — the redesigned home lights up with zero further code changes.
This proposal makes the placeholder state as appetizing as possible, but it cannot
substitute for photography.

## 6. Files touched

| Area | Files |
|---|---|
| Tokens | `src/lib/theme/palette.ts`, `tokens.ts`, `app/globals.css`, `tailwind.config.ts`, `packages/shared/src/catalogue/palettes.ts` |
| Fonts/layout | `app/layout.tsx` (Poppins, viewport themeColor, direction contract rewrite) |
| Nav | `components/header.tsx` |
| Home | `app/page.tsx`, new `components/sections/category-rail.tsx`, `trust-strip.tsx`, `reviews-band.tsx` |
| Data | `lib/supabase/reviews.ts` (+`listFeaturedReviews`) |
| Card | `components/product-card.tsx` |
| Footer | `components/footer.tsx` |
| Tests/docs | `lib/theme/palette.test.ts` comments, `DESIGN.md` addendum |

## 7. Verification

- `pnpm exec vitest run src/lib/theme` — all contrast + sync tests green after edits.
- `pnpm exec tsc` typecheck via the storefront's own script; production build.
- Playwright visual pass on / at 1440px and 390px against the reference criteria:
  warm ground, friendly type, category rail reachable, ≤200 words of prose above
  the fold, CTAs pill-shaped.
