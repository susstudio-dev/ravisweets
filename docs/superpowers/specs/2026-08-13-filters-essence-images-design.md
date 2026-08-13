# Filter rail, Essence carousel, image weight — design

**Date:** 2026-08-13
**Status:** approved (owner, 2026-08-13)

Three independent defects reported together by the owner. They share no code and
can ship in any order; they are one spec because they were one conversation.

1. The catalogue filter rail cannot be scrolled, so most of it cannot be used.
2. The Essence carousel is buried below a screen of text and reads as grey.
3. Catalogue images are far heavier than the slots they are painted into.

---

## 1. The filter rail

### The defect

`apps/storefront/src/components/shop/shop-view.tsx:101` and
`apps/storefront/src/app/category/[slug]/page.tsx:249` both declare the refine
column as:

```
lg:sticky lg:top-20 lg:self-start
```

with no height bound and no internal overflow. On `/category/sweets` the column
holds a back link, an `h1`, a product count, an intro paragraph and six filter
groups — roughly 900–1000px. Pinned 80px from the top of an ~800px viewport,
everything below the fold is unreachable **permanently**: the page scrolls, the
pinned rail does not move with it, and it has no scrollbar of its own. On the
Sweets category that strands the tail of `Free from`, the whole `Availability`
control and the `Sort by` select.

This is desktop-only. Below `lg` the rail is static and the `FilterSheet`
(`components/catalogue/filter-sheet.tsx`, `lg:hidden`) already provides a bottom
sheet with its own `max-h-[85dvh] overflow-y-auto`.

### The fix

**1.1 — The rail scrolls inside itself.** Both asides gain
`lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto`. `6rem` = the `top-20` offset
(5rem) plus 1rem of breathing room at the bottom.

Setting `overflow-y` to a non-`visible` value makes the computed `overflow-x`
`auto` as well, which clips anything painting outside the column — in practice
the `focus-visible:ring-2` on the filter chips. The rail therefore also carries
`pr-1 -mr-1` so a ring has somewhere to land, and a `.rail-scroll` class in
`globals.css` styles the scrollbar in the house rule colour instead of leaving
the platform default slab against cream.

**1.2 — Long groups collapse.** `ProductFilters` renders every live chip in every
group. `Free from` alone is nine. Any group with more than `COLLAPSE_AT` (6)
visible chips renders the first six plus a `Show all N` toggle.

A selected chip is **never** hidden by the collapse. If the shopper has selected
something in the tail, it is appended to the visible set rather than sorted to
the front — reordering chips underneath a cursor is worse than the problem it
solves. This is the same principle already stated in that file for zero-count
chips: a control that can undo the current state must stay reachable.

With this in place most categories fit the rail without scrolling at all, and
1.1 becomes the safety net rather than the primary interaction.

**1.3 — The mobile trigger stays reachable.** On the category page the
`FilterSheet` trigger sits below the back link, `h1`, count and intro, so a phone
visitor scrolls it off screen before reaching the grid. The trigger's wrapper
becomes `sticky top-16 z-20` below `lg`, so it stays in reach while the grid is
being read. `top-16` clears the sticky masthead (`header.tsx:153`,
`sticky top-0 z-40`); `z-20` sits under it.

### Not doing

Moving filters into a top bar on all breakpoints. It is a larger change than the
defect warrants and would discard the rail layout the owner asked for on
2026-08-11.

---

## 2. Essence

### The defect

Two things, both reported as "I need the scrolling carousel and one product in
the middle focused, add colourful photos".

The carousel **already exists** and already centre-focuses one piece
(`components/essence/essence-carousel.tsx`, a CSS 3D coverflow with drag, arrow
and keyboard control). It is invisible in practice because it sits below the
headline, a 60-word blurb, a CTA row and a three-cell stat table — a full screen
of text on a laptop. And it reads as grey because `PieceCard` paints the piece's
ink at 18% and 6% alpha over the surface colour, which on the carbon register is
a barely-perceptible tint.

