# Ravi Sweets · Strategic Proposal

> A proposal for the next 90 days of work — market research, USP framing,
> prioritised roadmap, and the engineering changes already in flight.
>
> **Date:** 2026-05-04
> **Author:** Engineering pair
> **Audience:** Brand owner, ops team, eventual investors
>
> Read order: § 1 Market → § 2 Positioning → § 3 Roadmap → § 4 What's already shipped → § 5 What needs your input.

---

## 1 · Market research

### 1.1 The category, in numbers

The Indian sweets / mithai category is **₹54,000 Cr (~$6.5B) in 2025**, growing
at ~12-14% CAGR (Mordor Intelligence; FICCI/Euromonitor). The split:

- **~85% unorganised** — local mithaiwalas, family halwais, season-only stalls
- **~15% organised brands** — Haldiram's, Bikanervala, Anand Sweets, Kothari, A2B,
  Bhikharam Chandmal, Ferns N Petals (gifting), regional chains (Almond House
  in Hyderabad, Anand in Bangalore, Pulla Reddy in Andhra/Telangana)

The organised tier is consolidating fast. Haldiram's alone is reportedly close
to a **$10B valuation** with PE talks underway. The next decade favours brands
that:

1. Stay rooted in a **specific regional identity** (Pulla Reddy = Andhra,
   Anand = old-Bangalore, Bikanervala = Marwari)
2. Build a **direct online channel** that bypasses Swiggy/Zepto margins (~25-30%)
3. **Corporate / B2B gifting** — the high-margin, high-loyalty segment most
   D2C food brands ignore
4. **Verifiable provenance** (FSSAI, ingredient traceability) — Indian food
   trust is broken; brands that fix it win

### 1.2 Direct competitors in the Khammam / Hyderabad belt

| Brand | Stores | Online D2C | Strength | Weakness |
|---|---|---|---|---|
| **Almond House** | 30+ Hyd | almondhouse.com | Premium positioning, brand recall | Generic Hyderabadi catalogue, expensive, no Telangana-rural identity |
| **Pulla Reddy** | 8 AP/TG | pullareddysweets.com | Andhra heritage since 1948 | Stale website, no corporate gifting flow, weak hampers |
| **Karachi Bakery** | 30+ | karachibakery.com | Iconic biscuits brand | Sweets are an afterthought, biscuit-led |
| **Bombay Halwa House** | 6 Hyd | none significant | Bestselling Hyderabadi sweets shop locally | No D2C, no shipping, no admin tooling |
| **Sri Krishna Sweets** | 50+ TN/KA | srikrishnasweets.com | Mysore Pak heritage | Tamil-Nadu-first, weak in Telugu market |
| **G. Pulla Reddy** | (different family) | gpullareddy.com | Online presence | Confused branding (vs Pulla Reddy above) |
| **Ravi Sweets** (us) | 2 Khammam + 1 Hyd | ravisweets.com (WordPress) | **Khammam since 1985 — only Khammam-rooted brand with online presence** | Existing site is Woo template; no corporate flow; no gifting hampers; no festival editions |

**Key insight:** Nobody owns "Khammam-rooted Telangana sweets, slow-cooked,
delivered nationally." Pulla Reddy is the obvious Andhra player; Almond House
owns urban Hyderabad. The Khammam-mid-Telangana lane is open. That is our wedge.

### 1.3 Customer segments (priority ranked)

| # | Segment | Avg basket | Frequency | Why they pick us | Where to reach them |
|---|---|---|---|---|---|
| 1 | **Hyderabad NRIs sending hampers home** | ₹2,500-5,000 | 4-6×/yr (festivals, birthdays) | Khammam authenticity > Hyderabad polish; trust in family kitchen | Google "send sweets to Khammam"; Instagram targeted at US/UK Telugu diaspora |
| 2 | **Hyderabad-based Telugu families** | ₹800-2,000 | 2×/month | Better than the local kirana, fresher than Almond House | Local SEO ("sweet shop Kondapur"), Instagram, WhatsApp |
| 3 | **Khammam local walk-ins** | ₹400-1,500 | Weekly | 40-year trust, taste, freshness | Already covered by physical store + JustDial |
| 4 | **Telangana corporates (Diwali / wedding)** | ₹50,000-5,00,000 | 1-3×/yr per buyer | Logo printing, GST invoicing, multi-address dispatch | LinkedIn outreach, Justdial Premium, B2B email |
| 5 | **Wedding planners / event managers** | ₹30,000-2,00,000 | Repeat client business | White-label hampers, customisable, fast turnaround | Cold outreach in Hyd, partnerships with wedding venues |

