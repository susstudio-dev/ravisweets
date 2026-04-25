## Context

Ravi Sweets ships today as a Next.js 15 App Router static export deployed to GitHub Pages. The catalogue (24 SKUs) is a TypeScript module compiled into the bundle; orders are seeded into `localStorage`; the "account" page is read-only; the corporate enquiry form is a single non-validated page; and the brand has no admin tooling. A separate `add-medusa-backend` change is queued but not yet implemented — Medusa core, Postgres, Redis, and the deploy story for them are weeks of work and gate the storefront's payment + fulfilment flows.

This design lands the **operating layer** the brand needs to actually run business — admin, customer auth, coupons, content management — *before* Medusa, by leaning on Supabase as a v1 spine that the storefront can talk to entirely from the client. When Medusa lands, we federate (Medusa accepts Supabase JWTs) and migrate orders + catalogue out of Supabase incrementally without breaking the auth contract.

Stakeholders: brand owner (uses admin daily), shop staff (fulfilment queue), customers (login + coupons), and the engineering team (clean migration path to Medusa).

## Goals / Non-Goals

**Goals:**
- A skinned, role-gated admin panel under `(admin)` that the brand owner can use to add/edit sweets, view and progress orders, see live revenue / inventory / top SKUs, manage coupons and themes, all without engineering involvement.
- Anonymous-then-claim customer auth so browsing and cart never require login but checkout does, with phone-OTP as the primary method (DLT-compliant via MSG91) and email/password fallback.
- A coupon engine that supports the patterns Indian D2C brands actually run (festival flat-off, first-order percent-off, free-shipping-above, hamper-only, max-discount-cap, per-user-once).
- Per-variant depth in the hamper builder so the same product can sit in multiple weights inside one box, priced as the sum of variant prices, validated against per-variant stock.
- A clear migration arc from "Supabase-only v1" to "Medusa + Supabase federated v2" without re-doing the storefront UI.
- Static-export compatibility preserved — admin saves trigger a webhook that rebuilds the storefront with fresh content. No dynamic SSR is introduced into the public storefront.
- DPDP Act 2023 hygiene baked in from day one: explicit consent, right-to-delete, retention rules.

**Non-Goals:**
- A full Medusa admin replacement — we ship a **thin** admin focused on the brand's daily flows. Medusa Admin remains the v3 path if depth grows.
- Real-time inventory or live order tracking — admin polls / refreshes; live websocket UX is post-launch.
- Multi-language storefront — only the privacy notice ships in English + Telugu (DPDP requirement); rest is English-only.
- Multi-currency / international payments — INR only at this stage; international shipping remains gated.
- Server-side rendering of customer-specific content on the public storefront — auth state is hydrated client-side; SEO surfaces stay statically rendered.
- Replacing the in-bundle catalogue overnight — content management lands incrementally, starting with hero copy and festival theme presets, then adds product fields once Medusa or Supabase becomes the source of truth.

## Decisions

### Decision 1: Auth provider — Supabase Auth (not Clerk, not NextAuth, not Firebase)

**Choice:** Supabase Auth with anonymous-then-claim flow, MSG91 as the SMS provider for phone-OTP, hosted Supabase on the free tier for v1.

**Why:**
- 100% client-SDK compatible — no API routes, preserves static export.
- Anonymous sessions return real `auth.users` rows; `linkIdentity` upgrades the same UUID to a permanent record at checkout, so the cart and any pre-login activity carry over without migration code.
- RLS on Postgres enforces per-user data without writing a backend; lets us ship customer + coupon + order tables on day one.
- Pluggable phone providers — bring our own MSG91 sender (DLT-registered), control template approvals, and pay India SMS prices (~₹0.15/SMS).
- Migrates cleanly onto Medusa (Medusa v2 accepts external JWTs) — at federation, the admin and storefront keep the same Supabase login, Medusa just becomes the catalogue + payment authority.

**Alternatives considered:**
- *Clerk* — beautiful DX but routes phone-OTP through their SMS provider with no DLT control; expensive past the free tier; less natural anonymous flow.
- *NextAuth/Auth.js v5* — needs API routes; static export blocks this; would require a parallel Vercel/Cloudflare Worker for callbacks.
- *Firebase Auth* — strong India phone-OTP but ~80KB SDK and Firestore lock-in; no SQL/RLS story.
- *Better Auth* — server-only, blocked by static export.

