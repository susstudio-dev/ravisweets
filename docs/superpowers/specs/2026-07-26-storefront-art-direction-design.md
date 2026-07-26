# Ravi Sweets storefront — art direction redesign

**Date:** 2026-07-26
**Status:** approved design, ready for implementation planning
**Scope:** whole public storefront + the token architecture it rests on. Admin chrome re-themes for free via tokens; admin-specific layout is out of scope.

---

## 1. Problem

The storefront ships **eight branded colour identities simultaneously** and **184 distinct hex values** for a system that declares 26 tokens. This is not a tuning problem; there is no single system to tune.

Evidence from the audit:

| Finding | Measurement |
|---|---|
| Declared brand accent (rose `#a8345d`) | **5 occurrences, 3 files** |
| Legacy brass/gold + rust family | **119 occurrences, 21 files** |
| Per-product palettes still pre-pivot brass | **26 of 26** |
| Layer 1 raw palette used as Tailwind classes | **0 occurrences** |
| Layer 2 semantic tokens that are dead | **4 of 7** |
| Hero discrete visual elements | **25** |
| Hero above-fold clickable destinations | **7** |
| Hero decorative ornaments | **12** |
| Hero simultaneous parallax rates | **3** |

The "Pista & Rose" identity declared in `globals.css:8-27` therefore survives only on routes that render no product.

### Three findings that reframe the brief

1. **The accent collides with the category leader.** Rose `#a8345d` is `hsl(339 53% 43%)`. Bombay Sweet Shop's royal magenta `#871a45` is `hsl(336 68% 32%)` — **3° apart in hue**.

2. **The current design is the category's most templated preset.** Cream + serif + gold-foil gradient is what Almond House (`#f6f5ec` + Cormorant Garamond + copper `#c76f46`), Anand Sweets (`#fff7eb` + Playfair Display + gold `#c4a237`) and Khoya (`#f3eee9` + oxblood) all run today. Additionally **Fraunces is Bombay Sweet Shop's own display font**, and Inter is rank #5 of 1,942 on Google Fonts.

3. **Pista green is the most valuable unowned asset in the codebase, and it is wired to `::selection`.** Hue 76 is unoccupied by every competitor measured; nearest neighbour (Anand gold, hue 46) is 30° away. It is simultaneously the most authentic mithai colour and the most unowned in the market.

### Defects found (independent of the redesign)

- **`layout.tsx:19-24`** passes `weight: ['400','600','700']` to `Fraunces()`. Passing an explicit weight array to a variable font in `next/font/google` loads static instances and **discards the variable axes** — the `SOFT` and `WONK` axes that are Fraunces' entire character.
- **`layout.tsx:32-37`** uses Tiro Telugu, which has **only 400 and 400i — there is no bold Telugu**. Every bold Telugu on the site is browser-synthesised faux-bold, which is visibly wrong on Indic conjuncts.
- **Cascade conflict:** `ActiveThemeProvider` (`active-theme-context.tsx:43-53`) writes `--theme-*` as **inline styles on `document.documentElement`**. `ThemeVars` (`theme-provider.tsx:46-49`) writes a **`:root` stylesheet rule**. Inline style always wins, so **per-product theming is already dead** whenever Supabase is configured.
- **Layer 2 is static while Layer 3 is dynamic.** Nothing writes `--color-surface`, `--color-surface-elevated`, `--color-border` at runtime. On any dark palette, **177 `bg-surface` + 137 `bg-surface-elevated` surfaces stay cream and 474 borders stay `rgba(31,24,32,.09)`** (invisible on dark). This breaks a live product today (`p_diwali_premium_hamper`, base `#2a1505`) and the seeded `midnight-saffron` preset.
- **`flavour-atlas.tsx:38-48`** writes `--theme-accent`/`--theme-glow` on hover and reverts to `defaultFlavour` rather than the **active preset** — one hover reverts the live palette for up to 60 s.
- **`flavour-atlas.tsx:122-123`** references `var(--surface-elevated)`, which is never defined. The real name is `--color-surface-elevated`; the chips have no background.
- **Five hand-maintained copies of one palette:** `tokens.ts:94-100`, `globals.css:24-28`, `0008_palette_presets.sql:21-27`, `SETUP_ALL.sql:331`, `admin-themes.tsx:9-70`.
- **`#c0392b` appears 8 times** as a one-off error red; `rawPalette.semantic.danger` (`#b3361f`) has 0 usages.