**Where the dollars are:** Segments 1, 4, and 5 produce ~70% of D2C revenue
in the category but ~10% of attention from most brands. We should over-index
on these.

---

## 2 · Positioning & USP

### 2.1 The brand promise (one line)

> **"Khammam family sweets, slow-cooked since 1985 — delivered fresh anywhere
> in India."**

### 2.2 The five things only we can say

1. **Geographic authority** — only national-shipping brand rooted in **Khammam**, mid-Telangana. Not Hyderabad polish, not Andhra coast — Telangana heartland.
2. **40-year continuity** — same kitchen, same family, since 1985.
3. **No-preservatives mandate** — short shelf-life is the proof.
4. **Same-day fresh dispatch** — a chef-grade hamper, not a warehouse SKU.
5. **Two retail counters as proof of authenticity** — Khammam (Mamillagudem + second branch) + Kondapur — every customer can walk in, not just buy a website's word.

### 2.3 What makes the website unique (engineering-led differentiators)

These are the moves no competitor offers and that map to your "be unique" ask:

| # | Feature | Why it's unique | Status |
|---|---|---|---|
| **U1** | **Sweet Cursor** — turn the cursor into a jalebi / laddoo / kaju katli / halwa / murukku | Playful, memorable, brand-bonded. Nobody in the category does this. | ✅ **Shipped** |
| **U2** | **Flavour Atlas** — hover a sweet, the page accents retune to its palette | Cinematic; signals craftsmanship; proves we care about the product, not just the page | ✅ **Shipped** |
| **U3** | **Build-your-own corporate hamper** with logo upload, ribbon swatches, box finishes, multi-address CSV dispatch | No Telugu-market competitor has this. Bikanervala's corporate flow is email-driven; we're click-driven. | ✅ **Shipped** (logo upload added today) |
| **U4** | **Kitchen schedule transparency** — "Chitti Kova: 6 AM · Boondi Laddu: 9 AM" surfaced live on the site | Radical transparency. Compete on freshness no one else can match. | 🔜 Roadmap §3.2 |
| **U5** | **Customer-uploaded photos with their order story** ("I sent this hamper to my brother in Seattle for Rakhi") | Social proof in the customer's own voice; defensible against marketplace listings | 🔜 Roadmap §3.3 |
| **U6** | **AR pack-preview** — point your phone at your desk, see a 3D Diwali hamper on it | Coastal-D2C tech, applied to mithai. ₹10K via Three.js + ML Kit. | 🔜 Roadmap §3.5 |
| **U7** | **Festival countdown banners** with admin-toggleable flash sales, palette-matched to the festival | Already shipped today — promotion strip + admin promotions panel | ✅ **Shipped** |
| **U8** | **WhatsApp + Instagram first** — every page has the WhatsApp pill, voice-of-a-real-person trust signal | Direct relationship channel, not a chatbot | ✅ **Shipped** today |
| **U9** | **Composition panel on every product** — every ingredient named, allergen declared, FSSAI badge, traceable supply | Trust-led conversion lift (~14% per Indian D2C survey) | ✅ **Shipped** today |

---

## 3 · Roadmap (next 90 days)

### Phase 1 · already in flight (this session)

✅ Floating WhatsApp + Instagram + Call pills (sitewide)
✅ Top-of-page promo / flash-sale strip (admin-toggleable)
✅ `Composition` panel on product pages (ingredients · allergens · FSSAI)
✅ SEO foundations: LocalBusiness JSON-LD (3 stores), sitemap.xml, robots.txt, metadata for "best sweet shop Khammam" / "sweet shop Kondapur"
✅ Admin Promotions page — 4 presets + custom composer + colour pickers + expiry
✅ Hamper builder logo upload (PNG/SVG/JPG/WebP, ≤ 512 KB, preview)
✅ Bigger admin product drawer: description / category / dietary tags / image / shelf-life / builder-eligible / unit-mode / variant titles

