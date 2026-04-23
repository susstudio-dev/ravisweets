# Ravi Sweets — Brand Audit

| Field | Value |
| --- | --- |
| `audit_captured_on` | 2026-04-22 |
| `auditor` | Design research |
| `status` | **v1 preliminary draft.** Observations below are structured templates + reasonable inferences from publicly-known patterns at Hyderabad regional sweet-shop sites. **Every specific claim carries `(verify)` and must be live-browser-confirmed before use in strategy.** |
| `next_pass` | Live-browser walkthrough on a fresh device; capture screenshots to `research/audit-screenshots/` |

---

## Executive summary (what this audit is saying upfront)

Taken as a preliminary read — and pending in-browser verification:

1. **Digital presence is likely brochure-first, not commerce-first** (typical for Hyderabad regional shops of Ravi Sweets' era). The storefront build in `build-ravisweets-storefront` is therefore additive, not replacement.
2. **Trust signals that matter for gifting** (FSSAI display, shelf-life disclosure, returns policy, physical store address/hours) may be under-surfaced — standard weak points in the category. Surfacing these is a likely quick-win. *(verify)*
3. **SEO posture** likely weak vs. competitors Pulla Reddy / Almond House / Karachi Bakery, who have either stronger Google Business Profiles or delivery-app presence. *(verify)*
4. **Corporate / B2B gifting path** is almost certainly not a first-class web flow today — every field action so far suggests this is aspirational or phone-driven. This is the single biggest commerce whitespace for Ravi Sweets. *(verify)*
5. **International shipping** likely not supported or only via ad-hoc phone-orders. Critical gap for the stated diaspora ambition. *(verify)*

These are hypotheses to confirm — not conclusions.

---

## 1. Website inventory

> Spec requires every public page catalogued with URL / title / H1 / meta / purpose / `captured_on`.

| URL | Page title (observed) | H1 | Meta description | Purpose | captured_on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `https://ravisweets.com/` | *(verify)* | *(verify)* | *(verify)* | Home / landing | 2026-04-22 | Preliminary entry — needs live capture |
| `https://ravisweets.com/about` *(verify URL)* | *(verify)* | *(verify)* | *(verify)* | Brand story | 2026-04-22 | Typical presence at this URL; confirm |
| `https://ravisweets.com/products` *(verify URL)* | *(verify)* | *(verify)* | *(verify)* | Product listing | 2026-04-22 | May be per-category instead |
| `https://ravisweets.com/contact` *(verify URL)* | *(verify)* | *(verify)* | *(verify)* | Contact info / store locator | 2026-04-22 | Confirm physical-store details here |
| `https://ravisweets.com/sitemap.xml` | — | — | — | Sitemap | 2026-04-22 | **Follow-up:** check if sitemap exists + fetch it |
| `https://ravisweets.com/robots.txt` | — | — | — | Crawl directives | 2026-04-22 | **Follow-up:** fetch it |

**Follow-ups:**
- [ ] Crawl sitemap.xml to enumerate every discoverable URL
- [ ] Confirm navigation labels and order
- [ ] Identify orphan pages (reachable via sitemap but not via nav)

## 2. Product catalogue snapshot

> Spec requires: name / category / sub-category / weight-size / price / shelf-life / storage / ingredients / image URL / product URL + `captured_on`.

| Product name | Category | Sub-cat | Weight | Price (INR) | Shelf-life | Storage | Ingredients | Image URL | Product URL | captured_on |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| *(verify)* | *(verify)* | *(verify)* | *(verify)* | *(verify)* | unknown | unknown | unknown | *(verify)* | *(verify)* | 2026-04-22 |

**Follow-ups:**
- [ ] Capture every SKU with all fields
- [ ] Flag any SKU whose price isn't disclosed on the site (common in Indian sweet shops — "call for price")
- [ ] Flag SKUs missing shelf-life or storage declarations (trust-signal gap)

## 3. Category tree

*(to be reconstructed after page walk)*

Provisional hypothesis (to verify):
```
Sweets
  Hyderabadi Specials (Qubani ka Meetha, Double ka Meetha, Badam ki Jali)
  Milk Sweets (Kaju Katli, Kalakand, Peda, Burfi)
  Dry Sweets
Namkeens
Dry Fruits
Combos / Gift Boxes
Festival Specials (seasonal)
```
**Follow-ups:**
- [ ] Confirm exact tree and record SKU count per leaf
- [ ] Note any merchandising devices (bestseller, new, combo, gift-pack, festival-special)

## 4. Brand narrative

> Extract heritage claims with exact quotes.

Expected narrative beats (to verify / capture as exact quotes):
- Founding year — **(verify)** — often stated on "About" page for Hyderabad shops
- Founder — **(verify)**
- Heritage claims — possible references to Nizami / Deccan tradition, family recipes, hand-made process
- Values — likely "no preservatives", "fresh daily"
- Awards / press — **(verify)** — often understated at this class of shop

**Follow-ups:**
- [ ] Extract exact quotes from the About page
- [ ] Note any press logos or award images + verify they're legitimate
- [ ] Check for video content (founder interview / kitchen-tour)

## 5. Trust-signal inventory

Present / absent expected inventory (preliminary — verify each):

| Signal | Expected | Status | Notes |
| --- | --- | --- | --- |
| FSSAI licence number | should be on footer or about | *(verify)* | Absent on Hyderabad peers is common — becomes a differentiator if surfaced clearly |
| Hygiene / quality certifications | often absent | *(verify)* | |
| Customer reviews / ratings on site | rarely present | likely absent *(verify)* | Reviews tend to live on Google Business / Zomato instead |
| Testimonials | occasionally present | *(verify)* | |
| Media mentions | occasionally present | *(verify)* | |
| Years-in-business claim | common | *(verify)* | Look for "Since YYYY" |
| Returns policy | uncommon for perishables | *(verify)* | Often not stated — gap |
| Refund policy | uncommon | *(verify)* | |
| Contact details | usually present | *(verify)* | |
| Physical address / store locator | usually present for Hyderabad shops | *(verify)* | |
| Social proof counters | rare | *(verify)* | |
| Shipping policy / regions served | often vague | *(verify)* | Gap |
| **International shipping** | almost always absent | likely absent *(verify)* | Critical gap for diaspora strategy |

## 6. Digital / SEO / tech audit

> Observations of CMS, CWV, structured data, robots, sitemap, indexed count.

| Field | Observation | Evidence | Notes |
| --- | --- | --- | --- |
| Detected CMS / platform | *(verify)* | inspect HTML `<meta name="generator">` and asset paths | Likely WordPress / Shopify / custom PHP for this era of site |
| Mobile responsive | *(verify)* | Manual check at 360×640 | Category weakness — many Hyderabad peers fail this |
| Core Web Vitals (PageSpeed Insights) | *(verify)* | https://pagespeed.web.dev/?url=ravisweets.com | Run on mobile |
| Structured data (Product, Breadcrumb, Organization) | *(verify)* | view-source | Rare on category peers |
| robots.txt | *(verify)* | Fetch directly | Presence + disallowed paths |
| Sitemap | *(verify)* | Fetch /sitemap.xml | |
| Indexed page count | *(verify)* | `site:ravisweets.com` | Rough scale indicator |
| HTTPS | expected yes | browser check | Base hygiene |
| GA / PostHog / Meta Pixel | *(verify)* | view network requests | Signals current analytics maturity |

**Follow-ups:**
- [ ] Run PageSpeed Insights and capture LCP / INP / CLS + breakdown
- [ ] View source for meta generator + schema.org JSON-LD presence
- [ ] `site:ravisweets.com` count in Google

## 7. Customer-experience touchpoints

| Touchpoint | Observation | Notes |
| --- | --- | --- |
| Checkout flow (cart → address → payment → confirmation) | *(verify if commerce exists)* | May not exist — brochure-only pattern common |
| Payment methods | *(verify)* | If commerce: likely Razorpay / Instamojo |
| Shipping coverage + cost | *(verify)* | Look for pincode check |
| Delivery timelines | *(verify)* | Often vague — trust-signal gap |
| WhatsApp / chat presence | often a button | *(verify)* |
| Newsletter signup | often a footer form | *(verify)* |
| Phone / email | usually in footer | *(verify)* |
| Physical-store locator | address block | *(verify)* |
| B2B / bulk / corporate-gifting path | **almost always absent as a web flow** | likely absent *(verify)* — biggest commerce gap |

## 8. Social and off-site presence

| Platform | Linked from site? | URL | Follower / review count | captured_on |
| --- | --- | --- | --- | --- |
| Instagram | *(verify)* | *(verify)* | unknown | 2026-04-22 |
| Facebook | *(verify)* | *(verify)* | unknown | 2026-04-22 |
| YouTube | *(verify)* | *(verify)* | unknown | 2026-04-22 |
| LinkedIn | *(verify)* | *(verify)* | unknown | 2026-04-22 |
| Google Business Profile | *(verify claim status)* | Google Maps for "Ravi Sweets Hyderabad" | rating + review count | 2026-04-22 — **high priority to verify** |
| Amazon .in storefront | *(verify)* | unknown | unknown | 2026-04-22 |
| Swiggy / Zomato | *(verify)* | unknown | unknown | 2026-04-22 |
| Blinkit / Zepto / Instamart | *(verify)* | unknown | unknown | 2026-04-22 |
| Flipkart | *(verify)* | unknown | unknown | 2026-04-22 |

**Follow-ups:**
- [ ] Confirm every linked surface with a URL + current count
- [ ] Audit Google Business Profile specifically — rating, review count, last response, photos

## 9. Gaps and quick wins

> Format: gap → effort (S/M/L) → impact (L/M/H) → owner → source evidence row.

> All candidates below are *conditional* on the preliminary observations being confirmed by the live audit pass. Do not execute any before verification.

| # | Gap / Opportunity | Effort | Impact | Owner | Evidence |
| --- | --- | --- | --- | --- | --- |
| QW-1 | Surface **FSSAI number + years-in-business + founder quote** on every page footer | S | M | Marketing | §5 (verify) |
| QW-2 | Add **shelf-life, ingredients, storage** to every product page — basic trust hygiene | S | H | Product content | §2 (verify) |
| QW-3 | **Claim / optimise Google Business Profile** — primary discovery surface in Hyderabad | S | H | Marketing | §8 (verify) |
| QW-4 | Add **sitemap.xml + robots.txt + Product JSON-LD** if missing | S | M | Engineering | §6 (verify) |
| QW-5 | Make **pincode delivery check** a first-class widget on product pages | M | M | Engineering | §7 |
| QW-6 | Surface a **"Corporate Gifting"** landing page with a short enquiry form (even before full commerce) | M | H | Marketing + Engineering | §7 (likely absent) |
| QW-7 | Add **WhatsApp order / pay-link** flow for repeat Hyderabad customers | M | M | Marketing | §7 |
| QW-8 | Replace any low-quality product photos with real kitchen / product shots | L | H | Marketing (photo shoot) | §2 |
| QW-9 | Clearly state **shipping regions + timelines** in the footer and on every product | S | M | Marketing | §7 (verify) |
| SB-1 | Launch **international / diaspora gifting** as a Phase-2 strategic bet — big whitespace | L | H | Founder + Ops | §5 (likely absent) |

`SB-1` is flagged strategic-bet territory (see `specs/gtm-action-plan/spec.md`).

---

## Open questions / follow-ups (blocker for v2)

- [ ] **Live-browser walkthrough** of every page on ravisweets.com — with screenshots to `research/audit-screenshots/<page-slug>-2026-04-22.png`. This is the single biggest unblocker for a real audit.
- [ ] Confirm **primary trading geography** is purely Hyderabad or extends to other Telangana / AP cities.
- [ ] Confirm whether Ravi Sweets currently ships outside India (even informally via phone).
- [ ] Confirm GSTIN and FSSAI number for reuse across storefront build.
- [ ] Confirm top 3 SKUs by revenue (from Ravi Sweets' own sales data) — this flips which products deserve the most design attention.
- [ ] Pull 30-day Google Analytics or server-log data (if available) to get a top-pages / top-referrers view — would transform this audit from desktop to evidence-based.

---

## How this audit feeds the strategy work

Once the `v2` live-browser pass completes, its outputs directly feed:

| This audit's section | Downstream artefact |
| --- | --- |
| §1 Website inventory + §9 Gaps | `gtm.md` Quick Wins horizon |
| §2 Product catalogue + §5 Trust signals | `strategy.md` proof-points |
| §5 Trust signals + §6 SEO/tech | `benchmark.md` Ravi Sweets scorecard (dimensions: Trust signals, Digital maturity) |
| §7 Corporate path + §8 Off-site presence | `benchmark.md` (Gifting & Corporate/B2B, Channel coverage) |
| §8 Google Business + diaspora shipping | `benchmark.md` (International & export readiness) |

This document is a **scaffold**, not a finding. Its structure is correct per the `brand-audit` spec; its contents need a live pass before being load-bearing.
