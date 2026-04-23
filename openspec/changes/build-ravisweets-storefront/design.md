## Context

Ravi Sweets is a Hyderabad-based traditional sweets & namkeen brand (ravisweets.com) pursuing two growth vectors simultaneously: deeper Hyderabad retail + diaspora-market expansion (US/UK/UAE) and a corporate / B2B gifting revenue line. The team is small; there is no existing engineering org we can assume; the website today is a brochure. The founder has stated two goals: a seamless swift customer experience and a deep admin with full statistics / orders / inventory / revenue visibility — without making the app heavy. Payments must work for India + international.

This design answers: what stack, what topology, what performance guarantees, what comes in Phase 1 vs. later phases, and where the biggest risks are.

**Current state**: legacy brochure site; no commerce backend; no admin; no payment integration; no analytics beyond page-level counters.

**Constraints**:
- Low-to-moderate traffic normally, with **5–10× festival spikes** (Diwali, Raksha Bandhan). The system must not fall over under spike load.
- Lean team — prefer batteries-included open-source where admin work is complex, prefer code-owned where flexibility matters.
- Cost-conscious — serverless / scale-to-zero where possible, but not at the cost of cold-start hits on customer flows.
- India-first compliance (GSTIN, FSSAI, HSN codes on invoice) and diaspora-ready (country-specific labelling, export shelf-life) on the same system.
- "Don't make the app heavy" — measured as a hard performance budget, enforced in CI.

## Goals / Non-Goals

**Goals:**
- Storefront that lands under a **strict performance budget** on mid-tier Android on 3G: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, JS shipped to the customer ≤ 180 KB gzipped for the critical route.
- Admin console that exposes every operational number the team needs (orders, inventory with shelf-life / batch, customers, revenue, statistics, audit logs) without any of that code being shipped to shoppers.
- Payments that Just Work for India (Razorpay: UPI / cards / netbanking / EMI / wallets / pay-by-link / QR / GST invoice) and for international customers (Stripe: multi-currency, 3DS, USD / GBP / AED).
- Corporate / B2B gifting as a dedicated surface, not a retrofit: MOQ, tiered pricing, multi-address delivery, custom branding, corporate invoices.
- Observability from day one so we can see what shoppers do, where they drop off, and where the system hurts.
- Multi-region readiness designed in — Phase 1 serves India, Phase 2 flips on the first diaspora market without a rewrite.
- Peak-festival resilience: design for 5–10× baseline orders/min without degrading checkout.

**Non-Goals:**
- No physical-store POS integration in Phase 1.
- No native iOS/Android apps in Phase 1 — PWA only.
- No subscription / recurring boxes in Phase 1.
- No own WMS / warehouse-management build — use Medusa inventory + shipping-provider APIs (Shiprocket for India, DHL/FedEx for international).
- No bespoke CMS — Medusa admin handles products and basic content; marketing pages use MDX checked into the storefront repo.
- No self-hosted ML/search in Phase 1 — managed search service.

## Decisions

### Decision 1: Headless commerce with Medusa.js + Next.js App Router
**Choice**: Medusa.js (open-source Node/Postgres commerce engine) as the backend and admin; Next.js (App Router, TypeScript, React Server Components) as the customer storefront.
**Why**:
- Medusa ships an admin UI that covers orders / inventory / customers / discounts / gift cards / tax / regions / reporting out of the box — deletes 60–70% of the "build a custom admin" effort the founder would otherwise own.
- Multi-region + multi-currency + multi-warehouse are native Medusa concepts; critical for Hyderabad-first → diaspora-second without a rewrite.
- Next.js App Router with RSC + ISR gives us static-fast product pages, partial hydration, and keeps JS shipped to the client small.
- Both are MIT/open-source; no per-sale platform fee; self-hostable.
**Alternatives considered**:
- **Shopify + Hydrogen** — fastest launch, huge app ecosystem, but ~2% platform fee + monthly subscription, harder corporate-gifting customisation, data lock-in. **Rejected** for long-term cost and customisation needs.
- **Saleor (Python/Django)** — similar posture, but smaller ecosystem and less India payment-plugin maturity.
- **Fully custom (Next.js + Supabase + shadcn admin)** — lightest, cheapest, but we'd rebuild orders / inventory / returns / discounts / regions. **Rejected** for time cost.
- **WooCommerce / Magento** — heavier, PHP stack the team would not want to maintain. Rejected.

