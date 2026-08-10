---
name: Ravi Sweets — The Sweet Counter
description: The kitchen's batch record read at a warm counter — halwai cream, stamp-pad blue, sweet-box paper, Poppins.
colors:
  docket-stock: "#FAF6E5"
  docket-top-copy: "#FFFCF2"
  press-ink: "#161C24"
  pencil-grey: "#5E594B"
  stamp-blue: "#2046C8"
  stamp-blue-pressed: "#16328F"
  manila-label: "#EBC77E"
  brass-rule: "#9A9384"
  brass-hairline: "#736C5B"
  jaggery-dark: "#2B2620"
  jaggery-top-copy: "#37312A"
  jaggery-ink: "#F1EDE4"
  jaggery-pencil: "#B0A898"
  jaggery-accent: "#FAF6E5"
  jaggery-accent-pressed: "#FFFFFF"
  ember: "#E2571F"
  ember-on-dark: "#FF8B4A"
  green-stamp: "#1F6238"
  green-stamp-stock: "#F2EFE0"
  green-stamp-label: "#DDC79B"
  red-stamp: "#A81B52"
  red-stamp-stock: "#F7EFE4"
  red-stamp-label: "#E6BFC6"
  olive-brass-stamp: "#6B5A0E"
  olive-brass-stock: "#F3EFDE"
  olive-brass-label: "#DCC372"
typography:
  display-xl:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 2rem + 3.4vw, 5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.012em"  display-lg:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.7rem + 2.4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.012em"  display-md:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.008em"  heading:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.25  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  caption:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.01em"
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"  value:
    fontFamily: "Courier Prime, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tabular-nums"
  indic:
    fontFamily: "Anek Telugu, Poppins, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
  3xl: "24px"
  pill: "9999px"
  circle: "50%"
spacing:
  field-row-y: "8px"
  head-underline-gap: "12px"
  head-bottom: "24px"
  docket-pad: "20px"
  docket-pad-lg: "28px"
  gutter: "16px"
  gutter-md: "24px"
  gutter-lg: "32px"
  section-y: "56px"
  section-y-lg: "80px"
  section-y-tight: "32px"
  section-y-tight-lg: "48px"
components:
  stamp:
    backgroundColor: "{colors.stamp-blue}"
    textColor: "{colors.docket-stock}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  stamp-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.stamp-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  docket:
    backgroundColor: "{colors.docket-top-copy}"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  docket-perf:
    backgroundColor: "{colors.docket-top-copy}"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.lg}"
    padding: "20px 20px 20px 40px"
  field-label:
    textColor: "{colors.pencil-grey}"
    typography: "{typography.label}"
  field-value:
    textColor: "{colors.press-ink}"
    typography: "{typography.value}"
  field-row:
    textColor: "{colors.press-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 0"
  live-mark:
    textColor: "{colors.ember}"
    typography: "{typography.label}"
  docket-head:
    textColor: "{colors.press-ink}"
    padding: "0 0 12px 0"
  input-field:
    backgroundColor: "{colors.docket-stock}"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
---

# Design System: Ravi Sweets — The Sweet Counter

## Overview

**Creative North Star: "The Sweet Counter"** *(warm pivot of "The Batch Card", owner-directed 2026-08-10)*

The paperwork is the proof, read at a warm counter. The brand's binding claim is that the sweets are made without preservatives and dispatched the same day, and the thing that actually demonstrates that is the kitchen's own record: the docket taped above the kadai, the gummed label on the box, the rubber-stamped date, the FSSAI composition panel. The record is still the interface — but after studying the stores customers actually love (Food on Farm, Sweet Karam Coffee), the owner moved the paper from the office to the counter: warm halwai cream, a friendly geometric face, pill CTAs, and a home page that shows products before it says anything.

What survives from the Batch Card, deliberately: the stamp-pad blue accent (hue 226, still the one colour no competitor holds — re-confirmed by the owner over the reference stores' orange), the manila label, ember as live-state-only ink, kumkum red as celebration ink, the ruled label/value grammar, and elevation as contact rather than float. What was reversed: "never cream" (the ground is now #FAF6E5 — with the discipline that its hue stays ≥42° so the dark register's cream accent clears ember by 25°), the condensed grotesque (Poppins 400–700 carries display and body; Courier Prime remains only for recorded values), and the guillotined corners (radii 6–24px, sweet-box scale).

