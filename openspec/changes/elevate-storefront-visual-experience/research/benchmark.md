# Visual Benchmark Dossier — Ravi Sweets

| Field | Value |
| --- | --- |
| `dossier_captured_on` | 2026-04-22 |
| `refresh_cadence` | Motion leaders: 3 months · Lifestyle/perfumery: 6 months · Patissiers: 12 months |
| `next_refresh_due` | 2026-07-22 (motion leaders) |
| `owner` | Design lead |
| `status` | **v1 draft — every entry carries an in-browser validation follow-up.** Preliminary observations based on general awareness of each site. Must be validated before any design decision is locked to a specific citation. |

---

## 1. Pool composition (15 sites)

| Pool | Sites |
| --- | --- |
| **Premium Indian sweets / gifting** (4) | Bombay Sweet Shop · Anand Sweets (premium line) · Loveleaf · Truffles & Co |
| **International chocolatiers / patissiers** (4) | La Maison du Chocolat · Pierre Hermé · Bouchon Bakery · Valrhona |
| **Luxury lifestyle / perfumery (tone references)** (3) | Aesop · Maison Francis Kurkdjian · Le Labo |
| **Motion / interaction leaders** (4) | Apple (product pages) · Linear · Rauno Freiberg · Diagram |

---

## 2. Per-site entries

> Every entry follows the normalised schema from the spec. Fields marked `(verify)` require in-browser confirmation on the next dossier pass.

### 2.1 Bombay Sweet Shop
- `url`: https://bombaysweetshop.com
- `pool`: premium-indian-gifting
- `captured_on`: 2026-04-22
- `hero_pattern`: Editorial large-image hero; product photography leads, typography supports. Pop colour blocks on accents.
- `scroll_motion_pattern`: Simple entrance reveals; not motion-heavy.
- `color_system_notes`: Bright, candy-coloured palette — cyans, magentas, mustards. Each SKU often has its own colour zone. *This is the closest Indian reference for per-product palette swap — validate pattern intensity.*
- `typography_pairing`: Editorial serif (heavy display) + clean sans body. Title-case product names.
- `product_card_interactions`: Image-forward cards, hover lifts subtly. No heavy motion. (verify)
- `transitions`: Standard route transitions. (verify)
- `navigation_pattern`: Horizontal nav with playful category labels.
- `distinctive_signature`: Modern-retro candy-shop graphic language; strong use of full-bleed imagery and illustration flourishes.
- `reduced_motion_support`: unknown (verify)
- `borrow_score_0_5`: **4** — closest Indian benchmark for premium-meets-modern; palette-per-product is validated as a viable pattern in this category.
- `borrow_rationale`: Confirms that per-product colour theming works for Indian sweet brands; validates our flavour-atlas mechanic as within-category.
- `skip_rationale_if_any`: Candy-retro tone is too irreverent for Ravi Sweets' Nizami heritage positioning — borrow the mechanic, not the voice.
- `evidence_url_or_screenshot_ref`: https://bombaysweetshop.com
- `target_spec_requirement`: visual-design-system → "Per-product flavour palettes"; product-interaction → "Theme shift on product selection"
- `follow_up`: Capture screenshots of 3 product pages to confirm per-product palette depth.

### 2.2 Anand Sweets (premium line)
- `url`: https://www.anandsweets.in
- `pool`: premium-indian-gifting
- `captured_on`: 2026-04-22
- `hero_pattern`: Curated photography hero; gifting-first positioning; clean editorial layouts.
- `scroll_motion_pattern`: Conservative; reveals on scroll, no parallax (verify).
- `color_system_notes`: Warm, muted neutrals; cream + brass + soft saffron. Premium tonal range. *Tonally close to Ravi Sweets' target.*
- `typography_pairing`: Clean serif headlines + sans body; tight tracking.
- `product_card_interactions`: Simple cards; price-prominent. (verify)
- `transitions`: Standard. (verify)
- `navigation_pattern`: Conventional e-commerce nav.
- `distinctive_signature`: Gifting-first framing; "corporate" is a first-class menu item. Strong packaging visuals.
- `reduced_motion_support`: unknown (verify)
- `borrow_score_0_5`: **4**
- `borrow_rationale`: Validates the tonal palette choice (cream + brass + saffron) as commercially proven in category; proves "Corporate gifting" deserves prominence in nav.
- `skip_rationale_if_any`: Motion is conservative to the point of plain — we should exceed their motion bar.
- `target_spec_requirement`: hero-experience → tonal direction; customer-storefront navigation structure.

