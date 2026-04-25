## Why

Ravi Sweets has shipped a polished public storefront, but the brand has no way to *operate* the business through it: there is no admin panel to add or edit sweets, no real customer accounts, no coupon engine, no inventory truth, no festival theme switching, and no analytics. Several user-facing surfaces (the dark-orange `/corporate` palette, the "Tell us what you're planning" enquiry form, the single-sweet bias of the editorial scroll band, and the missing per-variant depth in the hamper builder) also need lifts identified during the live walkthrough on 2026-04-25. This change converts Ravi Sweets from a brochure into a business and addresses the walkthrough fixes in the same arc.

## What Changes

- **Add an admin panel** at the `(admin)` route group, role-gated, with dashboard / orders / products / inventory / themes / coupons / customers / settings sections. v1 ships our own thin admin (Next.js app router + shadcn/ui style + Tailwind) that talks to the same Medusa backend the storefront will use. v2 path leaves the door open to graft Medusa Admin proper if depth needs grow.
- **Add real customer auth** via Supabase Auth: anonymous-then-claim flow on first visit, phone-OTP at checkout (MSG91 sender, DLT-registered templates, Web OTP autofill), email/password fallback for desktop. Customer record stores name, phone, email, addresses, GSTIN, dietary preferences, marketing consent.
- **Add a coupon engine**: typed coupons (percent / flat / free-shipping / BOGO), targeting (cart / collection / product / hamper), constraints (min subtotal / first-order-only / region / customer segment / category whitelist), usage caps (global + per-user), validity windows, max-discount cap on percent, stackability + priority. Cart UX with single input, inline validation, available-coupons chip row for logged-in users, specific error messages.
- **Hamper builder per-variant depth**: the same product can appear in multiple weights inside one hamper (e.g. Kaju Katli 250g AND Kaju Katli 500g as two distinct line items). Variant picker sheet on add. Per-variant stock validation against backend inventory. Live `perUnit = Σ(variant.price × qty)` recomputation. **BREAKING** for the existing builder URL schema — bump `BUILDER_SCHEMA_VERSION` and add a v1→v2 migration.
- **Refresh `/corporate` palette** away from the heavy dark-orange to a calmer warm cream + brass tone consistent with the rest of the storefront.
- **Rebuild the corporate enquiry form** ("Tell us what you're planning") into a 4-step stepper (occasion → quantity & budget → delivery & customisation → contact details) with progressive disclosure, file upload for logo, autosave to localStorage, and a clear submit confirmation.
- **Refine the `EditorialScrollBand`** ("Five small acts, every morning") so its imagery and copy span the whole kitchen rather than reading as a single-sweet showcase. Two of the five frames currently lean on the same Qubani / Kaju Katli macros — rotate to copper-pan / packing-table / kitchen-people frames.
- **Add a second parallax panel** on the home page below the hero — a "Sweet essence" full-bleed cinematic moment with its own multi-rate parallax (image, text, mark) so the landing region has two distinct parallax beats rather than one.
- **Make storefront content admin-managed**: hero copy, festival theme presets, store hours, delivery zones, filter taxonomy, product fields (title / description / price / images / stock / dietary / allergens / shelf-life) all editable from the admin without a redeploy. Storefront fetches at build (incremental rebuild on webhook) for static-export compatibility.
- **DPDP Act 2023 hygiene**: explicit marketing consent checkbox at signup (separate from T&C), privacy notice in English + Telugu, right-to-delete endpoint, 7-year order retention for GST law, age gate at 18+.

## Capabilities

### New Capabilities
- `admin-panel`: Brand-side console for managing the catalogue, orders, inventory, customers, coupons, themes, and settings. Role-gated with admin JWTs. v1 thin-admin built in-house atop the same Medusa backend.
- `customer-auth`: Anonymous-then-claim Supabase Auth, phone-OTP via MSG91 with DLT compliance, email/password fallback, customer profile with addresses + GSTIN + dietary prefs, DPDP-compliant consent + deletion.
- `coupon-engine`: Typed coupon model with targeting, constraints, usage caps, validity windows, stackability + priority; validation pipeline; cart UX with available-codes hints.
- `hamper-variant-depth`: Per-variant line items in the hamper builder, variant picker on add, per-variant stock validation, live per-unit recomputation, builder schema v2 with v1→v2 migration.
- `cms-content`: Admin-driven content for hero copy, festival theme presets, store hours, delivery zones, filter taxonomy, and product fields; storefront pulls at build time with webhook-triggered rebuilds.
- `home-second-parallax`: A second cinematic parallax panel on the home page below the hero ("Sweet essence") with three independent motion rates and its own image source.
- `corporate-page-uplift`: Refreshed `/corporate` palette (warm cream + brass) and a 4-step stepper-driven enquiry form replacing the current single-screen "Tell us what you're planning".
- `editorial-scroll-band-refresh`: Five-frame editorial band rotated so imagery and copy represent the whole kitchen, not a single sweet.

### Modified Capabilities
- (none — all behaviours above are additive new capabilities; existing storefront capabilities such as the cart, product detail, hamper builder, and corporate page are extended within the new capabilities listed)

## Impact

- **Code**: new `apps/storefront/src/app/(admin)/**`, new `packages/shared/src/auth/**`, new `packages/shared/src/coupons/**`, new `apps/admin` workspace if we split the admin out (decision in design.md), new Supabase migration files at `supabase/migrations/`, edits to `hamper-builder.tsx`, `corporate/page.tsx`, `corporate-enquiry.tsx`, `editorial-scroll-band.tsx`, new `home-essence-panel.tsx`.
- **Backend**: introduces a Supabase project (auth + Postgres) as the v1 customer + coupon store, ahead of the planned Medusa lift. When Medusa lands, customers and orders federate via JWTs (Medusa accepts Supabase-issued tokens) — see design.md for the migration path.
- **Build**: storefront switches from purely static catalogue (`packages/shared/src/catalogue/products.ts`) to a build-time fetch of admin-managed JSON; GitHub Pages deploy is triggered by a webhook on admin save. Static export still works — content is baked into the bundle.
- **Dependencies**: `@supabase/supabase-js`, `@supabase/ssr` (client-only mode), `zod` (already in repo), one charting lib for the admin dashboard (`recharts` or `tremor`), `react-hook-form` (admin forms), `@uploadthing/react` or `@vercel/blob` for image upload (admin product editor).
- **Security**: RLS policies on every Supabase table; admin role enforced both in JWT and in RLS; rate-limit on OTP requests; CSRF protection on admin actions; Sentry/PostHog wired for admin error visibility.
- **DPDP / legal**: privacy policy update, marketing consent split from T&C, age-gate at signup, right-to-delete flow that anonymises orders and removes auth records, 7-year retention table for GST.
- **Out of scope**: full payment integration (Razorpay/Stripe wiring stays gated behind the existing `add-medusa-backend` change); real production photography (still gated by photography-gating requirement); multi-language storefront (English-only at this stage; Telugu/Hindi only for the privacy notice).
