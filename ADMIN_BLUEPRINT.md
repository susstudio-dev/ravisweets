# Ravi Sweets · Admin Blueprint

> The complete admin capability map for a 1985-rooted Telangana D2C sweets
> brand serving walk-ins, online D2C, and corporate gifting.
>
> **Date:** 2026-05-05
> **Scope:** What the admin must do to keep the storefront, kitchen, and
> ops in lockstep — researched against Bikanervala, Almond House,
> Pulla Reddy, Haldiram's, MTR, and the Shopify Plus / Magento
> Commerce admin patterns Indian D2C food brands run on.
>
> Read order: § 1 Capability map → § 2 What's already shipped → § 3
> Roadmap (Phase A/B/C) → § 4 Open decisions.

---

## 1 · Capability map

Fourteen admin surfaces. Each row says *what the brand owner must be able
to do without asking an engineer*.

### 1.1 Catalogue management

- Create a new product (title, slug, description, category, dietary tags,
  allergens, ingredients list, storage, shelf-life, builder eligibility,
  unit-mode, theme palette, garnish mark)
- Edit any of the above on existing products
- Variant management — add/remove variants, set title (`250 g`, `Box of 12`),
  weight, price, SKU, stock, HSN code
- Image gallery — upload (not just URL paste), reorder, set primary,
  delete; AVIF/WebP autoencoding; alt-text per image
- Bulk operations — bulk price adjust, bulk archive, bulk featured/bestseller
  flag, bulk export to CSV
- Archive a product (soft delete) without breaking existing orders
- **Per-product on-sale flag + sale price** ← Phase A
- Product collections (manual or rule-based — "all products under ₹500",
  "all hampers", "all NRI-friendly")

### 1.2 Inventory

- Real-time stock per variant
- Low-stock alerts when below reorder threshold
- Reorder threshold per variant
- **Multi-location stock** — Khammam Flagship, Khammam Second branch, Kondapur
  (Hyderabad), with per-location adjustment ledger
- Batch / expiry tracking — every batch with `made_on`, `expires_on`, `lot_number`
  (critical for fresh food, regulated by FSSAI)
- Stock adjustment with reason code (sold, scrapped, transferred,
  damaged, returned)
- Stock-take wizard — admin can do a kitchen-wide count and reconcile

### 1.3 Promotions / pricing

- Site-wide announcement / flash sale strip (already shipped — Phase 1)
- Per-product on-sale toggle with sale price + optional expiry ← Phase A
- Coupon engine (already shipped) with %-off / flat / free shipping / BOGO
- Quantity-tier pricing — "5+ boxes get 10% off, 20+ get 15%" — important
  for corporate
- Bundle pricing — buy this hamper + this combo, get this discount
- **Festival auto-promotions** — toggle Diwali → automatically applies a
  discount + swaps theme + features curated SKUs ← Phase A
- Category sales — "all dry-fruits 20% off this weekend"
- Customer-segment pricing — corporate accounts see different prices

### 1.4 Festival management ← biggest gap

- **Toggle a festival "live"** with one click → site theme swaps, banner
  text appears, festival hero is featured on home, curated products
  surface in the festival route
- Per-festival curated products list — admin picks 8-12 SKUs that show
  up under the festival hero
- Per-festival hampers — bespoke compositions per festival (different
  from the standalone hamper catalogue)
- Festival start/end dates — auto-go-live, auto-retire
- Festival palette + banner copy editable
- Per-festival promo code (auto-generated and applied at checkout)
- Festival countdown — visible on home + festival route
- Recurring festivals (Diwali every year) vs one-off (e.g. brand
  anniversary) — both supported

### 1.5 Orders

- Order pipeline view — placed → packed → shipped → out-for-delivery → delivered
  → cancelled / refunded
- **Kanban board view** — drag a card across columns to advance status
- Bulk status update — select 50 orders, mark as `packed`
- Filter by status, date range, customer, SKU, fulfilment city, channel
- Search by order number, customer email, phone
- Order export (CSV) for accountant
- Print packing slip + invoice (GST-compliant)
- Refund flow — full or partial, reason code, audit-logged
- Cancel reason + restock toggle
- Customer notes (private) per order — "fragile, avoid courier X"
- Auto-pings — when an order moves to `shipped`, customer gets WhatsApp +
  email with tracking

