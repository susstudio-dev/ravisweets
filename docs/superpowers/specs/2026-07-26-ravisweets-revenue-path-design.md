# Ravi Sweets · Revenue Path Design

> How the storefront goes from a polished demo to a store that collects money and
> fulfils orders with minimal human touch — and what the audit found on the way.
>
> **Date:** 2026-07-26
> **Repo state at audit:** `35aa118` (2026-05-23), 43 commits
> **Engagement:** active, paid. Client is waiting on delivery.
> **Deadline that matters:** Diwali 2026 (≈ 8 Nov) — ~15 weeks from this date
> **Read order:** §1 Situation → §2 Audit findings → §3 Decisions → §4–7 Design → §8 Rollout → §9 Out of scope

---

## 1 · Situation

Ravi Sweets (Khammam, est. 1985; Kondapur branch; ravisweets.com) has a
substantially built Next.js + Supabase storefront: 80+ products, 10 festival
editions, 3 store locations, a gift-hamper builder, coupons, promotions,
swappable themes, Supabase auth, and an admin shell with 11 routes.

**It cannot accept a single rupee.**

Everything in the 12-month growth playbook — paid ads, NRI gifting, corporate
B2B, the Diwali push — sits downstream of a checkout that does not work. Diwali
alone is 30–35% of annual revenue in this category, so the ~15 weeks between now
and then decide whether this project earns anything in 2026.

### 1.1 Why this project, over the alternatives

Considered and set aside:

| Project | Why not now |
|---|---|
| **metaways** (AI poultry triage) | Own product, pre-pilot, no buyer. B2B sales cycle of 3–6 months before first revenue. |
| **Autom8** | Productizable, but no client waiting and no offer defined. |
| **10to10 / furor-web** | Not assessed as revenue-ready in this pass. |
| **New build in `money/`** | Empty folder. Slowest possible route to revenue. |

Ravi Sweets wins on one criterion that outranks the rest: **a client who already
knows you, already has budget, and is currently waiting.** The work is built; it
is not sold, because it cannot transact.

### 1.2 Market context (from `GROWTH_PLAN.md`, 2026-05-04)

Retained here because it justifies the sequencing, not as new research:

- Indian sweets/mithai: **₹54,000 Cr (~$6.5B)**, 12–14% CAGR
- ~85% unorganised; the organised ~15% is the only double-digit-growing segment
- D2C is ~22% of the organised tier, growing ~30% YoY
- Quick-commerce (Zepto/Instamart/Blinkit) takes **25–30% margin** and reduces the
  brand to a thumbnail → owned checkout is a margin decision, not just a brand one
- **₹800–₹3,000 hamper/gifting band is the fastest-growing price point**
- NRI diaspora >32M; ~$400M annual festival gifting flow; no credible
  send-from-Khammam-to-Khammam option exists
- **Diwali is 30–35% of annual revenue**

The strategic conclusion that drives this spec: *owned checkout captures the
margin that quick-commerce takes, and the gifting band is where the money is —
but only if the checkout works before the festival window.*

---

## 2 · Audit findings

All findings below were verified against the repo on 2026-07-26.

### 2.1 Blocker: checkout is simulated