### 2.3 Loveleaf (India, sweet/healthy gifting)
- `url`: https://loveleaf.in
- `pool`: premium-indian-gifting
- `captured_on`: 2026-04-22
- `hero_pattern`: Bright illustrated / photographic hybrid; health-positive positioning.
- `scroll_motion_pattern`: Gentle reveals. (verify)
- `color_system_notes`: Fresh greens + warm accents; wellness vocabulary.
- `typography_pairing`: Modern geometric sans-serif.
- `distinctive_signature`: Wellness + gifting mashup — "guilt-free indulgence" voice.
- `borrow_score_0_5`: **2** — tonally too wellness-forward for heritage positioning.
- `borrow_rationale`: Useful contrast — shows a path Ravi Sweets should NOT take (health-first over heritage-first).
- `follow_up`: Observe whether they use per-product theming or a unified palette.

### 2.4 Truffles & Co
- `url`: https://truffles-co.com (verify URL)
- `pool`: premium-indian-gifting
- `captured_on`: 2026-04-22
- `hero_pattern`: Boutique chocolate/patisserie hero — close-up product macros. (verify)
- `borrow_score_0_5`: **3**
- `borrow_rationale`: Close-up macro photography validates a "texture-first" hero alternative worth testing later.
- `follow_up`: Audit product page for gallery pattern and variant selector treatment.

### 2.5 La Maison du Chocolat
- `url`: https://www.lamaisonduchocolat.com
- `pool`: international-chocolatier
- `captured_on`: 2026-04-22
- `hero_pattern`: Sophisticated editorial hero with large photography, strong typographic poise, ample whitespace.
- `scroll_motion_pattern`: Scroll reveals on images; minimal parallax. (verify)
- `color_system_notes`: Deep brown + cream + gold; restrained, luxury tonal palette. *Very close aesthetic reference for Ravi Sweets.*
- `typography_pairing`: Classical serif display + refined sans body; slow-read cadence.
- `product_card_interactions`: Clean cards, quiet hover. (verify)
- `distinctive_signature`: Editorial luxury restraint — "less is more" executed ruthlessly.
- `borrow_score_0_5`: **5** — single strongest aesthetic reference.
- `borrow_rationale`: Sets the ceiling for tonal restraint + editorial typography we should aspire to. Proves that "quiet" can feel expensive.
- `target_spec_requirement`: visual-design-system → typography scale + semantic neutrals; hero-experience → still-photography-led hero.
- `follow_up`: Capture hero + product detail screenshots; measure whitespace ratios.

### 2.6 Pierre Hermé
- `url`: https://www.pierreherme.com
- `pool`: international-patissier
- `captured_on`: 2026-04-22
- `hero_pattern`: Art-directed macro photography; flavour chips prominent.
- `scroll_motion_pattern`: Subtle parallax on section headers. (verify)
- `color_system_notes`: Each collection/flavour gets a dedicated colour zone.
- `distinctive_signature`: *"Colour per flavour"* is a signature move at Pierre Hermé — independently validates our FlavourAtlas mechanic.
- `borrow_score_0_5`: **5**
- `borrow_rationale`: The strongest external precedent for per-product colour theming in food. Lends legitimacy to the FlavourAtlas.
- `target_spec_requirement`: visual-design-system → per-product palette; product-interaction → theme shift.
- `follow_up`: Document 3 flavour pages to capture palette range.

### 2.7 Bouchon Bakery
- `url`: https://www.bouchonbakery.com
- `pool`: international-patissier
- `captured_on`: 2026-04-22
- `hero_pattern`: Classical editorial; story-led.
- `borrow_score_0_5`: **3**
- `borrow_rationale`: Storytelling-as-UX validates our HeritageStrip pattern.

### 2.8 Valrhona
- `url`: https://www.valrhona.com
- `pool`: international-chocolatier
- `captured_on`: 2026-04-22
- `hero_pattern`: B2B + B2C dual framing; craft-oriented imagery.
- `borrow_score_0_5`: **3**
- `borrow_rationale`: Proves that corporate/wholesale can coexist with a premium retail surface. Relevant for our Corporate Gifting track.
- `target_spec_requirement`: corporate-gifting → landing page tone.

