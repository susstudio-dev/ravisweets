## ADDED Requirements

### Requirement: Benchmark set composition
The benchmark dossier SHALL cover **12–15 sites** across four pools:
- **Premium Indian sweets / gifting** (3–4): e.g., Bombay Sweet Shop, Anand Sweets (premium line), Loveleaf, Truffles & Co, Anardana.
- **International chocolatiers / patissiers** (3–4): e.g., La Maison du Chocolat, Pierre Hermé, Bouchon Bakery, Dominique Ansel, Valrhona.
- **Luxury lifestyle / perfumery benchmarks for tone** (2–3): e.g., Aesop, Maison Francis Kurkdjian, Le Labo, Diptyque.
- **Motion / interaction leaders** (3–4): e.g., Apple (product pages), Linear, Rauno Freiberg's site, Diagram, Arc Browser marketing, Basement Studio, Awwwards-winning food sites of 2025–2026.

#### Scenario: All pools are represented
- **WHEN** the benchmark dossier is reviewed
- **THEN** each of the four pools has at least the minimum entries listed

### Requirement: Per-site entry schema
Each site entry SHALL follow a fixed schema: `site_name`, `url`, `captured_on`, `pool`, `hero_pattern` (still / video / 3d / shader / kinetic-type / other — with description), `scroll_motion_pattern` (parallax / scroll-linked / scroll-triggered reveals / horizontal scroll / none), `color_system_notes`, `typography_pairing`, `product_card_interactions` (hover + click), `transitions` (page, modal, shared-element), `navigation_pattern`, `distinctive_signature` (the ONE thing that makes the site feel itself), `borrow_score_0_5`, `borrow_rationale`, `skip_rationale_if_any`, `evidence_url_or_screenshot_ref`.

#### Scenario: No field silently omitted
- **WHEN** a site entry is reviewed
- **THEN** every schema field is present; unknown values are written as `unknown` with a follow-up note rather than blanks

### Requirement: Pattern extraction and decision
The dossier SHALL include a **pattern-extraction table** aggregating the borrowable moves across sites: each row is a pattern (e.g., "product title animates up on hover revealing price underneath"), columns are which sites use it, the `borrow_score`, and the **specific spec requirement it will feed** (linking by capability + requirement name).

#### Scenario: Every borrowed pattern traces to a requirement
- **WHEN** a pattern is marked borrow_score ≥ 4
- **THEN** the pattern row names the target spec capability + requirement that will enshrine it (e.g., "motion-system → Requirement: Scroll-triggered reveal primitive")

#### Scenario: No pattern lands in code without the dossier
- **WHEN** a new motion / theme / hero pattern appears in implementation
- **THEN** a benchmark entry in the dossier supports it, or a rationale is added for why it is original (not borrowed)

### Requirement: Screenshot / evidence capture
Every entry MUST include at least **one piece of captured evidence** — an external URL that can be revisited, OR a screenshot stored under `openspec/changes/elevate-storefront-visual-experience/research/screenshots/<site-slug>/<page-key>-<captured_on>.(png|webp)`. Deep-link URLs are preferred when available because screenshots go stale.

#### Scenario: Evidence is re-findable
- **WHEN** a reviewer opens an entry six months later
- **THEN** they can reach the evidence via URL or local screenshot without needing to re-find the page

### Requirement: Accessibility and performance observations
Each entry MUST record two observations: (a) how the site handles `prefers-reduced-motion` (supported / not supported / unknown), and (b) an informal LCP / weight observation from Chrome DevTools "Performance insights" or PageSpeed Insights.

#### Scenario: Reduced-motion compliance is noted
- **WHEN** an entry is reviewed
- **THEN** its `reduced_motion_support` field has one of: supported / partial / unsupported / unknown, with a note

### Requirement: Anti-patterns and rejected inspirations
The dossier SHALL include a section listing patterns observed during research that we explicitly **reject** for Ravi Sweets, each with a reason (e.g., "custom cursor that replaces the system cursor — rejected for accessibility", "sound on scroll — rejected for premium-heritage tone", "scroll-hijacking horizontal reveal — rejected for performance on mid-tier Android").

#### Scenario: Every anti-pattern cites a reason
- **WHEN** the anti-pattern section is reviewed
- **THEN** each listed move has a one-line justification and, where relevant, names the site(s) that use it

### Requirement: Moodboard (optional, scoped)
A moodboard folder MAY be included but is NOT a substitute for the structured dossier. If present, it SHALL live at `research/moodboard/` with each image named `<source-slug>-<descriptor>.<ext>` and a `moodboard.md` index listing sources and rights status.

#### Scenario: Moodboard images carry sources
- **WHEN** the moodboard index is reviewed
- **THEN** every image lists its source URL and rights notes; unsourced images are removed

### Requirement: Dossier freshness and refresh cadence
The dossier MUST carry a `dossier_captured_on` date and a recommended refresh cadence (6 months for lifestyle/perfumery; 3 months for motion leaders; yearly for patissiers). If dossier age exceeds cadence AND a new feature builds on it, the dossier is refreshed first.

#### Scenario: Stale dossier blocks new feature
- **WHEN** a new visual feature is proposed more than the cadence after `dossier_captured_on`
- **THEN** a dossier refresh precedes the feature's design
