## ADDED Requirements

### Requirement: First visit creates an anonymous session

The system SHALL call `supabase.auth.signInAnonymously()` on the first client-side render for any visitor without an existing session. The returned `auth.users.id` SHALL be the persistent identity for cart, wishlist, and any pre-login activity for the duration of that browser.

#### Scenario: Brand-new visitor lands on home
- **WHEN** a visitor with no Supabase session opens the site for the first time
- **THEN** the client creates an anonymous session, persists the JWT in `localStorage`, and subsequent reads to user-scoped tables (cart, wishlist) succeed under that anonymous identity

#### Scenario: Returning anonymous visitor
- **WHEN** a visitor with an existing anonymous JWT returns
- **THEN** the system reuses the JWT; cart / wishlist persisted from prior visits is visible

### Requirement: Checkout requires phone or email identity

Before an order can be placed, the customer SHALL be either (a) phone-verified via OTP, or (b) email-verified via OTP, or (c) logged in with email + password. Anonymous-only sessions SHALL NOT be allowed to write to the `orders` table.

#### Scenario: Anonymous user reaches checkout
- **WHEN** an anonymous user clicks "Place order"
- **THEN** the system surfaces an OTP-or-email login modal in front of the order form; the cart and address state are preserved

#### Scenario: Phone OTP login at checkout
- **WHEN** the user enters a phone number, receives an OTP, and submits the correct code
- **THEN** the system calls `linkIdentity` to upgrade the anonymous user to a permanent record; the same `auth.users.id` is preserved; cart and addresses carry over with no migration

### Requirement: Phone OTP uses MSG91 with DLT-registered templates

The system SHALL route phone-OTP SMS through MSG91 as the configured Supabase Auth phone provider, using DLT-registered sender ID and approved message templates. Web OTP API auto-fill SHALL be supported via `<input autocomplete="one-time-code" inputmode="numeric">`.

#### Scenario: OTP arrives on Android Chrome
- **WHEN** an Android Chrome user requests an OTP
- **THEN** the SMS arrives via MSG91 with the registered template; Chrome auto-fills the OTP into the input field on receipt

#### Scenario: OTP throttling per phone
- **WHEN** the same phone number requests more than 3 OTPs within 60 seconds
- **THEN** the system returns a "too many requests" error and forces a 60-second cooldown before the next request

### Requirement: Customer record stores name, phone, email, addresses, GSTIN, dietary preferences

The `customers` table SHALL hold per-user profile data: `id` (matches `auth.users.id`), `full_name`, `phone` (E.164), `email`, `dietary_prefs` (array), `gstin` (validated regex), `business_name`, `is_b2b`, `marketing_consent`. Addresses SHALL live in a related `addresses` table with `is_default` flag.

#### Scenario: GSTIN format validation
- **WHEN** a B2B customer enters an invalid GSTIN
- **THEN** the field rejects with "Invalid GSTIN — must be 15 characters, format 22ABCDE1234F1Z5"

#### Scenario: Pincode format validation
- **WHEN** a customer enters a non-Indian-format pincode (e.g. 5 digits)
- **THEN** the field rejects with "Pincode must be 6 digits, starting 1-9"

#### Scenario: Default address selection
- **WHEN** a customer marks an address as default and a previous default exists
- **THEN** the previous default's `is_default` is unset and the new one is set; only ever one default per customer

### Requirement: Marketing consent is explicit and separate from terms

Signup forms SHALL present marketing consent (newsletter / WhatsApp / SMS promotions) as a separate, unchecked checkbox below the Terms & Conditions checkbox. The two SHALL NOT be combined or pre-checked.

#### Scenario: Customer signs up without consenting to marketing
- **WHEN** a customer accepts T&C but does not check marketing consent and submits
- **THEN** the account is created with `marketing_consent = false`; subsequent newsletter sends skip this customer

### Requirement: Right-to-delete flow anonymises orders

Customers SHALL have a "Delete my account" action under `/account/settings`. Triggering it SHALL: anonymise the customer's PII in the `orders` table (replace name/email/phone/address with redacted markers), preserve the `orders.id` and item lines for GST retention, delete the `customers` row, delete the `addresses` rows, delete the auth user, and emit an `account.deleted` audit log entry.

#### Scenario: Customer deletes account
- **WHEN** a logged-in customer confirms account deletion
- **THEN** within 30 days the customer record, addresses, and auth user are removed; orders remain with PII redacted; audit log records the deletion

### Requirement: Customers under 18 cannot sign up

The signup form SHALL include an age-gate (DOB or "I confirm I am 18 or older" checkbox). Submissions where the customer is under 18 SHALL be rejected.

#### Scenario: Underage signup attempt
- **WHEN** a user enters a DOB that places them below 18
- **THEN** the form blocks submit with "You must be 18 or older to create an account"
