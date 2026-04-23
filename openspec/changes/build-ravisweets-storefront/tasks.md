## 1. Foundations & Access

- [ ] 1.1 Register / confirm ownership of ravisweets.com DNS and set up `staging.ravisweets.com` + `admin.ravisweets.com` subdomains
- [ ] 1.2 Create a GitHub/GitLab org and monorepo (`ravisweets`) with `apps/storefront` (Next.js), `apps/backend` (Medusa), `packages/ui`, `packages/shared` workspaces
- [ ] 1.3 Set up accounts: Vercel, Railway (or Render), Supabase (or Neon), Upstash Redis, Cloudinary, Sentry, PostHog, Resend, BetterStack/Axiom, Razorpay, Stripe
- [ ] 1.4 Start **Razorpay KYC** (business PAN, GSTIN, bank account, address proof) — runs in parallel, owner: Finance
- [ ] 1.5 Start **Stripe KYC** for the India entity or the relevant international entity — owner: Finance
- [ ] 1.6 Obtain / confirm **FSSAI** number and on-pack label requirements
- [ ] 1.7 Secret management: decide on Doppler / Infisical / Vercel env-groups; never commit secrets
- [x] 1.8 Set up CI (GitHub Actions): lint, typecheck, unit tests, Lighthouse CI, bundle-size check, Medusa migrations dry-run *(`.github/workflows/ci.yml` shipped: three jobs (lint+typecheck+format-check → build+size-limit → Lighthouse CI) with pnpm cache + artifact upload. Missing: unit tests (no test framework configured yet), Medusa migrations dry-run (no backend runtime yet))*

> **Status note (2026-04-22):** `apps/storefront` + `apps/backend` (skeleton) + `packages/shared` + `packages/ui` (Button / Badge / Card / Skeleton) all scaffolded + `docker-compose.yml` + `.github/workflows/ci.yml` all landed. Monorepo structure now matches the spec. **Remaining for 1.2**: Medusa runtime actually installed + running against Postgres. Accounts / KYC still pending.

## 2. Backend — Medusa Setup

- [ ] 2.1 Bootstrap Medusa v2 in `apps/backend` with Postgres + Redis config
- [ ] 2.2 Configure **regions**: India (INR, GST enabled) in Phase 1; stub US/UK/UAE regions as `disabled` for Phase 2
- [ ] 2.3 Configure **tax providers**: India GST rates mapped to HSN codes per category (sweets, namkeens, dry fruits, gift items)
- [ ] 2.4 Configure **shipping options**: India via Shiprocket (or chosen courier) with zone-based rates; in-store pickup option for Hyderabad
- [ ] 2.5 Install / write **Razorpay payment provider** plugin and configure API keys per environment
- [ ] 2.6 Install / write **Stripe payment provider** plugin and configure API keys (disabled in Phase 1 except test mode)
- [ ] 2.7 Extend the **product data model**: add `shelf_life_days`, `storage_instructions`, `ingredients`, `allergens`, `hsn_code`, `regional_availability`
- [ ] 2.8 Extend **inventory model**: add `batch_id`, `manufactured_on`, `expiry_on`, and implement **FEFO** picking order on the fulfilment queue
- [ ] 2.9 Implement **destination-aware shelf-life guard**: block picks where remaining shelf-life at dispatch < destination minimum (stricter for international)
- [ ] 2.10 Implement **near-expiry alert** job (daily, configurable window, default 7 days)
- [ ] 2.11 Implement **custom RBAC** — add Ops, Finance, Viewer roles (Owner/Manager exist) with permission matrix and middleware-level enforcement
- [ ] 2.12 Implement **append-only audit log** table + service + middleware that records actor / action / before / after on every mutating admin call
- [ ] 2.13 Implement **GST invoice generator** (HSN, CGST/SGST/IGST split, seller details, invoice-number sequence per FY) with PDF output
- [ ] 2.14 Implement **webhooks** for Razorpay (payment.authorized, payment.captured, payment.failed, refund.processed) and Stripe (payment_intent.succeeded / failed, refund.updated) with signature verification
- [ ] 2.15 Implement **daily reconciliation job** comparing gateway payment state to local ledger; surface drift in the admin "needs attention" list

## 3. Storefront — Customer App (Next.js)

