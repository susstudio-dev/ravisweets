## ADDED Requirements

### Requirement: `/shop` catalogue hub exists
The app SHALL expose a `/shop` route that renders a catalogue hub — category chips at the top covering every `CategorySlug`, a prominent search entry point, and a flat all-products grid with a consistent product-card component. Every product in the `CATALOGUE` whose `region_availability` includes the current region MUST appear in the grid.

#### Scenario: Direct URL resolves
- **WHEN** a user visits `/shop`
- **THEN** the response is HTTP 200 and every catalogued product is rendered in the grid

#### Scenario: Home CTA routes correctly
- **WHEN** a user clicks the "Shop all" CTA from the home page's "Featured" section
- **THEN** they land on `/shop` and see the full catalogue; no 404

### Requirement: Themed 404 at app root
The app SHALL provide `src/app/not-found.tsx` rendering a branded 404 page consistent with the existing product-not-found treatment: paisley mark, display headline, explanatory copy, a "back to home" primary CTA, and a "try searching" secondary link to `/search`.

#### Scenario: Unknown path returns themed 404
- **WHEN** a user visits any path with no matching route
- **THEN** the response is HTTP 404 and the themed `not-found` page renders — NOT Next's default

#### Scenario: 404 inherits layout
- **WHEN** the themed 404 renders
- **THEN** the site header and footer still show, theme tokens apply correctly, and the "skip to content" link works

### Requirement: Link-integrity CI check
A script SHALL run in the `lint` job of `.github/workflows/ci.yml` that enumerates every `href="/..."` value in `src/**/*.{ts,tsx}` and asserts each resolves to a real route (static page file OR dynamic segment covered by a page with `generateStaticParams` producing a matching slug).

#### Scenario: Broken link blocks merge
- **WHEN** a PR introduces `href="/nonexistent-page"` and no corresponding route exists
- **THEN** the `lint` CI job fails with a clear error pointing to the file, line, and unmatched path

#### Scenario: Anchor and external hrefs ignored
- **WHEN** a file contains `href="#enquiry"`, `href="mailto:..."`, `href="tel:..."`, `href="https://..."`, or `href="?q=..."`
- **THEN** the link-check ignores these and does not emit a warning

#### Scenario: Dynamic segments resolve
- **WHEN** the check encounters `href="/category/hyderabadi-specials"` and `src/app/category/[slug]/page.tsx` exists with `generateStaticParams` returning `hyderabadi-specials`
- **THEN** the path resolves and is not flagged

#### Scenario: Inline escape hatch honoured
- **WHEN** a file contains a `href` preceded by a `// link-check:ignore` comment within the same line or on the immediately-prior line
- **THEN** the link-check skips that href and continues

### Requirement: Shop page respects performance budget
The `/shop` route's First Load JS MUST be ≤ **180 KB gzipped** (the storefront's critical-route ceiling). Route-specific JS SHALL be ≤ **6 KB gz**.

#### Scenario: Budget audit
- **WHEN** `pnpm build` runs
- **THEN** the reported `/shop` First Load JS is ≤ 180 KB and route-specific JS is ≤ 6 KB

### Requirement: Shop page respects accessibility baseline
The `/shop` page MUST meet WCAG 2.1 AA minimums consistent with the rest of the storefront: keyboard-reachable category chips and search input, `aria-live` on result count, focus-visible outlines, and colour contrast ≥ 4.5:1 across all flavour palettes.

#### Scenario: Keyboard traversal
- **WHEN** a keyboard-only user tabs through the page
- **THEN** category chips → search input → product cards → pagination (if any) are all focusable and visibly-outlined on focus
