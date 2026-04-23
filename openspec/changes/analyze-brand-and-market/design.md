## Context

Ravi Sweets is a traditional Indian sweets & namkeen brand with a live website at ravisweets.com. The brand competes against a stacked field: pan-India heritage giants (Haldiram's, Bikanervala, Bikaji), large regional leaders (Anand Sweets in Bengaluru, Adyar Ananda Bhavan / A2B in TN, Pulla Reddy & Almond House in Hyderabad, Ganguram's in Kolkata, Chitale Bandhu in Pune, Tewari Bros in Mumbai, Kaleva in Delhi), and a new wave of D2C/premium gifting brands (Bombay Sweet Shop, Loveleaf, Baker's Dozen-style premium, Anand Sweets' modern SKUs). Customer behaviour has shifted: gifting is now a year-round D2C/quick-commerce purchase, not just a festival walk-in. Marketplaces (Amazon, Flipkart), quick-commerce (Blinkit, Zepto, Swiggy Instamart), and delivery apps (Swiggy, Zomato) are now primary distribution surfaces alongside own stores.

This change is a **research & strategy deliverable**, not a code change. The "implementation" is a set of Markdown research artifacts, a benchmark sheet, and a recommendation deck-in-markdown. The downstream users are the founder/marketing/product team; the downstream consumers of the data are future OpenSpec changes (website refresh, new SKUs, packaging, channel expansion).

**Current state**: no existing brand audit, no competitor file, no benchmark, no documented positioning. All prior decisions are tacit.

**Constraints**:
- Public data only (no paid Similarweb/Nielsen in v1).
- Point-in-time snapshot — every artifact must carry an "as-of" date.
- Analyst must avoid fabricating prices, SKUs, or review counts. If a value cannot be verified from a cited public source, it is recorded as `unknown` with a follow-up action.
- Regional competitors often have weak digital presence — in-person/phone validation will be flagged but not performed inside this change.

## Goals / Non-Goals

**Goals:**
- Produce a structured, citation-backed audit of ravisweets.com covering catalogue, pricing, category tree, content/storytelling, trust signals, tech/SEO, and CX touchpoints.
- Produce a competitor dossier with a consistent schema across ~12–18 competitors (national, regional, D2C) so rows can be compared.
- Produce a side-by-side benchmark scorecard scoring Ravi Sweets and competitors across a fixed rubric (product breadth, pricing, packaging, digital maturity, storytelling, trust signals, gifting/B2B, channel coverage).
- Produce a differentiation recommendation with 3–5 positioning options, a recommended pick, rationale, and named risks.
- Produce a prioritised GTM action list (quick wins ≤ 30 days; 30/60/90; strategic bets) that any downstream change can pull from.

**Non-Goals:**
- No website rebuild, no new SKUs shipped, no paid campaigns in this change.
- No primary research (no customer surveys, no taste tests, no mystery-shopping) in v1.
- No financial modelling (unit economics, ROI) — that sits with a later change.
- No legal/trademark analysis.
- No packaging artwork.

## Decisions

### Decision 1: Five capabilities, not one monolithic report
The work is split into `brand-audit`, `competitor-intelligence`, `market-benchmark`, `differentiation-strategy`, `gtm-action-plan` — each a separate spec and deliverable.
- **Why**: each capability has different data sources, different rigour bars, and different consumers. A single 80-page deck is unreadable and un-updatable.
- **Alternative considered**: one combined `market-analysis` spec. Rejected — it couples the audit to the strategy, which means you can't refresh the competitor dossier quarterly without re-opening the strategy.

### Decision 2: Normalised data schema across competitors
Every competitor entry uses the same fields: `brand`, `hq_city`, `footprint`, `price_band`, `signature_skus`, `gifting_range`, `packaging_notes`, `channels` (own-store / Amazon / Flipkart / Blinkit / Zepto / Instamart / Swiggy / Zomato / own-D2C), `social_presence`, `content_angle`, `trust_signals`, `weaknesses`, `source_urls`, `captured_on`.
- **Why**: normalised schema is what makes the benchmark scorecard possible. Free-form notes per competitor cannot be compared.
- **Alternative considered**: free-form narrative per competitor. Rejected — not benchmark-ready.

