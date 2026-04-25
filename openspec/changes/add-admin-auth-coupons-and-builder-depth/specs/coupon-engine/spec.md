## ADDED Requirements

### Requirement: Coupons are typed and targeted

The system SHALL persist coupons in a `coupons` table with at minimum these fields: `code` (unique, case-insensitive), `type` (`percent` | `flat` | `free_shipping` | `bogo`), `value`, `max_discount_cap` (nullable), `target_scope` (`cart` | `collection` | `product` | `hamper`), `target_ids` (array, nullable), `constraints` (JSONB), `valid_from`, `valid_to`, `usage_limit` (nullable), `per_user_limit` (nullable, default 1), `stackable` (default false), `priority` (int).

#### Scenario: Create flat-off festival coupon
- **WHEN** admin creates `DIWALI500` with type=flat, value=500, constraints={minSubtotal: 2999}, validTo='2026-11-15'
- **THEN** the row persists; the cart accepts the code only when subtotal ≥ ₹2999 and the date is on or before 2026-11-15

#### Scenario: Create percent-off with cap
- **WHEN** admin creates `BIGFEST20` with type=percent, value=20, max_discount_cap=2000
- **THEN** a cart with subtotal ₹15000 receives a ₹2000 discount (capped), not ₹3000

### Requirement: Coupon validation order is fail-fast

The validator SHALL evaluate constraints in this order, returning the first failure: (1) code exists + active; (2) date window; (3) region; (4) customer eligibility (logged-in / segment / first-order); (5) cart eligibility (target intersects cart); (6) min subtotal (post line-discounts, pre-shipping); (7) per-user usage; (8) global usage; (9) stackability vs already-applied codes.

#### Scenario: Expired code rejected before any other check
- **WHEN** customer applies `OLDDIWALI` whose `valid_to` is past
- **THEN** validator returns "Code expired on YYYY-MM-DD" without checking subtotal or other constraints

#### Scenario: Min-subtotal failure shows delta
- **WHEN** customer with subtotal ₹2599 applies `DIWALI500` (min ₹2999)
- **THEN** the error message reads "Add ₹400 more to use DIWALI500"

#### Scenario: Per-user limit reached
- **WHEN** customer who has already redeemed `FIRSTDIWALI` once applies it again
- **THEN** validator returns "You have already used this coupon"

### Requirement: Server-side validation is authoritative

The cart UI SHALL call `validateCoupon(cart, customer, code)` for live preview. The order-create path SHALL re-run the same validator on the server (Supabase RPC) and reject the order if validation fails. The client SHALL NOT be trusted to apply a discount.

#### Scenario: Tampered client total rejected
- **WHEN** the client submits an order with `coupon_applied: 'DIWALI500'` but the server-side validation fails (e.g. subtotal manipulated)
- **THEN** the server rejects the order with a 422 and the cart UI re-validates and clears the coupon

### Requirement: Stackability and conflict resolution

Two non-stackable coupons SHALL NOT apply simultaneously. When a higher-priority code is added, lower-priority codes SHALL be rejected with a clear message ("Cannot combine with X — remove DIWALI500 to add SHIP49"). Two stackable codes MAY apply together.

#### Scenario: Non-stackable replacement attempt
- **WHEN** customer with `DIWALI500` (stackable=false) applied tries to add `BIGFEST20` (stackable=false, priority lower)
- **THEN** validator returns "Cannot combine with DIWALI500 — remove it to use BIGFEST20"

#### Scenario: Stackable + non-stackable mix
- **WHEN** customer applies `FREESHIP99` (stackable=true) on top of `DIWALI500` (stackable=false)
- **THEN** both apply; cart shows two separate discount lines

### Requirement: Available-coupons hint for logged-in customers

Logged-in customers SHALL see a chip row above the coupon input listing up to 3 codes they are eligible for (e.g. first-order codes for new customers, B2B codes for B2B segment, hamper codes if hamper is in cart). Clicking a chip applies the code; codes are not auto-applied.

#### Scenario: New customer sees first-order chip
- **WHEN** a new logged-in customer (no prior orders) opens the cart
- **THEN** a `FIRSTDIWALI` chip appears in the suggestions row above the input

#### Scenario: Anonymous visitor sees no chips
- **WHEN** an anonymous (unclaimed) visitor opens the cart
- **THEN** the chip row is empty (the input is still available for typed codes)

### Requirement: Coupon redemptions are recorded

Successful coupon application on order commit SHALL write a row to `coupon_redemptions` with `(customer_id, coupon_code, order_id, redeemed_at, discount_amount)`. This table backs per-user limit checks.

#### Scenario: Order commit with coupon
- **WHEN** an order is successfully placed with `DIWALI500` applied
- **THEN** `coupon_redemptions` gains a row recording the customer, code, order, time, and ₹500 discount

#### Scenario: Order cancelled with coupon
- **WHEN** an order with a coupon is later cancelled
- **THEN** the `coupon_redemptions` row is marked `reversed_at` so the per-user limit check no longer counts it

### Requirement: Rate-limit on coupon submission

The cart endpoint SHALL throttle coupon validation requests to no more than 10 per minute per IP and per session. Excess requests SHALL receive HTTP 429.

#### Scenario: Brute-force attempt blocked
- **WHEN** an attacker submits 11 coupon codes within 60 seconds from the same IP
- **THEN** the 11th request returns 429 with a 60-second `Retry-After` header