### Category context

Paisley — the site's core motif, **156 occurrences across 53 files** — is named and condemned in the design press as "shallow 'exotic' shorthand," alongside arches and rangoli. The motif field is the most crowded in Indian gifting.

Ten of ten Awwwards food & drink winners 2024–2026 declared **exactly two colours**. **Zero** used `#ffffff` as the ground; **zero** used `#000000` as the dark.

---

## 2. Direction

**D1 "Varak" as the master identity, with a D2 "Bidri" dark register scoped to specific sections.**

- **Varak** promotes pista from decoration to primary brand field, pairs it with an **anjeer** (fig-purple) accent, and signals premium with **silver, not gold**. Every competitor uses gold; edible silver leaf (*varak*) is literally what is on kaju katli, and no sampled competitor uses a silver/cool-grey cue. Anjeer and pista are the two most expensive ingredients in the catalogue, so the palette is named after what the customer is actually paying for.
- **Bidri** is Hyderabad's own GI-tagged craft — zinc-copper alloy blackened with Bidar soil, inlaid with pure silver. Its grammar is matte near-black ground, fine silver line, high negative space. It is essentially unused in Indian food packaging.

**Why not fully dark.** A study of 420 participants (210 Brazil, 210 France) across seven packaging colours found **black packaging produced expectations of least sweet and most bitter**, with the effect holding across both cultures. That is a feature for 70% dark chocolate and a liability for qubani ka meetha, badam ki jali and double ka meetha, whose entire proposition is sugar, ghee and milk. Light grounds also read product photography more accurately for mainstream retail.

**Therefore: invert locally, not globally.** Bidri is the register for the story, the Vault 10 drop, corporate gifting and festival moments — places where exclusivity is the job and appetite is not. Shop, category, product, cart and checkout stay on the light ground.

---

## 3. Palette

The palette is named **Anjeer & Pista** — fig and pistachio.

That is not decoration: anjeer and pista are the two most expensive ingredients in the catalogue and an authentic, established Indian sweet pairing (anjeer barfi, anjeer-pista rolls, dry-fruit chikki — all products Ravi Sweets already sells). It reads as *premium* to an Indian customer because the ingredients themselves are premium, which "rose" never did. Fig-purple and pistachio-green are also near-split-complementary, so the pairing carries real chromatic tension.

### Light register (default)

| Token | Value | HSL | Role |
|---|---|---|---|
| `base` | `#F1F0E2` | `hsl(56 35% 92%)` | page ground — never `#ffffff` |
| `surfaceElevated` | `#FAF9F0` | `hsl(54 50% 96%)` | cards |
| `ink` | `#221E1A` | `hsl(30 13% 12%)` | primary type — warm charcoal |
| `inkMuted` | `#5C5347` | `hsl(34 13% 32%)` | secondary type |
| `accent` | `#5E2757` | `hsl(308 42% 26%)` | **anjeer** — links, filled CTA |
| `accentDeep` | `#3E1938` | `hsl(310 42% 17%)` | anjeer panels, type on field |
| `field` | `#C9D99C` | `hsl(76 45% 73%)` | **the pista panel** |
| `varak` | `#9A9EA3` | `hsl(213 5% 62%)` | decorative silver fill |
| `varakRule` | `#7E8286` | `hsl(210 3% 51%)` | informational hairline |

**Naming note:** `field` is the design name for the token stored as **`glow`** in the `ThemePreset` jsonb and exposed as `--theme-glow`. The stored key name does not change — see §8.6. The rename is presentational only (`field` describes what it now does: a large flat panel rather than a glow), and any rename of the CSS variable itself is deferred to avoid touching the 33 existing `--theme-glow` references and 13 seeded DB rows.

**Computed contrast (WCAG 2.1):**