### Decision 3: Rubric-based benchmark, not vibes-based
Benchmark uses a fixed 0–5 rubric across 8 dimensions (product breadth, pricing clarity, packaging, digital maturity / website + SEO, storytelling / brand narrative, trust signals / reviews / certifications, gifting & B2B, channel coverage). Each score has a one-line justification pointing to evidence in the dossier.
- **Why**: makes Ravi Sweets' relative position defensible and makes the gap-to-close concrete.
- **Alternative considered**: qualitative SWOT only. Rejected — too squishy to drive a GTM list.

### Decision 4: Tiered competitor list (national / regional / D2C) with caps
Cap national at 4–5, regional at 5–7 (weighted toward Ravi Sweets' actual trading geography), D2C/premium at 3–5. Total ~12–18.
- **Why**: prevents the dossier from ballooning into 50 brands of thin data.
- **Alternative considered**: "cover everyone". Rejected — depth beats breadth for differentiation work.

### Decision 5: Markdown deliverables in-repo (not slides, not Notion)
All outputs are Markdown inside `openspec/changes/analyze-brand-and-market/` (audit.md, competitors.md, benchmark.md, strategy.md, gtm.md).
- **Why**: versioned, diff-able, renders in any tool, and OpenSpec's spec files will later codify the acceptance criteria. Slides can be generated from Markdown later.
- **Alternative considered**: Notion / Google Slides. Rejected for v1 — harder to diff and harder for future LLM refreshes.

### Decision 6: Every claim carries a source URL + as-of date
No price, SKU count, review count, or "they just launched X" claim lands without a URL and a captured_on date. Unverifiable claims are logged as `unknown` with a follow-up.
- **Why**: this is a repeatable, refreshable research asset. Sources make refreshes cheap; no-sources makes it disposable.

### Decision 7: Hyderabad-weighted regional tier + added diaspora/international tier
Ravi Sweets is Hyderabad-based with global ambition. Regional competitors are weighted toward Hyderabad (Pulla Reddy, Almond House, Karachi Bakery, G. Pulla Reddy Sweets, Mahalakshmi Sweets, Agarwal Sweets, Bombay Halwa House), plus 1–2 from adjacent markets (e.g., Bangalore's Anand Sweets, Chennai's A2B) for contrast. A **fourth tier — diaspora / international shippers** — is added and capped at 3–5 (Haldiram's international, Bikaji exports, Royal Sweets USA, Ambala Sweets UK, Mithaas, Ganesh Sweets AU, and notable diaspora mithai shops with international delivery).
- **Why**: the founder's growth thesis is "win Hyderabad deeper AND reach diaspora"; the competitor set has to mirror both, or the benchmark can't inform either move.
- **Alternative considered**: keep three tiers and fold international into "D2C". Rejected — international shippers have fundamentally different operational models (cold-chain, customs, 30-day shelf-life SKUs, foreign-currency pricing) that deserve their own tier.

### Decision 8: Corporate / B2B gifting is a first-class field and benchmark signal
Every competitor entry includes a `corporate` field (yes/no + notes covering minimum order, logo customisation, portals/accounts, invoice/GST support, delivery to multiple addresses, tiered pricing). The benchmark's Gifting & B2B dimension explicitly accounts for corporate capability, not just retail gifting.
- **Why**: stakeholder named corporate gifting as a priority track; treating it as a sub-bullet would let it get lost under retail gifting.

### Decision 9: International / export readiness is scored on the benchmark
The Channel Coverage dimension is expanded to explicitly score international-shipping enablement (own international checkout, country-specific SKUs, declared shelf-life on export packs, diaspora-market retail partnerships, foreign-currency pricing). Alternatively handled as a 9th dimension if evidence warrants; decision to split or merge is taken after the dossier is built (default: merged into Channel Coverage).
- **Why**: "expand globally" is a stated goal; the benchmark must measure who is already doing it well so Ravi Sweets can benchmark and learn.

## Risks / Trade-offs

- **Risk**: Competitor prices and SKUs on third-party marketplaces lag in-store reality. → **Mitigation**: capture from the brand's own D2C site where available; note marketplace-only evidence explicitly; mark volatile fields with `captured_on`.
- **Risk**: Regional competitors have thin digital footprints — we under-represent their strengths. → **Mitigation**: flag each thin-data competitor with a `needs_field_validation: true` tag and list it in GTM's "follow-ups" so a human can call/visit.
- **Risk**: "Differentiation" turns into a generic list (premium, clean-label, gifting) that every competitor already claims. → **Mitigation**: the strategy spec requires each positioning option to name at least one competitor it is explicitly NOT, and to cite the evidence gap it exploits.
- **Risk**: Research ages fast (festival launches, new SKUs, price changes). → **Mitigation**: every artifact carries `captured_on`; schedule a quarterly refresh as a recurring change (not in scope here).
- **Risk**: Analyst bias — cherry-picking competitors to fit a preferred positioning. → **Mitigation**: the competitor list is locked before the benchmark scoring begins; scoring rubric is fixed and justification is required per cell.
- **Trade-off**: No paid data (Similarweb, Meta Ad Library exports, Nielsen) means traffic/share-of-voice numbers will be directional, not precise. Accepted for v1.
- **Trade-off**: No primary customer research means we are inferring positioning whitespace from supply-side evidence only. Accepted for v1; flagged as a v2 upgrade.

## Migration Plan

Not applicable — no production systems are being changed. On archive, the five spec files land in `openspec/specs/` and become the acceptance contract for future refresh cycles and downstream changes.

## Resolved Inputs (2026-04-21)

1. **Trading geography**: **Hyderabad, India** is the primary base. Regional competitor research is weighted toward Hyderabad players (Pulla Reddy, Almond House, Karachi Bakery, G. Pulla Reddy Sweets, Mahalakshmi Sweets, Agarwal Sweets, Bombay Halwa House). Ambition is **global expansion**, so a fourth competitor tier — **diaspora / international shippers** — is added (Haldiram's international, Bikaji exports, Royal Sweets USA, Ambala Sweets UK, Mithaas, Ganesh Sweets AU, and strong local diaspora mithai shops in key cities).
2. **B2B / corporate gifting**: treated as a **priority revenue track**, not aspirational. Added as a first-class field (`corporate`: yes/no + notes) in the competitor schema and surfaced explicitly in the benchmark's Gifting & B2B dimension.
3. **Own-D2C ambition**: implicitly serious given global expansion intent. Digital-maturity rubric weight is held high; international-shipping enablement is a named strategic bet.
4. **Budget envelope**: **open to Strategic Bets**. The GTM action plan includes all three horizons — Quick Wins, 30/60/90, and Strategic Bets — without budget-filtering.

## Open Questions

1. **Festival calendar coverage**: which festivals matter most to Ravi Sweets' P&L (Diwali, Raksha Bandhan, Dussehra, Eid, Pongal/Sankranti, Ugadi, Ramzan / Ramadan for diaspora, Christmas for corporate gifting)? Ranking affects content-pillar and SKU-calendar recommendations — treat as a follow-up, not a blocker.
2. **First diaspora target market**: US vs. UK vs. UAE vs. Singapore/Australia — each has different import regulations, shelf-life requirements, and dominant incumbents. Strategic-bets sequencing will recommend one based on evidence from the dossier, to be confirmed with the stakeholder.
3. **Current international shipping capability**: does ravisweets.com currently ship abroad, and if so to which countries? (Determines whether international GTM is a greenfield build or an optimisation.)
