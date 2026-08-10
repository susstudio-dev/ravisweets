# Storefront feedback batch — 2026-08-11

Owner feedback (krish, with screenshots of ravisweets.com at ~1536×774 effective
viewport): seven items. Decisions below were made autonomously; anything the
owner may want to overturn is marked **[owner call]**.

## 1. Hero: fits the first viewport, right column fills, corner overlap fixed

**Problems seen.** (a) The hero's proof row clipped below the fold; (b) the
festival card ends mid-column leaving dead cream below it; (c) the katli-cursor
toggle (`sweet-cursor.tsx`, `bottom-4 right-[8.5rem]`) sits *inside* the span of
the contact cluster (`+` toggle + WhatsApp pill ≈ 196px from the right edge), so
the three widgets overlap.

**Design.**
- Compact the left column: lg headline cap 4.4rem → 4rem (re-checked against the
  "Made this / morning." orphan: first sentence needs ~576px at 4rem, column has
  ~650px), and tighten the vertical rhythm (mt-3/4/6/4/7 → mt-2/3/5/3/5, section
  pb-10 → pb-8).
- Right column: the festival card stretches to the column's full height
  (grid default stretch; card becomes `flex flex-col`, cutouts row centred and
  grown, seal/live-row anchored at the foot). Cutouts grow at md (w-28 → w-32).
- Cursor toggle moves to **bottom-left** (`bottom-4 left-4`). Nothing else lives
  there; the contact cluster keeps the bottom-right corner alone.

## 2. Global brand voice: "Family kitchen" retired

The live eyebrow comes from `site_content.hero.eyebrowEn = 'Family kitchen'`
(set by 0012, which has run in prod) — code-default edits alone change nothing.
Three moves, same pattern 0012 used:

- Extend `RETIRED_COPY` in hero-batch.tsx with `family kitchen`, so the current
  DB row is quarantined and the new code defaults paint immediately on deploy.
- New defaults: eyebrow **"Mithai house"**; body "…made fresh every morning
  since 1983…" (drops "by one family"); proof cell label `family kitchen` →
  `mithai house`. **[owner call: exact eyebrow wording]**
- Migration `0019_global_kitchen.sql` updates `site_content` + `theme_presets`
  to the same strings (dashboard paste, like 0012–0017).
- Sweep remaining customer-facing marketing copy: layout metadata, footer NAP
  line ("family kitchen in Khammam" → "Hand-made sweets from our kitchens in
  Hyderabad & Khammam" — footer stays the one factual origin mention), category
  SEO helper ("Khammam kitchen" → "our kitchens"), festivals index ("Khammam
  kitchen" line). `/about`, `/stores`, policies keep their factual history.

## 3. Festivals: nav goes to the index; Independence Day added

- Header "Festivals" link `/festivals/diwali` → `/festivals` (the index already
  lists every festival, upcoming + past — this was the real complaint).
- Add **Independence Day, 15 Aug 2026** (owner said "republic day"; Aug 15 is
  Independence Day — Republic Day is 26 Jan) to all four calendars: festivals
  index, `festivals/[slug]` (full page entry, tricolour-leaning palette within
  the cream system), hero calendar, festival-next-band. With the 3-day dispatch
  lead the order-by lands 12 Aug — tomorrow — which is exactly why it should be
  on the hero now.

## 4. Category pages: products start at the header

Current page spends a full viewport on back-link + display title + intro before
the grid. New layout: a **sticky left rail** (~280px) carrying back-link, title
(display-sm), product count, intro copy, then the Refine filters; the product
grid sits right and starts immediately below the site header.

Mechanics: `CategoryFilters` already talks only to the URL, so it detaches from
`CategoryBrowser` — the rail renders it in its own `Suspense`; the browser keeps
the grid. The server-rendered range index + method/keeping prose stay below the
fold (they are the crawler-visible content fix; do not client-ify them).

## 5. Reviews: **not fabricating** — flagged to owner

Full review infrastructure already exists (product-page submission + histogram,
verified-buyer badge, admin moderation, homepage band that appears when the
first approved review lands). PRODUCT.md: testimonials may never be invented.
Fabricated consumer reviews on a live store also violate India's Consumer
Protection (CCPA) fake-review rules. So: no seeded fiction. Fast honest path =
transcribe real WhatsApp/Google customer messages (with consent) into the
reviews table; offer to script that the moment the owner supplies them.

## 6. Essence: the Vault 10 as a storefront page

`/essence` — "The Essence Counter": the ten numbered pieces from
VAULT_10_PLAN.md presented as a serialised drop (No. 01–10, function line,
technique, heritage cue, shelf class), drop facts (₹2,400 · 500 numbered boxes ·
quarterly rotation), and a WhatsApp waitlist CTA. Checkout/serial-stock is a
later workstream (per the plan's W6–8); this page is the announcement + intent
capture. Nav gains **Essence** right after Shop (desktop + mobile). Rotation =
edit the one const array per drop.

## 7. Hero motion + photography

No gsap dependency — `motion` (framer) is already installed and the brief was
"gsap or something". A new ambient layer inside the hero: two slow-drifting
warm glow fields, floating specimen marks, and steam wisps rising behind the
festival card; all transform/opacity, all killed by the global
prefers-reduced-motion block. Photography cannot be produced from here: the
media library overlays real photos the moment they're uploaded in /admin/media.
