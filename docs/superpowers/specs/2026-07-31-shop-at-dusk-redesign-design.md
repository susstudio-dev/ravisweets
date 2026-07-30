# Ravi Sweets — "The Shop at Dusk" redesign + revenue path

**Date:** 2026-07-31
**Status:** approved design, ready for implementation planning
**Supersedes:** the palette and hero sections (§3–§7) of
[`2026-07-26-storefront-art-direction-design.md`](./2026-07-26-storefront-art-direction-design.md).
Its architecture sections (§8) remain in force and are load-bearing here.
**Adapts:** the payment architecture of
[`2026-07-26-ravisweets-revenue-path-design.md`](./2026-07-26-ravisweets-revenue-path-design.md)
and [`../plans/2026-07-26-transact.md`](../plans/2026-07-26-transact.md) to infrastructure
that now exists. Deltas from the transact plan are marked ∆.

---

## 1. Context — what changed and why

The Anjeer & Pista palette (fig-purple + pistachio-green) shipped on
`feat/storefront-anjeer-pista-foundation` and was reviewed by the brand owner
against the running app. **The owner rejected the colour direction and chose to
return to the pre-redesign rose-on-cream identity.** The owner was shown the
hue-collision finding (rose `#A8345D` sits 3° from Bombay Sweet Shop's wine
hue) and reaffirmed the choice; it is recorded in §14 as an accepted risk, not
an accident. The `palette.test.ts` hue-clearance suite is re-authored
accordingly: clearance is still asserted against Cadbury purple, and the BSS
proximity is pinned as a documented, owner-accepted exception rather than
waived silently.

Everything else the redesign built is kept: the single-source-of-truth token
architecture, the derived semantic layer, the register mechanism, the contrast
test suite, the CI colour ratchet, and the Young Serif + Anek type system.
**Values change; machinery stays.**

Simultaneously, three blockers to revenue have cleared. The owner now has: a
fresh Supabase project (the old one was deleted), Razorpay API keys, a
configured Razorpay webhook + signing secret, and agreement to host on Vercel.
The simulated checkout can therefore be replaced with the real money path.

### Decisions log (owner, 2026-07-30/31)

| Decision | Choice |
|---|---|
| Palette | Cream + rose; gold demoted to fine accents only |
| Typography | Keep Young Serif + Anek Latin/Telugu |
| Hero | **The shop at dusk** — living illustrated Khammam storefront (no product cutout) |
| Homepage structure | **Walk into the shop** — scroll enters the scene; categories as display counters |
| Shop page | Display counters landing + chip-bar grid inside categories |
| Festivals page | Next festival leads (countdown) + scrubbable year-line rail |
| Corporate page | Sticky enquiry split + dark cinematic opener |
| Sign-in | Awning modal (desktop) / bottom sheet (mobile), one responsive component |
| Purchase auth | Guest-first; email OTP only; no customer passwords |
| Payments | Razorpay via Vercel route handlers; webhook authoritative |
| Sequencing | Interleaved: theme flip + homepage → payments → inner pages → auth → polish |

---

## 2. Identity — rose & cream, warmed by lamplight

The identity's organising image is the shop itself at golden hour: cream
plaster, a rose-striped awning, marigold garland, warm light in the display
windows. Every token maps to something in that scene.

**Where colour lives:** the authority is
`apps/storefront/src/lib/theme/palette.ts`; `tokens.ts` only re-exports it.
Everywhere this spec says "the palette module", it means `palette.ts`.

### 2.1 Light register (default)

| Token (RegisterTokens key) | Value | Scene role | UI role |
|---|---|---|---|
| `base` | `#FAF5E9` | cream plaster | page ground — never `#ffffff` |
| `surfaceElevated` | `#FFFDF6` | butter paper | cards |
| `ink` | `#2E2118` | teak counter | primary type |
| `inkMuted` | `#6B5A48` | shadowed wood | secondary type |
| `accent` | `#A8345D` | the awning rose | links, filled CTAs |
| `accentDeep` | `#7C2344` | awning in shadow | hover/pressed, deep panels |
| `field` (stored `glow`) | `#E8A13C` | window lamplight | warm glow washes, festival warmth |
| `varak` | `#B08D57` | brass scale-weights | decorative hairlines/fine accents |
| `varakRule` | `#9C7C45` | — | informational hairline (must clear 3:1) |