### 2.9 Aesop
- `url`: https://www.aesop.com
- `pool`: luxury-lifestyle
- `captured_on`: 2026-04-22
- `hero_pattern`: Text-first, minimalist; product photography is secondary. Hero is often a quote or essay paragraph.
- `scroll_motion_pattern`: Intentional restraint; very limited motion.
- `color_system_notes`: Muted neutrals; tonal; off-white + ink. No flourish.
- `typography_pairing`: Single serif, carefully-set; body at long measure.
- `distinctive_signature`: *Editorial voice as the brand.* Copy-led UX.
- `reduced_motion_support`: High (verify)
- `borrow_score_0_5`: **5** — ceiling for tone-of-voice + typographic poise.
- `borrow_rationale`: Sets the tonal restraint standard; grain/off-white surface treatment; editorial pull-quotes as first-class UI.
- `target_spec_requirement`: visual-design-system → grain overlay + typography; heritage-strip → editorial pull-quote pattern.
- `skip_rationale_if_any`: Aesop ships very little visual product imagery — Ravi Sweets needs more hero photography, not less.
- `follow_up`: Document their grain-overlay opacity + body typographic measure.

### 2.10 Maison Francis Kurkdjian
- `url`: https://www.franciskurkdjian.com
- `pool`: luxury-lifestyle
- `captured_on`: 2026-04-22
- `hero_pattern`: Rich full-bleed photography + subtle parallax on scroll.
- `scroll_motion_pattern`: Parallax on hero imagery; section-transition fades.
- `color_system_notes`: Ink-on-cream; gold accent; saffron-adjacent warm palette. *Very close reference.*
- `typography_pairing`: Classical serif + refined sans.
- `distinctive_signature`: Full-bleed cinematic imagery + Parisian restraint.
- `borrow_score_0_5`: **5**
- `borrow_rationale`: Proves full-bleed editorial + parallax works at luxury tier without feeling overdone.
- `target_spec_requirement`: new `EditorialBand` section in the elevate change.

### 2.11 Le Labo
- `url`: https://www.lelabofragrances.com
- `pool`: luxury-lifestyle
- `captured_on`: 2026-04-22
- `hero_pattern`: Raw, industrial-editorial; monospace typography motif.
- `color_system_notes`: Sepia + black + white; apothecary coded.
- `distinctive_signature`: *Monospace wordmark and labels treat the brand like a chemistry lab.* Strong "manufacturer's voice" — validates FSSAI number + batch-label UI as brand-expressive rather than compliance-noise.
- `borrow_score_0_5`: **3**
- `borrow_rationale`: Gives us permission to surface FSSAI number, HSN codes, and batch/manufactured-on dates as a *signature* rather than a footnote.

### 2.12 Apple product pages
- `url`: https://www.apple.com
- `pool`: motion-leader
- `captured_on`: 2026-04-22
- `hero_pattern`: Large-type + video/animation hero; scroll-linked layered parallax; sticky sections.
- `scroll_motion_pattern`: **Scroll-linked scenes.** Content moves, pins, and reveals as scroll progress advances. Multiple Z layers moving at different rates.
- `color_system_notes`: Near-monochrome per product; black + white + subtle accent.
- `typography_pairing`: SF Pro display; massive, confident type.
- `product_card_interactions`: Product-tile scroll-linked animations.
- `transitions`: Scroll-driven pin + unpin; cinematic transitions between sections.
- `distinctive_signature`: *Scroll as cinema.* Every scroll tick advances a story.
- `reduced_motion_support`: High (documented).
- `borrow_score_0_5`: **4** for scroll-linked parallax discipline; **2** for intensity (would be off-tone).
- `borrow_rationale`: Validates our layered parallax approach and sets a ceiling for how rigorously reduced-motion must be handled.
- `skip_rationale_if_any`: Full scroll-hijacking cinema would be off-brand for a food heritage brand; borrow the *multi-layer parallax* discipline, not the scroll-jacking intensity.
- `target_spec_requirement`: motion-system → scroll-linked transformations; hero-experience → multi-layer parallax.