**Trade-off:** Supabase becomes a v1 dependency that we then have to coexist with Medusa. We accept this — federation is a documented Medusa pattern and the alternative is shipping the brand without auth for months while we wait for Medusa.

### Decision 2: Admin shell — bespoke thin admin under `(admin)` route group, not Medusa Admin, not Payload

**Choice:** Build a Next.js App Router admin under `apps/storefront/src/app/(admin)/**`, gated by Supabase JWT custom claim `role: 'admin'`, using shadcn/ui style + Tailwind + `react-hook-form` + `zod`. Six sections: Dashboard, Orders, Products, Inventory, Coupons, Themes, Customers, Settings.

**Why:**
- Skinning Medusa Admin or adopting Payload is wasted effort while the data model is still in flux. We control every screen and can iterate on the brand owner's actual workflow.
- Sharing the storefront's component library and theme tokens means the admin already feels brand-native.
- Co-located with the storefront repo — single deploy pipeline, no extra infra.
- When the brand outgrows the thin admin (likely at 100+ SKUs or multiple kitchens), Medusa Admin becomes the v3 jump.

**Alternatives considered:**
- *Medusa Admin (skinned)* — gives 90% of features for free but assumes Medusa is the backend, which we don't have yet. Adopting it now means waiting for Medusa first.
- *Payload CMS / Strapi* — would duplicate Medusa's planned commerce primitives; the admin would have to be retired when Medusa lands.
- *Cal.com / dub.co pattern* (Next.js + Prisma + tRPC) — closest reference; we adopt its IA but use Supabase RLS instead of tRPC since we have no API layer.

**Trade-off:** We will rebuild the thin admin once Medusa lands (estimated 1-2 weeks of engineering). Worth it to ship operating capability now rather than in 3 months.

### Decision 3: Static-export compatibility via build-time content fetch + webhook rebuilds

**Choice:** The storefront stays a pure static export. Admin-managed content (hero copy, theme presets, product overrides) is fetched from Supabase at build time and baked into the bundle. On admin save, Supabase fires a webhook that triggers a GitHub Actions deploy. Build is targeted at <2 minutes.

