## 1. Phase 1 — Walkthrough fixes (no backend dependency)

- [x] 1.1 Refactor `/corporate` page palette away from full-bleed dark-orange to warm-cream (`#fdf6ec` base, `#8a5a10` accent, `#d4a96b` glow); reserve dark-orange for CTAs and accents only
- [x] 1.2 Replace single-page corporate enquiry form with stepper (4 steps: Occasion → Quantity & Budget → Delivery & Customisation → Contact)
- [x] 1.3 Stepper autosaves to `localStorage` on each form change with a 7-day TTL key (`ravi.enquiry.draft.v1`)
- [x] 1.4 Stepper accepts `?from=builder&summary=` deep-link to pre-fill quantity / customisation step + carry the builder summary
- [x] 1.5 Submit confirmation displays a generated reference code (`ENQ-YYYY-MM-DD-XXXX`); persists submission to `ravi.enquiries.v1` (Supabase wiring follows in Phase 2)
- [x] 1.6 Rotate `<EditorialScrollBand>` frames so the five frames use distinct image sources and read as kitchen-process not single-sweet
- [x] 1.7 Add `<SweetEssencePanel>` component immediately below the hero on `/`, with three independent parallax rates (image / overlay marks / text)
- [x] 1.8 Bump `BUILDER_SCHEMA_VERSION` to 2; add `lineId` to `HamperItem`; v1→v2 migration in `parseConfig` (URL wire format unchanged; lineId synthesised on parse)
- [x] 1.9 Add variant picker sheet to the hamper builder palette — opens before the item lands in the box for multi-variant products; single-variant products skip the sheet
- [x] 1.10 Allow same-product-different-variant lines on the canvas via the variant picker; `lineId` keeps cards stable across swaps
- [x] 1.11 Add inline variant dropdown on each canvas card to swap variant in place; `layoutId` keyed on `lineId` for animation continuity
- [x] 1.12 Implement per-variant stock validation; show inline warning ("Only N hampers possible at this size") and disable submit when any line is short
- [x] 1.13 Recompute `perUnit = Σ(variant.price × line.qtyPerHamper)` live (existing `computePrice()` already supports this; `lookup` is `lineId`-agnostic)
- [x] 1.14 Verify build budget — home (183 kB) + builder (183 kB) within 185 KB First Load JS

## 2. Phase 1 — Auth + admin foundation

- [ ] 2.1 Provision Supabase project; record `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.example`
- [ ] 2.2 Add SQL migration `supabase/migrations/0001_init.sql` creating `customers`, `addresses`, `orders`, `coupons`, `coupon_redemptions`, `theme_presets`, `enquiries`, `audit_log`, `filter_taxonomy`, `store_settings` tables with RLS policies
- [ ] 2.3 Add `customers` schema check constraints for GSTIN regex and pincode regex
- [ ] 2.4 Add unique partial index on `theme_presets(active) WHERE active = true`
- [ ] 2.5 Install `@supabase/supabase-js` (and `@supabase/ssr` if a tiny SSR boundary is needed for admin only); export a typed client from `packages/shared/src/auth/client.ts`
- [ ] 2.6 Build `<SupabaseProvider>` and a `useSession()` hook; wire into root layout under existing `<CartProvider>`
- [ ] 2.7 Anonymous-then-claim: on first client render, call `supabase.auth.signInAnonymously()` if no session; store JWT in `localStorage` with the existing key namespace
- [ ] 2.8 Build `<AuthModal>` with email-OTP and email/password tabs (phone-OTP gated behind `NEXT_PUBLIC_PHONE_OTP_ENABLED`)
- [ ] 2.9 Wire `<AuthModal>` to checkout — anonymous users see it before order commit
- [ ] 2.10 Build `(admin)` route group with `<AdminLayout>` (sidebar nav + topbar + breadcrumbs); skin with brand tokens
- [ ] 2.11 Implement admin login at `/admin/login` (email + password + TOTP MFA enrolment on first login)
- [ ] 2.12 Implement admin role gate — middleware reads JWT, redirects non-admins to `/admin/login` or 404 depending on session state
- [ ] 2.13 Build `/admin` Dashboard skeleton with revenue cards (today / week / month), pending fulfilment count, low-stock card, top SKUs card; data sourced from existing localStorage demo orders for the v1 cut
- [ ] 2.14 Build `/admin/orders` list + detail drawer; status transition buttons; audit log on writes
- [ ] 2.15 Build `/admin/products` list + editor (all fields per spec); image upload via Supabase Storage
- [ ] 2.16 Build `/admin/inventory` table with inline stock editing
- [ ] 2.17 Build `/admin/themes` with preset list, palette editor, hero copy editor, "Activate" button
- [ ] 2.18 Build `/admin/customers` list + detail (read-only initially)
- [ ] 2.19 Build `/admin/enquiries` list (corporate enquiry submissions) + status transitions
- [ ] 2.20 Build `/admin/settings` for store hours, delivery zones, owner profile