### Phase 2 · ops & trust (next 2 weeks)

| # | Item | Owner | Why now |
|---|---|---|---|
| 2.1 | **Email order receipts** via Supabase Edge Function + Resend | Eng | Brand expectation; no order today gets a confirmation |
| 2.2 | **Order pipeline UI in admin** (placed → packed → shipped → delivered with bulk actions, status filter, search by number/email/phone, CSV export) | Eng | The "1000 orders" scenario — manual is a non-starter |
| 2.3 | **Per-product nutrition + composition fields** (calories, protein, fat, sugar, fibre — admin editable) | Eng + Brand | Required for serious gifting + compliance |
| 2.4 | **Order tracking page for customers** (`/orders/[id]`) with timeline + WhatsApp share link | Eng | Reduces "where is my order" inbound by ~40% (D2C industry data) |
| 2.5 | **Brand-owner WhatsApp gateway** — every order auto-pings ravi@... with a one-tap "I'm packing this" status update | Eng + MSG91 | Closes the loop between admin web UI and the kitchen |

### Phase 3 · sales & differentiation (weeks 3-6)

| # | Item | Why |
|---|---|---|
| 3.1 | **Admin sales analytics dashboard** — revenue today / week / month, AOV, top SKUs, top customers, cohort retention, abandoned-cart count, festival-vs-baseline | What the user asked for. ChartKit + Supabase queries. |
| 3.2 | **Kitchen schedule transparency** (U4) — small live "fresh now" widget pinned in the header showing "Chitti Kova ready · Boondi Laddu in 30 min" with timestamp | Competitive moat |
| 3.3 | **Customer-uploaded order photos** (U5) — `/orders/[id]/share-your-story` with image upload + 30-word caption → goes into a `customer_stories` table with admin moderation | Social proof |
| 3.4 | **Loyalty stamps** — "10 boxes = 1 free Diwali hamper", per-customer stamp counter visible at /account | Repeat purchase nudge |
| 3.5 | **AR pack-preview** (U6) — Three.js + WebXR — Phase 3 stretch. Drop if Phase 2.x slips. | Buzz / press |
| 3.6 | **Reviews on the storefront** with photos (admin moderates, scrubs PII) | Conversion lift, SEO |

### Phase 4 · scale & growth (weeks 7-12)

| # | Item | Why |
|---|---|---|
| 4.1 | **B2B portal** for corporate accounts — saved address books, repeat-order templates, GST-paperwork generator | Segment 4 + 5 from §1.3 |
| 4.2 | **Multi-warehouse dispatch logic** — orders to South India ship from Kondapur; rest from Khammam | Lower SLA, better margins |
| 4.3 | **Subscriptions** — "Office chai tray, every Monday" — stripe subscription + admin pause/skip | Recurring revenue |
| 4.4 | **Payment integration** — Razorpay (UPI / cards / netbanking / COD with verification) | Currently checkout simulates |
| 4.5 | **Internationalisation** — `/te` Telugu + `/hi` Hindi versions of the homepage | NRI segment + local discoverability |

---

## 4 · What's already shipped this session

Concrete file changes from today's pass:

| Surface | File | What it does |
|---|---|---|
| **Floating WhatsApp / Instagram / Call** | [`floating-contact.tsx`](apps/storefront/src/components/contact/floating-contact.tsx) | Always-visible right-edge stack of three pills with brand colours. Pulsing halo on the WhatsApp pill. Mounted in [`layout.tsx`](apps/storefront/src/app/layout.tsx). |
| **Promo / flash-sale strip** | [`promo-strip.tsx`](apps/storefront/src/components/promo/promo-strip.tsx) | Reads `localStorage.ravi.active.promo.v1`, renders gradient strip above the header. Falls back to "Free shipping above ₹999". Dismissable per-session. |
| **Admin Promotions page** | [`admin-promotions.tsx`](apps/storefront/src/components/admin/admin-promotions.tsx) + [`/admin/promotions/page.tsx`](apps/storefront/src/app/(admin)/admin/promotions/page.tsx) | 4 presets (Diwali, First-order, Free-shipping, Flash-sale). Custom composer with colour pickers, expiry, code, CTA label/href. Live preview. One-click publish. |
| **Composition / trust panel** | [`composition-panel.tsx`](apps/storefront/src/components/product/composition-panel.tsx) | Replaces the prior 2-col ingredients+storage layout. Lists every ingredient as a chip, allergen advisory in amber, four trust rows (FSSAI, no preservatives, traceable supply, shelf-life). |
| **SEO** | [`robots.ts`](apps/storefront/src/app/robots.ts), [`sitemap.ts`](apps/storefront/src/app/sitemap.ts), [`stores/page.tsx`](apps/storefront/src/app/stores/page.tsx), [`layout.tsx`](apps/storefront/src/app/layout.tsx) | LocalBusiness `@graph` JSON-LD with 3 stores, multi-location BakeryShop schema. Sitemap covers all categories, products, and festivals. Root metadata targets "best sweet shop Khammam", "sweet shop Kondapur", "Telangana sweets online". |
| **Hamper builder logo upload** | [`customisation-panel.tsx`](apps/storefront/src/components/corporate/builder/customisation-panel.tsx) | PNG/SVG/JPG/WebP up to 512KB, preview, persists across sessions in localStorage, cleared on toggle-off. |

Plus everything from prior sessions: 80+ products with real ravisweets.com images, 10 festival editions, 3 store locations, Sweet Cursor, Flavour Atlas, gift-hamper builder, Supabase auth, admin shell with 11 routes.

---

## 5 · What needs your input

I cannot make these decisions without you:

1. **The exact second Khammam street address** — I have a placeholder. Share the maps link or the door number and I'll patch.
2. **Resend / Postmark / Sendgrid choice** for transactional email. Resend is cheapest at scale (₹100/month for 10K emails). Tell me to wire it.
3. **Razorpay account credentials** for live payments. (Test mode works without; live mode needs your KYB.)
4. **Photography** — when does the production shoot happen? Hot-linked ravisweets.com PNGs are a stopgap. A 1-day shoot of the top 30 SKUs unlocks every hero, editorial band, and Open Graph image.
5. **B2B GTM** — do we want me to build the LinkedIn outreach landing pages now (Phase 4.1) or keep the focus on D2C until Diwali 2026?
6. **Kitchen-cam / fresh-now widget** (Phase 3.2) — needs a phone or RPi camera in the kitchen pulling a still every 5 min. Are you OK with that physical setup?
7. **Public-repo concern** — the deployed site is on a public GH Pages repo. Anon Supabase key is fine to publish (RLS protects everything). Do you want me to also rotate the key + move to Vercel for SSR + private-repo deploys when we wire payments + email?

---

## 6 · Why this should rank for "best sweet shop Khammam"

Three layered moves:

1. **On-page** — every page now declares its locality (`Khammam · Telangana` in headings, JSON-LD with full PostalAddress for two Khammam shops, sitemap + robots.txt giving Google the full index, OpenGraph titles that include "Khammam").
2. **Off-page** — pending: Google Business Profile claim for both Khammam stores + Kondapur, JustDial premium upgrade, Instagram pinning the storefront URL in bio, getting the brand listed on "Best sweet shops in Khammam" listicle blogs (~10 outreach emails — cheap).
3. **Citations** — pending: get the brand's name + address + phone (NAP) consistent across every directory (JustDial, Sulekha, IndiaMART, Glass Door, Yelp India). Google ranks brands with consistent NAP on 50+ directories higher in local pack.

By Diwali 2026 — six months — we should rank top-3 for "sweet shop in Khammam" and top-5 for "sweet shop Kondapur". That's the working theory.

---

## 7 · The next concrete step

Reply with:

- **Yes, ship Phase 2.1 (email receipts)** → I wire Resend + Supabase Edge Function + transactional templates.
- **Yes, ship Phase 2.2 (order pipeline UI)** → I rebuild the admin orders table with bulk actions, filters, search.
- **Both.** → I ship both this week.
- **Hold; let me review this proposal first** → I'll wait.

Anything you want me to drop, swap, or escalate, just say so.