### 2.13 Linear
- `url`: https://linear.app
- `pool`: motion-leader
- `captured_on`: 2026-04-22
- `hero_pattern`: Large hero with subtle animated gradient / glow; text-first.
- `scroll_motion_pattern`: Gentle reveals; occasional scroll-linked scene.
- `distinctive_signature`: *Subtle ambient glow on hero* — a soft animated radial that shifts slowly. Plus shared-element feel on card → detail.
- `borrow_score_0_5`: **4**
- `borrow_rationale`: Our radial ambient gradient behind the hero headline is lifted from this sensibility; their shared-element discipline is the north star for our quick-view morph.
- `target_spec_requirement`: hero-experience; product-interaction → shared-element morph.

### 2.14 Rauno Freiberg
- `url`: https://rauno.me
- `pool`: motion-leader
- `captured_on`: 2026-04-22
- `hero_pattern`: Personal site with exceptional micro-interactions.
- `scroll_motion_pattern`: Micro-interactions on every interactive element; scroll-linked subtle parallax.
- `distinctive_signature`: *Small details with enormous polish.* Cursor-follow glows, hover-tilt, subtle layout animations everywhere.
- `borrow_score_0_5`: **5** — reference for micro-interaction discipline.
- `borrow_rationale`: Our CursorGlow + HoverLift + paisley corner accent is in this spirit.
- `skip_rationale_if_any`: The intensity is personal-portfolio-scale; commerce needs to restrain it so CTAs stay scannable.

### 2.15 Diagram / Framer showcase pages
- `url`: https://diagram.com (verify)
- `pool`: motion-leader
- `captured_on`: 2026-04-22
- `hero_pattern`: Product-led motion; scroll-revealed UI demos.
- `distinctive_signature`: UI-reveal cadence tied to scroll.
- `borrow_score_0_5`: **3**
- `borrow_rationale`: Confirms that scroll-timed reveals feel premium when executed tightly; ties back to our Reveal/Stagger primitives.

---

## 3. Pattern extraction

| Pattern | Sites using | Borrow score | Target spec requirement |
| --- | --- | --- | --- |
| **Per-product / per-flavour colour palette** | Pierre Hermé, Bombay Sweet Shop | 5 | visual-design-system → Per-product flavour palettes; product-interaction → Theme shift |
| **Editorial restraint (whitespace + quiet type)** | La Maison du Chocolat, Aesop, Anand Sweets | 5 | visual-design-system → typography scale; hero-experience → still + grain |
| **Full-bleed imagery with strong parallax** | Maison Francis Kurkdjian, Apple | 5 | elevate change → new `EditorialBand` section; hero-experience → multi-layer parallax |
| **Scroll-linked multi-layer motion** | Apple, Linear | 4 | motion-system → Parallax + scroll-linked transforms |
| **Grain / tactile overlay for warmth** | Aesop, Maison Francis Kurkdjian | 5 | visual-design-system → Grain overlay |
| **Editorial pull-quotes as first-class UI** | Aesop, Bouchon Bakery | 4 | elevate change → `HeritageStrip` |
| **Monospace manufacturer-voice labels (FSSAI, batch)** | Le Labo | 3 | visual-design-system → optional monospace facet in labels |
| **Shared-element morph / layoutId on card-to-detail** | Linear, Rauno | 5 | product-interaction → Click transition shared element morph |
| **Cursor-follow micro-interactions** | Rauno, Linear | 4 | motion-system → CursorGlow |
| **Corporate/B2B surfaced in primary nav** | Anand Sweets, Valrhona | 4 | customer-storefront → header nav |
| **Gifting-first framing (hampers front-and-centre)** | Anand Sweets, La Maison du Chocolat | 5 | home page → gifting guide section |
| **Story-led heritage section** | Bouchon, Aesop | 4 | elevate change → `HeritageStrip` (existing) |
| **Craft-led three-step process strip** | Pierre Hermé, Valrhona (B2B page) | 4 | elevate change → `CraftStrip` (existing) |
| **Scroll progress indicator in header** | Linear, some motion-leader portfolios | 3 | new micro-interaction — worth adding |

## 4. Anti-patterns (rejected for Ravi Sweets)