[`checkout-flow.tsx:113`](../../../apps/storefront/src/components/checkout/checkout-flow.tsx#L113)

```ts
// Simulated payment latency — real Razorpay/Stripe flow replaces this.
payment: { method: payment, reference: `sim_${number}` },
```

Orders are written under a demo identity with `sim_` payment references. The
3-step flow (address → payment → review) and the UI are complete; the transaction
is not.

### 2.2 Blocker: add-to-cart is also simulated

[`add-to-cart.tsx:23-24`](../../../apps/storefront/src/components/product/add-to-cart.tsx#L23-L24)

```ts
 * No real cart wiring yet — simulates the network call so the animation can be reviewed.
 * Replace simulateAdd() with a real API call once the Medusa backend is wired.
```

**Two simulated paths, not one.** This was not in the May proposal's blocker list
and is an addition to scope.

### 2.3 Blocker: the deploy target makes payments architecturally impossible

[`next.config.mjs`](../../../apps/storefront/next.config.mjs) — with
`BUILD_TARGET=github-pages`:

```js
output: 'export',
trailingSlash: true,
images: { unoptimized: true, ... }
```

- **Zero API routes exist** in `apps/storefront/src/app` (no `route.ts` anywhere)
- A static bundle cannot hold `RAZORPAY_KEY_SECRET`, cannot create a Razorpay
  order server-side, and cannot verify an HMAC signature

Consequence: shipping payments on the current deploy target would mean trusting
client-reported payment success — i.e. handing an attacker the ability to forge
paid orders. **Payments require a server. There is no server.**

- `images.unoptimized` also disables Next's image optimiser, so real OG images
  are unavailable — which the ad creative and NRI gifting shares depend on.

### 2.4 Finding: Medusa is dead weight, not a foundation

[`apps/backend/package.json`](../../../apps/backend/package.json) — Medusa v2
(`2.4.0`), 5 dependencies, **no `src/` directory**, never run. The storefront's
only reference to it is the comment in §2.2.

Meanwhile Supabase is carrying the entire product: 10 migrations, RLS policies,
auth, and 2 Edge Functions. **Supabase is the real backend and it works.**

Standing Medusa up would mean re-modelling 80+ products, rebuilding existing RLS,
and running two sources of truth through the highest-revenue quarter of the year.

### 2.5 Finding: the anon key is burned

The deployed site has been served from a **public** GitHub Pages repo with the
Supabase anon key in the bundle. RLS made this survivable while there was no real
data. It stops being survivable when orders contain addresses, phone numbers and
payment records.

Going private does **not** fix this — git history retains the key and it should be
assumed already scraped. **Rotation is mandatory, not optional.**

### 2.6 Finding: money-handling has a bug history

From `git log`:

- `fix(shared): generated catalogue prices were 100× too high`
- `fix(coupons): demo coupons + cart wiring (paise/rupee mismatch + empty items)`

Same bug class, twice. Currently these are cosmetic. With live cards they become
chargeback-grade incidents. This directly motivates the paise-everywhere rule in
§5.2 and the test concentration in §7.

### 2.7 Finding: promotions/coupons are client-reachable

`feat(supabase): wire promotions to backend (was localStorage-only)` moved
promotions server-side, but coupon *validation and redemption limits* are still
evaluated where the client can reach them. Forgeable the moment money is real.

### 2.8 Finding: duplicate migration number

`supabase/migrations/` contains **two `0002_` files**:

- `0002_content_reviews_festivals.sql`
- `0002_product_unit_mode.sql`

Apply order is therefore ambiguous and depends on tooling collation. Low severity
today, but it needs resolving before more migrations land on top.

### 2.9 Current inventory

| Layer | State |
|---|---|
| `apps/storefront` | Next.js, feature-rich, static-exported. Working except cart + checkout. |
| `apps/backend` | Medusa v2 scaffold. Unused. |
| `packages/shared`, `packages/ui` | In use, transpiled by the storefront. |
| `supabase/migrations` | `0001`–`0009` (10 files, dup `0002`). RLS, auth, team mgmt, support threads, palettes, promotions. |
| `supabase/functions` | `send-order-email`, `team-management`. |
| Admin | 11 routes. [`admin-orders.tsx`](../../../apps/storefront/src/components/admin/admin-orders.tsx) reads `use-demo-orders`. |
| Uncommitted at audit | `M hero-still.tsx`, `?? package-lock.json` |

### 2.10 External dependencies — all clear

The May proposal listed 7 items needing the founder. Confirmed resolved:
Razorpay account/KYB, transactional email approval, product photography, and
store address + Google Business Profile. *(Asserted by the engagement owner, not
independently verified in this pass.)*

**Nothing external is blocking. The only thing between Ravi Sweets and a working
checkout is the build.**

---

## 3 · Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Drive **Ravi Sweets** to revenue; other projects paused | Only project with a paying client already waiting (§1.1) |
| D2 | **Platform hardening first**, then payments | Static export cannot do payments at all (§2.3); public-repo key exposure (§2.5); ISR/OG needed for the SEO + ad plan |
| D3 | **Delete Medusa.** Supabase is the backend | §2.4 |
| D4 | Migrate to **Vercel**, private repo | Enables Route Handlers, secret management, ISR, image optimisation |
| D5 | **Razorpay only** for v1 — no COD | Narrower surface; COD needs phone-OTP + pincode allowlist. Remove the COD option from the UI so it isn't promised. |
| D6 | **Both** ops dashboard and touchless WhatsApp | Founder lives on WhatsApp; staff can work a screen |
| D7 | **Meta WhatsApp Cloud API** direct, not a BSP | ~₹0.10–0.15/utility conversation vs BSP markup; Meta Business already needed for Instagram |
| D8 | Abandoned-cart recovery **deferred** past Diwali | Marketing template class — separate opt-in, stricter review, not on the path to a working store |
| D9 | Payments pulled **as early as hardening allows** (~wk 7), not last | Hedge against the migration consuming the Diwali window |

### 3.1 Accepted risk on D2

Choosing hardening first means the store takes ₹0 for roughly the first 7 weeks,
and the Diwali date does not move. This was raised and accepted by the engagement
owner. §8 sequences payments as early as the migration permits to limit the
exposure.

---

## 4 · Target architecture

Changes **where code runs**, not what the site does. The storefront should look
identical the day the migration lands.

| | Today | Target |
|---|---|---|
| Hosting | GH Pages, `output: 'export'`, public repo | Vercel, SSR + ISR, private repo |
| Server code | Impossible | Next Route Handlers + Supabase Edge Functions |
| Data | Supabase | Unchanged |
| Commerce engine | Medusa scaffold | Deleted |
| Secrets | Anon key public | Rotated; server keys in Vercel env only |

**Where server logic lives** — one rule, to stop this sprawling:

- **Vercel Route Handlers** — synchronous, user-facing, needs app types:
  create Razorpay order, verify signature, payment webhook, stock check.
  Co-located with the app, shares `packages/shared`, secrets never reach the client.
- **Supabase Edge Functions** — asynchronous, DB-triggered, fire-and-forget:
  receipt email, WhatsApp dispatch. `send-order-email` already establishes this pattern.

---

## 5 · Payment + order pipeline

Two rules drive the design: **the client never states a price, and the webhook is
the authority.**

### 5.1 Flow

```
CLIENT                      VERCEL ROUTE HANDLER              RAZORPAY
  cart ──────────────────▶  POST /api/checkout/create-order
                            · re-price cart from DB
                            · validate coupons server-side
                            · insert order → pending_payment
                            · create RP order ──────────────▶ returns rp_order_id
  open RP checkout ◀────────  { rp_order_id, amount_paise }
  pay ─────────────────────────────────────────────────────▶ captures
  ◀── payment_id + signature
  POST /api/checkout/verify ─▶ HMAC(order_id|payment_id) ✓
                              order → paid (optimistic UX)

                            POST /api/webhooks/razorpay ◀──── payment.captured
                            · verify webhook signature      · payment.failed
                            · idempotent on payment_id      · refund.processed
                            · order → paid  ← AUTHORITATIVE
                            · decrement stock, emit event
```

**Why both verify and webhook.** Verify gives the customer an instant confirmation
screen. The webhook makes the order correct when they pay and immediately close
the tab — which on mobile UPI is normal behaviour, not an edge case. Verify is UX;
the webhook is truth. Both write through the same idempotent transition, keyed on
a unique constraint on `razorpay_payment_id`.

### 5.2 Money correctness rules

1. **Integer paise end to end.** One conversion, at render only. Directly motivated by §2.6.
2. **Server re-prices everything.** Client posts product IDs and quantities, nothing else. Prices, discounts, shipping and coupon eligibility computed from the DB inside the same transaction that reserves stock.
3. **Coupon redemption limits enforced server-side**, in that transaction (§2.7).
4. **Idempotency** on both verify and webhook paths.

### 5.3 Order states

```
draft → pending_payment → paid → preparing → dispatched → delivered
```

Terminal branches: `payment_failed`, `cancelled`, `refunded`.

### 5.4 Schema — `0010_orders_payments.sql`

- `orders`: `razorpay_order_id`, `razorpay_payment_id` (UNIQUE), `amount_paise`, status enum
- `payment_events`: raw webhook bodies — audit trail plus replay capability
- Stock reservation

Resolve the duplicate `0002` numbering (§2.8) before this lands.

### 5.5 Cart wiring

§2.2 found add-to-cart simulated. Real wiring is part of this pipeline, not a
separate concern: the cart becomes a server-readable structure of product IDs and
quantities only — never prices — so that `create-order` can re-price it from the
DB per §5.2. Guest carts persist client-side; authenticated carts persist to
Supabase under the existing RLS model so a customer's cart survives switching from
phone to desktop mid-purchase.

### 5.6 Reconciliation

A daily job diffing Razorpay settlements against orders marked `paid`. Any
mismatch is an unaccounted rupee, and it should surface the next morning rather
than at month end.

---

## 6 · Automation loop

**Goal: on the happy path, nobody touches anything.** Payment lands → customer
confirmed → kitchen ticketed → staff taps once at dispatch → customer notified.
The founder sees only exceptions.

### 6.1 Outbox, not direct sends

```
order state change ──┬──▶ orders table
   (one transaction) └──▶ notification_outbox
                              │
                    whatsapp-dispatch (Edge Function, drains + retries)
                              │
                    Meta WhatsApp Cloud API
```

The alternative fails in the way that costs the client: customer pays, the
WhatsApp call times out, they phone the shop asking whether their money vanished.
Outbox rows are UNIQUE on `(order_id, template)` so retries cannot double-send,
and every message sent is auditable.

### 6.2 Messages

**Customer** (utility templates): order confirmed · dispatched · delivered +
review request · **payment failed with recovery link** — the only notification
that recovers revenue rather than merely informing.

**Ops:** new-order alert to the kitchen group · daily summary (orders, revenue,
top SKUs) to the founder.

### 6.3 Schedule dependency

WhatsApp templates require Meta approval — typically 24–48h, occasionally days,
and rejections need rewording and resubmission. **Submission starts week 1**
regardless of where payments sit, or it becomes the blocker in week 14.

### 6.4 Ops dashboard

Mostly a rewiring job. [`admin-orders.tsx`](../../../apps/storefront/src/components/admin/admin-orders.tsx)
moves off `use-demo-orders` to real Supabase orders with a Realtime subscription, plus:

- queue grouped by state
- one-tap transitions that fire the corresponding template
- filters and search
- 80mm thermal kitchen-ticket print view

**Built mobile-first.** The founder lives on WhatsApp; an admin panel requiring a
laptop is one he won't use, and the dashboard is worthless if the only person
authorised to refund an order can't do it from his phone.

---

## 7 · Security & testing

### 7.1 Security

- **Rotate the Supabase anon key** (§2.5). Mandatory. Going private is insufficient.
- Service-role and Razorpay secrets in Vercel env; never in a client bundle.
- Every webhook signature-verified before it is trusted.
- RLS pass on `orders` — a customer reads only their own; reuse `is_role()` from `0006`.
- Rate limits on checkout endpoints.

### 7.2 Testing, concentrated where money is

- **Pricing engine**: table-driven unit tests in paise — coupon stacking, shipping thresholds, rounding. This is exactly where §2.6's bugs bit.
- **Webhook replay** against real Razorpay fixtures.
- **Idempotency**: same webhook delivered 3×, assert one state change.
- **Adversarial**: client posts tampered price / quantity / expired coupon → server rejects.
- **E2E**: Playwright through Razorpay test mode.
- **Reconciliation**: seeded mismatch is detected.

---

## 8 · Rollout & sequence

### 8.1 Going live in stages

1. Test mode on a Vercel preview deploy
2. Live keys, store gated — founder places one real ₹1 order end to end
3. Narrow live window: few SKUs, limited pincodes, `payment_events` watched daily
4. Full catalogue

### 8.2 The 15 weeks

| Weeks | Work |
|---|---|
| 1 | Vercel + private repo + **key rotation** + submit WhatsApp templates *(external latency — starts immediately)* |
| 2–3 | Pricing engine in paise, server re-pricing, real cart wiring, fix dup `0002` |
| 4 | Migration `0010` (orders, payments, stock reservation) |
| 5–6 | Razorpay create / verify / webhook, test-mode E2E |
| **7** | **Soft launch — first real rupee** |
| 8–10 | Outbox + WhatsApp loop, admin rewire, kitchen ticket |
| 11–12 | Reconciliation, refunds, exception handling |
| 13–15 | Diwali surface: hampers, campaigns, ad landing pages |

First real money ≈ **mid-September**, ~7 weeks before Diwali, leaving the
campaign window intact (D9).

### 8.3 This spec needs more than one implementation plan

15 weeks is too much for a single plan. Decomposition:

| Plan | Covers | Ends when |
|---|---|---|
| **Plan 1 — Transact** | Weeks 1–7 (§4, §5, §7) | A real rupee has been collected and reconciled |
| **Plan 2 — Automate** | Weeks 8–12 (§6) | Happy path runs without human touch |
| **Plan 3 — Diwali** | Weeks 13–15 | Campaign surface live |

Plan 1 is the only one written now. Plans 2 and 3 are drafted after Plan 1 lands,
so they can absorb what the soft launch teaches — real order volume and real
failure modes will change the automation design in ways worth waiting for.

---

## 9 · Out of scope for v1

Explicitly deferred — YAGNI until the store transacts:

- COD (D5) · abandoned-cart recovery (D8) · Medusa in any form (D3)
- Kitchen-cam / fresh-now widget (proposal §6 open item)
- Corporate B2B LinkedIn outreach pages — revisit weeks 13–15
- Quick-commerce channel integrations
- The Vault 10 limited-edition drop mechanics
- NRI international shipping logistics (the *gifting UI* is in scope for weeks 13–15; freight is not)

---

## 10 · Open items

1. **Confirm the Diwali date against the Telugu calendar.** ≈ 8 Nov 2026 is used
   throughout; regional Deepavali observance varies and a Khammam brand should
   sequence to the local date. Every date in §8.2 shifts with it.
2. **Resolve duplicate `0002` migration** before `0010` lands (§2.8).
3. **Commit or discard** the working-tree changes found at audit (§2.9).
4. **Verify §2.10 items firsthand** — Razorpay KYB status, email provider account,
   photography asset delivery — before the weeks that depend on them.
5. **Confirm the review-request link target** for the delivered template — Google
   Business Profile review URL is the highest-value destination given the local-SEO plan.
