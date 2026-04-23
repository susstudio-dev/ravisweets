## ADDED Requirements

### Requirement: Three-horizon structure
The GTM action plan SHALL organise actions into three horizons: **Quick Wins** (≤ 30 days, low effort, low risk), **30/60/90** (staged build-out), and **Strategic Bets** (90+ days, higher investment, higher upside).

#### Scenario: Every action has a horizon
- **WHEN** an action is listed
- **THEN** it is placed in exactly one horizon with a stated duration bound

### Requirement: Action schema
Each action SHALL carry a normalised schema: `id`, `title`, `horizon`, `owner_role` (e.g., marketing, kitchen, ops, founder), `effort` (S/M/L), `cost_band` (₹ / ₹₹ / ₹₹₹), `expected_impact` (L/M/H), `success_metric` (how we'll know it worked), `depends_on` (other action ids or external inputs), `source` (which benchmark gap or strategy proof point it comes from).

#### Scenario: No action is an orphan
- **WHEN** an action is listed
- **THEN** the `source` field names a specific benchmark gap, whitespace area, or strategy proof point

#### Scenario: Success metric is measurable
- **WHEN** an action's success metric is reviewed
- **THEN** it is expressed as an observable number or event (e.g., "organic sessions +30% MoM", "FSSAI number visible on product pages", "3 gifting SKUs live on Blinkit")

### Requirement: Prioritisation and sequencing
Actions SHALL be sorted within each horizon by (expected_impact desc, effort asc, cost_band asc) to surface the best-ROI first. Dependencies MUST be respected — no action appears before its `depends_on` prerequisites.

#### Scenario: Dependencies are honoured
- **WHEN** action B depends on action A
- **THEN** action B is sequenced after action A in the same or later horizon

### Requirement: Quick-wins minimum set
The Quick Wins horizon SHALL include at least 6–10 concrete, sub-30-day actions, each scoped so a single owner could ship it with existing resources.

#### Scenario: Quick win is genuinely quick
- **WHEN** an action is tagged Quick Win
- **THEN** it has `effort: S` and requires no new hires, no new platforms, and no SKU development beyond packaging/merchandising tweaks

### Requirement: Strategic bets are explicit about risk
Each Strategic Bet SHALL carry a risk note and a "cheapest test first" step — the smallest experiment that would de-risk the bet before full commitment.

The Strategic Bets horizon MUST include bets covering (a) a **corporate / B2B gifting programme** (portal + custom packaging + GST/invoice + MOQ ladder), (b) **international-shipping enablement** from ravisweets.com (export-safe packs, destination phasing, foreign-currency checkout, customs/labelling), and (c) a **first-diaspora-market launch** (named country, named channel — own D2C vs. Amazon-country vs. diaspora retail partner). Each bet is independently scoped and de-riskable.

#### Scenario: Bet has a de-risking test
- **WHEN** a strategic bet is listed
- **THEN** its cheapest-test-first step is described with its own success metric and duration

#### Scenario: Growth-vector coverage in strategic bets
- **WHEN** the Strategic Bets horizon is reviewed
- **THEN** bets addressing corporate gifting, international-shipping enablement, and a first-diaspora-market launch are all present, each with its own risk note and cheapest-test-first step

### Requirement: Coverage across the rubric
The combined action list SHALL produce at least one action against every benchmark dimension where Ravi Sweets scored below the tier median, unless the differentiation-strategy explicitly accepts that dimension as a deliberate sacrifice.

#### Scenario: Coverage gap is intentional, not accidental
- **WHEN** a below-median dimension has no action against it
- **THEN** the strategy's "what we are NOT" section is cited as the reason for the omission

### Requirement: Owner-ready briefs
For each Quick Win and each 30/60/90 action, the plan SHALL include an "owner-ready brief" — 3–6 bullet points another team member could execute without further clarification (deliverable, audience, channel, approval path, done-definition).

#### Scenario: Brief is self-contained
- **WHEN** a brief is handed to an owner
- **THEN** the owner can start work without needing to re-read the benchmark or strategy documents

### Requirement: Refresh cadence
The plan SHALL state a refresh cadence (recommended: quarterly) for the benchmark and competitor dossier and name the trigger conditions (major competitor launch, significant own-channel change, festival-season start) that warrant an out-of-cycle refresh.

#### Scenario: Refresh triggers are documented
- **WHEN** the plan is archived
- **THEN** it names the cadence and at least three trigger conditions for an out-of-cycle refresh