### 1.6 Customers / CRM

- Customer list with: total orders, total spent, AOV, last order, marketing
  consent, segments
- Detail view: order history, addresses, notes, communication log
- Segment tagging — corporate, NRI, repeat (3+ orders), dormant (no order in
  90 days), VIP (₹50k+ lifetime), wedding-buyer
- Bulk export to email tool (Mailchimp / Brevo / SendGrid)
- Manual order on behalf of a customer (phone-order intake)
- Right-to-delete (DPDP compliance) — anonymise orders, delete profile

### 1.7 Marketing / content / theme

- Hero copy + image (already shipped — site_content table)
- Sticky banner copy (already shipped)
- Theme presets — Default, Diwali, Eid, Holi, Pongal, Sankranti, Ugadi,
  Onam, Ganesh Chaturthi, Christmas (already shipped)
- Set active theme + banner with one click
- Schedule a theme — "go Diwali on Oct 25, 2026 at 6 AM"
- Festival hero copy + cta — overrides default hero
- Press marquee logos (which publications mention us)
- Featured collections per page (home, shop, category)
- SEO metadata per page — title, description, OG image
- **Story content** — kitchen-cam, behind-the-scenes posts (the
  "transparency" moat we proposed)
- Reviews moderation (already shipped — Reviews admin)

### 1.8 Hamper builder configuration

- Toggle which products are eligible for the corporate hamper builder
  (per-product `builder_eligible`, already shipped)
- Available ribbon colors (with hex, label, in-stock toggle)
- Available box finishes (matte, satin, kraft, etc — with images)
- Logo print pricing (flat + per-unit)
- MOQ rules — minimum order quantity per template
- Hamper templates (Essence / Premium / Grande already shipped)
- New: per-festival hamper templates — "Diwali Premium Trousseau" with
  pre-filled items
- New: image-led palette in the builder UI (less text, more visualization)
  ← Phase A — shipped today
- New: live box visualization — preview the box with the chosen ribbon
  color and items inside (no 3D yet, just a layered SVG/PNG mockup)

### 1.9 Site / store settings

- Store hours, contact details, addresses
- Shipping zones, rates, free-shipping threshold
- Pincode serviceability — upload CSV of supported pincodes; show
  "we don't ship here yet" gracefully when not
- Tax / GST settings
- Payment provider keys
- Email / SMS / WhatsApp provider keys (Resend, MSG91, Gupshup)
- Privacy policy / Terms (rich-text editor)

### 1.10 Analytics / dashboard

- KPI strip on dashboard — revenue today/this week/this month/year, AOV,
  order count, top SKU, low-stock count, pending fulfilment count
- Sales by channel (D2C / corporate / walk-in if we wire POS)
- Sales by location
- Conversion funnel — visits → product views → carts → checkouts → orders
- Cart abandonment — list of dormant carts, last-action timestamp
- Search-no-results report — what customers searched for that we don't
  carry (huge product-line input)
- Cohort retention — orders by cohort month
- AOV trend — month-over-month
- Revenue forecast vs target — can we hit Diwali?

### 1.11 Communications

- Email templates — order confirmation, shipping update, delivered,
  cancelled, refunded, abandoned cart, "you may also like", festival
  preorder open
- WhatsApp templates (DLT-registered) — same set
- Auto-reply rules — when customer messages WhatsApp with "order status",
  bot replies with order link
- Customer-service inbox — unified WhatsApp + email + Instagram DM (this
  is a v2 — initial cut just routes to staff)

### 1.12 Audit / permissions

- Audit log of every admin action (already shipped — `audit_log` table)
- User roles — founder (full), ops (orders + inventory only), marketing
  (content + promotions only), accountant (read-only + export)
- Two-factor auth on admin login (already designed for v2)

### 1.13 Storefront preview / staging

