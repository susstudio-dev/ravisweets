# Security & compliance fixes — applied 2026-08-14

Remediation of the 2026-08-13 audit ([report artifact](https://claude.ai/code/artifact/23ab0a34-a5e9-4d49-adb0-b5c9029bfec5)).
Most fixes are in code and verified (`tsc` clean, `next lint` clean, static export builds). The
database + edge-function changes still need **deploying** — see "Deploy" below.

## What changed

### The checkout money hole (4 critical + 3 high — the headline)
The browser could write the order's `total`/`payment`, so a customer could pay ₹1 for anything or
mark an order "paid" without paying. Closed on three layers:

- **`supabase/migrations/0023_order_payment_integrity.sql`** (new)
  - `orders` INSERT policy now forbids a client-written paid `payment` blob (`razorpay_payment_id`
    / `paid_at`) and any status other than `placed` — a customer can create an unpaid order, nothing
    more. Payment is stamped only by the service-role edge function.
  - `coupons` taken off public read (it let anyone `select *` every code + cap). A new
    `preview_coupon(code)` SECURITY DEFINER RPC returns one coupon by exact code for live preview and
    cannot enumerate.
  - `variants` read scoped to non-archived products.
- **`supabase/functions/razorpay-order/index.ts`** — `create` now RE-PRICES the order from
  authoritative `variants.price_amount` (service role), bounds the discount to what the named coupon
  could legitimately give, floors shipping/fees at zero, charges **that** amount and writes the
  corrected breakdown back. `verify` re-fetches the payment from Razorpay and confirms it was
  captured for the expected amount before marking paid, and records the coupon redemption
  server-side (enforcing the per-user cap). Both actions now require the caller's JWT and that they
  own the order. *Honest orders re-price to the same number they already showed — only tampered ones
  change.*
- **`apps/storefront/src/lib/supabase/coupons.ts`** — `fetchCouponByCode` now calls the
  `preview_coupon` RPC instead of reading the (now-private) `coupons` table.

### Compliance
- **`supabase/functions/send-order-email/index.ts`** — removed the **fabricated FSSAI number** and
  "Since 1985" (→ 1983); the FSSAI line now prints the real number from `store_settings.owner_profile`
  and is omitted when unset.
- **`policies/[slug]/page.tsx`** — GST claims made honest ("inclusive of any applicable taxes";
  no "GST-compliant invoice for every order" promise); privacy policy refreshed (payments are live via
  Razorpay; Cloudflare Web Analytics disclosed as cookieless).
- **`footer.tsx` + `footer-compliance.tsx`** (new) — the footer FSSAI/GSTIN line now reads the admin
  "FSSAI / GSTIN line" control (previously a dead edit), falling back to an honest "pending".
- **`stores/page.tsx`** — added a **Grievance Officer** block (Consumer Protection (E-Commerce)
  Rules 2020: named officer, contact, 48h ack / 1-month resolution).
- **`composition-panel.tsx`** — added **Country of origin: India** to product listings.

### Headers (`apps/storefront/public/_headers`)
- `Permissions-Policy: payment=()` → allowlists Razorpay's checkout/API origins (it was blocking the
  Payment Request API inside Razorpay's iframe).
- `*.supabase.co` wildcards in `img-src`/`connect-src` pinned to the project host; dead
  `res.cloudinary.com` and `ravisweets.com` removed; `Cross-Origin-Opener-Policy: same-origin-allow-popups` added.

### Hardening
- Open redirect on admin login (`from` param) constrained to internal `/admin` paths.
- "Order placed" email now sends immediately for COD but only **after verified payment** for online
  orders.
- `SETUP_ALL.sql` review-photos bucket hardened to match 0010 (it was re-opening uploads to any
  authenticated/anonymous session).
- `supabase/.temp/` untracked and gitignored.
- Latent `dangerouslySetInnerHTML` in admin-strategy replaced with auto-escaped text.

## Deploy (required for the DB + edge changes to take effect)
```bash
supabase db push                      # applies 0023 (or paste it in the SQL editor)
supabase functions deploy razorpay-order
supabase functions deploy send-order-email
```
Then place ONE real test order (online + COD) on a staging key before trusting the new payment path.

## Still needs an OWNER decision (not auto-fixed)
- **Admin bundle exposure (high 7).** The whole `/admin` app — including the strategy/financials —
  ships in the public static bundle behind a client-only gate; the JS chunks are fetchable by anyone.
  The real fix is a **separate, access-controlled admin deployment** (its own Cloudflare Pages project
  behind Cloudflare Access) and moving confidential strategy content out of client code into
  admin-only DB reads. `/admin` is already `noindex`, but that only hides it from search, not from a
  determined reader. This changes the admin workflow, so it needs your call.
- **Corporate GST marketing.** The corporate pages promise "GST-compliant invoices". That's only
  truthful once you're GST-registered with a GSTIN configured, and no invoice is generated yet. Decide
  your GST-registration status; if registered, wire the GSTIN + generate the invoice; if not, soften
  these promises.

## Accepted / deferred low-risk residuals
- `store_settings.owner_profile` world-readable (finding 18) — left as-is because the site and admin
  read it; splitting public vs private fields is a follow-up.
- Order emails go to the order's own address (finding 20) — inherent to "ship to someone else".
- Supabase JWT in localStorage with `unsafe-inline` CSP (finding 21) — inherent to a keyless static
  export; the anon key is public by design and RLS is the boundary.
- Duplicate `0017_*` migration ordinal (finding 23) — renaming an applied migration is riskier than
  the ambiguity; left with a note.
- COD order totals are not yet server-recomputed (they never reach the edge function); the RLS
  identity guard limits the blast radius. Full parity needs a `commit_order` RPC for all orders.
