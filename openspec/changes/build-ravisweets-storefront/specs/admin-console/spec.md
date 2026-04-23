## ADDED Requirements

### Requirement: Separate admin route and bundle
The admin console SHALL live at `/admin`, ship as a separate JavaScript bundle, and share zero runtime code with the customer storefront bundle. Access MUST be authenticated; unauthenticated requests are redirected to `/admin/login`.

#### Scenario: Admin code is not in customer bundles
- **WHEN** the customer storefront bundles are analysed
- **THEN** zero modules from the admin codebase appear in any customer route's JavaScript

#### Scenario: Unauthenticated access is blocked
- **WHEN** an unauthenticated request hits `/admin` or any sub-route
- **THEN** the response redirects to `/admin/login` with no admin data leaked

### Requirement: Role-based access control (RBAC)
The admin SHALL support the roles **Owner**, **Manager**, **Ops**, **Finance**, and **Viewer** with the following baseline permissions — and every destructive / financial action MUST be gated by the correct role:
- **Owner**: everything, including user management and settings.
- **Manager**: products, inventory, orders, discounts, content; cannot manage users or delete.
- **Ops**: orders (view, pack, ship, mark-delivered), inventory (adjustments, receive stock); no refunds, no pricing.
- **Finance**: invoices, refunds, payment reconciliation, revenue reports; read-only on products/orders.
- **Viewer**: read-only everywhere, no exports of PII.

#### Scenario: Ops cannot refund
- **WHEN** an Ops user attempts to issue a refund
- **THEN** the UI hides the control and the API rejects the request with a 403

#### Scenario: Role changes are audited
- **WHEN** an Owner changes a user's role
- **THEN** an audit log entry is written with actor, target, before/after role, and timestamp

### Requirement: Orders pipeline
The admin SHALL list all orders with filters (status, date range, channel, customer, payment status, fulfilment status, tag) and actions (view, edit, mark-packed, mark-shipped with courier + AWB, mark-delivered, cancel, refund, resend invoice, add internal note). Order detail MUST show: items, pricing, taxes, discounts, payment status & gateway reference, customer, addresses, timeline, internal notes, attachments.

#### Scenario: Bulk-packing workflow
- **WHEN** an Ops user selects multiple orders and clicks "mark-packed"
- **THEN** all selected orders transition to Packed, pack slips are generated in a single PDF, and a bulk audit-log entry is written

#### Scenario: Refund is tied to payment gateway
- **WHEN** a Finance user issues a full or partial refund
- **THEN** the refund is initiated on the original payment gateway (Razorpay or Stripe), the order ledger is updated, and the customer receives a refund-confirmation email

### Requirement: Inventory management with shelf-life and batch tracking
The admin SHALL track stock per SKU and per location, with every inventory movement recording: quantity, reason (receive / pack / adjust / write-off), **batch/lot id**, **manufactured_on**, **expiry_on** (derived from shelf-life), and actor. The system MUST enforce **FEFO (First-Expiry-First-Out)** picking order on the fulfilment queue and MUST block picking of lots whose remaining shelf-life at dispatch is below the declared minimum for the destination (stricter for international).

#### Scenario: Near-expiry alerts
- **WHEN** any lot's expiry date is within the configured near-expiry window (default 7 days)
- **THEN** the admin surfaces a "near expiry" list with quantities and a "discount / write-off" action

#### Scenario: International shipment respects shelf-life minimum
- **WHEN** an order ships to an international address and the selected lot would arrive with less than the destination's minimum remaining shelf-life
- **THEN** the picker is blocked from selecting that lot and surfaced an alternative lot suggestion

#### Scenario: Low-stock alert
- **WHEN** a SKU's available stock drops below its configured reorder threshold
- **THEN** a low-stock alert appears on the admin dashboard and an optional email/WhatsApp is sent to the configured recipient

### Requirement: Product and catalogue management
The admin SHALL support creating / editing / archiving products and variants, with fields for: name, slug, description, ingredients, allergens, shelf-life (days), storage instructions, weight, dimensions, HSN code, GST rate, images, regional availability, SEO meta, tags, and combo composition (for hamper products). Changes MUST be versioned and revertible.

