## 1. Kickoff & Scope Lock

- [x] 1.1 ~~Confirm Ravi Sweets' primary trading geography~~ — confirmed 2026-04-21: **Hyderabad, India**, with global expansion ambition
- [x] 1.2 ~~Confirm B2B / corporate gifting importance~~ — confirmed 2026-04-21: **active priority track** (add `corporate` field to competitor schema)
- [x] 1.3 ~~Confirm own-D2C ambition~~ — implied serious given global expansion; digital-maturity weight held high
- [ ] 1.4 Confirm top 3 festival windows that matter most to the P&L (including diaspora-relevant ones: Diwali, Raksha Bandhan, Eid, Christmas corporate gifting)
- [ ] 1.5 Confirm current international-shipping capability on ravisweets.com (already shipping abroad? to where? greenfield or optimisation?)
- [ ] 1.6 Lock the competitor list tiers and counts (national 4–5 / Hyderabad-weighted regional 5–7 / D2C 3–5 / diaspora-international 3–5 = 16–22) and record `locked_on` date
- [ ] 1.7 Create the shared data schema for competitor entries as a Markdown template in `openspec/changes/analyze-brand-and-market/competitors.md` — **must include `corporate` and `international_shipping` fields**
- [ ] 1.8 Create the benchmark rubric template (9 dimensions × 0/3/5 anchors, including the new International / export readiness dimension) in `benchmark.md`

## 2. Brand Audit — ravisweets.com

- [ ] 2.1 Crawl sitemap.xml, navigation, and footer; produce a URL inventory with page title, H1, meta description, purpose, `captured_on`
- [ ] 2.2 Capture the full product catalogue: name, category, sub-category, weight/size, price (INR), shelf-life, ingredients, image URL, product URL, `captured_on`
- [ ] 2.3 Reconstruct and document the category / sub-category tree with SKU counts per leaf
- [ ] 2.4 Extract brand narrative: founding year, founders, Hyderabad/Nizami/Deccan heritage claims (with exact quotes), values, awards, press
- [ ] 2.5 Inventory trust signals (present and absent): FSSAI, certifications, reviews, testimonials, media mentions, returns/refund policy, address, contact
- [ ] 2.6 Run digital/SEO/tech audit: CMS detection, mobile responsiveness, Core Web Vitals (PageSpeed Insights), structured data, robots.txt, sitemap, indexed-page estimate via `site:`
- [ ] 2.7 Walk checkout end-to-end and record each step, payment methods, shipping coverage/cost, delivery timelines, chat/WhatsApp, newsletter
- [ ] 2.8 **Corporate / B2B path audit**: is there a dedicated corporate page, enquiry form, MOQ info, logo-customisation flow, GST/invoice handling, tiered-pricing signal? Record present/absent with evidence
- [ ] 2.9 **International / export path audit**: does the site ship internationally? If yes, to which countries, at what cost, with what shelf-life on the product, in what currency? If no, are there any "international enquiry" or "NRI gifting" signals? Record with evidence
- [ ] 2.10 Inventory off-site presence linked from the site (Instagram, Facebook, YouTube, LinkedIn, Google Business, Amazon .in / .com / .co.uk, Swiggy/Zomato, Blinkit/Zepto/Instamart, Flipkart) with follower/review counts + `captured_on`
- [ ] 2.11 Produce the "gaps & quick wins" section with effort (S/M/L) and impact (L/M/H) tags for each item — tag items as Hyderabad-retail / Corporate / International for easy downstream filtering
- [ ] 2.12 Write the audit up as `audit.md` inside the change directory with an executive summary at the top

## 3. Competitor Intelligence Dossier

