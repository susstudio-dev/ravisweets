## Context

A live walkthrough of the storefront raised six issues spanning three categories: brand-context error (location wrong), genuine bugs (FlavourAtlas hover, cart hydration race), and polish gaps (search/account UX, builder usability, hero impressiveness). This change handles them in one rework so the site graduates from "functional demo" to "stakeholder-shareable."

**Current state recap**:
- 17 routes prerendered, 5 OpenSpec changes in flight, home at 181 KB First Load JS, builder at 179 KB, all under the (raised) 185 KB ceiling.
- 20 products in `CATALOGUE`, 4 templates, 6 motion primitives, 1 cinematic moment (`SignatureMoment`).
- Brand framing throughout assumes Hyderabad — needs correction to Khammam, Telangana.
- Specific bugs confirmed via code read: FlavourAtlas writes all 4 theme vars on hover (should write 2); CartProvider's localStorage load runs in a useEffect that races with first interactive click.

**Constraints**:
- 185 KB First Load JS ceiling on `/`.
- Motion sub-budget 9 KB gz custom (per the polish change's amendment).
- `prefers-reduced-motion` honoured on every new interaction.
- Photography-gating: hero stays on placeholder + "Dev only" watermark.
- No backend — demo orders + reviews live in localStorage / static data.
- Static-export-compatible (`BUILD_TARGET=github-pages`).

## Goals / Non-Goals

**Goals:**
- Every user-facing surface reads "Khammam, Telangana" for the shop's location; dish-style copy still says "Hyderabadi" where the dish IS Hyderabadi.
- FlavourAtlas hover changes the *accent* feel without ever breaking text legibility, on any palette including Diwali.
- Cart adds never get clobbered by hydration; persistence is causal and idempotent.
- `/account` and `/search` both feel "alive" on a fresh browser without requiring the user to first place an order or first run a search.
- Hamper builder is approachable for first-time users — stepper guides them, drag-to-reorder works, tier upgrades feel celebrated, items have tooltips before commitment.
- Home hero feels visibly more cinematic than the current parallax — distinct motion rates per layer + a garnish drift overlay.
- Catalogue feels populated (24 SKUs), reviews appear on top products.

**Non-Goals:**
- Rebuilding the cart architecture — just fix the race.
- Replacing `/search` route — overlay augments it, doesn't replace it.
- Real photography or real backend.
- Full WCAG audit on new motion (reduced-motion compliance per primitive remains required).
- Animated hamper rendering — top-down stylised composition stays an SVG/CSS tableau.

## Decisions

### Decision 1: FlavourAtlas writes only accent + glow on hover
**Choice**: `applyPalette()` in `flavour-atlas.tsx` accepts an `accent` + `glow` pair, not a full `ThemePalette`. The `Flavour` type changes from `palette: ThemePalette` to `palette: Pick<ThemePalette, 'accent' | 'glow'>`. The reverting `defaultFlavour` still has the full palette but only its `accent`/`glow` are applied through this code path.
**Why**: The bug is structurally caused by writing `--theme-base` and `--theme-ink` on hover. Removing those writes from this code path means no future palette can break legibility through hover. Full-palette swaps remain valid on product detail pages where every surface adapts via SSR-seeded `<ThemeVars>` (the entire body and cards inherit the new theme together — no mismatch).
**Alternative considered**: Keep writing all four vars but additionally swap surface-elevated bg colours via more CSS variables. Rejected — multiplies the variable surface area for marginal gain; the simpler fix is "don't write what doesn't need to change."

### Decision 2: Cart hydration via lazy initialiser
**Choice**:
```tsx
const [state, setState] = useState<CartState>(() => {
  if (typeof window === 'undefined') return { lines: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [] };
    const parsed = JSON.parse(raw) as CartState;
    return parsed?.lines ? parsed : { lines: [] };
  } catch { return { lines: [] }; }
});
```
Drop the `hydrated` flag. Persist on every state change after first render via a `useRef` `mounted` flag (skip the very first render's no-op write).
**Why**: This pattern eliminates the race because the lazy initialiser runs synchronously on the very first client render — *before* any click handler can fire. SSR fallback returns `{ lines: [] }` so Server-Component HTML still snapshots correctly.
**Alternative considered**: Add a `<CartHydrated>` provider that suspends interactivity until the load effect completes. Rejected — adds a UX delay (cart icon shows "—" for a frame) that's worse than the current race.

### Decision 3: Header search overlay = `Cmd/Ctrl+K` modal with inline autocomplete
**Choice**: `<HeaderSearchOverlay>` is a Radix-Dialog-style overlay (we'll write a small headless dialog rather than pull Radix in for one component) opened by:
- Clicking the header search icon
- `Cmd/Ctrl+K` shortcut (registered via `keydown` on `window`)
Body has an autofocused input + live results from `searchProducts()` (same scorer as `/search`). Shows up to 6 hits; "View all results" footer routes to `/search?q=…`.
**Why**: Modern e-comm UX expects an overlay; full-page nav for a query feels heavy. Reusing the existing `searchProducts` scorer means no new logic.
**Bundle**: ~3 KB gz (modal + handler).

### Decision 4: Demo orders seeded on first visit, not always
**Choice**: A `seedDemoData()` function runs once on the storefront's first client render, checking a sentinel key (`ravi.demo.seeded.v1`). If the sentinel is missing AND `ravi.orders.v1` is empty, write 4 demo orders. Idempotent — never overwrites real user data.
**Why**: Account looks meaningful on a fresh browser. Real orders placed afterward append, and the sentinel never fires twice.
**"Reset demo data" affordance**: `/account` has a small "Reset demo data" link in the empty / corner of the page that clears `ravi.orders.v1` + `ravi.cart.v1` + the sentinel, then reseeds. Useful for stakeholder demo.

### Decision 5: Hamper builder stepper — stateful but URL-shareable
**Choice**: 4 steps: `template` → `compose` → `customise` → `review`. The current step is held in component state AND surfaced in the URL as `?step=compose`. Sharing a URL preserves the active step. Default step on entry is `compose` if items are already in the URL state, otherwise `template`. Each step shows breadcrumb chips at the top of the panel; clicking any visited step jumps there.
**Why**: Stepper guides first-timers without taking the URL-share contract away. Repeat users with a saved configuration land on `compose` with everything pre-filled.

### Decision 6: Top-down hamper visualisation — stylised SVG, not photo
**Choice**: Replace the current "side-view box with ribbon" composition with a top-down "looking into the box" view. Items show as small circular icons in a hex-grid arrangement inside a rectangular box outline. Ribbon shows as a strip across the top edge (selected ribbon colour). Box finish is a textured background fill.
**Why**: A top-down view is more honest about what a "stack" of items looks like, and is more visually informative than a side-view box where items appear to "float" in front. Stylised because we have no photogrammetry of real hampers.
**Drag-to-reorder**: items use motion's `<Reorder.Group>` + `<Reorder.Item>` so the visual order in the box can be rearranged via drag. Touch users get a small "≡" handle for long-press grab.

### Decision 7: Tier-upgrade celebration — paisley confetti, ≤ 250 ms
**Choice**: When `totalUnits` crosses a tier threshold (Essence → Premium at 100, Premium → Grande at 500), a one-shot effect: 4-6 small `<Paisley size="sm">` SVG marks briefly drift across the price-summary panel from edges, fading to 0 opacity within 250 ms. Plus a non-blocking toast "Premium tier unlocked — 5% off per unit". Reduced-motion: just the toast.
**Why**: Discreet but rewarding; reuses the existing paisley primitive (no new asset).

### Decision 8: Palette hover-preview tooltip — Radix-free implementation
**Choice**: A small `<HoverPreview>` portal that opens on `pointer-enter` of palette items (after a 300 ms delay) and shows the product's image, ingredients, dietary tags. Closes on `pointer-leave` or when the user adds the item.
**Why**: 6 KB Radix Tooltip dependency is overkill for one use site; we can build this in ~40 lines.

### Decision 9: Hero refresh — three-rate parallax + garnish drift
**Choice**: Hero image changes from "Diwali hamper from above" to "Qubani ka Meetha macro" (matches `SignatureMoment` subject for brand consistency). Three explicit motion rates:
- Image: scroll progress 0..1 → translateY 0..-90px, scale 1..1.10
- Paisley ornaments: scroll progress 0..1 → translateY 0..+70px (opposite direction)
- Kinetic type: stays anchored (no scroll translation)
Plus 4 small saffron-strand SVG marks layered on top of the image, each drifting independently from the image at a third rate (~half the image's range).
**Why**: Distinct rates make parallax feel layered, not synchronised. Garnish drift adds the "macro depth" feel.

### Decision 10: Demo data is shared-package, not storefront-only
**Choice**: Demo reviews live at `packages/shared/src/catalogue/reviews.ts` (so backend / admin / future consumers can read them). Demo orders live in `apps/storefront/src/lib/orders/demo-seed.ts` because they're storefront-localStorage-specific.
**Why**: Reviews are catalogue-adjacent data; orders are user-state data. Different layers.

## Risks / Trade-offs

- **Risk**: Khammam framing reduces marketing scale ("a Khammam shop" sounds smaller than "a Hyderabad shop"). → **Mitigation**: surface as an open question; the founder approves the copy. The honest-craft framing is actually a differentiator in a category dominated by metropolitan brands.
- **Risk**: Stepper layout feels constraining to power users who want to see everything at once. → **Mitigation**: breadcrumb chips let visited steps be revisited freely; "review" step shows everything in one panel.
- **Risk**: Drag-to-reorder confuses mobile users without an obvious handle. → **Mitigation**: explicit "≡" drag handle + on-tap haptic feedback (where available); visible affordance.
- **Risk**: Demo-data seeding fires on real users' browsers and looks fake. → **Mitigation**: a small "Demo orders shown — reset" banner on `/account` makes it explicit; the seeder does not run if any real order already exists.
- **Risk**: `Cmd/Ctrl+K` global keybinding clashes with browser shortcuts in some locales. → **Mitigation**: only intercept when no input is focused and no modifier-conflict is active; default-allow `/` as an alternate trigger.
- **Risk**: Builder grows past 185 KB after the rework. → **Mitigation**: lazy-load the celebration confetti + the hover-preview tooltip via `next/dynamic`; both are only needed on user interaction.
- **Trade-off**: We ship a stylised top-down hamper (not a photo render). Accepted — the visual is better than the side view it replaces, and a real render needs photography we don't have.

## Migration Plan

- **Code**: all changes additive or in-place; no data-model migrations.
- **Demo data seeding**: idempotent; first-visit only. Existing users with real orders never see seeded data.
- **Builder URL contract**: existing share URLs (no `?step=` param) default to `compose` when items are present, `template` when empty. Backward-compatible.
- **Rollback**: each capability is independently revertable. Reverting the FlavourAtlas fix would re-introduce the Diwali hover bug; reverting the Khammam context would re-introduce stale Hyderabad framing — both are clean reverts at the file level.

## Open Questions

1. **Khammam vs Hyderabad framing in marketing copy** — the founder may want the more recognisable "Hyderabad" framing for SEO and brand recognition, even if the shop is physically in Khammam. Proposal: lead with "Khammam, Telangana" (honest) but allow "Hyderabad-style" as a dish descriptor when relevant. Founder confirmation needed.
2. **Telugu eyebrow translation** — `ఖమ్మం` (Khammam). Confirm with a native Telugu speaker that the spelling is canonical for the city name.
3. **Demo orders content** — names + addresses should be plausibly Indian + plausibly anonymised. Use names like "Priya Reddy", "Kiran Rao", "Ananya Sharma" with addresses in Hyderabad / Bengaluru / Mumbai. Confirm tone.
4. **Real Khammam store address** — the `/stores` page still uses an Abids/Hyderabad placeholder. Need the real Khammam address for the live deploy.
5. **`Cmd/Ctrl+K` as the search shortcut** — vs `/` (slash) which some sites prefer. Proposal: support both, prefer `Cmd/Ctrl+K`.
6. **Tier-celebration intensity** — paisley confetti is on the subtle side; founder may prefer something more / less. Proposal: ship the subtle version, take feedback.
