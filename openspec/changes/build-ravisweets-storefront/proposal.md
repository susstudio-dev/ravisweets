## Why

Ravi Sweets currently has a website but no fast, modern commerce experience for shoppers and no operational cockpit for the team. To grow Hyderabad retail, launch corporate / B2B gifting, and eventually ship to diaspora markets, the brand needs (a) a **seamless, swift customer storefront** where any visitor can find, customise, gift, and pay in a handful of taps, and (b) an **admin console** that gives the team complete visibility — orders, inventory, revenue, customers, logs, statistics — without the app becoming heavy for shoppers. Payments must work natively for India (UPI / cards / netbanking / EMI + GST invoices) and international (USD / GBP / AED). The `analyze-brand-and-market` change will tell us *what* to build; this change delivers *how we build and run it*.

## What Changes

- Ship a **public customer storefront** at ravisweets.com: browse, search, filter, product detail, combos / gifting hampers, cart, guest + account checkout, order confirmation, order tracking, address book, reorder, wishlist, reviews, festival/campaign landing pages, and a clean mobile-first experience that is fast on 3G.
- Ship an **admin console** at `/admin` (separate bundle, lazy-loaded, never shipped to shoppers) covering: orders pipeline, inventory (stock, low-stock alerts, shelf-life/expiry tracking, batch/lot for sweets), products & variants, customers, discounts, revenue analytics (daily/weekly/monthly/YoY, SKU-level, channel-level), AOV / repeat-rate / funnel statistics, audit logs, settings, staff roles/permissions, and exportable reports.
- Integrate **payments**: Razorpay for India (UPI, cards, netbanking, EMI, wallets, pay-by-link, QR) and Stripe for international (multi-currency, 3DS). Both tied to a unified order + refund ledger. Support **GST-compliant invoicing** for all domestic orders and **tax-inclusive pricing** per region.
- Ship a **corporate / B2B gifting** surface: corporate account, MOQ ladders with tiered pricing, logo / custom-message / custom-packaging flow, multi-address bulk delivery (CSV upload), corporate PO support, credit terms (optional v2), downloadable GST invoices, dedicated account manager contact.
- Build in **observability from day one**: PostHog (product analytics + session replay + feature flags), Sentry (errors), structured application logs, uptime monitoring, and a performance budget enforced in CI (LCP, INP, CLS, bundle size).
- Design for **multi-region commerce**: currency (INR / USD / GBP / AED), shipping zones, export-safe SKU variants (30–45 day shelf-life packs), country-specific certifications/labels, and region-scoped inventory. Hyderabad + India is Phase 1; first diaspora market is Phase 2.
- **Non-goal**: marketing creative, packaging artwork, physical-store POS integration (deferred), mobile app (PWA suffices for v1), subscription boxes (deferred), own-warehouse WMS (use Medusa inventory + shipping provider APIs).

## Capabilities

### New Capabilities
- `customer-storefront`: the public shopping experience — browse, product detail, cart, checkout, account, order tracking, reviews, landing pages. Must meet a defined performance budget and accessibility bar.
- `admin-console`: the team-facing cockpit — orders, inventory with shelf-life/batch tracking, products, customers, discounts, revenue & stats dashboards, audit logs, settings, roles, exports.
- `payment-and-billing`: Razorpay + Stripe integration, unified payment ledger, refunds, GST-compliant invoicing, tax calculation, payment-link + QR flows, failure/retry handling.
- `corporate-gifting`: corporate accounts, MOQ ladders, tiered pricing, custom branding on orders, multi-address bulk delivery (CSV), corporate PO, dedicated invoicing, account-manager surface.
- `observability-and-performance`: PostHog events + session replay, Sentry errors, structured logs, uptime checks, performance budget enforced in CI, admin-dashboard metric feeds.

### Modified Capabilities
<!-- None. No existing specs in this project. -->

## Impact

- **Stack (decided in design.md)**: Next.js (App Router, TypeScript) for storefront + Medusa.js (headless commerce) for backend/admin, Postgres on Supabase/Neon, Razorpay + Stripe for payments, Vercel + Railway/Render for hosting, PostHog + Sentry for observability, Cloudinary for media, Resend for transactional email, WhatsApp Business API for order updates (Hyderabad), Meilisearch or Algolia for search.
- **Downstream changes unlocked**: festival-campaign landing pages, WhatsApp order + pay-link flow, AI product-finder, in-store QR → catalogue, subscription boxes, loyalty programme, mobile app.
- **Dependencies**: domain control (ravisweets.com), business bank account with GSTIN for Razorpay/Stripe onboarding, content (product photography, descriptions, ingredient & nutrition info, shelf-life declarations), logistics partner(s) for India + international.
- **Stakeholders**: founder (scope & positioning), engineering (build), marketing (content + campaigns), ops (inventory + fulfilment), finance (GST + reconciliation), customer-support (orders + returns).
- **Risks**: Medusa admin customisation effort, payment-provider onboarding timelines (KYC), international shelf-life & labelling compliance, peak-festival load (Diwali/Raksha Bandhan surges). Each is addressed in design.md with mitigations.
