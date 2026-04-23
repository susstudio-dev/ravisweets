## ADDED Requirements

### Requirement: Competitor list construction
The competitor-intelligence dossier SHALL include 16–22 competitors split across four tiers — **National** (4–5: e.g., Haldiram's, Bikanervala, Bikaji, MTR), **Regional (Hyderabad-weighted)** (5–7: e.g., Pulla Reddy, Almond House, Karachi Bakery, G. Pulla Reddy Sweets, Mahalakshmi Sweets, Agarwal Sweets, Bombay Halwa House, with 1–2 adjacent-region players for contrast such as Anand Sweets or A2B), **D2C / Premium / Gifting-first** (3–5: e.g., Bombay Sweet Shop, Anand Sweets' modern line, new-wave brands), and **Diaspora / International Shippers** (3–5: e.g., Haldiram's international, Bikaji exports, Royal Sweets USA, Ambala Sweets UK, Mithaas, Ganesh Sweets AU, and notable diaspora mithai shops with international delivery).

#### Scenario: Tier caps are respected
- **WHEN** the competitor list is finalised
- **THEN** it has 4–5 national, 5–7 Hyderabad-weighted regional, 3–5 D2C/premium, and 3–5 diaspora/international entries, totalling 16–22

#### Scenario: Hyderabad bias is honoured
- **WHEN** the regional tier is reviewed
- **THEN** at least 5 of its entries are Hyderabad-headquartered or Hyderabad-primary brands

#### Scenario: List is locked before benchmarking
- **WHEN** scoring starts in the market-benchmark artifact
- **THEN** the competitor list has a "locked_on" date and any later additions are recorded as an addendum, not silent edits

### Requirement: Normalised competitor schema
Each competitor entry SHALL use the same field schema: `brand`, `tier`, `hq_city`, `footprint` (cities/states/countries served), `price_band` (₹/kg range with examples; and USD/GBP/AED equivalents where the brand ships or sells internationally), `signature_skus` (top 3–5), `gifting_range` (yes/no + notes), `corporate` (yes/no + notes covering minimum order quantity, logo/packaging customisation, corporate-account portal, GST/invoice support, multi-address delivery, tiered pricing), `international_shipping` (yes/no + destinations + shelf-life on export packs + foreign-currency checkout), `packaging_notes`, `channels` (own-store count, Amazon .in / .com / .co.uk, Flipkart, Blinkit, Zepto, Instamart, Swiggy, Zomato, own-D2C, diaspora retail partnerships), `social_presence` (platform + follower count + `captured_on`), `content_angle` (heritage / modern / health / festive / regional / premium / diaspora-nostalgia), `trust_signals`, `observed_weaknesses`, `source_urls`, `captured_on`.

#### Scenario: No field is silently omitted
- **WHEN** a competitor entry is reviewed
- **THEN** every schema field — including `corporate` and `international_shipping` — is present; unknown values are written as `unknown` with a follow-up note, never blank

#### Scenario: Corporate-gifting evidence is detailed
- **WHEN** `corporate: yes` is recorded
- **THEN** the notes enumerate which of the sub-capabilities (MOQ, logo customisation, corporate portal, GST/invoice, multi-address delivery, tiered pricing) are confirmed from public evidence, and which are `unknown`

#### Scenario: International shipping is recorded per destination
- **WHEN** `international_shipping: yes` is recorded
- **THEN** the entry lists the specific destination countries, the shelf-life declared on export-safe packs, and whether the site supports foreign-currency checkout

### Requirement: Evidence and sourcing
Every quantitative claim (price, follower count, store count, review count, launch date) SHALL carry a source URL and a `captured_on` date. Claims without a citable public source SHALL be recorded as `unknown`.

#### Scenario: Price claims are sourced
- **WHEN** a price band is stated for a competitor
- **THEN** at least one URL pointing to the competitor's own site or a listed marketplace SKU supports the band

#### Scenario: Unverifiable claims are not invented
- **WHEN** a field cannot be confirmed from a public source
- **THEN** the value is `unknown` and a follow-up action ("validate in field", "call store", etc.) is logged

### Requirement: Weakness identification per competitor
Each competitor entry SHALL include 2–4 observed weaknesses or gaps (e.g., "no gifting SKUs under ₹500", "website is brochure-only, no checkout", "thin presence in quick-commerce", "inconsistent shelf-life disclosure"). Each weakness MUST be evidence-backed, not speculative.

#### Scenario: Weakness is evidence-backed
- **WHEN** a weakness is listed
- **THEN** the entry cites the page, listing, or absence-of-artifact that supports it

### Requirement: Thin-data flag and field-validation follow-ups
Competitors whose digital footprint is insufficient for confident scoring SHALL be tagged `needs_field_validation: true` and added to a follow-ups list (call store, visit location, check local press).

#### Scenario: Thin-data competitors are flagged
- **WHEN** a competitor has fewer than three independent data sources
- **THEN** the entry is tagged `needs_field_validation: true` and appears in the follow-ups list

### Requirement: Recent-moves log
The dossier SHALL include a dated "recent moves" log per competitor covering the last 12 months: new SKU launches, festival campaigns, new channels, price changes, store openings, notable press — drawn only from public sources.

#### Scenario: Recent moves are dated and sourced
- **WHEN** a recent move is logged
- **THEN** it has a month/year, a one-line description, and a source URL

### Requirement: Tier summary narratives
After the per-competitor entries, the dossier SHALL include four tier-summary narratives — one each for **National**, **Regional (Hyderabad-weighted)**, **D2C / Premium**, and **Diaspora / International Shippers** — summarising the shared playbook of that tier and how it differs from the others.

#### Scenario: Tier summaries name shared plays
- **WHEN** a tier summary is read
- **THEN** it identifies at least three patterns common across that tier (e.g., "all diaspora shippers offer 30–45 day shelf-life export packs and lead with nostalgia-led content")

#### Scenario: Diaspora tier calls out export-ops patterns
- **WHEN** the diaspora/international tier summary is read
- **THEN** it specifically covers declared shelf-life ranges, destination-country coverage, shipping-cost bands, payment-currency support, and the trust signals used (FDA registration claims, halal/kosher certifications where relevant, temperature-controlled shipping claims)
