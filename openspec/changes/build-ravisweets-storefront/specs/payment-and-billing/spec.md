## ADDED Requirements

### Requirement: Razorpay for India
The system SHALL integrate Razorpay as the payment provider for the India region, supporting: **UPI (collect + intent), cards (domestic + international), netbanking, wallets (Paytm / PhonePe / Mobikwik), EMI (cardless + card-based), pay-by-link, QR codes, and Razorpay Orders API** for server-side order creation.

#### Scenario: UPI intent flow completes
- **WHEN** an Indian shopper selects UPI at checkout and completes the intent flow in their UPI app
- **THEN** the order's payment status transitions to "paid", the Razorpay payment id and order id are stored against the order, and a paid-order webhook from Razorpay confirms the transition server-side

#### Scenario: Card 3DS completes
- **WHEN** a card requiring 3DS is used
- **THEN** the shopper is redirected through the 3DS challenge and returned to the order-confirmation page on success

### Requirement: Stripe for international
The system SHALL integrate Stripe as the payment provider for non-India regions, supporting multi-currency (USD / GBP / AED / EUR / AUD / CAD / SGD), 3DS by default, and Stripe Payment Intents for server-side confirmation.

#### Scenario: USD checkout uses Stripe
- **WHEN** a shopper in the US region places an order priced in USD
- **THEN** the payment goes through Stripe in USD, 3DS is enforced, and the payment is linked to the Medusa order via the Payment Intent id

### Requirement: Unified order + payment ledger
All payments, regardless of gateway, MUST be stored in a unified order-payment ledger with fields: `order_id`, `gateway` (razorpay/stripe/cod), `gateway_order_id`, `gateway_payment_id`, `amount`, `currency`, `status`, `captured_at`, `failure_reason`, `raw_payload_ref`. Refunds link back to the original payment row.

#### Scenario: Refund is traceable to original payment
- **WHEN** a refund is issued for an order
- **THEN** the refund row references the original payment row's `gateway_payment_id`, and the admin order-detail page shows the full payment + refund timeline

### Requirement: GST-compliant invoicing for India
For every Indian order, the system SHALL generate a **GST-compliant tax invoice** containing: seller name, GSTIN, FSSAI number, invoice number (sequential, per FY), invoice date, buyer name & address, place of supply, item lines with HSN, taxable value, CGST / SGST / IGST split, total, amount in words, and a signature block. Invoices MUST be downloadable by the customer and by admin.

#### Scenario: Intra-state invoice uses CGST + SGST
- **WHEN** an order ships within Telangana (same state as seller)
- **THEN** the invoice shows CGST + SGST (not IGST) per item and totals reconcile to the final charge

#### Scenario: Inter-state invoice uses IGST
- **WHEN** an order ships from Telangana to another state
- **THEN** the invoice shows IGST per item and no CGST/SGST

### Requirement: Tax calculation per region
Tax calculation MUST be region-aware. India orders apply GST per HSN-code-mapped rate. International orders apply no GST; the customer is responsible for any import duties, and the checkout clearly displays a "duties & taxes may apply on delivery" notice.

#### Scenario: International order is zero-rated for GST
- **WHEN** a shopper in the US places an order
- **THEN** the cart shows no GST and the invoice shows the sale as an export (zero-rated) with appropriate annotation

### Requirement: Payment failure handling and retry
On payment failure, the system MUST: keep the cart intact, show the shopper a clear reason with a "try another method" CTA, record the failure in the ledger, and NOT confirm the order. If the shopper returns within 24 hours via an abandoned-cart email, the cart MUST still be loadable.

#### Scenario: Failed payment does not create a paid order
- **WHEN** a Razorpay payment fails mid-flow
- **THEN** the order either does not exist or is stored with status "payment_failed", no paid-confirmation email is sent, and stock reservations are released after a configurable TTL

### Requirement: Webhook reconciliation
Both Razorpay and Stripe webhooks (payment succeeded / failed / refunded / disputed) MUST be received, verified by signature, and reconciled against the local ledger. A **reconciliation report** SHALL run daily to flag any mismatch between gateway state and local state.

#### Scenario: Webhook signature verification
- **WHEN** a webhook arrives with an invalid signature
- **THEN** it is rejected with 401 and an alert is raised

#### Scenario: Daily reconciliation flags drift
- **WHEN** a gateway payment is marked paid but local order is not
- **THEN** the reconciliation job logs the mismatch with order id, gateway references, and surfaces it in the admin "needs attention" list

### Requirement: Cash-on-delivery (India, optional)
The system MAY support cash-on-delivery for India with configurable rules (pincode whitelist, max order value, mandatory phone verification). COD orders MUST be flagged separately in revenue and RTO reports.

#### Scenario: COD ineligible pincode is refused
- **WHEN** a shopper attempts COD with a pincode not in the whitelist
- **THEN** the COD option is hidden and an explanatory tooltip is shown

### Requirement: Refund and partial-refund support
The admin MUST support full and partial refunds, with reason codes, and MUST reflect the refund on the gateway (Razorpay / Stripe) as well as the local ledger. Refunds trigger an email to the customer with the refund reference and expected credit timeline.

#### Scenario: Partial refund reduces revenue
- **WHEN** a partial refund of ₹500 is issued against an order of ₹2000
- **THEN** net revenue reflects ₹1500 for that order in all revenue reports

### Requirement: PCI and secret handling
No card PAN, CVV, or sensitive credential SHALL be stored in Ravi Sweets' systems. Gateway credentials (keys) MUST be stored in a secret manager (not in repo) and rotated on role change or suspected compromise.

#### Scenario: No card data in logs
- **WHEN** logs are audited
- **THEN** no card number, CVV, or UPI PIN is present in any log line or database column

### Requirement: Payment method availability is region-aware
The storefront checkout MUST show only the payment methods enabled for the shopper's region: Razorpay methods for India, Stripe methods for non-India. A shopper MUST NOT see an unavailable method.

#### Scenario: International shopper does not see UPI
- **WHEN** a shopper in the US region reaches checkout
- **THEN** UPI, netbanking, and India wallets are not listed; Stripe-supported methods are listed
