## ADDED Requirements

### Requirement: Catalogue grows to 24 products
The catalogue SHALL contain **24 products** (up from 20). The new SKUs cover four categories that were under-represented:
- One additional **sweet** (Soan Papdi)
- One additional **gift hamper** (Wedding Trousseau Box)
- One additional **festival special** (Pongal Pot Set)
- One additional **combo** (Office Chai Tray)

Each new SKU passes the imagery rubric and carries `rubric_passed_on` + `source_url` per the catalogue-expansion spec.

#### Scenario: Category coverage
- **WHEN** any of the seven category pages are visited
- **THEN** at least 2 products are shown; for the four expanded categories, the new products appear

### Requirement: Demo reviews seeded for top products
Top 3 bestselling products (Kaju Katli, Hyderabadi Mixture, Qubani ka Meetha) SHALL each carry **5–8 demo reviews** stored in `packages/shared/src/catalogue/reviews.ts`. Each review includes: rating (1–5), title, body, author display name, dated 1–90 days before today, optional verified-purchase flag.

#### Scenario: Reviews appear on product detail
- **WHEN** a visitor views Kaju Katli's product page
- **THEN** at least 5 reviews are shown with author, date, rating, title, body — replacing the previous empty / no-data state

#### Scenario: Reviews are realistic
- **WHEN** the demo reviews are read
- **THEN** they're plausibly Indian (names like "Priya Reddy", "Kiran Rao"), reference the product specifically (not generic "great product!"), and mix 4-and-5-star with one 3-star for honesty

### Requirement: Demo orders seeded on first visit
On first client render, if `localStorage` does NOT contain `ravi.demo.seeded.v1` AND `ravi.orders.v1` is empty, **4 demo orders** SHALL be seeded into `ravi.orders.v1`. Statuses span placed / packed / shipped / delivered. Each order has 2-4 line items, a plausibly-Indian shipping address, and a realistic total.

#### Scenario: Fresh browser shows demo orders
- **WHEN** a user visits the storefront for the first time and goes to `/account`
- **THEN** 4 demo orders are visible with varied statuses and content

#### Scenario: Idempotent — never overwrites
- **WHEN** the seeder runs on a second visit (or a visit where the user has placed real orders)
- **THEN** the seeder no-ops; existing orders are preserved

#### Scenario: Banner makes demo state explicit
- **WHEN** demo orders are present (sentinel set, no real orders placed since)
- **THEN** `/account` shows a small "Showing demo orders — reset" banner

### Requirement: Reset demo data affordance
`/account` SHALL provide a "Reset demo data" link (small, in the page corner) that:
1. Clears `ravi.orders.v1`, `ravi.cart.v1`, `ravi.demo.seeded.v1`.
2. Re-seeds the demo orders.
3. Reloads the page so the UI updates.

#### Scenario: Reset works
- **WHEN** the user clicks "Reset demo data"
- **THEN** localStorage is cleared, demo orders are reseeded, and the page reflects the freshly-seeded state

### Requirement: Cart is NOT seeded
The first-visit demo seeder MUST NOT add items to the cart. The cart starts empty for a clean first impression.

#### Scenario: Cart is clean on first visit
- **WHEN** a user visits the storefront for the first time
- **THEN** the header cart badge does not appear (count = 0); the cart page shows the empty-state

### Requirement: Demo seeder runs SSR-safe
The seeder runs in a `useEffect` on the storefront's root layout. It MUST gate `localStorage` access with `typeof window !== 'undefined'` and run only once per page-load. Static-export builds are unaffected (server HTML doesn't seed; client picks up).

#### Scenario: Static export still builds
- **WHEN** `BUILD_TARGET=github-pages pnpm build` runs
- **THEN** the build succeeds with the seeder code present; the seeder's `localStorage` writes execute only at runtime in the browser