### Decision 2: Postgres on Supabase or Neon (managed, scale-to-zero)
**Choice**: Postgres as the single source of truth; hosted on **Supabase** (gives us auth + storage + realtime bonuses) or **Neon** (cheaper, branching, pure DB).
**Why**: Postgres is Medusa's native DB; managed options remove ops burden; both scale to zero for low-volume nights and scale horizontally for festivals.
**Alternatives**: self-hosted Postgres on Hetzner/Railway — cheaper at high volume, costlier in ops time. Revisit when monthly DB bill > ~$200.

### Decision 3: Razorpay (India) + Stripe (international) — unified via Medusa plugins
**Choice**: Razorpay for INR / Indian methods / GST invoicing; Stripe for USD / GBP / AED / EUR and 3DS. Both registered as Medusa payment providers so the order + refund ledger is unified.
**Why**:
- Razorpay is the standard for Indian commerce: UPI / cards / netbanking / EMI / wallets / pay-by-link / QR all covered, and its invoicing module supports GST-compliant invoices with HSN / SAC codes.
- Stripe is the safe international default — multi-currency, 3DS by default, robust dispute tooling, broad country coverage for diaspora markets.
**Alternatives**:
- Only Razorpay (it does have international acquiring) — rejected because Stripe has better diaspora-country coverage and dispute tooling.
- PayU / Cashfree — fine for India, but Razorpay's GST invoicing + developer experience is stronger.
- Shopify Payments — n/a (not using Shopify).

### Decision 4: Storefront performance budget enforced in CI
**Choice**: Every PR runs Lighthouse CI + bundle-size check. CI fails if: LCP > 2.5s (mobile, simulated Slow 4G), INP > 200ms, CLS > 0.1, or customer-route JS > 180 KB gzipped.
**Why**: "don't make the app heavy" must be a hard, automated contract, not a vibe. Budgets erode silently otherwise.
**Mitigation for product imagery** (sweets are image-heavy): Cloudinary with automatic AVIF / WebP + responsive srcset + blur placeholders.