| Pair | Ratio | Requirement |
|---|---|---|
| ink on base | **14.43:1** | 4.5 ✅ |
| inkMuted on base | **6.58:1** | 4.5 ✅ |
| ink on surfaceElevated | **15.67:1** | 4.5 ✅ |
| ink on field | **10.95:1** | 4.5 ✅ |
| accent on base (links) | **9.61:1** | 4.5 ✅ |
| base on accent (filled button) | **9.61:1** | 4.5 ✅ |
| accent on surfaceElevated | **10.44:1** | 4.5 ✅ |
| accent on field | **7.30:1** | 4.5 ✅ |
| field on accent (pista button on anjeer) | **7.30:1** | 4.5 ✅ |
| accentDeep on base | **13.06:1** | 4.5 ✅ |
| accentDeep on field | **9.91:1** | 4.5 ✅ |
| varakRule on base | **3.37:1** | 3.0 ✅ |

### Dark / Bidri register

| Token | Value | HSL | Role |
|---|---|---|---|
| `base` | `#17181A` | `hsl(220 6% 10%)` | gunmetal — Bidar patina |
| `surfaceElevated` | `#202225` | `hsl(216 7% 14%)` | raised cards |
| `ink` | `#F2EDE0` | `hsl(43 41% 91%)` | warm cream type |
| `inkMuted` | `#A7A49B` | `hsl(45 6% 63%)` | secondary type |
| `accent` | `#C9D99C` | `hsl(76 45% 73%)` | **pista** — links, filled CTA |
| `field` | `#3E1938` | `hsl(310 42% 17%)` | **anjeer panel** on gunmetal |
| `accentDeep` | `#8FA85C` | `hsl(80 30% 51%)` | UI states |
| `varak` | `#C8CBD0` | `hsl(218 8% 80%)` | silver inlay |

**The two brand colours swap roles between registers.** Pista is the *field* on light and the *interactive* colour on dark; anjeer is the *interactive* colour on light and a *panel* colour on dark. One rule, and it keeps both colours load-bearing everywhere instead of one going decorative.

A light anjeer tint (`#C9A3C4`, 8.05:1 on gunmetal) was tested for dark-register links and rejected — at that lightness it reads as washed lilac rather than fig. Pista does the interactive job on dark unambiguously and is appetite-positive, which matters more.

**Computed contrast:**

| Pair | Ratio | Requirement |
|---|---|---|
| ink on base | **15.20:1** | 4.5 ✅ |
| inkMuted on base | **7.13:1** | 4.5 ✅ |
| ink on surfaceElevated | **13.64:1** | 4.5 ✅ |
| accent on base (links) | **11.75:1** | 4.5 ✅ |
| base on accent (filled button) | **11.75:1** | 4.5 ✅ |
| varak on base | **10.92:1** | 4.5 ✅ |
| accentDeep on base | **6.70:1** | 3.0 ✅ |
| ink on anjeer panel | **12.82:1** | 4.5 ✅ |
| accent on anjeer panel | **9.91:1** | 4.5 ✅ |

### Hue-collision check

The anjeer accent (hue **308**) sits in a narrow safe window between two occupied hues, and clears both:

| Competitor | Hue | Clearance |
|---|---|---|
| **Cadbury Dairy Milk** (Pantone 2685C) | 263 | **45°** |
| **Bombay Sweet Shop** wine | 336 | **28°** |
| Old Ravi Sweets rose | 339 | 31° |
| Anand crimson | 350 | 42° |
| Khoya oxblood | 0 | 52° |
| Anand gold | 46 | 98° |
| Bombay Sweet Shop petrol | 198 | 110° |
| Sweet Karam teal | 177 | 131° |

Cadbury is the single largest confectionery brand in India and owns purple in the category — it was **not** in the original competitor set and was added during this revision. The usable window between Cadbury (263) and BSS wine (336) at ≥25° clearance from both is hue **288–311**; the accent sits at 308, near the warm end, so it reads as fig rather than as violet.

The pista field (hue 76) is 30° from its nearest competitor (Anand gold, 46). `varak`/`varakRule` sit at hue ~210 but at 3–5% saturation, so they read as neutral metal, not blue.

