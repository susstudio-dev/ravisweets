## ADDED Requirements

### Requirement: Corporate account type
The system SHALL support a **Corporate account** customer type, distinct from retail customers, with fields: company name, GSTIN, registered address, billing address, authorised contacts (name / email / phone / role), approval status (pending / active / suspended), credit terms (none / net-15 / net-30 — v2+), and an assigned account manager (admin user).

#### Scenario: Corporate registration is gated by approval
- **WHEN** a company submits the corporate registration form
- **THEN** the account is created as `approval_status: pending`, the team receives a notification, and the company cannot place orders until an admin approves

### Requirement: Corporate landing and quote flow
The storefront SHALL publish a dedicated `/corporate` section with: landing page explaining the offering, gallery of corporate-gifting SKUs, catalogue download (PDF), enquiry form (company / contact / budget / delivery date / approximate quantity / customisation notes), and a "request a quote" flow that produces an admin task and a formal quote email.

#### Scenario: Quote request creates a task
- **WHEN** a prospect submits the corporate enquiry form
- **THEN** a task is created in the admin's corporate-pipeline view with all submitted details, an auto-reply email is sent to the prospect, and the assigned account manager is notified

### Requirement: MOQ ladders and tiered pricing
Corporate SKUs SHALL support MOQ (minimum order quantity) and **tiered pricing** (e.g., 50–99 units at ₹X, 100–499 at ₹Y, 500+ at ₹Z). The cart MUST automatically apply the correct tier price based on quantity and MUST refuse checkout below MOQ.

#### Scenario: MOQ refusal with clear message
- **WHEN** a corporate buyer adds 20 units of a SKU with MOQ 50
- **THEN** the cart surfaces "Minimum order quantity is 50" with the current shortfall and disables checkout until the quantity is raised

#### Scenario: Tier price auto-applies
- **WHEN** a corporate buyer raises quantity from 99 to 100
- **THEN** the per-unit price updates to the next tier and the cart total recalculates

### Requirement: Custom branding on orders
Corporate orders MUST support: a custom gift message (per shipment), a custom branded card (PDF upload by customer or by admin), logo printing on packaging (proof approval flow), and custom ribbon / tag colour (from a predefined set). Each customisation MUST be captured on the order and surfaced on the pick slip.

#### Scenario: Logo proof approval before production
- **WHEN** a corporate order includes logo printing
- **THEN** the order enters a "proof_pending" sub-status, the customer receives a proof PDF, and fulfilment is blocked until the customer approves the proof in writing (email or dashboard)

### Requirement: Multi-address bulk delivery
Corporate orders MUST support shipping one order to **many recipient addresses** (e.g., 200 employees at 200 addresses). Addresses MUST be accepted via: CSV upload (template provided), manual entry, or repeat-for-location. Shipping cost MUST be computed per recipient and consolidated on one invoice.

#### Scenario: CSV upload with validation
- **WHEN** a corporate user uploads a 500-row CSV of recipients
- **THEN** the system validates each row (name / phone / pincode), highlights invalid rows, allows inline correction, and commits only when all rows are valid

#### Scenario: Per-recipient tracking
- **WHEN** a multi-address order ships
- **THEN** each recipient receives their own tracking link via email/WhatsApp and the admin sees a per-recipient status grid on the order

### Requirement: Purchase order and invoicing
Corporate checkout MUST accept a **PO number** and attach it to the invoice. Invoices MUST be GST-compliant, downloadable, and may be consolidated monthly on request. Credit terms (Phase 2+) MUST block dispatch if an account is past due.

#### Scenario: PO number appears on invoice
- **WHEN** a corporate order is placed with PO number "PO-2026-0042"
- **THEN** the generated invoice carries that PO number in the header and in the filename

### Requirement: Corporate dashboard for the customer
Corporate customers MUST have a self-serve dashboard showing: open quotes, active orders, past orders with per-recipient statuses, outstanding invoices, credit balance (v2+), and an account-manager contact card with direct WhatsApp + email.

#### Scenario: Dashboard loads past orders by recipient
- **WHEN** a corporate user opens an order with 200 recipients
- **THEN** the dashboard paginates recipients and allows filtering by status and sorting by city/state

### Requirement: Admin corporate pipeline
The admin SHALL expose a **corporate pipeline** view (quotes, pending approval, active accounts, past-due if credit terms are enabled) with account-manager assignment, activity log, and SLAs (e.g., quote response within 24h).

#### Scenario: SLA breach is flagged
- **WHEN** a quote has been pending for more than the configured SLA (default 24 hours)
- **THEN** the pipeline flags the quote, escalates to the account-manager's manager, and logs the breach

### Requirement: Minimum lead-time and dispatch windows
Corporate orders with customisation (logo, custom card) MUST declare and enforce a minimum lead time (e.g., 7 business days for printed packaging). Checkout MUST block earlier requested-delivery dates.

#### Scenario: Lead-time block
- **WHEN** a corporate buyer requests delivery in 3 days but the order includes logo printing (7-day lead)
- **THEN** the checkout rejects the date and offers the earliest feasible date

### Requirement: Reporting on corporate revenue
Corporate orders MUST be filterable and reportable separately in the admin's revenue dashboard (corporate revenue, top corporate accounts, revenue by account manager, win rate on quotes).

#### Scenario: Corporate revenue card
- **WHEN** the admin dashboard is viewed
- **THEN** a "Corporate revenue" metric card appears alongside retail, with its own time-range comparison and a drilldown to top accounts
