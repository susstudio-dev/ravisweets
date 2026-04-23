## ADDED Requirements

### Requirement: Fixed benchmark rubric
The market-benchmark SHALL score Ravi Sweets and every competitor in the locked list across exactly nine dimensions on a 0–5 scale: (1) **Product breadth**, (2) **Pricing clarity & range**, (3) **Packaging**, (4) **Digital maturity** (website + SEO + structured data + checkout), (5) **Storytelling / brand narrative**, (6) **Trust signals** (FSSAI, reviews, certifications, press), (7) **Gifting & Corporate/B2B capability** (retail gifting range AND corporate features: MOQ, logo/packaging customisation, corporate portal, GST/invoice, multi-address delivery, tiered pricing), (8) **Channel coverage** (own-store, marketplaces, quick-commerce, food delivery, own-D2C), (9) **International / export readiness** (international-shipping enablement, destination coverage, export-pack shelf-life, foreign-currency checkout, diaspora retail partnerships, country-specific certifications where applicable).

#### Scenario: Rubric is fixed before scoring
- **WHEN** benchmark scoring begins
- **THEN** the rubric (dimensions, 0–5 scale, what 0/3/5 means per dimension) is documented and cannot be changed for the current round

#### Scenario: Dimensions have anchor definitions
- **WHEN** a dimension is scored
- **THEN** the rubric includes a short anchor for 0 ("absent/broken"), 3 ("competent / industry-average"), and 5 ("category-leading") for that dimension

### Requirement: Per-cell evidence
Every score cell (brand × dimension) SHALL carry a one-line justification that points to the evidence row(s) in the brand-audit or competitor-intelligence dossier that support the score.

#### Scenario: No unjustified cell
- **WHEN** the benchmark is reviewed
- **THEN** every score cell has a justification and an evidence pointer; blank justifications are not permitted

### Requirement: Ravi Sweets scored on the same rubric
Ravi Sweets SHALL be scored on the identical rubric with the identical evidence requirements, so the gap-to-competitor is directly readable.

#### Scenario: Ravi Sweets row is present
- **WHEN** the benchmark scorecard is opened
- **THEN** Ravi Sweets appears as a row with all eight dimension scores, justifications, and evidence pointers

### Requirement: Gap summary per dimension
For each of the nine dimensions, the benchmark SHALL produce a short gap summary describing where Ravi Sweets sits vs. the best-in-class competitor and vs. the tier median (including the Diaspora / International Shippers tier median for the International / export readiness dimension).

#### Scenario: Gap is stated in concrete terms
- **WHEN** a gap summary is read
- **THEN** it names the best-in-class competitor on that dimension, the observed practice that earns their high score, and the specific delta Ravi Sweets would need to close

### Requirement: Whitespace identification
The benchmark SHALL include a "whitespace" section naming dimensions or sub-dimensions where multiple competitors score ≤ 2 — i.e., under-served areas that are candidates for differentiation.

#### Scenario: Whitespace is evidence-backed
- **WHEN** a whitespace area is named
- **THEN** it cites the competitors that score ≤ 2 on that dimension and explains why the area is under-served

### Requirement: Weighted composite is optional and declared
If a weighted composite score is produced, the weights SHALL be declared openly (e.g., digital maturity 1.5×, gifting 1.2×) with rationale. An unweighted simple-average view MUST also be shown.

#### Scenario: Weights are transparent
- **WHEN** a composite score is published
- **THEN** the weights and their rationale are shown alongside the composite, and the unweighted view is available for comparison