Estimated WCAG ratios (authoritative numbers come from `palette.test.ts`,
which must be re-authored to these values; any failing value is nudged, not
waived): ink/base ≈ 14.3:1 · inkMuted/base ≈ 6.1:1 · accent/base ≈ 5.8:1 ·
base-on-accent (filled button) ≈ 5.8:1 · varakRule/base ≈ 3.6:1.

**Gold is demoted, not deleted.** `varak`/`varakRule` become brass and are
allowed only as hairlines, dividers and small marks — never fills, frames or
gradients. (Key names `varak`/`varakRule` are kept in code to avoid churn; a
rename to `brass`/`brassRule` is optional cleanup, phase 6.)

### 2.2 Dusk register (replaces Bidri)

The dark register is the hero scene's own sky. The `data-register` mechanism
is unchanged; the attribute value renames `bidri` → `dusk` (mechanical,
greppable) and the values become:

| Token | Value | Role |
|---|---|---|
| `base` | `#3A1F31` | deep plum sky |
| `surfaceElevated` | `#4A2A3F` | raised cards |
| `ink` | `#F6EAD8` | warm cream type |
| `inkMuted` | `#CBB3A6` | secondary type |
| `accent` | `#E8A13C` | **marigold** — links & CTAs on dark |
| `accentDeep` | `#F2B15C` | UI states |
| `field` (stored `glow`) | `#7C2344` | rose panel on dark |
| `varak` / `varakRule` | `#D9C6A8` | brass inlay |

The two brand colours swap roles between registers, same rule as before: rose
is interactive on light and a panel on dusk; marigold is the glow on light and
interactive on dusk. Estimated ratios: ink/base ≈ 12.4:1 · accent/base ≈ 6.8:1.

Dusk is used for: the homepage story band, festival banners, the corporate
opener, and the footer. The footer is not currently register-wrapped; phase 1
wraps it in `data-register="dusk"` and re-tokens the header in the same pass.
The ban — never on PLP, PDP, cart or checkout — applies to
`data-register="dusk"` *bands*; per-product `FlavourPalette`s on PDP/cart
(e.g. the dusk-toned `hamper` palette below) are exempt, exactly as today's
`vault` palette already is.

### 2.3 Product palettes

The 5 named product palettes in `palette.ts` re-author to tonal variations of
rose & cream — working names: `house`, `kesar` (saffron-warm), `gulkand`
(rose-forward), `badam` (nut-cream), `hamper` (dusk-toned, for premium
hampers; named `hamper`, not `dusk`, so the register attribute value stays
grep-unique). **Exact hex values are proposed in the phase-1 plan and gated by
the re-authored `palette.test.ts` contrast pairs** — the same bar as
§2.1/§2.2. The `FlavourPalette` shape `{base, accent, glow, ink,
grainOpacity}` is unchanged. A soft sage variant for pista-based *products* is
permitted — the ban is on green as a *brand* colour, not on a pista product
looking like pista.

### 2.4 Typography — unchanged

Young Serif (display, size-only hierarchy, `font-synthesis-weight: none`),
Anek Latin (body/UI), Anek Telugu (Indic). No changes to `layout.tsx` font
loading.

### 2.5 Motifs

The shop's vocabulary replaces abstract decoration:

- **Awning stripe** — rose/cream striped edge on the sign-in surface, promo
  strip, and select card tops. Use sparingly: one striped element per view.
- **Marigold garland** — dot-garland dividers; festival contexts only.
- **Window glow** — warm `glow`-tinted box-shadow on hover for product cards
  and counters.
- **Katli diamond** — retained as the small functional mark (bullets, badges,
  add-to-cart confirm, focus corners). It is the product's own geometry and
  survives the palette change. The `Paisley`→katli SVG swap already shipped
  stays; paisley remains retired.

### 2.6 Motion system

AOS-style scroll animation site-wide, built exclusively on the already-installed
`motion` library and existing primitives (`Reveal`, `Stagger`, `SectionEntry`,
`Parallax`, `ScrollProgress`) — **no new animation dependency.** Additions:

- `ScrollScene` — scroll-linked scale/translate for the hero walk-in
  (one transform, no layered parallax on mobile).
- `CounterReveal` — counters "light up" (glow + stagger) on entry.
- Every effect gates on `useReducedMotion`; reduced-motion users get static
  layouts with opacity-only transitions.

---

## 3. The hero — the shop at dusk