- [ ] 3.1 Finalise the **national** competitor list (4–5 of: Haldiram's, Bikanervala, Bikaji, MTR, Anand Sweets if scored as national) and confirm with stakeholder
- [ ] 3.2 Finalise the **Hyderabad-weighted regional** competitor list (5–7, must include ≥5 Hyderabad-HQ'd or Hyderabad-primary brands): shortlist includes Pulla Reddy, Almond House, Karachi Bakery, G. Pulla Reddy Sweets, Mahalakshmi Sweets, Agarwal Sweets, Bombay Halwa House; add 1–2 adjacent-region contrast players (e.g., Anand Sweets / A2B / Sri Krishna Sweets)
- [ ] 3.3 Finalise the **D2C / premium / gifting-first** list (3–5, e.g., Bombay Sweet Shop, Anand Sweets' premium line, any new-wave gifting brands)
- [ ] 3.4 Finalise the **diaspora / international shippers** list (3–5): Haldiram's international (haldiram.com / haldirams.com /.co.uk), Bikaji exports, Royal Sweets USA, Ambala Sweets UK, Mithaas, Ganesh Sweets AU, plus 1–2 strong local diaspora mithai shops that ship internationally
- [ ] 3.5 For each competitor, populate the normalised schema — including the new **`corporate`** and **`international_shipping`** fields (brand, tier, hq_city, footprint, price_band incl. foreign currency where applicable, signature_skus, gifting_range, corporate, international_shipping, packaging_notes, channels, social_presence, content_angle, trust_signals, weaknesses, source_urls, captured_on)
- [ ] 3.6 For each competitor, source price bands from the brand's own D2C site where available; capture foreign-currency pricing from international storefronts where they exist; fall back to marketplaces with the source noted
- [ ] 3.7 For each competitor with `corporate: yes`, enumerate which sub-capabilities are confirmed (MOQ, logo customisation, corporate portal, GST/invoice, multi-address delivery, tiered pricing)
- [ ] 3.8 For each competitor with `international_shipping: yes`, list destination countries, declared shelf-life on export packs, and foreign-currency checkout support
- [ ] 3.9 For each competitor, collect 2–4 evidence-backed weaknesses with source pointers
- [ ] 3.10 Tag thin-data competitors `needs_field_validation: true` and add them to the follow-ups list
- [ ] 3.11 Build the 12-month recent-moves log per competitor (launches, campaigns, new channels, price changes, corporate-programme announcements, international-market entries, press) with month/year + URL
- [ ] 3.12 Write the **four** tier-summary narratives (national / Hyderabad-regional / D2C / diaspora-international) naming the shared playbook of each tier
- [ ] 3.13 Compile the dossier as `competitors.md` with a front-matter table of contents

## 4. Market Benchmark Scorecard

- [ ] 4.1 Lock the **9-dimension** rubric (Product breadth / Pricing clarity / Packaging / Digital maturity / Storytelling / Trust signals / **Gifting & Corporate/B2B** / Channel coverage / **International & export readiness**) with 0/3/5 anchors per dimension
- [ ] 4.2 Score every competitor on every dimension (0–5) with a one-line justification per cell pointing to an evidence row in `competitors.md`
- [ ] 4.3 Score Ravi Sweets on the same rubric with justifications pointing to `audit.md`
- [ ] 4.4 Write the per-dimension gap summary: best-in-class competitor, what they do, concrete delta for Ravi Sweets — include the diaspora/international tier median on the International & export readiness dimension
- [ ] 4.5 Identify whitespace (dimensions/sub-dimensions where ≥ 3 competitors score ≤ 2) and document each with supporting evidence — with explicit attention to sub-patterns within Corporate capability and International readiness
- [ ] 4.6 Decide whether to publish a weighted composite; if yes, declare weights and rationale (recommend up-weighting Gifting & Corporate and International & export readiness to reflect stated growth priorities) and also show the unweighted view
- [ ] 4.7 Produce `benchmark.md` with (a) the rubric, (b) the full scorecard as a Markdown table, (c) gap summaries, (d) whitespace callouts

## 5. Differentiation Strategy

- [ ] 5.1 Draft 3–5 positioning options each in the form "For <target>, Ravi Sweets is the <category> that <claim>, because <proof>" — **must include at least one Hyderabad-retail, one Corporate/B2B, and one Diaspora/International option** to cover all three growth vectors
- [ ] 5.2 For each option, cite the whitespace dimension(s) from `benchmark.md` and the Ravi Sweets strengths it builds on
- [ ] 5.3 For each option, name 2–3 competitors it is deliberately NOT and the sacrifice being made
- [ ] 5.4 Score all options on the 5-criterion scorecard (fit / whitespace size / execution difficulty / defensibility / time-to-signal)
- [ ] 5.5 Pick ONE recommended option OR a "portfolio" recommendation (one core positioning + segment-specific claims for Corporate and International); document the rationale and the top 2 risks + mitigations
- [ ] 5.6 Build the proof-point inventory for the recommended option (specific SKUs, packaging cues, content pillars, store-experience changes, certifications — include export-readiness proof points like 30–45 day shelf-life packs, FDA-registration claim, halal/kosher where relevant)
- [ ] 5.7 Write the anti-patterns list — positioning moves to avoid — naming the competitor that owns each abandoned position (e.g., "don't chase national heritage against Haldiram's", "don't price-lead against Bikaji scale", "don't out-modern Bombay Sweet Shop")
- [ ] 5.8 Produce `strategy.md` with options table, recommendation, proof points, and anti-patterns

## 6. GTM Action Plan

- [ ] 6.1 Derive action candidates from every below-median dimension in `benchmark.md` and from every proof point in `strategy.md`
- [ ] 6.2 Write each action using the normalised schema (id, title, horizon, owner_role, effort, cost_band, expected_impact, success_metric, depends_on, source)
- [ ] 6.3 Verify every action's `source` field traces to a concrete benchmark gap, whitespace area, or proof point — remove orphans
- [ ] 6.4 Assemble the Quick Wins horizon with 6–10 sub-30-day, effort=S actions; write owner-ready briefs for each (tag each as Hyderabad-retail / Corporate / International for downstream owner clarity)
- [ ] 6.5 Assemble the 30/60/90 horizon with staged actions and owner-ready briefs
- [ ] 6.6 Assemble the Strategic Bets horizon — **must include** (a) **Corporate / B2B gifting programme** (portal + custom packaging + GST/invoice + MOQ ladder), (b) **International-shipping enablement** from ravisweets.com (export-safe packs, destination phasing, foreign-currency checkout, customs/labelling), (c) **First-diaspora-market launch** (named country + named channel: own D2C vs. Amazon-country vs. diaspora retail partner). Each bet has a risk note and a cheapest-test-first step with its own success metric and duration
- [ ] 6.7 Sort within each horizon by (impact desc, effort asc, cost_band asc) and enforce dependency ordering
- [ ] 6.8 Verify rubric coverage: every below-median dimension has ≥ 1 action OR is explicitly named in the strategy's sacrifice list
- [ ] 6.9 Document the refresh cadence (quarterly recommended) and at least 3 out-of-cycle refresh triggers (e.g., competitor international-market entry, major corporate-programme launch by a rival, new quick-commerce channel going live)
- [ ] 6.10 Produce `gtm.md` with the full action list, owner-ready briefs, refresh cadence, and the follow-ups list (carried over from competitor-intelligence thin-data flags)

## 7. Stakeholder Review & Archive

- [ ] 7.1 Share the five deliverables (`audit.md`, `competitors.md`, `benchmark.md`, `strategy.md`, `gtm.md`) with the stakeholder
- [ ] 7.2 Capture feedback; mark any contested scores / claims and revalidate sources
- [ ] 7.3 Update the positioning recommendation if stakeholder picks a different option than recommended — and document why
- [ ] 7.4 Lock the `captured_on` dates on every deliverable
- [ ] 7.5 Run `openspec validate analyze-brand-and-market --strict` and fix any violations
- [ ] 7.6 Archive the change with `/opsx:archive` so the five specs land in `openspec/specs/` as the acceptance contract for the quarterly refresh