### Rules

- **Gold is deleted.** No gold token, no gold-foil gradient, anywhere.
- **Ink is warm charcoal, not plum-black.** The previous `#1F1820` sat at hue 292 — only 16° from the anjeer accent, which would make links read as ordinary body text. Moving ink to `#221E1A` (hue 30) gives **82° separation**, so the accent does real affordance work. This is a functional requirement, not a preference.
- **One chroma family owns the brand.** Ink and muted stay near-neutral warm; anjeer and pista are the only saturated colours in the system.
- Two silver tokens, because decorative fill and informational hairline have different obligations. `varak` need not clear 3:1; `varakRule` must, and `#9A9EA3` did not (2.35:1 on base).
- The pista field is a **flat fill**. No gradients on brand surfaces.
- Semantic success/warn/danger consolidate onto the existing `rawPalette.semantic` values; the 8 stray `#c0392b` and the 219 non-token `red-*`/`emerald-*`/`amber-*` utility classes migrate to them.

---

## 4. Typography

| Role | Family | Google Fonts rank | Axes (verified) |
|---|---|---|---|
| Display | **Young Serif** | #742 | static, 400 only |
| Body / UI | **Anek Latin** | #459 | `wght 100–800`, `wdth 75–125` |
| Telugu | **Anek Telugu** | #89 | `wght 100–800`, `wdth 75–125` |

All three verified present on Google Fonts via `fonts.google.com/metadata/fonts` on 2026-07-26. Anek Telugu carries both `latin` and `telugu` subsets.