- Preview unpublished theme changes before publishing
- Schedule theme/banner/promo changes for a future date
- Rollback last theme change
- "Publish now" button bypasses scheduled queues

### 1.14 Operations

- Kitchen schedule — when each SKU is made ("Chitti Kova: 6 AM, Boondi
  Laddu: 9 AM"). Surfaces on storefront as the transparency moat.
- Production planning — based on open orders, what to make tomorrow
- Shift planning — kitchen vs counter staff
- Vendor list — anjeer from Pune, badam from California, ghee from
  Telangana dairy

---

## 2 · What's already shipped

| Surface | Coverage | Notes |
|---|---|---|
| Catalogue | 70% | Edit drawer covers all major fields; image upload (vs URL paste) and "create new product" still pending |
| Inventory | 30% | Per-variant stock + reorder threshold exists; multi-location + batch tracking pending |
| Promotions | 60% | Coupon engine + announcement strip + admin promotions page; per-product sale toggle ships today |
| Festival management | 30% | Festival routes exist with palettes; admin "go live" toggle is the gap |
| Orders | 40% | List + status transitions exist; kanban + bulk actions + CSV export pending |
| Customers | 50% | List + detail + segment tag exist; bulk export + manual-order intake pending |
| Marketing / theme | 70% | Theme presets + banner + site_content done; SEO per-page pending |
| Hamper builder | 80% | Templates + ribbon + box finish + logo upload all in; **image-led palette ships today** |
| Site settings | 60% | Store hours, addresses, pincodes done; tax + provider keys pending |
| Analytics | 20% | KPI strip on dashboard exists; cohort + funnel pending (Phase B) |
| Communications | 0% | Email/WhatsApp templates entirely pending (Phase B) |
| Audit / permissions | 50% | Audit log shipped; role-based perms pending |
| Preview / staging | 10% | None — Phase C |
| Operations | 0% | Kitchen schedule / production planning — Phase C |

---

## 3 · Roadmap

### Phase A · this turn (already shipping or shipped today)

- [x] **Per-product on-sale toggle + sale price** with strikethrough on
  storefront cards + product detail (single biggest revenue lever for
  Diwali / clearance / kitchen-overproduction days)
- [x] **Hamper builder palette → image-led tiles** with bigger product
  visuals, less text. Replaces the dense list of names with hover-to-add
  cards.
- [x] **Brass & ghee palette retune** (shipped earlier today) — the brand
  no longer reads "fast food"

### Phase B · this week (high-leverage admin upgrades)

| # | Item | Effort | Why now |
|---|---|---|---|
| B1 | **Festival "go live" manager** — single admin page that toggles which festival is active, swaps theme, sets banner, and curates the products that appear under the festival hero. Replaces the manual three-place edit (theme + banner + products). | M | The season is the season — Pongal/Sankranti runs 5 days; Diwali pre-orders 6 weeks. Owner can't wait for a dev to flip routes. |
| B2 | **Order kanban view** — placed / packed / shipped / delivered columns; drag-to-advance. Bulk select. CSV export. Search by number, email, phone. | L | "1000 orders" scenario from prior feedback — list view doesn't scale past 50 orders. |
| B3 | **Order email receipts** via Resend + Supabase Edge Function. Templates for placed, packed, shipped, delivered, cancelled. | M | Brand expectation. No order today gets a confirmation email. |
| B4 | **Image upload** in admin product drawer — to a Supabase Storage `product-images` bucket, with AVIF + WebP transforms. Replaces URL-paste. | S | Friction blocker for adding new SKUs without a developer. |
| B5 | **"Create new product" flow** — wizard with the same fields as the edit drawer plus initial image upload. | S | Owner currently can't add a new product without a dev. |
| B6 | **Per-product nutrition fields** — calories, protein, fat, sugar, fibre per 100 g. Surfaces on product page below ingredients. | S | DPDP compliance + serious gifting customers (corporate HR teams) ask. |
| B7 | **Customer status pipeline** — "VIP", "wedding lead", "corporate prospect" tags + assigned-to staff. Touch-point log per customer. | M | Corporate gifting close rate × 2 with proper CRM hygiene. |

### Phase C · weeks 3-6 (deeper ops + analytics)

| # | Item | Effort | Why |
|---|---|---|---|
| C1 | **Multi-location stock** — Khammam Flagship, Khammam Second, Kondapur. Each variant has stock per location. Adjustment ledger with reason. | L | Khammam-grown business; Kondapur acts as Hyderabad fulfilment. Single stock count today is fiction. |
| C2 | **Batch / expiry tracking** — every kitchen batch logged with `made_on`, `expires_on`, `lot_number`. FIFO picking on order. FSSAI-grade. | L | Fresh food without batch tracking is a recall risk. |
| C3 | **Sales analytics dashboard** — revenue by channel/location, AOV trend, cohort retention, conversion funnel, search-no-results report. | L | Owner asked for this. Drives the strategy doc. |
| C4 | **Customer-service unified inbox** — WhatsApp Business API + email + Instagram DMs in one screen, threaded by customer. | XL | Voice-of-customer moat. |
| C5 | **Schedule theme / promo / banner** — `effective_at` ISO field on every published change. CRON publishes when due. | M | Owner schedules Diwali at 6 AM Oct 25 from a beach in Goa. |
| C6 | **Role-based permissions** — founder / ops / marketing / accountant. Each admin page gates on role. | M | Bring in staff without giving them everything. |
| C7 | **Per-product reviews + photos** — already shipped admin moderation; add storefront display + photo upload from customer. | M | Conversion lift, SEO. |

### Phase D · weeks 7-12 (scale + differentiation)

| # | Item | Why |
|---|---|---|
| D1 | **Razorpay live payments** — UPI / cards / netbanking / COD verification | Currently checkout simulates |
| D2 | **B2B portal** — saved address books, repeat-order templates, tier pricing, GST paperwork generator | Corporate segment |
| D3 | **Subscriptions** — "Office chai tray, every Monday" | Recurring revenue |
| D4 | **Telugu + Hindi translations** — `/te` and `/hi` of home, shop, product detail | NRI segment + local discoverability |
| D5 | **Loyalty stamps** — "10 boxes = 1 free Diwali hamper" | Repeat-purchase nudge |
| D6 | **AR pack-preview** — Three.js / WebXR — point your phone at your desk, see the hamper on it | Press / buzz |
| D7 | **Kitchen-cam** — live photo of the kitchen every 5 min, surfaced on home — the transparency moat | Defensible against marketplace listings |

---

## 4 · Open decisions

These need owner input before Phase B can land:

1. **Email provider** — Resend (₹100/mo for 10K, recommended) vs Postmark
   vs SendGrid vs custom SMTP. Tell me to wire whichever.
2. **WhatsApp Business API** — Gupshup vs MSG91 vs Wati. Need a DLT-registered
   number to start; a 6-week registration process.
3. **Razorpay account** — KYB on the brand. Test mode works without; live
   mode needs the brand's KYB.
4. **Photography** — production photo shoot of top 30 SKUs unlocks every
   hero / OG image / festival edition. Currently using ravisweets.com PNG
   cutouts which work but cap our visual ceiling.
5. **Multi-location split** — does Kondapur ship Hyderabad-area orders
   separately, or do all orders ship from Khammam to keep ops simple?
6. **Roles** — who's the ops person? marketing person? accountant? — need
   their email + the role assignment to ship Phase C6.

---

## 5 · What ships in the next push (this turn)

| Surface | Change |
|---|---|
| **Catalogue + Storefront** | Per-product `on_sale` flag + `sale_price`. Admin drawer toggle. Strikethrough + sale badge on every storefront product card and detail page. SQL migration `0003_product_sale_pricing.sql`. |
| **Hamper builder** | Image-led tile palette replacing the dense text rows. Bigger thumbnails, hover-to-add affordance, category filter. |
| **Docs** | This blueprint. PROPOSAL.md remains the strategic doc; this is the engineering spec. |

The plan: keep landing weekly, work top-down through Phase B then Phase
C. Tell me which Phase B item to ship first and I'll execute.