**Why:**
- Preserves SEO and Pagespeed advantages of static export.
- No dynamic boundary to manage on the public storefront.
- Two-minute build cadence is acceptable for content edits (matching Shopify's typical "publish takes a few minutes" mental model).

**Alternatives considered:**
- *ISR (Incremental Static Regeneration)* — requires a Next.js host (Vercel) and abandons GitHub Pages.
- *Client-side fetch on every page load* — defeats the static-export performance story; introduces an API dependency we don't have.
- *Edge functions for live content* — adds Cloudflare Workers as a new infrastructure piece for marginal gain.

**Trade-off:** Content edits are not live-instant. Acceptable for a brand at this scale; we surface a "publishing... ETA 90 seconds" toast in the admin so it's expected.

### Decision 4: Coupon validation order is server-authoritative; client validation is preview-only

**Choice:** A `validateCoupon(cart, customer, code)` function lives in `packages/shared/src/coupons/validate.ts`. The cart UI calls it client-side for live preview, and the order-create path re-runs it server-side (Supabase RPC v1; Medusa cart calculation v2) before allowing the order to commit. Client cannot grant a discount without the server agreeing.

**Why:** Trusting the client is a known D2C exploit vector (manipulated coupon stacking, expired codes replayed). The duplicate validation is cheap.

**Validation order** (cheapest first, fail fast):
1. Code exists + active
2. Date window
3. Region match
4. Customer eligibility (logged-in / segment / first-order)
5. Cart eligibility (target intersects cart)
6. Min subtotal (post-line-discount, pre-shipping)
7. Per-user usage cap (Supabase `coupon_redemptions` table)
8. Global usage cap
9. Stackability check vs already-applied codes — non-stackable rejects lower-priority

### Decision 5: Builder schema v2 — `HamperItem` carries `lineId` + `variantId`; same product can occupy multiple lines

**Choice:** Bump `BUILDER_SCHEMA_VERSION` from 1 to 2. New shape:

```ts
type HamperItem = {
  lineId: string;          // unique per canvas card; survives swaps
  productId: string;
  variantId: string;       // REQUIRED — variant picker is mandatory
  qtyPerHamper: number;    // 1..10 (unchanged)
};
```

`BUILDER_SCHEMA_VERSION = 2`. The serialiser writes `v=2`. The parser keeps a v1→v2 migration: every v1 item gets a generated `lineId`, and `variantId` is populated from the existing serialiser field (already required in v1, so this is just renaming-with-id-add).

**Why:** Without `lineId`, two same-product/different-variant rows collide in `useState` keys and AnimatePresence layoutIds. The `lineId` makes the canvas card stable across variant swaps.

**Migration:** v1 URLs continue to work — `parseConfig` detects `v=1` and synthesises `lineId = ${productId}_${variantId}`. v2 URLs are produced by every new save.

### Decision 6: Theme presets as JSON in Supabase, baked at build

**Choice:** A `theme_presets` table with `{ id, name, palette: { base, accent, glow, ink, grainOpacity }, hero_copy, hero_image_url, banner_text, active: bool }`. The admin edits this; one preset is `active: true` at a time. Build reads the active preset and writes it to a top-level constants module. Storefront consumes via existing `<ThemeVars>`.

**Why:** Lets the brand owner switch from "default" to "diwali" to "eid" with a click + a 90-second rebuild — without engineering. Fits the constraint that the storefront stays static.

**Trade-off:** A theme switch is not instant; staff need to plan the switch ~2 minutes before the campaign goes live. Acceptable.

### Decision 7: Corporate page palette — warm cream + brass, away from heavy dark-orange

**Choice:** `/corporate` adopts the storefront's default warm-cream palette (`base: #fdf6ec`, `accent: #8a5a10`, `glow: #d4a96b`, `ink: #2a1a04`) and reserves dark-orange for accents only (CTAs, hover states). The current full-bleed dark-orange backdrop becomes a single accent strip.

**Why:** The walkthrough flagged the dark orange as oppressive. Aligns the page with the rest of the storefront's tone.

### Decision 8: Corporate enquiry — 4-step stepper

**Choice:** Replace the single-page `corporate-enquiry.tsx` with a stepper component identical in pattern to the hamper builder stepper:
1. **Occasion** — what's this for? (Diwali / wedding / corporate / other) + date
2. **Quantity & budget** — how many hampers, target per-unit budget, customisation needs (logo print? ribbon? message?)
3. **Delivery & customisation** — single address vs. CSV-multi, delivery window, file upload for logo
4. **Contact** — name, business, GSTIN (optional), phone, email; consent + submit

Autosave to localStorage on each step change so refreshes don't lose progress. Inline validation; visible field-level errors; clear submit confirmation with a generated reference code.

**Why:** A 4-step stepper has been validated as the right pattern for the hamper builder; replicating it makes the corporate flow consistent and breaks down the cognitive load.

### Decision 9: Editorial Scroll Band rotation — copper-pan / packing-table / hands not single-sweet

**Choice:** Replace the two duplicate-image frames (Qubani close-up appearing twice across the 5 frames) with a copper-pan-stirring frame and a packing-table frame so the band reads as the *whole* kitchen rather than a single sweet. Keep the same five-step structure (Copper / Apricots / Silver leaf / Almonds / Pack).

**Why:** Walkthrough flagged the band as feeling sweet-specific rather than kitchen-wide. The copy already supports the broader read; only the imagery and headlines need a rotation.

### Decision 10: Home "Sweet essence" panel — second parallax beat below the hero

**Choice:** A new full-bleed section between the hero and the existing signature moment, called `<SweetEssencePanel>`. Macro image of saffron strands in syrup with three motion rates: image (slow), strand SVG overlay (fast), eyebrow text (slow). Sits in its own scroll-target container so its parallax is independent of the hero.

**Why:** Walkthrough asked for "another parallax sweet image" — adding it as a distinct panel preserves the hero's role as the brand statement and gives a second cinematic beat as the user scrolls.

## Risks / Trade-offs

- **Risk:** Supabase becomes a sticky dependency we can never fully retire. → **Mitigation:** Keep all Supabase calls behind a thin `@ravisweets/shared/auth` and `@ravisweets/shared/coupons` interface so swapping for Medusa Customer + Discount modules later is a one-file change.
- **Risk:** MSG91 DLT registration takes 2–7 days; we can't ship phone-OTP day one. → **Mitigation:** Ship with email-OTP and email/password first (Supabase native, zero DLT); add phone-OTP as a follow-up once DLT lands. Document the gating in admin Settings.
- **Risk:** GitHub Actions rebuild on every admin save burns minutes / queues. → **Mitigation:** Debounce admin saves (5-minute coalesce window), display "publishing in N seconds" countdown, allow "Publish now" override.
- **Risk:** Builder schema v2 silently breaks shareable URLs from v1. → **Mitigation:** Keep the v1→v2 migration in `parseConfig`; flag any rejected URLs with the existing schema-mismatch toast; never delete v1 understanding.
- **Risk:** Admin auth weakness exposes the catalogue to vandalism. → **Mitigation:** Admin role gated in JWT *and* Postgres RLS, with Supabase MFA (TOTP) required. Audit log table records every admin write.
- **Risk:** Static-export rebuild lag means admin-saved content is stale for ~90 seconds. → **Mitigation:** Surface a "Live in 90s" toast post-save in admin; add a `?preview=1` query param that fetches live content from Supabase at runtime for admin preview.
- **Risk:** DPDP non-compliance fines (₹250 crore max). → **Mitigation:** Marketing consent split from T&C, privacy notice in EN + TE, right-to-delete endpoint shipping with v1, age-gate on signup, retention table for GST.
- **Risk:** Hamper variant depth makes the canvas overwhelming. → **Mitigation:** Variant picker sheet on add (one decision at a time); duplicate-variant warning if the same combo already exists; "Add another size" affordance is opt-in, not default.
- **Risk:** Coupon engine becomes a vector for fraud (replay attacks, brute-forcing codes). → **Mitigation:** Per-IP rate limit on coupon submission, server-side authoritative validation, codes are 6+ chars and case-insensitive, no leaking which constraint failed (single "Code not valid" error from API; specific error only for client preview).
- **Trade-off:** Choosing thin-admin v1 means we'll rebuild it when Medusa lands (estimated ~2 weeks). Acceptable to unblock daily operations now.
- **Trade-off:** Theme switches require a rebuild — not instant. Acceptable at this brand scale.

## Migration Plan

This change is delivered in three phases so the brand can start operating before all of it lands.

**Phase 1 — Foundation (week 1):**
- Supabase project provisioned; `customers`, `addresses`, `coupons`, `coupon_redemptions`, `theme_presets`, `audit_log` tables + RLS policies.
- Email OTP + email/password login wired (phone-OTP gated on DLT).
- Anonymous-then-claim flow on first visit; `(admin)` route group with role gate.
- Admin shell with Dashboard skeleton, Orders (read-only from existing localStorage demo), Settings.
- Walkthrough-fix sub-tasks land here: corporate palette, editorial band rotation, home essence panel, builder schema v2 + variant picker, corporate enquiry stepper.

**Phase 2 — Operating capability (week 2):**
- Coupon engine fully wired (admin create + cart validation + redemption tracking).
- Theme presets + active flag + storefront build hook.
- Inventory section in admin with low-stock alerts.
- Phone-OTP wired once MSG91 DLT clears.
- DPDP page in EN + TE; right-to-delete flow.

**Phase 3 — Federation prep (week 3):**
- Catalogue moves from in-bundle TypeScript module to Supabase-backed at build (still static-export-compatible).
- Webhook from Supabase → GitHub Actions for rebuild on admin save.
- Documentation for the eventual Medusa lift (this change leaves federation hooks but does not implement Medusa).

**Rollback:** Each phase ships behind a feature flag (`NEXT_PUBLIC_AUTH_ENABLED`, `NEXT_PUBLIC_COUPONS_ENABLED`, `NEXT_PUBLIC_ADMIN_ENABLED`, `NEXT_PUBLIC_CMS_ENABLED`). Disabling a flag reverts that surface to the pre-change behaviour without redeploy.

## Open Questions

- **Which charting library for the admin Dashboard?** Recommend `recharts` (already in the React ecosystem, ~30KB). Alternative: `tremor` (more polished but heavier). Decide before Phase 1 dashboard task.
- **Image upload host for admin product editor?** Supabase Storage is the obvious answer (free tier 1GB, integrates with the auth project) but we should evaluate if Cloudflare R2 or `@vercel/blob` would be cheaper at scale. Decide before Phase 2.
- **Is the brand willing to add a Vercel/Cloudflare deployment for the eventual Medusa backend, or stay GitHub-Pages-only forever?** If forever, federation requires a small dynamic host for Medusa anyway. Confirm with brand owner before Phase 3.
- **Should v1 admin support multi-user (multiple staff accounts) or single-owner only?** Single-owner is faster; multi-user is a 1-day lift adding `users` to `audit_log` and a tiny "Team" page. Default: single-owner v1, multi-user v1.5.
- **Festival theme schedule automation** — should the admin allow "activate this preset on date X automatically" (cron-like)? Marked as nice-to-have; skip in v1, revisit when the brand has a year of festival data.