### Decision 5: Admin on a separate route + separate bundle, RBAC-gated
**Choice**: Admin lives at `/admin` (Medusa's own admin UI, optionally customised with a Next.js wrapper for reports); its JS never ships to `/` or product pages. Auth via Medusa user roles; RBAC: Owner, Manager, Ops, Finance, Viewer.
**Why**: directly serves the founder's "keep customer app light + give admin everything" requirement; role scoping is required for operational safety (ops shouldn't issue refunds; finance shouldn't change prices silently; all changes audited).

### Decision 6: Observability stack — PostHog + Sentry + structured logs
**Choice**: **PostHog** for product analytics, funnels, session replay, feature flags (self-hostable, privacy-friendly). **Sentry** for error tracking (frontend + Medusa backend). **Structured logs** emitted as JSON to stdout, shipped to a log aggregator (Axiom / Logtail). **Uptime** via BetterStack or equivalent.
**Why**: covers "logs + stats" on the admin side without us building dashboards from scratch; PostHog doubles as the feature-flag kill switch we want for festival-day risk control.
**Opt-out**: analytics / replay respects a "Do Not Track" choice in the cookie banner; PII is never pushed to PostHog events.

### Decision 7: Media on Cloudinary; search on Meilisearch (self-hostable) or Algolia (managed)
**Choice**: Cloudinary for product images (DAM + on-the-fly transforms + AVIF/WebP). Start with **Meilisearch** (self-hostable, cheap, fast) for product search; upgrade to **Algolia** if relevance/scale demands.
**Why**: offloads image optimisation (huge LCP win) and search (typo-tolerant, Indian-language-friendly) to specialists. Cheap at our scale.

### Decision 8: Transactional comms — Resend (email) + WhatsApp Business API (orders) + SMS fallback
**Choice**: Resend for email (order confirmations, shipping, invoices, marketing). **WhatsApp Business Cloud API** for order updates — Indian customers live on WhatsApp. SMS (Msg91 / Twilio) as fallback for OTPs and critical notices.
**Why**: WhatsApp delivery/read rates dwarf email in India; Resend has a modern DX and good deliverability.

### Decision 9: Hosting topology
**Choice**:
- **Storefront (Next.js)** → Vercel (edge runtime for middleware, ISR for product pages) OR Cloudflare Pages. Vercel preferred for Next.js integration; Cloudflare Pages is a fallback if bill balloons.
- **Medusa backend + admin** → Railway or Render (long-running Node). Background workers (email, webhooks) in the same fleet.
- **Postgres** → Supabase or Neon.
- **Redis** → Upstash (serverless, cheap) for Medusa queues / caches.
- **Cloudinary**, **PostHog Cloud** / self-hosted, **Sentry Cloud**, **Meilisearch** (Hetzner €5/month VM or Meilisearch Cloud).

### Decision 10: Multi-region as Medusa regions from day one
**Choice**: Set up India region in Phase 1 but build on Medusa's region abstraction so diaspora regions (US, UK, UAE) are a config+content addition in Phase 2, not a refactor. Export-safe SKU variants (longer shelf-life, different packaging) modelled as Medusa product variants tagged per region.
**Why**: the business has stated a global ambition; designing the data model around a single region now forces a painful migration later.

### Decision 11: Inventory model extended for sweets-specific concerns
**Choice**: Beyond standard stock-on-hand, we track **shelf-life** (days from manufacture), **manufactured_on** (per batch), **expiry_on** (derived), and **batch / lot id** per inventory movement. Admin surfaces near-expiry lots (≤ 7 days) and auto-blocks sale if remaining shelf-life at dispatch < declared minimum for destination (stricter thresholds for international).
**Why**: this is **food retail**; shipping near-expiry product is a brand-breaking error. International shipments need export-safe shelf-life declared on the pack and enforced at checkout.
**Mitigation**: FEFO (First-Expiry-First-Out) picking order, surfaced in admin's fulfilment queue.

### Decision 12: Peak-festival resilience strategy
**Choice**:
- Static / ISR for all non-checkout pages → CDN-served, survives any spike.
- Checkout is dynamic but rate-limited per IP + per session; queue non-critical work (emails, WhatsApp, PostHog events) via Redis-backed BullMQ so spikes don't block the hot path.
- Inventory writes protected with row-level locks; oversell tolerance = 0 for low-stock SKUs (system reserves stock at cart → checkout start).
- Pre-festival dry run: Locust / k6 load test at 10× baseline before Diwali week; scale Postgres + Medusa instances up ahead of time.
- Feature-flag kill switches (via PostHog) for non-critical features (recommendations, reviews) to shed load if needed.

### Decision 13: Phased rollout — Hyderabad-first, diaspora Phase 2
**Phase 1 (Hyderabad + rest of India, ~weeks 1–12)**: Storefront + admin + Razorpay + GST + Shiprocket shipping + corporate-gifting MVP (no credit terms, just MOQ + multi-address + custom branding).
**Phase 2 (first diaspora market, ~weeks 13–24)**: Stripe live, USD region, export-safe variants, DHL/FedEx international shipping, destination-country labelling, country-specific landing page; target market TBD from `analyze-brand-and-market` outputs.
**Phase 3 (hardening + growth, ongoing)**: Subscription / festival boxes, loyalty, AI product-finder, WhatsApp catalogue integration, additional diaspora markets.

## Risks / Trade-offs

- **Risk**: Medusa admin UI is functional but not pretty; team may push back. → **Mitigation**: accept plain UI for v1; wrap the 3–4 most-used admin screens in a custom Next.js admin later if volume justifies.
- **Risk**: Razorpay / Stripe KYC onboarding can take 1–3 weeks (bank account, GSTIN, address proofs). → **Mitigation**: kick off KYC on Day 1 in parallel with build; use Razorpay test mode until live keys land.
- **Risk**: Festival-day incident (payment failure, oversell, checkout broken). → **Mitigation**: pre-festival dry run + load test, feature-flag kill switches, on-call rota during festival week, "degraded mode" banner + pre-drafted customer-support templates.
- **Risk**: International shipping compliance (customs, food labelling, ingredient disclosure) varies per destination. → **Mitigation**: for Phase 2, pick ONE destination first; work with a freight-forwarder who pre-clears the category; maintain country-specific product metadata in Medusa.
- **Risk**: Performance budget erodes over time as features pile on. → **Mitigation**: Lighthouse CI + bundle-size check is a **required** CI gate; regressions block merge; track it on the admin dashboard as a first-class health metric.
- **Risk**: Building corporate portal prematurely eats time that should go to retail. → **Mitigation**: corporate-gifting MVP is intentionally thin in Phase 1 (MOQ + multi-address + custom message + PO number + GST invoice) — no credit terms, no bespoke catalogues. Expand in Phase 2+ only if pipeline justifies.
- **Risk**: PostHog self-hosting ops cost if we insist on full self-host. → **Mitigation**: use PostHog Cloud EU tier initially (meets most privacy needs), revisit self-host when volume + compliance warrant.
- **Trade-off**: Choosing Medusa over custom means we accept some admin friction in return for faster time-to-live and lower build risk. Accepted.
- **Trade-off**: Enforcing a hard 180 KB JS budget means some rich interactions (fancy product configurator, heavy carousels) must be lazy-loaded or deferred. Accepted — the founder's "not heavy" constraint is the higher-order priority.

## Migration Plan

There is no existing commerce system to migrate from — the current site is informational. Catalogue, images, and any existing customer list are seeded fresh into Medusa. Domain DNS is cutover only after UAT sign-off; a `/new` preview URL runs in parallel until then.

Rollback strategy for post-launch regressions:
- All customer-facing code behind feature flags in PostHog — can disable instantly.
- Database migrations are forward-only but written to be reversible where practical; every migration has an accompanying rollback SQL.
- Payment provider test/live keys switchable via env var — if a Razorpay outage hits, we can temporarily disable online payments and surface a WhatsApp-order fallback banner.

## Open Questions

1. **First diaspora market** — US vs. UK vs. UAE vs. Australia? Determines Phase 2 ordering and the specific payment/shipping/labelling work. (Expected answer from `analyze-brand-and-market` outputs; placeholder assumption: **US** given diaspora size.)
2. **India logistics partner** — Shiprocket is the default; does Ravi Sweets have an existing Delhivery / Bluedart relationship to reuse? (Affects cost tables and dispatch integration.)
3. **Product photography** — is there an existing asset library or do we need a photo shoot before launch? (Biggest non-engineering blocker.)
4. **GSTIN and trade licences** — confirm GSTIN and FSSAI number to seed on invoices. (Blocks payment provider go-live.)
5. **Self-host vs. managed for PostHog and Meilisearch** — default to managed for Phase 1; revisit in Phase 3 based on cost.
6. **In-store pickup** — should the storefront offer "order online, pick up at Hyderabad store" in Phase 1? (Low-effort feature with high local-customer value; would add a simple "delivery method: pickup" flow.)
