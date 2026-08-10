# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Priority-ranked ICPs (GROWTH_PLAN.md, 2026-05-04):

1. **NRI hamper senders** (US/UK/UAE/Aus/Sg/Ca) sending to family in Telangana/AP — ₹3,000–7,000 baskets, 4–6×/yr, festival-driven. The "send-from-Khammam" trust story is the win driver.
2. **Hyderabad Telugu working families** (28–45) — ₹900–2,200, 1–2×/month. The home base to protect.
3. **Telangana SME / corporate buyers** — Diwali, employee and client gifting, ₹40K–4L per order. Won by logo printing, GST invoicing, multi-address dispatch.
4. **Health-first urban buyers** (35–55, diabetic/pre-diabetic household) — won by jaggery/millet/sugar-free line with real nutrition panels.
5. **Wedding / event planners** (Hyd, Vijayawada, Bengaluru) — white-label hampers, fast turnaround.
6. **Khammam local walk-ins** — the offline cash engine; don't break it, digitise it.

Marketing over-indexes on ICPs 1, 3, and 4 (largest gap between current and addressable revenue).

## Product Purpose

D2C e-commerce storefront + in-app admin for **Ravi Sweets**, a family sweets brand rooted in Khammam, Telangana since 1983, with three retail counters (Khammam Mamillagudem, a second Khammam branch, and Kondapur, Hyderabad). **Fully launched: this build serves ravisweets.com traffic; the prior WordPress/Woo site is retired** (confirmed by owner-side, 2026-08-02).

Success = owning the open "Khammam-rooted Telangana sweets, delivered nationally" lane: top-3 local search for "sweet shop Khammam", growing NRI hamper and corporate-gifting revenue, while the walk-in trade stays protected.

## Positioning

> "Khammam family sweets, slow-cooked since 1983 — delivered fresh anywhere in India."

Five claims no neighbouring brand can truthfully copy:

1. Only national-shipping sweets brand rooted in Khammam / mid-Telangana (not Hyderabad polish, not Andhra coast).
2. 40-year continuity — same kitchen, same family, since 1983.
3. No-preservatives mandate — short shelf life is the proof.
4. Same-day fresh dispatch — chef-grade hamper, not a warehouse SKU.
5. Three physical counters as walk-in proof of authenticity.

## Operating Context

- **Festival rhythm drives the business** — Diwali alone is ~30–35% of category revenue. Festival editions and the admin-toggleable promo strip are core operating workflow, not campaigns bolted on.
- **WhatsApp is the primary relationship channel** — floating WhatsApp/Instagram/Call pills sitewide; order and catalogue conversations happen there.
- **Perishability shapes the catalogue** — fresh khoya/mawa sweets keep 4–7 days; the shipping range leans shelf-stable (dry-fruit barfis, laddoos, mysore pak) separate from the perishable walk-in range.
- **Corporate flow is click-driven** — the hamper builder (logo upload, ribbon swatches, box finishes, multi-address CSV dispatch) replaces the email-driven flow competitors use.
- **Admin lives inside the storefront app** (`(admin)` route group) — products, promotions, orders, analytics — backed by Supabase (auth, orders, edge functions `send-order-email`, `team-management`).

## Capabilities and Constraints

- Next.js 15 **static export** to Cloudflare Pages (`BUILD_TARGET=cloudflare`); no SSR — all dynamic behaviour is client-side + Supabase.
- 80+ product catalogue with 10 festival editions. Products/variants are catalogue-code-driven and **never DB-seeded**; admin product edits no-op on a fresh Supabase project until a catalogue→DB import exists.
- **Checkout does not capture payment online** — the payment step simulates (code-verified on this branch, 2026-08-02); Razorpay integration is roadmap (Phase 4.4). Order receipts ship via the `send-order-email` edge function.
- Search indexing is env-gated in `src/app/robots.ts` (`NEXT_PUBLIC_INDEXING_ENABLED=true` opens crawling). **Open item:** launch + photography conditions are now met — verify the flag is enabled in the production build.
- Open/undecided product facts: exact second Khammam street address (placeholder in JSON-LD); B2B portal, subscriptions, `/te` + `/hi` i18n, AR pack-preview, kitchen-schedule widget remain roadmap, not shipped.

## Brand Commitments

Binding — confirmed by owner-side 2026-08-02; future design work must preserve, not revise:

- **Sweet Cursor** (jalebi/laddoo/kaju-katli/halwa/murukku cursor).
- **Flavour Atlas** (hover a sweet → page accents retune to its palette).
- **Corporate hamper builder** (logo upload, ribbon, finishes, multi-address dispatch).
- **WhatsApp-first contact pills + festival promo system.**

Binding brand facts: name Ravi Sweets; est. 1983, Khammam; founder Srinivasa Rao Edupalli; no-preservatives mandate; FSSAI-badged composition transparency (ingredients + allergens) on every product.

## Evidence on Hand

- **Real production photography exists** (confirmed 2026-08-02) but is not yet in the repo — the branch still hot-links ravisweets.com images as a stopgap. Ask where the assets live before designing around them.
- **Real customer testimonials exist** (confirmed 2026-08-02) but are not yet in the repo. Source exact quotes from the owner before publishing; never paraphrase into invented quotes.
- Market and competitor research: `PROPOSAL.md` and `GROWTH_PLAN.md` at repo root (both 2026-05-04).
- Three store locations with LocalBusiness JSON-LD; one Khammam address is still a placeholder.
- Nothing else may be claimed: no awards, press, benchmarks, or review counts exist to cite.

## Product Principles

1. **Khammam-proven, not Khammam-led** (amended by owner decision, 2026-08-03) — locality is still the moat and stays truthful in schema, /stores, /about, shipping policies, and product provenance fields (the batch card's KITCHEN row, the footer NAP). Entry surfaces — hero, homepage metadata, OG/ads, logo lockup — lead with craft, family, and freshness instead: the brand addresses a global buyer whose parcel lands in India. Never delete a factual or legal locality reference; never lead a marketing surface with one.
2. **Transparency is a conversion feature** — ingredients, allergens, FSSAI, freshness timing sell; treat them as product, not compliance.
3. **Own the relationship** — WhatsApp and the direct channel outrank marketplaces; never design a flow that hands the customer to an aggregator.
4. **Festival rhythm is the calendar** — surfaces must flex to festival editions and promos without redesign.
5. **Indulgent + better-for-you, never "diet"** — the health line is framed as the same sweet made prouder (jaggery, millets), not as punishment.

## Accessibility & Inclusion

No formal standard mandated. Audience spans English-first NRI diaspora and Telugu-first locals; `/te` Telugu and `/hi` Hindi localisation is on the roadmap but not built. Keep copy legible to non-native English readers.
