## ADDED Requirements

### Requirement: Product analytics via PostHog
The system SHALL emit PostHog events for the full shopper funnel: `page_view`, `product_view`, `search`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `payment_started`, `payment_succeeded`, `payment_failed`, `order_placed`, `order_delivered`, `review_submitted`, `corporate_quote_requested`. Events MUST carry a stable anonymous id, any logged-in user id, and relevant properties (product id, variant, value, currency, region).

#### Scenario: Funnel is reconstructable
- **WHEN** the team opens a "browse → purchase" funnel in PostHog
- **THEN** each stage uses the events above and conversion can be segmented by region, channel, and device

#### Scenario: No PII leaks into events
- **WHEN** an event payload is inspected
- **THEN** no raw email, phone, card number, or full address is present; emails are hashed where user-level linkage is needed

### Requirement: Session replay with consent
PostHog session replay MUST be enabled on the storefront, with sensitive inputs masked by default (payment, passwords, address fields). Replay MUST NOT record sessions where the visitor has rejected analytics cookies.

#### Scenario: Masked inputs
- **WHEN** a session recording is played back
- **THEN** card number, CVV, password, and full address inputs render as masked placeholders

### Requirement: Error tracking via Sentry
Frontend (Next.js storefront + admin) and backend (Medusa) errors MUST be captured by Sentry with source maps, release tagging, user context (non-PII), and breadcrumbs. Each deployment MUST register a release so regressions can be attributed.

#### Scenario: Frontend error is captured with release
- **WHEN** a React error boundary catches an error on the storefront
- **THEN** Sentry receives the error with the Git SHA of the current release, stack trace resolved via source maps, and breadcrumbs of recent actions

### Requirement: Structured application logs
All backend services (Medusa, workers, cron) MUST emit **JSON-structured logs** to stdout with fields: `ts`, `level`, `service`, `request_id`, `user_id` (when available), `route`, `event`, `duration_ms`, `error`. Logs MUST be shipped to a central aggregator (Axiom / Logtail / Better Stack Logs) with a minimum 30-day retention.

#### Scenario: Request traceability
- **WHEN** a customer reports an issue with an order
- **THEN** support can search logs by order id or request id and see the full request chain with timings

### Requirement: Uptime monitoring
External uptime checks MUST run at ≤ 1-minute intervals against: storefront home, product detail, checkout API, admin login, and webhook endpoints. Failures MUST page an on-call channel (email + WhatsApp + Slack webhook where applicable).

#### Scenario: Checkout API down triggers page
- **WHEN** the checkout API fails health-check for 2 consecutive intervals
- **THEN** an on-call alert fires within 2 minutes and an incident record is created

### Requirement: Performance budget enforced in CI
CI MUST run **Lighthouse CI** against home, category, product-detail, and checkout routes on every PR (mobile, simulated Slow 4G) and MUST fail the PR if any route regresses **LCP > 2.5s, INP > 200ms, CLS > 0.1**, or if any customer-route JS bundle exceeds **180 KB gzipped**.

#### Scenario: Bundle-size regression blocks merge
- **WHEN** a PR adds a dependency that pushes the home route's JS over 180 KB gzipped
- **THEN** the CI check fails with a clear diff of which modules grew and the merge is blocked until waived by the Owner role or reduced

#### Scenario: Budget waivers are explicit
- **WHEN** a waiver is granted (e.g., for a temporary spike during migration)
- **THEN** it is recorded in the repo with an expiry date and auto-reverts to enforcement after expiry

### Requirement: Feature flags for risk control
The system MUST expose feature flags (via PostHog) for high-risk features: reviews, recommendations, session replay, AI product-finder (when built), new-checkout variant, and any experiment. Flags MUST be togglable without a deploy.

#### Scenario: Festival-day kill switch
- **WHEN** during festival peak the recommendations feature starts degrading checkout latency
- **THEN** Ops disables the `recommendations` flag in PostHog and the feature is off for all users within 60 seconds without a deploy

### Requirement: Admin health page
The admin SHALL expose a `/admin/health` page showing, for the last 24 hours: p50/p95/p99 response time on checkout API, storefront Core Web Vitals (LCP, INP, CLS) from real-user monitoring, error rate from Sentry, webhook failure count, and current uptime. Values that breach thresholds are highlighted.

#### Scenario: RUM Web Vitals are current
- **WHEN** the admin health page is opened
- **THEN** LCP/INP/CLS shown reflect the last 24 hours of real traffic (not synthetic), with sample counts ≥ 100 or an "insufficient data" label

### Requirement: On-call runbooks
Each high-risk failure mode (payment gateway down, Postgres connection limit hit, webhook backlog, DNS failure, festival-peak load) MUST have a **runbook** in the repo under `ops/runbooks/` with symptoms, diagnostic steps, mitigation commands, and rollback. Runbooks MUST be reviewed quarterly.

#### Scenario: Payment-gateway outage runbook exists
- **WHEN** the team needs to handle a Razorpay outage
- **THEN** `ops/runbooks/razorpay-outage.md` provides symptoms, the feature-flag switch to disable online payments, the customer-communication template, and the recovery checklist

### Requirement: Pre-festival load testing
Before every major festival (Diwali, Raksha Bandhan), a **load test** MUST be run at **10×** the prior-month baseline order rate, covering the full checkout flow end-to-end, with results captured in `ops/load-tests/<festival>-<year>.md` and all identified bottlenecks either fixed or explicitly accepted with mitigation.

#### Scenario: Load test is a merge-blocker before festival launch week
- **WHEN** the date is within 14 days of a registered festival peak
- **THEN** the festival-day feature flag cannot be turned on until the latest load test passes the 10× threshold