An illustrated, animated Khammam storefront built as a layered SVG/CSS
component (`ShopScene`). Layers, back to front: dusk-gradient sky with
twinkling stars → shop body (cream plaster) → sign (`RAVI SWEETS · ఖమ్మం ·
SINCE 1985`) → striped awning with scalloped edge → marigold garland (gentle
sway) → three glowing display windows with tiny sweet silhouettes on shelves
(staggered glow pulses) → door with warm light → steam curls rising from the
kitchen side. Loop is slow (8–12 s cycles, desynchronised) so it reads as
alive, not busy.

**No product photography anywhere in the hero.** The matting-artefact katli
cutout is removed.

### Contract that must not break

All 8 DB-driven hero text fields keep their exact `??` precedence chain
(`site_content.hero` → active `theme_presets.hero` → hardcoded fallback; the
two secondary-CTA fields skip the theme-preset step — `theme_presets.hero`
carries only a single `ctaLabel`/`ctaHref` — and fall straight to the
hardcoded fallback): `eyebrowIndic`, `eyebrowEn`, `headline`, `body`,
`primaryCtaLabel`, `primaryCtaHref`, `secondaryCtaLabel`, `secondaryCtaHref`.
Headline re-animates on admin edit (keyed on headline text). The scene is the
hero's *backdrop*; admin-authored text renders over it.

**Review checkpoint:** the `ShopScene` component is built and shown to the
owner in isolation *before* it replaces the current hero. If it reads cheap,
we iterate there, not in production.

### Performance budget

The scene is CSS/SVG — no raster image in the critical path. Hero LCP element
is the headline text. Scene animation uses `transform`/`opacity` only
(compositor-friendly); target 60 fps on mid-range mobile, verified in Chrome
DevTools CPU-throttled run. Mobile renders a simplified scene: no scroll-zoom,
fewer stars, static garland.

---

## 4. Homepage — walk into the shop

Section order and behaviour:

1. **Hero** — full-bleed `ShopScene`, headline + 2 CTAs overlaid (the only
   above-fold destinations). Scrolling scales the scene gently toward the door
   (`ScrollScene`, one transform; disabled on mobile and reduced-motion).
2. **The counters** — three warm-lit glass display counters, curated
   super-groups over the seven real category slugs: **Sweets** →
   `/category/sweets` (also fronting `hyderabadi-specials`, `dry-fruits`,
   `festival-specials`), **Savouries** → `/category/namkeens`, **Gifting** →
   `/category/gift-hampers` (also fronting `combos`). They light up on entry
   (`CounterReveal`); the same grouping drives the `/shop` counters view (§5).
3. **Bestsellers** — "what people take home": product cards, staggered rise,
   horizontal scroll on mobile.
4. **Festival next** — dusk-register band: live countdown to the nearest
   festival (reuses `festival-countdown`), marigold garland, one pre-order CTA.
5. **Trust signage** — FSSAI / no preservatives / fresh daily, styled as
   painted shop-signs (moved from hero altitude, unchanged content).
6. **The story, back outside** — dusk register, sky fully dark, stars out:
   1985 → today in 3 short beats.
7. **Corporate CTA** — rose band, one line, one button.

Existing homepage sections not listed above are **removed from the homepage
composition** — not deleted from the repo — to keep the page to one coherent
story. Concretely: `flavour-atlas`, `press-marquee`, `signature-moment`,
`sweet-essence-panel`, both `editorial-band`s, `editorial-scroll-band`,
`heritage-strip`, `craft-strip`, `gifting-guide`, `festival-tease`
(`ingredient-marquee` is already built-but-unwired; nothing to remove).

Admin-fed content keeps working, verified: the hero is today's **only**
storefront `site_content` consumer and is retained; the promo strip reads the
`promotions` table via `getActivePromotion()` and mounts in `layout.tsx`,
outside the homepage composition entirely. The `signature_moment`,
`editorial_band_heading`, `home_trust` and `footer` `site_content` keys have
no storefront consumers today, so removing those sections severs no admin
feed.

---

## 5. Shop & category pages

