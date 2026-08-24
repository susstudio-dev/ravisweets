# Browse & Voice batch — 2026-08-24 (second batch of the day)

Owner feedback, seven items. The theme: browsing should feel like standing at the counter
(switch shelves instantly, grab with one tap), and the letterforms should stop being boxy.

## 1. Category switcher bar on every category page

- New `CategorySwitcher` component (extracted grammar from `sections/category-rail.tsx`):
  a horizontal snap-scroll row of the circular glyph tiles, rendered full-width **above**
  the sidebar+grid columns on `/category/[slug]`.
- Covers **all 12** `ALL_SLUGS` (the homepage rail deliberately stays at its curated 8).
  Four new glyphs join the union: `leaf` (healthy-sweets), `scallop` (biscuits),
  `mound` (powders), `diya` (festival-specials). Palettes reuse existing
  `PRODUCT_PALETTES` keys — no palette edits, no shared-package sync.
- Active tile = accent ring + tinted circle + semibold label. Server component;
  `activeSlug` comes from the route param, so every link stays in static HTML.

## 2. Left panel = filters + sort only

- The sidebar loses: "Back to home" link, h1 title, product count, category description.
  It keeps exactly `CategoryFilters` (FilterSheet on mobile, Refine panel on desktop).
- "Sort by" moves from the bottom of the Refine panel to the **top** (shared
  `ProductFilters`; affects the mobile sheet too, /shop desktop is unaffected since it
  doesn't pass `showSort` there).
- Aside gets `aria-label="Refine products"` (it can no longer point at the moved h1).

## 3. Category title joins the count strip

- Eyebrow + h1 ("Gift Hampers") render server-side directly above the product column,
  immediately over CategoryBrowser's "SHOWING N OF N" ruled strip — title and count read
  as one header. h1 stays outside the Suspense boundary (static-export constraint).
- The category description (meta.body) moves down to introduce the prose block at the
  bottom of the page (SEO copy kept, browsing UI cleaned).

## 4. Quick-add on every card

- `ProductCard` already ships a gated quick-add (+ → green "Added" morph, first variant,
  qty 1, preventDefault/stopPropagation inside the card Link). Enable it at the five
  callers that don't pass it: category-browser, shop-view, search-view, product-page
  related grid, festival-page grid. (send-sweets-to-india already passes it.)

## 5. Festivals index starts with the upcoming edition

- Delete the intro section ("A year of festivals, one kitchen." + the Pongal→Christmas
  paragraph, `app/festivals/page.tsx:151-164`).
- Promote "Upcoming editions" from h2 to h1 (display-lg) so the heading hierarchy stays
  intact. Metadata description untouched.

## 6. Corporate: the builder is the headline act

- Hero slims to a single column: h1, lead, CTA row. **"Build your own hamper" becomes the
  primary CTA with a new `.stamp--feature` gradient** (stamp-blue → deep ink, 135°;
  the one sanctioned gradient exception to the flat-stamp rule — it marks the flagship
  interactive feature and nothing else). "Request a quote" drops to ghost.
- The capability-sheet docket moves out of the hero into the enquiry section (beside the
  contact rows), so "Three tiers, endlessly customisable." lands at/near the fold.
- The tier TABLE becomes three feature **cards** (SlotImage, tier name, price, MOQ,
  contents, Build → link). Volume-break footnote stays below. `id="catalogue"` kept.

## 7. Homepage hero left column, decluttered

- Default body copy shortens to one sentence ("Sweets, namkeens and gift hampers made
  fresh every morning since 1983 — delivered anywhere in India."). site_content override
  still wins when present.
- The bordered proof rule (`NIL PRESERVATIVES · …`) leaves the hero if the homepage
  already carries a trust/craft strip elsewhere; otherwise it stays as a single unruled,
  muted line. The red deadline line stays — it converts.
- Result: eyebrow / headline / one-line body / CTA row / one red line. No boxed lists.

## 8. Typography: the boxy face retires

- Poppins (display+body since the 2026-08-10 pivot) is replaced. A serif display was
  considered and REJECTED during design: layout.tsx records the standing owner decision
  that "warm serif over cream is the arrangement every Indian sweets brand ships" —
  and it is also the templated look. The boxiness is Poppins' monoline geometry
  (perfect circles, uniform strokes, flat wide caps), so the fix is a humanist
  skeleton, not a serif:
  - **Display: Bricolage Grotesque** (variable, `opsz` axis) — varied proportions,
    tight apertures, ink traps; curve and character where Poppins had rigid geometry.
  - **Body/UI: Figtree** (variable) — soft terminals, friendly, crisp at UI sizes.
  - **Courier Prime stays** (recorded/typed values — house signature).
    **Anek Telugu stays** (Indic marks).
- `--font-body` gets properly wired to next/font (it was a CSS literal only).
  `.field-label`, `.stamp`, `.live-mark` stay on the display var — Bricolage's
  uppercase at caption sizes keeps the "pre-printed form" voice, now with character.
- Files: `layout.tsx` (next/font + direction contract), `globals.css:84-87` fallback
  block + comments, `tailwind.config.ts` scale comment.

## Verification

Storefront production build must pass (`pnpm` workspace build, Windows: pnpm exec, never
npx); typecheck; visual spot-check of home, a category page, festivals, corporate.
Commit to master (working tree was clean at session start; static export means nothing
is live until the next deploy).