### The fix

**2.1 — The carousel opens the page.** New order inside the carbon subtree:

```
eyebrow  →  h1  →  carousel  →  rail  →  reading panel
            ↓
        blurb  →  CTA + price  →  drop stats
```

The `h1` steps down one level (`text-display-lg md:text-display-xl` →
`text-display-md md:text-display-lg`) and the section's vertical padding tightens
from `section-y` to `pt-10 md:pt-14`, so on an ~900px laptop viewport the
headline and the entire carousel share the first screen. The reading panel falls
just below the fold, which is correct — it invites the scroll rather than
competing with the stage.

The `display-md` "The collection, 01 → 10" heading is demoted to a compact `h2`;
with the carousel as the hero it was restating the `h1`.

**2.2 — Auto-advance.** A 4.5s timer advances the active piece, wrapping 10 → 01
(the existing `go()` clamps and must not be reused for this — a new `advance()`
wraps).

Paused while: the pointer is over the stage, focus is inside the carousel, a drag
is in progress, or the tab is hidden.

Stopped **permanently** on any deliberate selection — card click, rail number,
arrow button, arrow key, or a completed drag. Once a visitor has taken control,
the page does not take it back.

Never runs under `prefers-reduced-motion`, which already renders `FlatGrid`.

A hairline progress bar under the active rail number shows the timer, so the
movement reads as designed rather than as a glitch.

**2.3 — The cards carry real colour.** `PieceCard` becomes a colour object
rather than a tinted surface:

- the piece's ink at full strength across the top third, falling to transparent;
- a radial glow behind the specimen figure;
- a fine grain overlay (inline SVG turbulence, tiled) to kill gradient banding
  and give the tile a material;
- a hairline top highlight so it reads as a physical object under a light.

`SpecimenMark` renders twice — large and faint as a watermark, crisp and small in
front — for depth.

The number badge picks a dark or light foreground from the ink's **luminance**
via `culori` (already a storefront dependency), because two of the ten inks are
near-white (`#EFE3C8` Living Rabri, `#B9BCC4` Til Noir) and would otherwise set
white on cream.

Inactive cards render at reduced saturation so the centre card is unambiguously
the focus. `FlatGrid` gets the same panel treatment so the reduced-motion path
is not the drab one.

### Constraints that stay

- **No photographs.** The ten pieces do not exist outside `VAULT_10_PLAN.md`.
  Owner decision 2026-08-13: colour comes from CSS and SVG, not from a stock
  photo or a borrowed shot of a different sweet.
- **No body text inside a rotated plane** — the rule stated at the top of
  `essence-carousel.tsx`. Text on a 3D-transformed element is rasterised at its
  projected size and resampled; the reading panel below the stage stays the only
  place words live.
- The compliance notes at the top of `app/essence/page.tsx` (§2 of the plan) are
  untouched — no per-piece nutrition numbers, no "probiotic", no liquid nitrogen.

---

## 3. Image weight

### The defect

All 83 catalogue photographs are **1400×1400 WebP, averaging 130 KB, 10.56 MB
total**. Every one of them is served at that size to every device.

The cause is `apps/storefront/next.config.mjs`:

```js
images: { unoptimized: true, ... }   // "Static export cannot use Next's image optimiser"
```

With `unoptimized`, `next/image` emits a bare `<img src>` and **no `srcset`** —
which also means the `sizes` attribute on all ~25 call sites is dead code. A
phone painting a 170 CSS px thumbnail in a two-column grid downloads the full
1400px file: about 68× the pixel data it can use. A 24-card viewport is ~3.1 MB
of images.

`/products/*` also has no cache rule in `public/_headers`, so Cloudflare Pages
serves it with its revalidating default and every repeat visit pays a round trip
per image.

### The fix

