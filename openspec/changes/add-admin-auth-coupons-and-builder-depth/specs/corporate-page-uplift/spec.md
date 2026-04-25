## ADDED Requirements

### Requirement: /corporate uses the warm-cream default palette

The `/corporate` page SHALL use the storefront's default warm-cream palette (`base: #fdf6ec`, `accent: #8a5a10`, `glow: #d4a96b`, `ink: #2a1a04`) for its overall surface. Dark-orange SHALL be reserved for accents (CTAs, hover states, badges) only.

#### Scenario: Visit /corporate
- **WHEN** user navigates to `/corporate`
- **THEN** the page background is warm cream; CTAs use brass/dark-orange as accent; no full-bleed dark-orange section dominates

### Requirement: Corporate enquiry form uses a 4-step stepper

The "Tell us what you're planning" enquiry form at `/corporate#enquiry` SHALL be replaced by a 4-step stepper:

1. **Occasion** — purpose (Diwali / wedding / corporate / other), event date
2. **Quantity & budget** — hamper count, target per-unit budget, customisation needs (logo print? ribbon? message?)
3. **Delivery & customisation** — single address vs multi-address (CSV upload), delivery window, file upload for logo
4. **Contact** — name, business name, GSTIN (optional), phone, email; consent + submit

The stepper SHALL include forward / back nav, a step indicator, autosave to `localStorage` on each step change, and a final submit confirmation with a generated reference code.

#### Scenario: Complete the stepper
- **WHEN** user completes all 4 steps and submits
- **THEN** the system records the enquiry, displays a confirmation with a reference code (e.g. `ENQ-2026-04-25-A8F2`), and emails the brand team

#### Scenario: Refresh mid-flow
- **WHEN** user fills steps 1 and 2, then refreshes the page
- **THEN** the stepper resumes at step 2 with the previously entered values restored from `localStorage`

#### Scenario: Step-level validation
- **WHEN** user clicks Continue on step 1 with no occasion selected
- **THEN** the Continue button is disabled (or surfaces a validation error) until a selection is made

### Requirement: Enquiry submission integrates with admin

Submitted enquiries SHALL persist to a Supabase `enquiries` table with all step data + reference code + timestamp + customer's auth id (anonymous or registered). Admin SHALL see new enquiries in `/admin/enquiries` and SHALL be able to mark them `responded` / `quoted` / `closed`.

#### Scenario: Admin views new enquiry
- **WHEN** a user submits the enquiry form
- **THEN** an admin opens `/admin/enquiries` and sees the new row at the top, marked `new`, with the customer's contact details and step data

### Requirement: Enquiry from builder pre-populates step 2 and 3

If the user arrives at the enquiry form via a deep-link from the hamper builder (carrying `?from=builder&state=<config>`), step 2 (quantity) and step 3 (customisation) SHALL be pre-filled from the builder config; the user SHALL only need to complete steps 1 and 4.

#### Scenario: Builder → enquiry
- **WHEN** user submits a hamper builder enquiry that lands at `/corporate?from=builder&state=...#enquiry`
- **THEN** the stepper opens at step 1 but steps 2 and 3 are already populated; the user fills only the occasion and contact details