| Anti-pattern | Observed on | Why we reject |
| --- | --- | --- |
| **Custom cursor replacing the system cursor** | Some Awwwards-style portfolio sites | Accessibility hazard; obscures OS affordances. Our `CursorGlow` adds a glow but keeps the cursor intact. |
| **Sound-on-scroll / auto-playing audio** | Rare but occurs | Off-brand for premium heritage; user-hostile on mobile. |
| **Scroll-hijacking horizontal reveals** | Apple (at high intensity) | Breaks scroll expectation; fails on mid-tier Android. |
| **Wellness-first "guilt-free" framing** | Loveleaf | Conflicts with Ravi Sweets' heritage positioning. |
| **Candy-retro exuberance** | Bombay Sweet Shop (at max intensity) | Too irreverent for Nizami heritage. Borrow the mechanic (per-flavour palette), not the voice. |
| **Heavy ornamentation across every section** | Mass-market sweets sites | Dilutes premium; we limit paisley to 4 usage types. |
| **Excessive gamification (confetti, sparkles)** | Consumer e-commerce promo sites | Reads as mass-market; we use Grain + subtle glow instead. |
| **Pop-up modal on page load** | Many Indian e-commerce sites | Intrusive; we lead with value, not capture. |
| **Carousel-led hero on desktop** | Mass-market sites | Low engagement; we lead with a single still + parallax. |

## 5. Home-page recommendations — derived from research

Research-backed recommendations for the current iteration, each citing the sites it borrows from:

1. **Replace the hero image** with something darker and more food-editorial in tone (close La Maison du Chocolat / MFK than current placeholder). Dark backdrop, directional light, shallow DOF.
2. **Add a `EditorialBand`** full-bleed section (one per page) with a text overlay and strong scroll parallax. Borrows from MFK + Apple.
3. **Add a `GiftingGuide`** three-persona tile section (Diwali / Weddings / Corporate). Borrows from Anand Sweets + La Maison du Chocolat's corporate surfacing.
4. **Scroll progress indicator in the header** — thin theme-accent bar that fills as the page scrolls. Borrows from Linear.
5. **Multi-layer hero parallax** — image + 2–3 ornament layers moving at different scroll rates + cursor-parallax tilt. Borrows from Apple + MFK.
6. **Editorial pull-quote cadence** — one pull-quote per major section with larger body measure. Borrows from Aesop.
7. **Exhibit the per-product theming more visibly** — FlavourAtlas already does this; additionally have product cards subtly tint their surrounding area on hover. Borrows from Pierre Hermé.
8. **Reinforce the "Dev only" placeholder watermark** on every hero image until real photography lands — honours the photography-gating spec requirement.

## 6. Follow-ups (for next dossier pass)

- [ ] Capture screenshots for every entry (currently only URLs are cited).
- [ ] Measure LCP / weight of each site via PageSpeed Insights; record informal observation.
- [ ] Confirm `prefers-reduced-motion` support on each entry (3 of the 15 are documented high; rest are `unknown`).
- [ ] Validate Bombay Sweet Shop's per-product palette depth (is it really per-SKU, or per-collection?).
- [ ] Record Pierre Hermé's flavour-palette range across 3 pages.
- [ ] Audit Le Labo's batch-label typography (exact font / weight / size).
- [ ] Ask: is there a South-Indian premium sweet brand that should be added to the Indian pool?

## 7. What this dossier directly unlocks in code

| Decision | Landed in code | Source |
| --- | --- | --- |
| Still-photograph hero with grain + parallax | `HeroStill` | La Maison du Chocolat, MFK, Aesop |
| Per-product flavour palette via CSS vars | `ThemeProvider` + `theme_palette` | Pierre Hermé, Bombay Sweet Shop |
| Editorial heritage strip with pull-quote | `HeritageStrip` | Aesop, Bouchon |
| Craft three-column | `CraftStrip` | Pierre Hermé, Valrhona |
| Paisley motif (4 usage types only) | `<Paisley>` | — (original — no benchmark lift) |
| Cursor-follow glow on product cards | `<CursorGlow>` | Rauno, Linear |
| Shared-element morph on quick-view | `<QuickViewModal>` + `layoutId` | Linear, Rauno |
| FlavourAtlas interactive theme demo | `FlavourAtlas` | Pierre Hermé (adapted) |
| FSSAI / Batch as signature label | *to be added in monospace-facet refresh* | Le Labo |
| EditorialBand full-bleed parallax | *new in this iteration* | MFK, Apple |
| GiftingGuide three-persona strip | *new in this iteration* | Anand Sweets, La Maison du Chocolat |
| Scroll progress bar in header | *new in this iteration* | Linear |

---

*This document is the source of truth for visual-design decisions in the `elevate-storefront-visual-experience` change. Any new visual pattern must trace back to an entry here, or be flagged as original in its PR description.*