- [ ] 3.1 Bootstrap Next.js (App Router, TypeScript, RSC) in `apps/storefront` with Tailwind + shadcn/ui + Radix primitives *(partial — Next.js + TS + Tailwind done; shadcn/ui vocabulary not scaffolded, only Radix-slot used incidentally)*
- [ ] 3.2 Set up Medusa JS client and data-fetching helpers (server components call Medusa; client components only for interaction-heavy islands)
- [x] 3.3 Build **home page** (hero, featured collections, active festival banner, trust strip, newsletter) — ISR with 5-minute revalidation *(home exists with hero, featured, bestsellers, trust strip, categories, press marquee, heritage, craft, festival tease, gifting guide, corporate CTA; newsletter signup + ISR revalidation not yet wired — noted)*
- [x] 3.4 Build **category / sub-category listing** with faceted filters (price, weight, dietary tags, occasion, in-stock), sort, pagination — ISR *(7 categories statically generated; dietary + in-stock + sort filters work via `?diet=&stock=in&sort=`; pagination deferred until real catalogue; price/weight/occasion facets not yet wired)*
- [x] 3.5 Build **product detail page** with images (Cloudinary AVIF/WebP, blur placeholder, zoom), variant selector, pincode delivery check, shelf-life declaration, storage, ingredients, allergens, reviews, JSON-LD *(page exists with gallery crossfade + thumbs, variant-price crossfade, pincode-check stub, shelf-life / storage / ingredients / allergens, JSON-LD. Missing: Cloudinary (using Unsplash), blur placeholder, zoom, real reviews data)*
- [x] 3.6 Build **search** (Meilisearch integration) with typo tolerance, synonyms, and URL-shareable filter state *(v1 ships `/search` with a client-side fuzzy scorer over SAMPLE_PRODUCTS matching title / category / dietary tags / ingredients / description, weighted + bestseller/featured lift for ties. URL-shareable via `?q=` with 180ms debounce. Suggestion chips, empty-state, no-hits state, auto-focus, clear button. Header search icon now routes here. Meilisearch integration proper deferred until real catalogue + backend)*
- [x] 3.7 Build **cart** (add/update/remove, promo code, gift message, gift wrap, pickup vs delivery) *(add/update/remove + localStorage persistence + live header badge + empty-state + summary/subtotal/shipping estimate done; promo code, gift message, gift wrap, pickup-vs-delivery toggle not yet wired)*
- [x] 3.8 Build **checkout** (guest + logged-in, pincode autofill, addresses, payment method selection, Razorpay / Stripe UI components, 3DS flow, out-of-stock guard) *(multi-step flow: address → payment method radio (UPI/card/netbanking/COD) → review → simulated place-order → redirect to /orders/[id]. Missing: real Razorpay/Stripe UI widgets, 3DS flow, pincode autofill (city/state), out-of-stock guard, logged-in address book)*
- [x] 3.9 Build **order confirmation + tracking** page (status timeline, courier info, tracking link, invoice download) *(status timeline done (placed/packed/shipped/delivered) with staged icon entrances; address + payment + totals + line items all rendered. Missing: courier info, tracking link, invoice PDF download — all require real backend data)*
- [x] 3.10 Build **account area** (orders list, order detail, addresses, wishlist, reviews, reorder) *(orders list at /account with status badges + order-detail navigation + empty-state; order detail at /orders/[id]. Missing: address book, wishlist, reviews history, one-click reorder — all require real backend)*
- [x] 3.11 Build **festival / campaign landing** page template with admin-editable slug, hero, curated SKUs, countdown *(3 festivals statically generated — Diwali, Raksha Bandhan, Eid — each with festival-specific `theme_palette` SSR-seeded, parallax hero background, TextKinetic headline, Tiro Telugu eyebrow, live countdown, curated SKU grid, "who are you gifting" tiles, and priority-list CTA. Content currently inline in the page file; admin-editable slug + SKU selection is deferred until the Medusa backend lands)*
- [x] 3.12 Build **static pages** (about, stores, contact, returns, privacy, terms, shipping policy) via MDX *(/about shipped with heritage hero + timeline + pull-quote + pillars + CTA; /policies/[slug] shell with privacy, terms, returns, shipping, cancellation — 5 policies statically generated. Missing: /stores (store locator) + /contact. Content is inline TS, not MDX — MDX migration deferred)*
- [ ] 3.13 Implement **cookie consent banner** with granular categories (essential, analytics, marketing) and honour rejection for PostHog + Meta Pixel + GA
- [ ] 3.14 Implement **region & currency detection** via URL path + geoIP fallback; stub non-INR currency rendering behind a feature flag for Phase 2 *(types + formatter support it; no runtime routing wired)*
- [ ] 3.15 Integrate **WhatsApp Business API** for order-status updates (template messages for placed / shipped / delivered) with opt-in capture at checkout
- [ ] 3.16 Integrate **Resend** for all transactional emails (order confirmation, shipping, invoice, refund, password reset)
- [ ] 3.17 Pass **accessibility audit**: WCAG 2.1 AA on home, category, product, cart, checkout, account (axe-core + manual keyboard walk-through)
- [ ] 3.18 Pass **performance budget**: Lighthouse CI mobile LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, customer-route JS ≤ 180 KB gzipped (fail-the-build) *(we're currently under budget on home 172 KB / product 169 KB, but no Lighthouse CI gate exists yet)*

## 4. Admin Console

- [ ] 4.1 Deploy Medusa admin UI at `/admin` with RBAC + MFA (TOTP)
- [ ] 4.2 Customise admin home **dashboard**: gross/net revenue, orders placed/delivered, AOV, unique customers, new vs. returning, conversion rate, top 10 SKUs (revenue + units), revenue-by-category / channel / region, payment-method split, cancellation rate, refund rate, RTO rate — with range picker (today / 7d / 30d / 90d / YTD / custom) and prior-period comparison
- [ ] 4.3 Orders pipeline: list with filters, detail view, bulk-pack, mark-shipped with courier+AWB, mark-delivered, cancel, refund, resend-invoice, internal notes
- [ ] 4.4 Inventory screen: stock by SKU + location, batch/lot entry on receive, near-expiry list, low-stock alerts, movement history, FEFO toggle per SKU
- [ ] 4.5 Products screen: create/edit/archive with the extended fields (shelf-life, ingredients, allergens, HSN, regional availability), revertible change history
- [ ] 4.6 Customers screen: profile, LTV, order history, addresses, opt-ins, segments (Hyderabad-repeat / corporate / diaspora), GDPR-delete flow
- [ ] 4.7 Discounts screen: create codes (percent / fixed / free-shipping) with rules, usage caps, stackability; automatic promotions
- [ ] 4.8 Reports: monthly GST sales export (order-level with CGST/SGST/IGST + HSN), refunds export, inventory movements export — all CSV / Excel
- [ ] 4.9 Audit-log viewer: filter by actor / entity / date; read-only
- [ ] 4.10 Settings: store info (GSTIN, FSSAI, addresses), tax rules, shipping zones, payment credentials, email/WhatsApp templates, policy text, feature flags, user & role management
- [ ] 4.11 Global command palette (⌘/Ctrl+K) searching orders / customers / products / discount codes with sub-300ms response

## 5. Payments & Billing

- [ ] 5.1 Razorpay **test-mode** end-to-end: UPI intent, cards (domestic + international test), netbanking, wallet, EMI, pay-by-link, QR — each happy-path + failure-path green
- [ ] 5.2 Razorpay **live-mode** cutover once KYC is complete: rotate keys, smoke test on staging with real ₹1 orders, refund those orders
- [ ] 5.3 Stripe **test-mode** end-to-end in USD / GBP (Phase 2 readiness) with 3DS
- [ ] 5.4 Unified **order-payment ledger** schema + service; wire both providers through it
- [ ] 5.5 **Refunds** (full + partial) with reason codes, gateway call, ledger update, customer email
- [ ] 5.6 **GST-compliant invoice** PDF: intra-state (CGST+SGST) vs. inter-state (IGST) vs. export (zero-rated) test cases
- [ ] 5.7 **Webhooks** for Razorpay + Stripe with signature verification, idempotency, and retry backoff
- [ ] 5.8 **Reconciliation** cron: daily drift report; "needs attention" surfacing in admin
- [ ] 5.9 **COD (optional)** with pincode whitelist, max-order-value rule, phone verification, separate revenue/RTO tags
- [ ] 5.10 **Region-aware method availability**: UPI/netbanking hidden for non-India; Stripe methods hidden for India
- [ ] 5.11 **Secret handling**: verify zero card/UPI/CVV in logs (log scrub test), keys in secret manager only, rotation runbook written

## 6. Corporate / B2B Gifting

- [ ] 6.1 Corporate account registration form + admin approval flow + pipeline view
- [x] 6.2 `/corporate` landing page with catalogue PDF download + enquiry form *(landing page live with dark cinematic hero + trust badges, three-tier hamper catalogue (Essence / Premium / Grande with MOQ + price tiers), 5-step how-it-works strip, FAQ accordion, bottom download-catalogue CTA. Multi-field enquiry form shipped with validation (company, GSTIN, contact, quantity ≥ 25, budget, delivery date, hamper tier, customisation, notes, sample-request opt-in). PDF catalogue download itself is stubbed — routes to enquiry form; real PDF generation deferred)*
- [x] 6.3 Quote-request flow creates admin task with 24h SLA and auto-reply email *(enquiry form simulates submission with spinner → success state with a unique `RSC-XXXXXX` reference + 24h SLA messaging. Real admin-queue routing and Resend auto-reply email deferred to backend bring-up)*
- [ ] 6.4 MOQ + tiered-pricing on products; cart auto-applies tier price and blocks below MOQ
- [ ] 6.5 Custom branding capture (gift message per shipment, branded card PDF upload, logo printing with proof-approval sub-status, ribbon/tag colour)
- [ ] 6.6 **Multi-address bulk delivery**: CSV upload + template download, inline validation, per-recipient shipping-cost, consolidated invoice, per-recipient tracking links
- [ ] 6.7 **PO number** on checkout and invoice; filename includes PO
- [ ] 6.8 Corporate self-serve dashboard (open quotes, active orders, per-recipient status grid, outstanding invoices, account-manager contact card)
- [ ] 6.9 Minimum lead-time enforcement on customised orders; block earlier requested-delivery dates
- [ ] 6.10 Corporate revenue metrics on admin dashboard + drilldown to top accounts + revenue-by-account-manager + quote win rate

## 7. Observability & Performance

- [ ] 7.1 PostHog SDK integration (storefront + admin) with the required event taxonomy; session replay masking on sensitive inputs; consent-aware loading
- [ ] 7.2 Sentry integration (Next.js + Medusa) with source maps on every release, non-PII user context, release tagging
- [ ] 7.3 Structured JSON logging on Medusa + workers; ship to Axiom/BetterStack; 30-day retention
- [ ] 7.4 Uptime monitoring (BetterStack / Pingdom) for home, product, checkout, admin login, webhook endpoints — 1-minute interval; on-call alerts via email + WhatsApp + Slack
- [ ] 7.5 Lighthouse CI pipeline for home, category, product, checkout; fail-the-build on budget regression
- [ ] 7.6 Bundle-size CI check (size-limit / next-bundle-analyzer assertions)
- [ ] 7.7 Feature-flag wrappers around reviews, recommendations, session replay, checkout variants, future AI product-finder
- [ ] 7.8 Admin `/admin/health` page with RUM Web Vitals + p50/p95/p99 checkout API + Sentry error rate + webhook failure count + uptime
- [ ] 7.9 Runbooks: razorpay-outage, stripe-outage, postgres-connection-exhaustion, webhook-backlog, dns-failure, festival-peak-load — in `ops/runbooks/`
- [ ] 7.10 Pre-festival load test with k6 / Locust at 10× baseline; results stored in `ops/load-tests/`; gate festival-day feature flags on a passing test

## 8. Data, Content & Launch Prep

- [ ] 8.1 Product-content writing: for every SKU — title, description, ingredients, allergens, storage, shelf-life, weight, images (per variant), HSN, category/tags *(sample/demo content written for 6 SKUs; not production-final copy)*
- [ ] 8.2 Photography: brief + shoot + retouch for every SKU (owner: marketing); fallback to existing Instagram shots only if date-pressed **(scheduling blocker — see storefront-change open questions)**
- [ ] 8.3 Seed catalogue into Medusa (bulk import via CSV / API) and QA every row
- [ ] 8.4 Write and publish policies: returns, refunds, shipping, privacy, terms, cancellation, FSSAI disclosures
- [ ] 8.5 SEO baseline: sitemap.xml, robots.txt, structured data (Product, Breadcrumb, Organization), canonical URLs, Open Graph images, Google Business profile claim, Google Search Console & Analytics 4 property *(Product JSON-LD done on detail pages; rest not)*
- [ ] 8.6 Shiprocket (or equivalent) integration: pick-up setup from Hyderabad origin, rate cards, AWB printing, pincode serviceability feed, RTO workflow
- [ ] 8.7 Email templates in Resend: order confirmation, shipping, delivered, cancelled, refund, password reset, corporate quote, corporate invoice
- [ ] 8.8 WhatsApp template approval (order-placed / shipped / delivered / pre-festival) with Meta Business Manager
- [ ] 8.9 Staging UAT with the founder + ops + finance: happy path (browse → pay → deliver → refund) + corporate (quote → approve → bulk → ship) + edge cases (OOS, pincode not served, payment failure, international view)
- [ ] 8.10 Security check: OWASP top-10 pass, dependency audit, HTTPS-only, HSTS, admin MFA enforced, rate-limit checkout and login, Razorpay/Stripe webhook signatures verified, no PII in logs

## 9. Launch & Post-Launch

- [ ] 9.1 DNS cutover: ravisweets.com → new storefront; keep old site at `old.ravisweets.com` for 30 days as safety
- [ ] 9.2 Announce to existing customer list (WhatsApp + email) with a first-order discount code
- [ ] 9.3 Monitor first-72-hour metrics: conversion rate, checkout abandonment, payment failure rate, Sentry error spike, Core Web Vitals — with an on-call rota
- [ ] 9.4 Post-launch retro at day 14: what broke, what surprised, what to fix before the next festival
- [ ] 9.5 Phase 2 prep (only after Phase 1 stable): enable Stripe live, open first diaspora region per `analyze-brand-and-market` recommendation, export-safe SKU variants, destination-country labelling, DHL/FedEx international shipping integration, pre-festival load test at 10× India-peak baseline