The home page rule is "lots to see, little to read": hero, category rail, bestsellers, four trust badges, festival band, real reviews (the section is absent until approved reviews exist — testimonials are never invented), corporate. Product photography is the missing asset; the admin media library overlays it everywhere the moment it is uploaded.

**Key Characteristics:**

- Warm halwai cream ground (#FAF6E5, hue ~49°); dark register is burnt jaggery (#2B2620)
- Stamp-pad blue accent at hue 226, verified clear of the category
- Poppins carrying display and body on weight (400–700); Courier Prime for recorded values only
- Sweet-box paper: radii 6–24px, pill primary CTAs; elevation still caps at a 10px blur
- Ruled label/value rows as the atom the whole system is built from
- Two registers, one grammar: cream counter and burnt-jaggery copy swap roles without component changes
- Ember reserved exclusively for live state; kumkum red for celebration/certification ink
- One container, one rhythm, one product grid

## Colors

A cool working-stock ground carrying a small number of saturated inks, each with exactly one job.

### Primary

- **Stamp-Pad Blue** (`{colors.stamp-blue}`): The interactive colour on the light register. Links, filled primary actions (`.stamp`), active states, focus rings, selection highlight. Hue 226° — the colour an Indian office stamp pad and ballpoint actually contain, and the only saturated hue in the tested competitive set that nobody owns. The obvious "rubber stamp" choice was violet; measured violet (#6D2FA0) sits 10° from Cadbury 2685C and was rejected on that measurement.
- **Stamp Pressed** (`{colors.stamp-blue-pressed}`): The same stamp pushed harder into the paper. Hover and pressed states of blue elements, and the panel ground on the dark register.

### Secondary

- **Gummed Manila Label** (`{colors.manila-label}`): The warm tag stuck to the box. Panel grounds, image-slot washes, tint fills. It is a ground for ink and never a text colour — the pinned contrast pairs only certify ink on manila, not manila on anything.
- **The Inverted Stamp** (`{colors.carbon-accent}`) / **Pressed** (`{colors.carbon-accent-pressed}`): The interactive colour on the dark register — docket stock itself, pressed onto the carbon sheet. On carbon, blue demotes to a panel ground and the stock promotes to the action; the two registers swap roles rather than tinting the same one.

  > **This slot used to hold an orange (`#F2732F`) on the reasoning that "ember becomes the interactive colour on dark".** That was wrong twice: it sat 2° from Ember, breaking the one containment rule this system has, and it made "made today" and "clickable" indistinguishable oranges on the dark ground. `palette.test.ts` now asserts a ≥25° clearance between Ember and *both* registers' accents, so the near-miss cannot return. Do not reintroduce a warm accent here.

### Tertiary

- **Ember** (`{colors.ember}`): Live state and nothing else. "Made today", "dispatching now", an active sale mark. It is deliberately not a member of the register token set, so no admin theme edit and no register swap can spread it into general use. On the carbon ground the 6px dot lifts to **Ember on Carbon** (`{colors.ember-on-carbon}`) to stay visible.
- **The Flavour Atlas stamps** — **Green Stamp** (`{colors.green-stamp}`, nut-forward: kaju, badam, pista), **Red Stamp** (`{colors.red-stamp}`, dried fruit and floral), **Olive-Brass Stamp** (`{colors.olive-brass-stamp}`, savouries, namkeens, podis): five named product palettes (`house`, `badam`, `gulkand`, `kesar`, `hamper`) in `src/lib/theme/palette.ts`. Each is the *same docket stamped in a different ink* — the ground shifts by only a few degrees while the stamp changes completely. The three semantic colours (success, warn, danger) are the same three values, deliberately.

### Neutral

- **Docket Stock** (`{colors.docket-stock}`): The page ground on the light register. Cool and faintly green, the colour of NCR carbonless docket paper.
- **Docket Top Copy** (`{colors.docket-top-copy}`): The elevated surface — the top sheet of the form. Every `.docket` sits on this.
- **Press Ink** (`{colors.press-ink}`): Body and heading text. Press black, faintly blue, never neutral grey-black.
- **Pencil Grey** (`{colors.pencil-grey}`): Muted text, field labels, secondary values.
- **Steel Rule** (`{colors.steel-rule}`): Decorative rules only. It does **not** clear 3:1 and must never carry information on its own.
- **Steel Hairline** (`{colors.steel-hairline}`): The load-bearing hairline. Use this wherever a rule must be perceivable; it is pinned at ≥3:1 on the ground.
- **Carbon Slate** (`{colors.carbon-slate}`), **Carbon Top Copy** (`{colors.carbon-top-copy}`), **Carbon Ink** (`{colors.carbon-ink}`), **Carbon Pencil** (`{colors.carbon-pencil}`): the dark register's four equivalents — the duplicate sheet under the carbon paper, read in the dark. Used for festival drops, the story band, corporate, and the footer.

Two derived tokens are computed rather than authored: `--color-border` (14% ink on light, 16% on carbon) and `--color-rule` (26% / 30%). A rule is heavier than a border and is always horizontal. Note the sharp edge here: because a custom property's `var()` references resolve at the element where the property is *declared*, `--color-border` had to be re-declared inside the carbon block — a single `:root` declaration freezes to light ink and stays frozen everywhere it is inherited.

### Named Rules

**The Runtime Palette Rule.** The live palette is resolved at **runtime** by `applyPalette()` from the active row in the Supabase `theme_presets` table (`supabase/migrations/0011_batch_card_world.sql` seeds `batch-card` as active and `carbon-copy` as an inactive alternative). The `:root` values in `globals.css` are **first-paint defaults only** and are overwritten the moment the active preset loads. Changing a brand colour in code alone does nothing to the live site — it must land in the database too. Keep the `:root` block byte-identical to `DOCKET` in `palette.ts` so the first paint does not flash.

**The Ember Containment Rule.** `{colors.ember}` appears on `.live-mark` and on the sale flag, and nowhere else. It is excluded from `RegisterTokens` by construction and `palette.test.ts` asserts that no register token equals it. If you want a warm highlight, you want the manila label, not ember.

**The 25-Degree Rule.** The accent must clear all nine tracked competitor hues by ≥25°. `palette.test.ts` enforces this against a measured set (Cadbury 2685C, Bombay Sweet Shop wine and petrol, Anand crimson and gold, Almond House terracotta, Haldiram burnt brick, Bikanervala vermilion, Sweet Karam teal) and separately pins the accent to the exact string `#2046C8`. Both tests must be re-run and re-argued before any accent change, not deleted.

**The Manila-Is-Ground Rule.** `{colors.manila-label}` is a wash and a panel ground for ink. Never set text in it, never use it as an accent, never put accent-coloured text on it above UI scale — only `accentDeep` on manila is certified, and only at 3:1.

**The Cool Ground Rule.** The base never warms and never becomes `#FFFFFF`. The system is cool precisely so the food photography and the manila tag are the only warm elements on screen; warm the ground and the appetite contrast collapses.

## Typography

**Display Font:** Archivo (variable, `wdth` axis requested; falls back to system-ui, sans-serif)
**Body Font:** Archivo — the same family, no second face
**Label/Mono Font:** Courier Prime (400/700, no italic; falls back to ui-monospace)
**Indic Font:** Anek Telugu (variable 100–800, `preload: false`)

**Character:** Archivo descends from the 19th-century American grotesques that job printers actually set forms, dockets and signage in — it *is* the printed form. Courier Prime is a typewriter revival rather than a code face, so it reads as what was **typed into** the form. That distinction is the whole pairing: the printed matter and the entry. A display serif is specifically refused; the retired world used one, and warm serif over cream is the arrangement the entire category ships.

Anek Telugu is retained from the retired world for a functional reason, not an aesthetic one: the audience is Telugu-first locally and a `/te` locale is on the roadmap. It is variable 100–800 so Telugu conjuncts are never browser-synthesised into faux-bold, and it is not preloaded because the Telugu subset is large and used for short marks, not body copy — preloading competes with the LCP element against a 2500ms budget.

### Hierarchy

- **Display XL** (`wdth` 112, clamp 2.75→5rem, line-height 0.98, tracking −0.028em): Page-defining headlines. One per page at most.
- **Display LG** (`wdth` 112, clamp 2.25→3.5rem, line-height 1.02, tracking −0.024em): The hero's `<h1>` inside the batch card.
- **Display MD** (`wdth` 112, clamp 1.75→2.5rem, line-height 1.1, tracking −0.018em): Major section headings.
- **Heading** (`wdth` 112, clamp 1.25→1.5rem, line-height 1.25): Subsection and card group headings.
- **Body** (400, 1rem, line-height 1.6): Running copy. Constrained to ~48ch in the hero; keep prose measures in the 48–70ch band.
- **Caption** (400, 0.8125rem, line-height 1.45, tracking 0.01em): Supporting notes and secondary descriptions.
- **Label** (`wdth` 84, 600, 0.6875rem, tracking 0.14em, uppercase): The pre-printed caption on a form. `.field-label`. Always uppercase, never sentence case.
- **Value** (Courier Prime, `tabular-nums`): Every recorded value — batch numbers, dates, weights, percentages, prices. `.field-value`.
- **Stamp label** (`wdth` 92, 700, 0.8125rem, tracking 0.1em, uppercase): Text inside `.stamp` only.
- **Live label** (`wdth` 84, 700, 0.6875rem, tracking 0.12em, uppercase): Text inside `.live-mark` only.

Note the three width stops in play — 84 for pre-printed captions, 92 for the stamp face, 112 for display lines. Tracking is tighter than the retired serif scale carried, because Archivo sets loose by default at display sizes and a stamped form head is compact by nature.

### Named Rules

**The Width-Not-Weight Rule.** Hierarchy rides Archivo's `wdth` axis (84 / 92 / 112), not weight alone. That width range is why one family can do both the display and body jobs without a second face. Reaching for a heavier weight where a width change is available flattens the system back into a generic sans.

**The Typed-Value Rule.** Anything that was *recorded* — a batch number, a date, a weight, a percentage, a price — is set in Courier Prime with `font-variant-numeric: tabular-nums`. Tabular is not optional: a column of prices that does not align is the exact failure this world exists to avoid. Conversely, prose is never set in the mono; it is a value face, not a texture.

**The One Eyebrow Rule.** `.field-label` is the only small-caps label pattern on the site. The audit that produced this world counted eleven hand-rolled variants of it. If a new surface needs a small tracked caption, it uses `.field-label` and does not re-declare `text-[11px] uppercase tracking-[...]`.

## Layout

**One container.** `.container-site` — `max-width: 1280px`, centred, with a 16 / 24 / 32px padding ramp at base / `sm` / `lg`. It replaced five competing max-widths and four horizontal padding ramps across 40 routes, which was the single largest reason the site did not read as one product. 1280px rather than 1200px specifically so the catalogue grid gets four comfortable columns at `xl`; the retired 1200px cap forced `/shop` down to three. `.container-wide` (1600px) exists for dense tables and the admin console only, and currently has exactly one call site.

**One vertical rhythm.** `.section-y` (56px / 80px at `md`) and `.section-y-tight` (32px / 48px at `md`). Sections declare their spacing with these and never with ad-hoc `py-*`. More space above a heading than below it is enforced structurally by `.docket-head`, which carries 12px below its own text to the rule and 24px from the rule to the content.

**One product grid.** `ProductGrid` is the only layout any collection of products uses. Default ramp is 2 → 3 (`md`) → 4 (`lg`); `dense` adds a fifth column at `xl` and is for scanning surfaces (`/shop`, `/search`). Gaps are 12px, 16px at `sm`. Before consolidation the same card ran on five different column ramps with disagreeing gaps, and `/shop` — the dedicated browse surface — showed **one** product per row on mobile while the homepage showed two.

**Breakpoints:** `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1200px (Tailwind's container config; note this `xl` value is legacy and does not correspond to `.container-site`'s 1280px cap).

**Registers as layout.** Any subtree opts into the dark register by setting `data-register="carbon"` on its wrapper. Because custom properties resolve to the nearest declaring ancestor, that single attribute re-themes everything inside it with zero component changes. This is how the story band, festival drops, corporate surfaces and the footer go dark.

### Named Rules

**The One Container Rule.** Every storefront surface uses `.container-site` and nothing else. `.container-wide` is for the admin console and dense tables. A new page that introduces its own `max-w-*` is a regression, not a variation.

**The Two-Up Rule.** Two products per row at the smallest breakpoint is not negotiable. Products-per-viewport is the strongest lever on browse-to-detail conversion, and a food grid reads perfectly well two-up at 375px.

**The Rhythm Rule.** Section spacing comes from `.section-y` / `.section-y-tight`. If a surface needs different air, change the class definition once — do not write `py-24` on the section.

## Elevation & Depth

Paper on a counter does not float. Depth in this system is **contact**, not lift: a hard 1px edge where the sheet meets the surface below it, then a short, tight shadow. The retired scale used a 24px blur, which reads as a card hovering in space — exactly the arrangement this world refuses. Nothing in the system exceeds a 10px blur.

Depth is carried primarily by tonal layering (docket stock → top copy) and by rules (`--color-border` at 14%, `--color-rule` at 26%), with shadow as a secondary cue. A grain overlay at 4% (light) / 6% (carbon) sits over ground surfaces to give the stock a paper tooth; it uses `mix-blend-mode: multiply` on light and `screen` on carbon, and is removed entirely under `prefers-reduced-motion`.

### Shadow Vocabulary

- **Flat** (`box-shadow: none`): The default. Most surfaces have no shadow at all.
- **Soft** (`0 1px 0 rgb(22 28 36 / 0.06), 0 1px 2px rgb(22 28 36 / 0.07)`): A sheet resting on the ground. This is what `.docket` carries at rest, expressed with `color-mix` against the live ink so it follows the register.
- **Lifted** (`0 1px 0 rgb(22 28 36 / 0.09), 0 4px 10px rgb(22 28 36 / 0.10)`): The response to hover on an interactive sheet — a product card being picked up slightly. Never a resting state.
- **Stamp contact** (`0 1px 0 color-mix(in oklab, var(--theme-ink) 22%, transparent)`): The hard edge under a `.stamp`. On `:active` it goes to `0 0 0` and the stamp translates 1px down — pressing a stamp pushes it into the paper.

### Named Rules

**The Contact-Not-Float Rule.** Every shadow leads with a `0 1px 0` contact edge before any blur, and no blur exceeds 10px. If a surface needs to feel more present, raise its tone or give it a rule — do not raise its shadow.

**The Motion-As-Response Rule.** Elevation changes are responses to state, never decoration. `.docket` moves soft → lifted on hover in 200ms; `.stamp` presses in 120ms. Motion easing is `cubic-bezier(0.2, 0, 0, 1)` (standard) or `cubic-bezier(0.16, 1, 0.3, 1)` (emphasised), with durations from the 100–650ms scale. Entrance reveals travel 12px. Under `prefers-reduced-motion` all durations collapse to 0.01ms **and all delays to 0s** — a `backwards`-filled entrance would otherwise hold its hidden state and then pop.

## Shapes

Paper is square-cut. A docket has a guillotined edge, a gummed label has about 2mm of radius, and nothing on a counter has 24px of it. The radius scale is therefore compressed almost to zero: `sm` 0px, `md` 2px, `lg` 3px, `xl` 4px, `2xl` 6px, `3xl` 8px.

**The scale was compressed rather than renamed, and this is the most important structural fact in the file.** Roughly 200 existing `rounded-2xl` / `rounded-3xl` call sites across the tree resolve into the new world without being individually rewritten, because the *names* still exist and only the *values* moved. This is why the migration was tractable at all. Two escapes are not caught by it: `rounded-full` (the `pill` step is still 9999px) and arbitrary values like `rounded-[2rem]`. Both are residue, not world.

The form language is rectilinear and ruled. Horizontal rules do the structural work — a `.field-row` is a label and a value separated by a full-width hairline, a `.docket-head` is a heading over a 2px rule. Borders are 1px alpha-ink. The one non-rectilinear signature is `.docket--perf`, a 3px dotted vertical strip 8px in from the left edge, rendered as a repeating radial gradient: the perforated stub of a torn-off docket.

`pill` survives for genuine chips only — promo codes and count badges. A rubber stamp is rectangular; reach for `pill` rarely.

### Named Rules

**The Square-Cut Rule.** New surfaces use `rounded-lg` (3px) or less. Anything above `rounded-3xl` (8px) is out of world. `rounded-full` on a rectangular element is always wrong.

**The Perf-Edge Rule.** `.docket--perf` is the world's signature and it cheapens on repetition. It belongs on the hero card and on order receipts. It currently appears on exactly one element and should stay in the low single digits.

## Components

### Buttons

Primary actions are **stamps**, not buttons. A rubber stamp is rectangular, prints with a hard edge, and sits slightly off-square — so this is never a pill and never a gradient.

- **Shape:** Near-square (`{rounded.md}`, 2px).
- **Primary (`.stamp`):** Accent fill, base-coloured text, 12px × 24px padding, Archivo at `wdth` 92 / 700 / 0.8125rem / 0.1em tracking / uppercase, with a hard 1px contact shadow beneath.
- **Pressed:** `translateY(1px)` and the contact shadow collapses to zero over 120ms. There is no hover lift; a stamp does not levitate.
- **Secondary (`.stamp--ghost`):** The counterstamp. Transparent ground, accent text, and a 1.5px `inset` ring rather than a border — the outline, not the fill.
- **Focus:** A global 2px `--color-ring` outline at 2px offset. The ring follows the accent, so it inverts correctly on the carbon register for free.

Both variants read their colour from `var(--theme-accent)` / `var(--theme-base)`, which is why a stamp inside `data-register="carbon"` becomes ember-on-slate with no component change.

### Cards / Containers

The **docket** is the only container. It replaced roughly 40 hand-built card and button variants.

- **Corner Style:** 3px (`{rounded.lg}`).
- **Background:** Elevated surface (`--color-surface-elevated`), i.e. the top copy of the form.
- **Border:** 1px `--color-border` (14% ink on light, 16% on carbon).
- **Shadow Strategy:** Soft at rest; lifted on hover for interactive dockets only (see Elevation & Depth).
- **Internal Padding:** 20px, 28px at `md`.
- **Variant:** `.docket--perf` adds the perforated left margin and 20px of left padding.

### Inputs / Fields

- **Style:** Docket-stock ground, 1px `--color-border`, 4px radius (`{rounded.xl}`), 10px × 14px padding, 0.875rem text.
- **Focus:** Border shifts to the accent and a 2px accent ring at 30% opacity appears. No glow.
- **Error:** Border and ring go red-600/red-700 with an 11px semibold message below.
- **Label:** A tracked uppercase caption above the field. *Ground truth: the checkout field component still hand-rolls this rather than using `.field-label` — see Not Yet Migrated.*

### Navigation

The masthead sits on the docket ground rather than on its own slab. Primary nav items are small tracked uppercase Archivo (11px, 600, 0.18em) with an animated underline, resting at 85% ink and going to accent on hover. The header is scroll-aware, collapsing from tall to compact past 24px of scroll. Icon affordances are 36px square. Mobile menu trigger is a `.docket`; the mobile drawer and several icon buttons are still pills.

### Signature Component: The Batch Card

The first viewport is not a photograph with words over it — it is the kitchen's record of what was made this morning, with the sweet photographed inside it. Three parts carry it:

1. **The card.** A `.docket docket--perf` holding a ruled `<dl>`: BATCH NO. / MADE / BEST BEFORE / KITCHEN / PRESERVATIVES, each a `.field-row` with a `.field-label` term and a `.field-value` definition.
2. **The live MADE field.** The date is *computed*, not typeset. Because this is a static export, the prerendered HTML carries the build date; the component re-resolves on mount so the LCP text paints immediately and a visitor never reads a stale date for more than a frame. The batch number is `KH-DDMM-NNN`, deterministic from the date so it is stable within a day. The card carries a `.live-mark` reading "Made today".
3. **The batch index.** A ruled list of the day's other sheets along the bottom edge, which doubles as the first navigation offered.

### Signature Component: The Ruled Row

`.field-row` is the atom the whole system is built from — a flex row, baseline-aligned, label left and value right, 8px vertical padding, separated by a 1px hairline, with the last child's rule removed. It appears in the batch card, the composition/spec panel, the cart summary, the checkout review and every admin detail view it has reached. When in doubt about how to present a pair of facts, this is the answer.

### Signature Component: The Live Mark

`.live-mark` is a 6px ember dot followed by tracked uppercase text. A dot rather than a badge, deliberately: a grid of badges reads as a wall of colour, a grid of dots reads as a column of state. It lifts to `{colors.ember-on-carbon}` on the dark register because ember at 6px disappears on slate.

### Product Card

A small docket: the plate on top, the record underneath. Title, a two-line description, then a ruled foot carrying variant weight (`.field-label`) and price (`.field-value`, tabular). The **Flavour Atlas** — a binding brand commitment — survives the world change intact, but re-expressed: the product's palette retunes the **stamp**, not the page. Hovering a sweet changes what colour its record was stamped in. Concretely, `theme_palette.accent` colours the price and the quick-add control, `theme_palette.glow` at 20% tints the image slot, and the card's ground never moves. Sale marks use ember; bestseller marks use the product's own accent; "new" uses ink. Sale outranks bestseller — a discount is more actionable than a badge.

## Do's and Don'ts

### Do:

- **Do** ship palette changes as a Supabase migration against `theme_presets`, not as a code edit. Code-only changes affect first paint and nothing else.
- **Do** keep the `:root` block in `globals.css` byte-identical to `DOCKET` in `palette.ts`, so first paint does not flash into the runtime palette.
- **Do** run `vitest run src/lib/theme/palette.test.ts` after any colour change. 48 assertions currently pass; they pin every contrast pair, the exact accent hex, the 25° competitor clearance, ember's exclusion from the register set, and the five-member product palette list.
- **Do** reach for `.docket`, `.field-row`, `.field-label`, `.field-value`, `.stamp`, `.docket-head` before writing new component CSS. A new surface needing a container uses `.docket`.
- **Do** set every recorded value in Courier Prime with `tabular-nums`.
- **Do** use `data-register="carbon"` to take a subtree dark. It re-themes everything inside with zero component changes.
- **Do** use `{colors.steel-hairline}` for any rule that carries meaning; `{colors.steel-rule}` does not clear 3:1.
- **Do** mirror any edit to `PRODUCT_PALETTES` into `packages/shared/src/catalogue/palettes.ts` — the set is deliberately duplicated because the shared package cannot import upward.

### Don't:

- **Don't** warm the ground or move it toward `#FFFFFF`. The cool stock is the appetite strategy.
- **Don't** use ember for anything but live state. It is outside the register token set specifically so it cannot spread, and a test asserts that.
- **Don't** set text in the manila label colour, or put accent text on a manila panel above UI scale.
- **Don't** introduce a display serif, a new font family, or a heavier weight where an Archivo `wdth` change would do.
- **Don't** write `rounded-full` on a rectangular element, or arbitrary radii like `rounded-[2rem]`. Both escape the compressed scale.
- **Don't** add a `max-w-*` to a page. Use `.container-site`.
- **Don't** write ad-hoc `py-*` on a section. Use `.section-y` / `.section-y-tight`.
- **Don't** hand-roll another eyebrow (`text-[11px] uppercase tracking-[...]`). Use `.field-label`.
- **Don't** repeat `.docket--perf`. It is the signature and it cheapens on repetition.
- **Don't** exceed a 10px shadow blur or add a hover lift to a stamp.
- **Don't** move the accent hue without re-running the clearance test and arguing the result. Deleting the test is not passing it.
- **Don't** re-add `cream`, `anjeer`, `pista` or `gunmetal` to the Tailwind palette. They were removed for having zero class usages; register colour is read through the `--theme-*` / `--color-*` properties instead.
- **Don't** use hex-valued CSS variables in Tailwind colour bindings. They must be `rgb(var(--x-rgb) / <alpha-value>)` — with a hex-valued var, `text-theme-ink/60` silently emits nothing, which is how 1003 opacity usages were once dead across the tree.

## Not Yet Migrated

The world is complete in the token and CSS layers; its **application** is partial. This section records what is world and what is residue, so the next person can tell the difference. Counts measured against `apps/storefront/src` on 2026-08-02.

**Adoption so far.** The container consolidation landed broadly (92 `.container-site` call sites). The docket grammar did not: `.docket` appears on 10 elements across 6 files, `.stamp` on 4, `.field-row` on 9, `.field-label` on ~19, `.docket-head` on 3, `.live-mark` on 2, and `.section-y` on 3 — all three of those in `app/page.tsx`. In practice the world is fully expressed on roughly seven surfaces: the home page, the hero, the product detail page, the product card, the cart, the header, and the floating contact. There are 17 storefront routes.

**Residue still in the tree.**

| Marker | Count | Note |
|---|---|---|
| Paisley heritage motif | 53 files | The retired world's ornament, still imported by `header.tsx` among others. Out of world. |
| `rounded-full` | 265 occurrences | Escapes the radius compression; the `pill` step is still 9999px. |
| `rounded-[2rem]` / `rounded-[1.75rem]` | 12 occurrences | Arbitrary radii, also uncaught by the compression. |
| Inline `bg-theme-accent` | 105 occurrences / 49 files | Hand-built accent buttons that should be `.stamp`. |
| `tracking-[0.22em]` | 121 occurrences | The retired eyebrow pattern; should be `.field-label`. |
| The admin console | 19 sections, 21 routes | Zero use of the docket grammar. Entirely unmigrated. |

*(The brief that commissioned this document cited 46 paisley files and 106 `bg-theme-accent` sites; the measured values above are 53 and 105. Trust the measurement, and re-measure before acting.)*

**Specific known contradictions.**

- **The shared `Button` is still a pill.** `packages/ui/src/button.tsx` is `rounded-full` with a `hover:-translate-y-0.5` lift, and its doc comment asserts *"Always round-pill shape to match brand"* — which is now false. It is the single most direct code-vs-world contradiction in the repo. Only one storefront file imports from `@ravisweets/ui`, so the blast radius of fixing it is small. `packages/ui/src/badge.tsx` is likewise a pill. `packages/ui/src/card.tsx`, by contrast, lands in-world for free: its `rounded-2xl` default now resolves to 6px.
- **`data-register="dusk"` cannot be removed yet.** It is accepted as a legacy alias for `carbon` throughout `globals.css` (base block, grain blend, live-mark lift) during migration, and nine files still emit it — `footer.tsx`, `hero-dusk.tsx`, `about/page.tsx`, and six `sections/*` components. Convert those to `carbon`, then delete every `[data-register='dusk']` selector. Until then, deleting the alias silently un-themes the footer.
- **Two retired heroes are still in the tree.** `hero-still.tsx` and `hero-dusk.tsx` sit alongside `hero-batch.tsx`. `PageDriftGarnish` is intentionally retired-but-present: it remains in the repo, unmounted, because in a world built on printed records its floating saffron/almond/paisley marks read as debris on the paper.
- **The checkout field label is hand-rolled.** `checkout-flow.tsx` sets its own `text-[11px] font-semibold uppercase tracking-wider` instead of `.field-label`.
- **Photography is absent.** The catalogue still points at the retired WordPress host, which 404s on every file. Both the hero and the product card detect the failure and fall back to a dashed 45°-rotated specimen plate on docket material — a deliberate part of the form rather than a broken-image icon. Migration `0011` also blanks every preset `imageUrl` that pointed at that host, so activating an old preset cannot reintroduce a 404 hero. When real assets land, the fallbacks disappear on their own.
- **`getVisualVersion()` stamps `data-theme="v3"` on `<html>`** and gates *components* only. The token layer is deliberately not gated — a duplicate v2 palette block would re-create the multiple-sources-of-truth problem this redesign exists to remove.
