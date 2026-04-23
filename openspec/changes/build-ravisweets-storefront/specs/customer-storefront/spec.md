## ADDED Requirements

### Requirement: Public storefront pages
The storefront SHALL publish the following public pages: home, category, sub-category, product detail, combos/gifting-hampers, search results, cart, checkout, order confirmation, order tracking, account (orders / addresses / wishlist), reviews submission, festival/campaign landing pages, static pages (about, stores, contact, policies). All public pages MUST be crawlable and pre-rendered (static or ISR).

#### Scenario: Home page loads pre-rendered
- **WHEN** a first-time visitor requests the home page on a cold CDN
- **THEN** the page responds with fully-rendered HTML (not a client-side spinner) and displays featured products, active festival banner, and navigation

#### Scenario: Product detail page is SEO-ready
- **WHEN** a product detail page is rendered
- **THEN** it includes Product + Breadcrumb + Organization JSON-LD, a unique title and meta description, Open Graph and Twitter card tags, and a canonical URL

### Requirement: Performance budget
Customer-route pages MUST meet, on mid-tier Android + simulated Slow 4G: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, and total JavaScript shipped ≤ 180 KB gzipped. CI SHALL fail any PR that regresses any of these thresholds on the home, category, product, or checkout routes.

#### Scenario: Budget is enforced in CI
- **WHEN** a PR is opened that raises the home route's JS bundle above 180 KB gzipped
- **THEN** the CI check fails and the PR cannot be merged without an explicit waiver

#### Scenario: Admin code is not shipped to shoppers
- **WHEN** any customer-facing route's JS bundle is analysed
- **THEN** it contains zero code from the admin bundle

### Requirement: Mobile-first and responsive
The storefront MUST be mobile-first; every page MUST render and function on a 360×640 viewport without horizontal scroll, with tap targets ≥ 44×44 px, and with all critical flows (browse, add-to-cart, checkout) completable without a keyboard.

#### Scenario: Checkout on mobile is fully keyboard-free
- **WHEN** a shopper completes checkout on a 360×640 viewport
- **THEN** they can complete payment using taps only, with correct input modes (numeric for phone/pincode/card, email for email) surfacing the right keyboard

### Requirement: Accessibility baseline
The storefront MUST meet **WCAG 2.1 Level AA** for all public pages. Semantic HTML, ARIA where semantics don't suffice, colour-contrast ≥ 4.5:1 for body text, visible focus outlines, skip-to-content link, labelled form fields.

#### Scenario: Keyboard-only user can shop end to end
- **WHEN** a keyboard-only user navigates from home → product → cart → checkout → order confirmation
- **THEN** every action is reachable and actionable via keyboard with visible focus states

### Requirement: Browse, search, filter
The storefront SHALL provide: a category tree navigation, a search input (typo-tolerant, synonym-aware), faceted filters per category (price range, weight, dietary tags — sugar-free / eggless / regional, occasion, in-stock only), and sort options (relevance, price asc/desc, newest, bestselling).

#### Scenario: Search tolerates a typo
- **WHEN** a user searches "kajukatli"
- **THEN** results include "Kaju Katli" products ranked in the top 3

#### Scenario: Filter state is URL-shareable
- **WHEN** a user applies filters (price + eggless)
- **THEN** the URL reflects the filter state and pasting it in a new tab reproduces the same filtered view

### Requirement: Product detail
Each product page SHALL display: name, images (with zoom and AVIF/WebP delivery), price, weight / variant selector, per-variant price, shelf-life declaration, storage instructions, ingredients, allergens, nutrition (where available), festival tags, stock status (in-stock / low-stock / out-of-stock), delivery estimate for the entered pincode, add-to-cart button, and customer reviews summary.

#### Scenario: Shelf-life is visible before purchase
- **WHEN** a shopper views a product
- **THEN** the declared shelf-life (e.g., "Best before 15 days from manufacture") is visible above the add-to-cart button

#### Scenario: Pincode delivery check is present
- **WHEN** a shopper enters a pincode on the product page
- **THEN** the page updates to show expected delivery date and applicable shipping cost

### Requirement: Cart and checkout
The cart SHALL support: add / update quantity / remove / apply promo code / gift message / gift wrap / choose delivery method (home / in-store pickup if enabled) / select address / select payment method / place order. Checkout MUST support both guest and logged-in flows. Address entry MUST support Indian pincode autofill (city + state auto-filled from pincode).

#### Scenario: Guest checkout completes without account creation
- **WHEN** a guest adds items, enters email + address, pays, and lands on the order confirmation
- **THEN** the order is created, the confirmation email is sent, and a password-setup link is offered but not required

#### Scenario: Out-of-stock at checkout is prevented
- **WHEN** an item in the cart goes out of stock between cart-add and payment
- **THEN** the checkout surfaces a clear error, prevents charging the card, and offers to remove the item or substitute

### Requirement: Order tracking and customer account
Logged-in customers MUST be able to view all past orders, track live order status (placed → packed → shipped → out-for-delivery → delivered), download invoices, reorder any past order, manage addresses, and manage wishlist. Guests MUST be able to track an order via order id + email.

#### Scenario: Reorder places the same items in the cart
- **WHEN** a customer clicks "reorder" on a past order
- **THEN** all in-stock items from that order are placed in the cart with the same variants and quantities, and out-of-stock items are flagged

#### Scenario: Guest can track without account
- **WHEN** a guest enters order id + email on the track-order page
- **THEN** the current status, timeline, courier partner, and tracking link are shown

### Requirement: Reviews
Customers SHALL be able to submit a review (rating + text + optional photo) for any product they have purchased. Reviews MUST be moderated before publication.

#### Scenario: Only purchasers can review
- **WHEN** a non-purchaser opens the review form for a product they have not bought
- **THEN** the form is disabled with a message "Only customers who have purchased can review"

### Requirement: Festival / campaign landing pages
The storefront MUST support curated landing pages (e.g., "Diwali Gifting", "Raksha Bandhan") with custom hero, curated SKU grid, and a countdown banner, launchable without an engineering deploy.

#### Scenario: A festival page can be launched without deploy
- **WHEN** an admin creates a new festival landing page with a slug, hero, and SKU selection
- **THEN** the page is live at `/festivals/<slug>` within 5 minutes and is indexable

### Requirement: Internationalisation and multi-currency readiness
The storefront MUST detect region from URL path or geoIP and render in the correct currency (INR / USD / GBP / AED) with region-appropriate SKUs and shipping options. Phase 1 enables INR only; the code paths MUST NOT hard-code INR.

#### Scenario: No hard-coded currency
- **WHEN** the storefront code is audited for currency handling
- **THEN** all price rendering goes through a region-aware formatter and no component contains a literal "₹" outside that formatter

### Requirement: Cookie consent and privacy
The storefront MUST display a region-appropriate cookie banner on first visit, distinguish essential vs. analytics/marketing cookies, and honour a rejection by not loading non-essential trackers.

#### Scenario: Analytics off on rejection
- **WHEN** a visitor rejects analytics cookies
- **THEN** no PostHog, Meta Pixel, or Google Analytics script loads or fires for that session

### Requirement: WhatsApp order-status notifications (India)
For Indian orders, the storefront MUST capture a WhatsApp opt-in at checkout and deliver order-status updates (placed / shipped / delivered) via the WhatsApp Business API when opted in. Email is always sent regardless.

#### Scenario: Opt-in is respected
- **WHEN** a shopper opts in and an order transitions status
- **THEN** a WhatsApp template message is sent to the provided number and an email is also sent