- **`/shop`** lands on the counters view: each counter group (§4's mapping) a
  lit glass shelf (horizontal scroll) with "view all →". A category chip-row
  sits above for direct jumps to all seven real categories. No sidebar.
- **Category view** (`/category/[slug]` and "view all"): the current sticky
  filter *sidebar* (today: dietary chips, in-stock toggle, sort) is replaced
  by a horizontal chip row. Dietary, in-stock and sort carry over;
  **price-band and occasion are new filters to build.** Chips scroll sideways
  on mobile.
- Product cards: window-glow hover, katli-diamond add-confirm. Existing
  quick-view modal retained, restyled.
- Search overlay and `/search`: functionally unchanged, re-tokened.
- **Re-token-only surfaces** (no structural change anywhere in this spec):
  PDP, cart, checkout, `/orders` tracking, policies pages, and both 404s
  inherit the phase-1 theme flip; the phase-1 gate walks each of these routes
  explicitly.

## 6. Festivals

- **Index**: hero = nearest upcoming festival in its own palette (the existing
  per-festival palettes stay), Telugu name large, countdown, one pre-order
  CTA. Below: the **year-line** — a horizontal scrubbable timeline, every
  festival a colour stop; dragging (or tapping stops) crossfades the detail
  panel through that festival's palette. Next festival pre-selected.
- **Detail pages** (`/festivals/[slug]`): structure unchanged, re-tokened;
  countdown and decor components reused.

## 7. Corporate

- **Opener**: dusk-register cinematic band — headline + counting stats
  (boxes shipped, companies, cities; numbers animate on entry). Stats are
  hardcoded constants in the page component — the owner supplies the three
  numbers before phase 4c; admin editability is a non-goal.
- **Body**: two columns. Left scrolls: trust badges (GST invoicing, logo
  printing, CSV multi-address, account manager), 5-step process (existing
  content, animated line drawing through steps), tier cards, hamper-builder
  teaser card → `/corporate/builder`. Right: the enquiry form, sticky within
  the section. Stacks full-width on mobile, form last with a floating
  "get a quote" jump button.
- **Builder**: logic untouched; restyled to tokens. `isHamperBuilderEnabled()`
  exists in `lib/flags/visual-v2.ts` but is currently unwired —
  `/corporate/builder` renders unconditionally; wire it (with the promised
  "coming soon" fallback) or delete it in phase 4c.
- Enquiry submission continues into the existing Supabase enquiries path.

## 8. Stores & About

Refreshed, not rebuilt: new tokens, scroll reveals, one awning/garland touch
each, dusk story band on About. Layout and content otherwise untouched.

---

## 9. Sign-in, accounts, and the guest-first purchase flow

### 9.1 Principles

1. **Nobody is stopped at the till.** Checkout never requires an account.
2. **No customer passwords, ever.** Email OTP only. The password form survives
   solely in `/admin/login`.
3. **Buying creates the relationship; sign-in unlocks it.** Orders are keyed
   by email; OTP later proves ownership and reveals history.

### 9.2 The component

One responsive `AuthSheet` replacing the current `AuthModal`
(`components/auth/auth-modal.tsx`): centered "awning modal" ≥ md (striped top
edge, Young Serif greeting), bottom sheet below md. Flow: email → "code sent"
→ six auto-advancing digit inputs (paste-friendly,
`autocomplete="one-time-code"`) → petal-fall success → close. Supabase
`signInWithOtp` (email). The phone tab stays behind
`NEXT_PUBLIC_PHONE_OTP_ENABLED` (off) for a future MSG91 setup. Triggers:
header "Sign in", `/account` (bare `/orders` redirects there), and the
post-purchase "track your orders" prompt. ESC-close, body scroll-lock and
initial-focus behaviour carry over from the current modal; a real focus trap
(Tab containment + focus restore to the trigger on close) is **added** — the
current modal does not have one.

### 9.3 Accounts

`/account`: order history (newest first, status chips), saved addresses,
one-tap reorder (refills cart from a past order). Guest orders placed with the
same (now-verified) email appear automatically — matching happens server-side
at read time via RLS: `orders.customer_email = auth.jwt() ->> 'email' OR
orders.customer_id = auth.uid()` (`customer_id` is the column that exists on
`orders`; there is no `user_id`). The select policy replacing the current
`auth.uid() = customer_id` ships in the ∆ additions to `0010` (§10.2). No
client-side email filtering. `/orders?id=…` remains the guest-accessible
order-tracking view (re-tokened, unchanged); bare `/orders` redirects to
`/account`.

---

## 10. The money path

Adapts the transact plan (`../plans/2026-07-26-transact.md`) — its
architecture is adopted wholesale; deltas from its assumptions are marked ∆.

1. **Hosting → Vercel.** Route handlers become possible; the GitHub Pages
   static-export path is retired. ∆ `deploy.md` and the CI workflow update
   accordingly; `prepare-export` scripts become dead and are removed.
2. **New Supabase project** (∆ the old one was deleted, so seeds run fresh —
   there is no live-data migration concern). Apply migrations in documented
   order (the duplicate-`0002` caveat), plus new `0010_orders_payments.sql`:
   payment columns, `payment_events` audit table,
   `UNIQUE (razorpay_payment_id)`, stock reservation, ∆ plus two additions not
   in the transact plan's 0010, both for guest-order linking (§9.3): a
   `customer_email` column on `orders`, and the replacement select policy.
3. **Money is integer paise everywhere**; `Money.amountPaise`; conversion at
   render only; any non-integer throws.
4. **The client never sends a price.** Checkout submits
   `{productId, variantId, quantity}` + customer fields (name, email, phone,
   address). The server re-prices from the DB (which requires the product
   **read path** — `products-read.ts` — the transact plan's Task 6
   prerequisite; the catalogue is seeded into Postgres first).
5. **`POST /api/checkout/create-order`** — server-side quote, insert `pending`
   order, create Razorpay order, return `{razorpayOrderId, amountPaise}`.
6. **Razorpay Checkout** (hosted widget: UPI/cards/netbanking) opens with that
   order id; prefills the guest's email/phone.
7. **`POST /api/checkout/verify`** — optimistic HMAC signature check for the
   instant confirmation screen.
8. **`POST /api/webhooks/razorpay`** — the authoritative writer. Verifies the
   webhook signature with the configured secret; writes through an idempotent
   state transition keyed on `razorpay_payment_id`; tolerates the same event
   three times; records every event in `payment_events`.
9. **No COD in v1.** The COD option is removed from the UI, not disabled.
10. **Confirmation email** via the existing `send-order-email` edge function,
    re-pointed to the new Supabase project and re-skinned rose & cream.
11. **Reconciliation**: `scripts/reconcile.mjs` daily settlement diff, per the
    transact plan.
12. **Graceful degradation stays**: with no env vars the site renders in demo
    mode (`SUPABASE_CONFIGURED` guard); checkout shows a "store offline"
    state instead of the simulated success. ∆ The `sim_` simulation path is
    deleted, not kept behind a flag.

Two further items belong to this workstream and are assigned to phase 3a
(§12): deleting the unused Medusa scaffold (`apps/backend/`), per the transact
plan, and configuring the env/secrets below.

### Env & secrets (owner supplies at phase 3)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (server-only), `RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — set in Vercel project
settings; never committed. The Razorpay dashboard webhook URL points at
`/api/webhooks/razorpay` on the production domain.

---

## 11. Architecture — reused, re-authored, contracts

### Reused unchanged
- `applyPalette()` derived semantic layer (polarity-aware) and its two live
  consumers — `ActiveThemeProvider`'s inline write on `<html>` and the
  `FlavourScope` per-product wrapper (which itself covers SSR); the cascade
  fix. The `paletteToCss` serialiser and `useFlavour` hook exist without
  production call sites; they follow the value changes but gain no new
  consumers here.
- `data-register` subtree mechanism (attribute value renamed `bidri`→`dusk`).
- Contrast test machinery (`contrast.ts`, `palette.test.ts`) and the CI colour
  ratchet (`colour-audit.mjs`) — budgets must not regress.
- Theme provider stack, admin themes editor, `visual-v2.ts` flag system.

### Re-authored (values only)
- `palette.ts` register values + product palettes (§2) — the colour authority;
  `tokens.ts` only re-exports it. `globals.css` first-paint defaults stay
  byte-identical to `palette.ts` per the existing convention.
- SQL seed palette values (`0008_palette_presets.sql`, `SETUP_ALL.sql`) —
  these two must stay byte-identical to each other; since the DB is fresh,
  re-authoring values is safe.
- `admin-themes.tsx` fallback presets; `0009_promotions.sql` (and its
  `SETUP_ALL.sql` copy) `bg_from`/`bg_to`/`fg` column defaults — re-author to
  the new palette or default to `''` so promo rows opt into theme tokens
  (`promo-strip.tsx` is already token-driven and needs no colour change); the
  build-time cursor colour; `layout.tsx` `themeColor`.

### Contracts that must not break
- `ThemePreset` jsonb shape: `palette{base,accent,glow,ink,grainOpacity}` +
  `hero{...}` + `bannerText`. Keys never rename.
- The four authored palette keys stay the admin inputs; richer tokens derived.
- The 8 hero text fields and their fallback chain (§3).
- `grainOpacity` preservation through admin edits.
- `SUPABASE_CONFIGURED` demo-mode rendering.

---

## 12. Sequencing

| # | Phase | Contents | Gate |
|---|---|---|---|
| 1 | Theme flip | §2 values into `palette.ts`/globals/tests/seeds/admin fallbacks/cursor; `bidri`→`dusk` rename; header re-token pass; footer wrapped in `data-register="dusk"` | contrast suite green; colour audit not regressed; rose & cream verified by route walkthrough: home, shop, category, PDP, cart, checkout, orders, account, policies, both 404s, admin |
| 2 | Homepage | `ShopScene` (owner checkpoint), walk-in, counters, festival band, signage, story band | owner approves scene; 60 fps throttled; reduced-motion pass |
| 3a | Infra | Vercel hosting + CI/`deploy.md` rewrite + `prepare-export` removal; fresh Supabase (migrations in documented order) + catalogue seed + `products-read.ts`; Medusa scaffold deletion; Vercel env configuration | Vercel deploy serves the DB-backed catalogue; demo mode still renders without env vars |
| 3b | Payments | §10 items 3–12 | real ₹1 test-mode payment end-to-end; duplicate webhook idempotent |
| 4 | Inner pages — three independent task groups, executable in any order | **4a** shop counters/chips · **4b** festivals countdown/year-line · **4c** corporate split/opener + builder-flag decision | link-check + mobile pass per group |
| 5 | Sign-in & accounts | `AuthSheet`, OTP, `/account`, `/orders` redirect, guest-order linking (policy from §10.2 ∆) | guest order visible after OTP sign-in with same email |
| 6 | Polish | Stores/About refresh, cleanup, full QA sweep | build+typecheck+tests green; success criteria below |

Each phase lands as its own reviewable commit series on this branch (or a
successor branch), demo-able at its gate.

---

## 13. Success criteria

| Criterion | Target |
|---|---|
| Anjeer & Pista hexes (`#5E2757`, `#3E1938`, `#C9D99C`, `#8FA85C`, `#4F6024`, `#EDEFDD`, `#C6A8BE`) outside git history | **0** |
| Contrast: every pair in `palette.test.ts` (both registers) | **≥ 4.5:1 text, ≥ 3:1 UI** |
| Colour-audit ratchet (distinct hexes outside `palette.ts`/`contrast.ts`, the audit's EXEMPT list) | **≤ current budget** |
| Hero above-fold destinations / product photography | **2 / none** |
| Scene frame rate, mid-range mobile (4× CPU throttle) | **~60 fps, no long tasks > 100 ms from the scene** |
| Reduced-motion: all scroll effects | **static fallbacks** |
| Test-mode payment | **create-order → widget → verify → webhook → `paid` row, idempotent on replay** |
| Client-sent price fields in checkout requests | **0** |
| Guest order → OTP sign-in (same email) → order visible | **yes** |
| Customer password surfaces | **0 (admin login only)** |
| `pnpm build` + `typecheck` + all tests + `link-check` | **green** |

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Rose ≈ Bombay Sweet Shop wine (3° hue distance) | Owner's informed decision, recorded in §1. Differentiation carried by the shop-at-dusk identity, marigold register and motifs — not hue alone. |
| Illustrated scene reads cheap | Built in isolation; owner checkpoint gates phase 2. Fallback: static dusk gradient + type-led hero, which the scene degrades to under reduced-motion anyway. |
| Scroll-zoom jank on low-end phones | Mobile gets no scroll-zoom; scene simplifies; compositor-only properties; measured gate. |
| Homepage removes sections admin CMS may reference | Verified already (§4): the hero is the only storefront `site_content` consumer and is retained; the promo strip reads the `promotions` table and mounts in `layout.tsx`. No admin feed is severed. |
| Payment path stalls waiting on owner env keys | Phases 1–2 proceed independently (interleave chosen partly for this); §10 lists exact keys needed at phase 3a. |
| Fresh Supabase drift from SQL files | `SETUP_ALL.sql` + migrations applied in documented order; seeding scripted (`seed-catalogue.mjs`), not manual. |
| Vercel migration breaks the Pages deploy workflow | Old workflow removed in the same commit that documents the new one; `deploy.md` rewritten. |

---

## 15. Non-goals

- New product photography (the design deliberately needs none).
- Admin dashboard layout/IA (it re-tokens for free; nothing else).
- Phone OTP (flag stays off until MSG91/DLT exists).
- COD, wallets besides what Razorpay Checkout bundles, or international pricing.
- Commissioned illustration or custom type.
- Copywriting beyond the structures specified here.
- Admin editability for the corporate stats numbers (§7).
- Runtime feature flags (build-time only, as today).