## 3. Phase 2 — Coupon engine

- [ ] 3.1 SQL migration adding `coupons` and `coupon_redemptions` tables (already in 0001 — verify columns match the spec)
- [ ] 3.2 Implement `validateCoupon(cart, customer, code)` in `packages/shared/src/coupons/validate.ts` honouring the fail-fast order from the spec
- [ ] 3.3 Add `<CouponInput>` to the cart drawer + `/cart` + checkout with live preview, success state showing strike-through + delta saved, specific error messages including subtotal-delta on min-subtotal failure
- [ ] 3.4 Implement available-coupons chip row above the input for logged-in customers (≤ 3 codes)
- [ ] 3.5 Implement Supabase RPC `commit_order_with_coupon` that re-runs validation server-side and rejects on mismatch
- [x] 3.6 Implement `coupon_redemptions` write on order commit; mark `reversed_at` on cancel (write done client-side; reversal on cancel pending the admin order-cancel transition handler)
- [ ] 3.7 Rate-limit coupon submission to 10/min per IP via Supabase Edge Function (or Postgres function with `pg_throttle` if Edge unavailable on free tier)
- [ ] 3.8 Build `/admin/coupons` list + create/edit form with all fields per the spec
- [ ] 3.9 Add the four reference Indian D2C festival presets as admin "templates" (FIRSTDIWALI, DIWALI500, FREESHIP99, HAMPER10) so the brand can clone-and-edit
- [ ] 3.10 Tests: validator unit tests covering each of the 9 fail-fast steps + stackability matrix

## 4. Phase 2 — Theme presets + CMS-managed content

- [ ] 4.1 Implement `loadActiveTheme()` server helper that reads from Supabase at build time
- [ ] 4.2 Wire build-time fetch into `app/layout.tsx`, `hero-still.tsx`, `signature-moment.meta.ts`, and `editorial-scroll-band.tsx` to consume admin-managed copy + palette
- [ ] 4.3 Add Supabase webhook → GitHub Actions deploy workflow (`.github/workflows/storefront-rebuild.yml`)
- [ ] 4.4 Add 5-minute coalesce window for webhook bursts (Supabase Edge Function)
- [ ] 4.5 Add "Publish now" button in admin that bypasses the coalesce window
- [ ] 4.6 Implement `?preview=1` query param — when present and JWT has admin role, fetch live content from Supabase at runtime (the only dynamic boundary on the storefront)
- [ ] 4.7 Migrate hero copy + signature moment copy + editorial band copy into `theme_presets` JSONB column
- [ ] 4.8 Migrate filter taxonomy from `shop-view.tsx` constants to `filter_taxonomy` table; verify `/shop` still renders correct facets after rebuild
- [ ] 4.9 Migrate store hours and delivery zones from `stores/page.tsx` constants to `store_settings` table

## 5. Phase 2 — Phone OTP via MSG91