**Why Young Serif over Instrument Serif** (the research's own top pick): Instrument Serif is high-contrast, and its hairlines would disappear on the `#C9D99C` pista field — which is the entire identity. Young Serif is chunky old-style; its strokes survive on colour. At #742 it is also considerably more unowned than Instrument Serif at #99.

**Why Anek:** Anek Latin and Anek Telugu are the same Ek Type superfamily with **identical axes**, designed together for cross-script harmony. Nothing else on Google Fonts offers true Latin↔Telugu harmony, and the variable weight range fixes the faux-bold defect.

### Consequence: size-only hierarchy on display type

Young Serif has one weight. Display hierarchy comes from **size, never weight**.

- Set `font-synthesis-weight: none` (with the `font-synthesis: none` shorthand as fallback) on display type so the browser cannot synthesise bold.
- **197 of 255 `font-display` occurrences across 68 files** currently pair with `font-semibold`/`font-bold`/`font-medium`. These become no-ops. They are removed in a mechanical cleanup pass, not by hand-editing 197 sites individually.

Both original font defects are resolved: the variable-axis loss disappears with Fraunces, and Telugu gains real weights 100–800.

---

## 5. Signature device — the katli cut

**The 45° diamond that kaju katli is actually cut into.**

This is the geometry of the product itself, not an imported cultural motif — which is precisely why it survives the appropriation critique the design press levels at paisley, arches and rangoli. The same logic as Tony's Chocolonely's unequally-divided bar: the structure carries the message.

Applications, all cheap in CSS/SVG and none dependent on photography:

- diamond lattice debossed into the pista field at ~4% opacity
- the crop mask on product imagery
- section dividers — a single diamond flanked by two silver hairlines
- list bullets, badge shape, add-to-cart confirm state
- focus ring corner treatment

**Paisley is retired.** Implementation: swap the SVG path *inside* the existing `Paisley` component and keep its `size`/`rotate`/`color` API. All 156 call sites across 53 files re-mark from one file edit; the rename to `KatliMark` follows as cleanup. `PaisleyDivider` gets the same treatment.

---

## 6. Hero

### Removed

8 saffron-strand SVGs, 2 parallax paisley ornaments, the rotated vertical side ribbon, the pulsing scroll cue, the 3-item trust `<dl>`, the 3-card quick-browse strip, the trust/delivery pill, the 5-stop gold-foil gradient ring, the radial `HERO_BACKDROP`, and 2 of the 3 parallax rates.

Above-fold clickable destinations: **7 → 2**. Discrete visual elements: **25 → 8**. Hardcoded colours: **8 → 0**.

### Retained structure

1. Flat pista field, full-bleed — **no gradient**
2. Telugu place-name + year lockup (`ఖమ్మం · 1985`), set in Anek Telugu
3. One headline, Young Serif at display scale
4. One line of body copy
5. One primary CTA + one text link
6. The photo slot (§7)
7. Silver hairline closed by a single katli diamond
8. Grain overlay across the whole hero

One parallax rate only, and it stays disabled under `prefers-reduced-motion`.

### Contract that must not break

All **8 DB-driven hero fields** keep their exact `??` precedence chain (`site_content.hero` → active `theme_presets.hero` → hardcoded fallback):

`eyebrowIndic`, `eyebrowEn`, `headline`, `body`, `primaryCtaLabel`, `primaryCtaHref`, `secondaryCtaLabel`, `secondaryCtaHref`.

`TextKinetic` stays keyed on `key={heroHeadline}` so admin headline edits re-animate.

Trust badges (FSSAI / no preservatives / fresh daily) move to a strip **below** the fold — necessary information at the wrong altitude in the hero.

---

## 7. Photography

No new photography is assumed. The slot must look deliberate while empty.

### Placeholder design

A diamond-masked plate on the flat pista field, framed by a silver hairline, with grain across the whole hero unifying the edge. The placeholder states its own shot brief as visible caption text so it reads as an intentional art-direction slot rather than a missing asset.

### The four rules that stop a cutout reading as a template

1. **Flat ground, not a gradient.** A radial gradient says "we did not build a background"; a flat colour says "we chose this."
2. **A real photographed contact shadow**, not a CSS `drop-shadow` blur — a blur has no shape, direction, or relationship to the light in the image.
3. **Crop into the frame** at ~1.4× scale so the sweet bleeds off an edge. Cutouts read as templates largely because they are always fully contained and centred.
4. **1–2% grain** over the whole hero, which unifies the matte edge with the ground and hides gradient banding.

### Shot list, priority order

1. **Kaju katli, macro, raking light** — silver leaf is specular and semi-transparent; shoot it *on* the surface. Automated matting destroys exactly this texture. (Today's `kaju_katli-removebg-preview.png` is a matting artefact shipped to production.)
2. **Ghee pouring**, mid-motion, backlit.
3. **Silver varak being laid by hand** — hands in frame. The single most premium image this brand can own.
4. **One cut diamond at implausible scale** — a single katli filling 900px, shot as a landscape rather than a product.
5. **Real surfaces** — brass thali, butter paper, marble — which removes the need for isolation entirely.

Explicitly **not** a mesh/dispersion gradient behind a cutout: that is the single most template-coded pattern in premium food e-commerce, and none of the 2024–2026 award winners use it.

---

## 8. Architecture

The redesign cannot hold without these. They are the reason the *current* palette already does not work.

### 8.1 One source of truth for palettes

`tokens.ts` becomes the only place palette values are authored. `globals.css`, the SQL seeds and the admin fallbacks are generated from or import it. The five hand-maintained copies collapse to one.

### 8.2 Derive Layer 2 from Layer 3, polarity-aware

Semantic tokens must follow the active palette. Because "elevated" means *lighter* on a light ground and *lighter-than-ground* on a dark one, polarity cannot be expressed by a single `color-mix` — it needs the base's relative luminance.

Introduce a single shared pure function:

```
applyPalette(palette) -> Record<cssVarName, string>
```

It takes the four authored colours (`base`, `accent`, `glow`, `ink`), computes relative luminance of `base` to determine polarity, and returns **all** of the `--theme-*` and `--color-*` variables including `--color-surface`, `--color-surface-elevated`, `--color-text-primary`, `--color-text-muted`, `--color-accent`, `--color-ring`.

Three consumers, one implementation:
- `ActiveThemeProvider` — site palette, inline on `<html>`
- the per-product scope wrapper (§8.3)
- an SSR variant emitting the same values into a `<style>` for zero-flash first paint

`--color-border` can stay in CSS as `color-mix(in oklab, var(--theme-ink) 12%, transparent)` — polarity-agnostic and correct on both grounds.

This fixes the 177 + 137 + 474 dark-palette breakage.

### 8.3 Resolve the cascade conflict

Per-product and per-festival palettes stop writing `:root`. They scope to a wrapper element (e.g. `data-flavour`), so custom-property inheritance makes the nearest declaring ancestor win inside that subtree. No specificity fight with `ActiveThemeProvider`'s inline root write, and per-product theming works again.

### 8.4 The Bidri register

A section opts in with `data-register="bidri"`, which re-declares the theme variables for its subtree. Because custom properties resolve to the nearest declaring ancestor, everything inside re-themes with **zero component changes** — the same mechanism as §8.3. The ~9 currently-hardcoded dark sections (`signature-moment`, both `EditorialBand`s, `editorial-scroll-band`, `gifting-guide`, the duplicated corporate CTA bands in `page.tsx` and `about/page.tsx`, `promo-strip`) become `data-register="bidri"` and drop their ~70 hardcoded hex values.

### 8.5 Other fixes in scope

- `flavour-atlas` hover reverts to the **active preset**, not `defaultFlavour`.
- `var(--surface-elevated)` → `var(--color-surface-elevated)`.
- 26 per-product palettes collapse to ~6 named palettes derived from `tokens.ts`, referenced by name.
- `lib/supabase/products.ts:210-216` (the 27th orphan palette stamped on admin-created products) references a named palette.
- `header.tsx` megamenu + mobile drawer (38 hardcoded brass hexes, currently does not re-theme at all) move to tokens. Highest-visibility single fix.
- `sweet-cursor.tsx` — the 5 data-URI SVG cursors (9 baked hexes) cannot read CSS vars. **Decision: collapse to one katli-diamond cursor, generated from `tokens.ts` at build time** so it re-themes with the palette. Five per-context cursors is decoration the new system does not need; one on-brand mark is consistent with §5.
- `layout.tsx:88` `themeColor: '#FFFAF0'` (orphaned value) → the new base.
- The 8 `#c0392b` error reds and 219 non-token Tailwind colour utilities migrate to semantic tokens.
- `supabase/functions/send-order-email/index.ts` (hardcoded brass, cannot read CSS vars) updates to the new palette.
- `0009_promotions.sql` column defaults `bg_from`/`bg_to`/`fg` update in lockstep with `promo-strip.tsx`.

### 8.6 Contracts that must not break

- **`ThemePreset` jsonb shape** — `palette{base,accent,glow,ink,grainOpacity?}` + `hero{...}` + `bannerText`. Renaming a key silently breaks 13 seeded rows and 3 SQL files.
- **The four palette keys stay the authored inputs.** Richer tokens are *derived*, not authored, so `/admin/themes` keeps working unchanged.
- **`useState(initial)` spread in `admin-themes.tsx:215`** is the only thing preserving `grainOpacity` through an edit.
- **`bannerText` → `header.tsx:124`** is the only consumer of the admin banner.
- `0008_palette_presets.sql` and `SETUP_ALL.sql` must stay byte-identical.
- Re-running `0008` / `SETUP_ALL.sql` currently resets the live palette and overwrites admin edits — the new seed must not regress this further.

### 8.7 Rollout

An existing build-time flag system lives at `lib/flags/visual-v2.ts`. Add `getVisualVersion(): 'v2' | 'v3'`, stamp it as `data-theme` on `<html>` in `layout.tsx`, and scope the new token block to `:root[data-theme='v3']`. This composes cleanly with the inline `setProperty` writes and leaves all ~96 token-consuming files untouched.

Caveat: these flags are build-time (`NEXT_PUBLIC_*`, inlined at `next build`), so flipping requires a rebuild — no instant kill-switch.

---

## 9. Sequencing

Foundation first. Slower to first screenshot, but the palette then holds everywhere instead of breaking on product pages, dark sections and the header.

1. **Foundation** — `tokens.ts` single source of truth, `applyPalette()`, derived Layer 2, cascade fix, `data-register` mechanism, font swap. ~4 files, after which ~96 files re-theme for free.
2. **Header** — 38 hardcoded hexes to tokens. Biggest visible win.
3. **Runtime palette injection** — `flavour-atlas` hover, `lib/supabase/products.ts:210`. Stops old-brand colour entering the live theme.
4. **Hero** — rebuild per §6, with the placeholder slot per §7.
5. **Signature device** — katli cut swapped into the `Paisley` component; 156 sites re-mark.
6. **Dark sections** → `data-register="bidri"`, dropping ~70 hex values.
7. **Product palettes** — 26 literals → ~6 named palettes.
8. **Festivals** — 2 files, 70 hex → collapse into `theme_presets`.
9. **SQL + email + cursor** — lockstep data updates.
10. **Cleanup** — 197 redundant weight utilities, 219 non-token colour utilities, 8 stray error reds, `Paisley` → `KatliMark` rename.

---

## 10. Success criteria

| Criterion | Target | Current |
|---|---|---|
| Distinct hex literals in `apps/storefront/src`, **excluding** `lib/theme/tokens.ts` (the authoring file) | **≤ 20** — third-party brand colours only (WhatsApp `#25d366`, Instagram gradient), no brand colours | 184 |
| Branded colour families shipping | **1** (+ semantic triad) | 8 |
| Hero discrete visual elements | **≤ 8** | 25 |
| Hero above-fold destinations | **2** | 7 |
| Hero hardcoded colours | **0** | 8 |
| Paisley occurrences | **0** | 156 |
| Body text contrast, both registers | **≥ 4.5:1** | passes light only |
| Dark palette renders correctly | **all surfaces + borders follow** | 788 stay light |
| Per-product theming functional | **yes** | dead when Supabase configured |
| Faux-bold Telugu | **none** | all bold Telugu |
| Fraunces variable axes | n/a — face replaced | discarded |
| `next build` + `tsc --noEmit` | **clean** | baseline to confirm |
| Hand-maintained palette copies | **1** | 5 |

Verification is by re-running the audit greps, not by inspection.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Pista field reads "healthy/wellness" rather than indulgent — light packaging raises perceived healthiness but *lowers* purchase intention | **Primary mitigation is the anjeer accent**, which is a deep saturated jewel tone doing the premium/indulgent work that a green accent could not. Pista is also a *field*, not the ground, with ink on it at 10.95:1 so it stays rich rather than pastel. Grain and the Bidri register add weight. Still worth watching conversion. |
| Anjeer is mistaken for Cadbury purple | 45° of hue clearance, and the accent is a dark 26%-lightness fig rather than Cadbury's mid-tone blue-violet. Verified numerically, not by eye. |
| Bidri sections read austere or bitter | Confined to story / drops / gifting. Never on PLP, PDP, cart or checkout. |
| Older Khammam customers find it unfamiliar | Telugu is promoted, not demoted; "1985" is in the hero lockup; the katli cut is more literally the product than paisley ever was. |
| Young Serif's single weight limits hierarchy | Deliberate. Size-only hierarchy is the editorial register. `font-synthesis-weight: none` prevents fake bold. |
| 197 + 219 + 156 cleanup occurrences is large | All mechanical and greppable; the `Paisley` swap and `font-synthesis` line handle 353 of them from 2 edits. |
| Build-time flag has no instant kill-switch | Accepted. Documented in §8.7. |
| Re-running SQL seeds resets the live palette | Pre-existing. Do not worsen; note for a later migration fix. |
| Design depends on photography that does not exist | Explicitly designed not to. Placeholder is a deliberate slot; shot list in §7 is additive. |

---

## 12. Non-goals

- New product photography (briefed, not produced).
- Admin dashboard layout or IA.
- A custom or commissioned typeface — Google Fonts only, per `next/font/google`.
- Commissioned illustration (a credible future direction; out of scope here).
- Runtime/per-user feature flagging (build-time only).
- Fixing the non-transactional `activateTheme` two-UPDATE window.
- Copywriting beyond hero structure. The verbal identity is a real recall driver and deserves its own pass.