The premise in that config comment is half true. A static export cannot use
Next's *built-in* optimiser, but `output: 'export'` **does** support a custom
loader — which fixes every call site from configuration instead of by rewriting
twenty-five components.

**3.1 — Generate the rungs.** New `scripts/photography/variants.mjs`, called at
the end of the existing `process.mjs` so a future drop produces them
automatically, and exposed as `pnpm photography:variants` for the current set.

For every master in `public/products/` it emits `<name>-400w.webp` and
`<name>-640w.webp` with the same sharp settings the masters use (q78, effort 5).
The 1400px master stays as the top rung.

The `w` suffix is load-bearing: extra camera angles are already named
`<slug>-2.webp`, so a bare `<slug>-400.webp` would be ambiguous with them. Files
matching `/-\d+w\.webp$/` are skipped as inputs, which keeps the script
idempotent.

Two rungs, not four:

| slot | CSS px | @2× | serves from |
|---|---|---|---|
| phone grid, 2-col | ~195 | 390 | `400w` (~22 KB) |
| tablet grid, 3-col | ~253 | 506 | `640w` (~45 KB) |
| desktop grid, 4-col | ~300 | 600 | `640w` (~45 KB) |
| product page hero | ~560 | 1120 | 1400 master |

A middle rung near 1000px would only help the product page, which loads one
image — it would add ~7 MB to the repository to save ~35 KB on a single-image
page. AVIF is skipped for the same reason: another ~4 KB off a 22 KB thumbnail,
for double the files and double the encode time. Both are easy to add later.

**3.2 — The loader.** `src/lib/image-loader.ts` snaps a requested width to the
nearest rung and returns anything that is not a `/products/*.webp` unchanged, so
Supabase and Cloudinary overrides and every brand asset pass through untouched.

`next.config.mjs` replaces `unoptimized: true` with:

```js
loader: 'custom',
loaderFile: './src/lib/image-loader.ts',
deviceSizes: [640, 1400],
imageSizes: [200, 400],
```

`imageSizes` values must all be smaller than the smallest `deviceSizes` value,
which is why the two lists are split that way.

**3.3 — Cache and priority.** `public/_headers` gains:

```
/products/*
  Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
```

Thirty days, and deliberately **not** `immutable`: these filenames carry no
content hash, so a re-shot photograph has to be able to win eventually. If the
photography set starts changing often, hash the variant filenames and raise this
to a year.

The first four cards in each grid receive `priority`, so the LCP image on a
category page is not lazy-loaded.

**3.4 — Verify.** `scripts/photography/verify.mjs` is extended to fail if any
master is missing a rung, so a future drop cannot half-land.

### Expected result

| | before | after |
|---|---|---|
| phone grid thumbnail | 130 KB | ~22 KB |
| 24-card viewport | ~3.1 MB | ~530 KB |
| repository | 10.5 MB | ~16 MB |

### Risk, and the fallback

The one genuine unknown is whether `loader: 'custom'` builds cleanly under
`output: 'export'` in Next 15.5.15. The documentation says it does; this is
proved with a real export build **before** any other work in part 3.

If it does not, the fallback is a `<Photo>` wrapper — `<img>` with a
hand-built `srcset` — applied to the six call sites that carry the weight:
product card, product gallery, quick-view modal, cart, hero, category rail. Same
win on the pages that matter, a larger diff, and the remaining ~19 call sites
keep today's behaviour.

---

## Verification

- `pnpm --filter @ravisweets/storefront typecheck`
- `pnpm --filter @ravisweets/storefront build:cloudflare` — must succeed with the
  custom loader
- Grep the built `out/` HTML for a `srcset` containing `-400w.webp`, to prove the
  loader ran rather than silently no-oping
- `photography:verify` passes
- Filter rail: at 1280×800 on `/category/sweets`, every control including
  `Sort by` is reachable
- Essence: headline and full carousel visible in the first screen at 1280×900;
  auto-advance stops permanently after one rail click
