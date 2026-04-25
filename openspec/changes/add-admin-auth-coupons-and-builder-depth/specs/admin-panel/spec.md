## ADDED Requirements

### Requirement: Admin route group is role-gated

The system SHALL gate every route under `(admin)` behind a Supabase JWT claim of `role: 'admin'`. Unauthenticated users SHALL be redirected to `/admin/login`. Authenticated non-admin users SHALL receive a 403 page that does not leak the existence of admin routes.

#### Scenario: Anonymous visit to admin route
- **WHEN** an anonymous user navigates to `/admin/orders`
- **THEN** the system redirects to `/admin/login` with `?from=/admin/orders` so post-login the user lands at the requested page

#### Scenario: Logged-in customer (non-admin) attempts admin access
- **WHEN** a logged-in customer (no `role: 'admin'` claim) navigates to any `/admin/*` route
- **THEN** the system shows a generic "Page not found" 404, not a "you don't have permission" message

#### Scenario: Logged-in admin accesses admin route
- **WHEN** a user with `role: 'admin'` JWT claim visits `/admin/orders`
- **THEN** the page renders the admin orders table

### Requirement: Admin Dashboard surfaces operating metrics

The Dashboard at `/admin` SHALL display, refreshing on page load: revenue today, revenue this week, revenue this month; count of orders awaiting fulfilment; low-stock SKU list (any variant where `stock_available <= reorder_threshold`); top 5 SKUs by units this week; abandoned carts older than 1 hour; new vs. returning customer split for the last 30 days.

#### Scenario: Brand owner opens dashboard mid-day
- **WHEN** an admin opens `/admin`
- **THEN** the page shows revenue numbers for today, this week, and this month; a Pending fulfilment card with a count and a "Go to queue" link; a Low stock card listing variants below threshold; a Top SKUs list

#### Scenario: No data state
- **WHEN** the database has no orders yet
- **THEN** each metric card shows "No data yet" with an explanatory line, not a zero or a broken layout

### Requirement: Admin Orders section supports filter, drill-down, and status transitions

The `/admin/orders` route SHALL render a paginated table of orders with filters (status, date range, customer, payment method, search by order number). Clicking a row SHALL open a side drawer with full order detail (customer, address, items, payment, status timeline). Admins SHALL be able to transition an order through `placed → packed → shipped → delivered` and to `cancelled` from any pre-shipped state.

#### Scenario: Filter to pending fulfilment
- **WHEN** the admin selects status filter "placed"
- **THEN** only `placed` orders appear, sorted by oldest first

#### Scenario: Mark order as packed
- **WHEN** admin opens an order's drawer and clicks "Mark as packed"
- **THEN** the system writes the new status, appends a timeline entry with the admin's user id and timestamp, and the row reflects the new status without a full reload

#### Scenario: Cancel a shipped order is rejected
- **WHEN** admin attempts to transition a `shipped` order to `cancelled`
- **THEN** the system rejects with a clear error explaining the order has already shipped

### Requirement: Admin Products section supports CRUD with image upload

The `/admin/products` route SHALL allow admins to list, search, create, edit, archive, and delete products. The product editor SHALL expose all fields: title, slug, description, category, dietary tags, ingredients, allergens, storage instructions, shelf life, primary image, gallery images, variants (with weight / price / SKU / stock), region availability, featured / bestseller / new flags, theme palette, garnish, builder eligibility, rubric pass date.

#### Scenario: Create new product
- **WHEN** admin clicks "Add product", fills required fields, uploads at least one image, and clicks "Save"
- **THEN** the product is written to Supabase, queued for next storefront rebuild, and appears in the admin list with status "draft"

#### Scenario: Edit price on existing product
- **WHEN** admin opens an existing product and changes the variant price from ₹499 to ₹549, then saves
- **THEN** the change persists, an audit log entry records who changed what, and the storefront rebuilds within 90 seconds (with a "Live in N seconds" toast)

#### Scenario: Required field validation
- **WHEN** admin tries to save a product with no title or no variant
- **THEN** the form blocks submit and surfaces field-level errors

### Requirement: Admin Inventory section tracks stock per variant

The `/admin/inventory` route SHALL display a table with one row per variant, columns: SKU, product, variant title, current stock, reorder threshold, days-of-stock-remaining (estimated from last-7-day sales), last restocked date. Admins SHALL be able to edit current stock and reorder threshold inline.

#### Scenario: Edit stock inline
- **WHEN** admin clicks the stock cell, types a new number, and presses Enter
- **THEN** the value persists, an audit log entry is recorded, and any low-stock alert clears if stock now exceeds threshold

#### Scenario: Below-threshold variant displays warning
- **WHEN** a variant's `stock_available <= reorder_threshold`
- **THEN** the row shows a red "Reorder" badge, and that SKU also appears on the Dashboard's low-stock card

### Requirement: Admin writes are audited

Every admin write (create / update / archive / delete on any entity) SHALL append a row to `audit_log` with `{ admin_user_id, action, entity_type, entity_id, before, after, timestamp }`.

#### Scenario: Price change is auditable
- **WHEN** admin changes a variant price
- **THEN** `audit_log` contains a row with `entity_type='variant'`, `before.price=499`, `after.price=549`, and the admin's user id

### Requirement: Admin requires MFA

Admin login SHALL require TOTP-based MFA in addition to email + password. New admin accounts SHALL be required to enrol an authenticator app on first login before any admin route renders.

#### Scenario: Admin logs in without MFA enrolled
- **WHEN** a fresh admin account logs in for the first time with email + password
- **THEN** the system intercepts and shows the MFA enrollment screen (QR + backup codes) before any admin route is reachable

#### Scenario: Admin logs in with MFA
- **WHEN** an admin enters correct password followed by correct TOTP code
- **THEN** the system issues a JWT with `role: 'admin'` and the admin lands on `/admin`