- [ ] 5.1 Register DLT sender ID + OTP template with one of the Indian DLT portals (Vodafone Idea / Vi or Airtel)
- [ ] 5.2 Configure MSG91 as the Supabase Auth phone provider in the dashboard
- [ ] 5.3 Toggle `NEXT_PUBLIC_PHONE_OTP_ENABLED=true` once DLT clears (this can land independently)
- [ ] 5.4 `<AuthModal>` exposes a Phone tab with `+91` prefix locked, autofocus, `autocomplete="one-time-code"` for Web OTP API
- [ ] 5.5 Resend timer at 30s, max 3 attempts before showing fallback to email-OTP
- [ ] 5.6 Show last 2 digits of phone on OTP screen ("OTP sent to +91 XXXXXX**42**")
- [ ] 5.7 Test on Android Chrome that the OTP auto-fills from SMS

## 6. Phase 2 — DPDP compliance

- [ ] 6.1 Update `/policies/privacy` to be DPDP-compliant (data categories, purposes, retention, contact for DPO)
- [ ] 6.2 Add Telugu translation of the privacy notice (toggle on `/policies/privacy?lang=te`)
- [ ] 6.3 Split marketing consent from T&C as a separate unchecked checkbox at signup
- [ ] 6.4 Add age-gate at signup (DOB or 18+ confirmation; reject under-18)
- [ ] 6.5 Build `/account/settings` "Delete my account" flow: confirmation, anonymise orders, delete addresses, delete auth user, audit log entry
- [ ] 6.6 Add a 7-year retention rule on `orders` (cron job that anonymises orders older than 7 years rather than deleting)

## 7. Phase 3 — Catalogue federation prep

- [ ] 7.1 Migrate `packages/shared/src/catalogue/products.ts` static array to a Supabase `products` table (keep the .ts module as a generated typed export from a build script for now)
- [ ] 7.2 Build script `scripts/generate-catalogue.ts` that fetches products from Supabase and writes a typed module the storefront can import unchanged
- [ ] 7.3 Replace product CRUD in `/admin/products` to write to Supabase (currently mock); rebuild webhook fires on save
- [ ] 7.4 Document the Medusa federation path — when Medusa lands, customer/auth stays on Supabase, catalogue moves to Medusa, orders move to Medusa, coupons move to Medusa Discounts
- [ ] 7.5 Leave a `MIGRATION-TO-MEDUSA.md` runbook with concrete steps + dependencies

## 8. Verification

- [ ] 8.1 Typecheck (`pnpm -r typecheck`) clean across all workspaces
- [ ] 8.2 Production build green; storefront First Load JS ≤ 185 KB on home + builder; admin chunks lazy-loaded so they don't bloat the public bundle
- [ ] 8.3 Static-export build green (`BUILD_TARGET=github-pages`) — admin routes still build but live behind a runtime auth gate
- [ ] 8.4 Coupon validator unit tests pass (9 fail-fast steps + stackability)
- [ ] 8.5 Auth flow tested manually: anonymous → cart → checkout → email-OTP → linked customer; orders persist
- [ ] 8.6 Admin smoke test: create product, edit price, switch theme, see rebuild fire, see new content live within 90 seconds
- [ ] 8.7 Hamper builder smoke test: add same product in 250g and 500g, swap one variant, verify per-unit recomputes, verify v1 URL still parses
- [ ] 8.8 Corporate enquiry smoke test: complete 4-step stepper, refresh mid-flow to verify autosave, submit and see ref code, see entry in `/admin/enquiries`
- [ ] 8.9 DPDP smoke test: signup with marketing-consent unchecked → verify no marketing email; trigger right-to-delete → verify cascade
- [ ] 8.10 Reconcile OpenSpec checkboxes; run `openspec validate add-admin-auth-coupons-and-builder-depth --strict`
- [ ] 8.11 Update root memory with the Khammam-context + Supabase-as-v1-spine decisions for future conversations