#### Scenario: Product change is audited and revertible
- **WHEN** a Manager edits a product's price
- **THEN** the previous value is stored as a version and the edit appears in the product's change history with actor and timestamp

### Requirement: Customers and segments
The admin SHALL show every customer with: profile, lifetime value, total orders, last order, addresses, reviews, opt-ins, and order history. Customer search MUST support email, phone, order id, and address substring. Customers MAY be grouped into segments (e.g., "Hyderabad repeat", "corporate", "diaspora") for filtering and bulk action.

#### Scenario: GDPR-style delete
- **WHEN** a customer requests deletion and Owner approves
- **THEN** the customer's PII is anonymised on orders (retained for statutory period) and the profile is scrubbed

### Requirement: Discounts and promotions
The admin SHALL support creating discount codes (percent, fixed, free-shipping) with rules: minimum cart value, specific products/collections, one-use-per-customer, usage cap, valid date window, stackability policy, region scope. Automatic promotions (e.g., "buy 2 get 1 free on namkeens") MUST also be supported.

#### Scenario: Discount rule is enforced
- **WHEN** a shopper applies a code outside its valid date window
- **THEN** the code is rejected with a clear reason and no cart change occurs

### Requirement: Revenue, statistics, and analytics dashboard
The admin home SHALL display, for a selectable date range (today / 7d / 30d / 90d / YTD / custom), the following metrics with comparison vs. prior period: **gross revenue, net revenue (after refunds & discounts), orders placed, orders delivered, AOV, unique customers, new vs. returning split, conversion rate (sessions→orders), top 10 SKUs by revenue, top 10 SKUs by units, revenue by category, revenue by channel (retail / corporate / international), revenue by region, payment-method split, cancellation rate, refund rate, RTO rate**. Every metric MUST be exportable to CSV.

#### Scenario: Dashboard range comparison
- **WHEN** a user sets the range to "last 30 days"
- **THEN** each metric card shows the absolute value, the percent change vs. the previous 30 days, and a sparkline

#### Scenario: CSV export
- **WHEN** a user clicks "export" on any report
- **THEN** a CSV is generated containing the same data visible in the UI, with an audit-log entry of who exported what

### Requirement: Audit log
Every admin action that changes data (product edits, price changes, inventory adjustments, order status changes, refunds, role changes, discount creation, settings changes) MUST write an audit-log entry: actor, action, entity, before/after, timestamp, ip. Audit logs are **append-only** and read-only even for Owners.

#### Scenario: Audit log cannot be tampered with
- **WHEN** any user (including Owner) attempts to delete or edit an audit log entry
- **THEN** the action is rejected by both UI and API

### Requirement: Settings
The admin SHALL expose settings for: store info, GSTIN, FSSAI, addresses, tax rules, shipping zones & rates, payment-gateway credentials, email/WhatsApp templates, return/refund policy text, cookie banner text, feature flags (read-through to PostHog), and user/role management.

#### Scenario: Tax rule change is scoped by region
- **WHEN** a Finance user updates the GST rate on a category
- **THEN** the change applies only to the India region and orders placed before the change retain their original tax

### Requirement: Data export for accounting
The admin SHALL provide monthly exports of: sales (order-level with GST split), refunds, and inventory movements, in a format compatible with Tally / Zoho Books / QuickBooks.

#### Scenario: Monthly GST report
- **WHEN** Finance requests the current month's sales export
- **THEN** the CSV/Excel contains order-level rows with taxable value, CGST, SGST, IGST, HSN code, and totals reconcilable with Razorpay settlements

### Requirement: Search inside admin
The admin SHALL provide a global search (Cmd/Ctrl+K) across orders, customers, products, and discount codes, returning results grouped by entity type in under 300ms on datasets up to 100k orders.

#### Scenario: Global search finds an order by partial phone
- **WHEN** a user types the last 4 digits of a customer's phone
- **THEN** matching customers and their recent orders appear in the command palette
