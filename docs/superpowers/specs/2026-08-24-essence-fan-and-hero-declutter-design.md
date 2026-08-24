# Essence fan + hero declutter — owner feedback batch, 2026-08-24

Owner feedback (verbatim intent, from the 2026-08-24 session):

> "In essence page there is lot of text in the top which is making no focus on
> the product; also the cards can be scrolled with mouse scroll, and then the
> cards should be there left and right initially — when scroll it can look
> like a real animation; also in the right we can bring the details of it
> clearly. In the hero the header and the left side area looks really
> cluttered, and the sweet in the right side has a red tint on it — fix it —
> add a bg image which can make the app more realistic."

Session was autonomous, so the interactive design-approval gate could not run;
this document records the decisions taken and the reasoning, and was written
alongside the implementation rather than ahead of it.

## 1. Essence page (`/essence`)

**Problem.** The h1 ran display-md→lg over three lines; headline, manifest
label and stage stacked vertically, and every word about the active piece sat
in a centered strip *under* the stage — the product was the fourth thing the
viewport offered.

**Design.**

- The h1 drops to a single `text-display-md` step, `max-w-3xl`. The words are
  unchanged — they are the drop's pitch — they just stop being the largest
  object on the page.
- The carousel becomes a two-column surface at `lg`:
  `[minmax(0,1.12fr)_minmax(0,0.88fr)]` — the 3D fan and its rail on the left,
  the **reading panel** as a ruled right column (`lg:border-l` +
  `--color-rule`, left-aligned) carrying number/fresh line, name, description,
  technique/heritage cells, and — new — the drop price and the WhatsApp
  waitlist stamp, passed in as `price`/`cta` props so the terms sit beside the
  piece instead of a screen below it. Below `lg` the panel stacks under the
  rail (same reading order, linearised).
- **The fan opens mid-drop**: `active` initialises to the middle index so
  cards spread to both sides on arrival ("cards should be there left and
  right initially"). The rail still counts 01–10; order is a rail concept,
  not a starting-position concept.
- **The wheel drives the deck**: a native `wheel` listener on the stage
  (`{ passive: false }` — React's root wheel handlers are passive and cannot
  `preventDefault`). Accumulator of 60px per step, one step per 350ms,
  direction flips reset the accumulator, `deltaX` honoured for trackpads.
  Hardened by the adversarial review (below): `ctrlKey` wheels (pinch-zoom /
  Ctrl+wheel browser zoom) are never claimed; `deltaMode` is normalised per
  mode (page-mode notches are a full step — untreated they were a true scroll
  trap); past either end the handler declines the event and the page scrolls,
  except during a short grace window after the final step so one gesture's
  inertia cannot fling the page. A wheel step counts as taking the wheel —
  autoplay stops, per the carousel's existing interaction philosophy.
- **A mount "deal" animation was tried and reverted the same day.** Replacing
  `initial={false}` with a stacked-centre pose (a) blanked the static
  export's stage until hydration (motion serialises `initial` into the SSR
  HTML) and (b) replayed on every jump ≥ 2 — the autoplay wrap 10→01 blanked
  the whole fan every cycle, because the ±3 card window has no exit
  animation. `initial={false}` is now documented as load-bearing in the
  component.
- Stage edge fades narrowed (`md:w-28 → md:w-16`) — 7rem of fade a side on a
  half-width stage was eating the ±2 cards the layout exists to show.
- Reduced motion keeps the flat grid, untouched.

**Rejected alternative:** scroll-linked page animation (cards animate as the
document scrolls). Rejected because the page has real content below the fan;
binding card state to document scroll would have made the manifest and the
close unreachable without cycling all ten pieces — the clamped wheel handler
gives the same "scrolling animates the cards" feel without the trap.

## 2. Homepage hero + header

- **Red tint (the actual defect):** the Kaju Katli master was shot on red
  cloth; the u2net cutout kept (a) red bounce over the whole subject and
  (b) raw cloth slivers between the cashews. Fixed at the pixel level —
  `scripts/photography/despill.py` (HSV: red hues rotate to beige 38° and
  desaturate under a smoothstep weight; alpha-kill exists but is disabled —
  any threshold that catches the cloth also chews holes in the katli).
  Applied to `kaju-katli-cutout.webp`. **Do not run it folder-wide**: gongura,
  red karam and kesar products are legitimately red.
- **Backdrop ("bg image … more realistic"):** `public/brand/hero-counter.webp`
  — a 6KB 1600×900 webp baked from the owner's *own* photography (mysore pak,
  jalebi, motichoor), 85px-blurred into pools of warm counter light and graded
  toward the house cream, hardest over the text column and the bottom edge.
  Mounted as a decorative, `pointer-events-none` layer under `HeroAmbient`.
  The 2021 legacy stock was explicitly not used (owner rejected borrowed
  shots 2026-08-13), and the ground *token* never warms — the Cool Ground
  Rule governs the token, and the photograph is the sanctioned warm element.
- **Left column declutter:** the deadline chip lost its border box (red line,
  same copy, same red discipline — kumkum red still appears exactly twice);
  the proof strip lost its three display numerals and became one quiet
  `.field-label` ruled row: "Nil preservatives · Same-day dispatch ·
  Pan-India delivery" ("Est 1983" dropped from it — the eyebrow two lines up
  already says it). The column now frames exactly two objects: the pill CTAs.
- **Header declutter:** desktop nav drops Stores and About (both remain in
  the footer — "Stores & Contact", "Our Story" — and in the mobile drawer via
  a new `DRAWER_NAV`); `NavLink` gains `whitespace-nowrap` so "Gift hampers"
  can never wrap into a two-line tab against the search field.

## 3. Adversarial review (same session)

A 44-agent review/verify workflow over the diff confirmed 15 findings (5 were
refuted); every confirmed one was fixed before commit:

- The mount "deal" reverted (empty SSR stage + jump flashes — see §1).
- Wheel: `ctrlKey` guard, `deltaMode` 1/2 normalisation, end-of-gesture grace
  window, and an honest in-code statement of what the handler claims.
- The reading panel's `aria-live`/`aria-atomic` region now wraps only the
  crossfade; the price/CTA is a sibling (it was being re-announced every
  4.5s autoplay beat), and the min-height moved onto the live wrapper, sized
  for the tallest entry so the CTA cannot pump under a thumb mid-tap.
- The hero backdrop was re-baked with measured WCAG floors: relative
  luminance ≥ 0.90 wherever text can sit under any crop (x < 0.68 covers the
  desktop text column and every portrait-crop centre strip), richer pools
  only behind the desktop plate. Verified over saved pixels: brand red
  ≥ 5.2:1, muted text ≥ 6.2:1 in all text zones.
- The hero proof line is a `ul` again (three bounded items for screen
  readers, numerals still gone).
- `cutouts.py` now imports despill's `APPLIED` registry and re-applies the
  correction after rebuilding a listed master — `--force` can no longer
  silently resurrect the red kaju katli. The refactored function reproduces
  the shipped cutout byte-for-byte.

## 4. Out of scope, noted for later

- Other cutouts from the red-cloth shoot may carry milder casts; despill.py is
  written and documented for one-at-a-time, eyes-on application (add masters
  to `APPLIED` as they are confirmed by eye).
