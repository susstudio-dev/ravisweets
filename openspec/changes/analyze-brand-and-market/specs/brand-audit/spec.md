## ADDED Requirements

### Requirement: Website inventory
The brand audit SHALL produce a complete inventory of every public page on ravisweets.com, recording URL, page title, H1, meta description, primary purpose, and date captured. Pages discovered via XML sitemap, navigation crawl, and footer links MUST all be included.

#### Scenario: Every page is catalogued
- **WHEN** the audit report is reviewed
- **THEN** each public page on ravisweets.com appears as a row with URL, title, H1, meta description, purpose, and `captured_on` date

#### Scenario: Orphan pages are flagged
- **WHEN** a page is reachable via sitemap but not via site navigation
- **THEN** it is recorded with an `orphan: true` flag

### Requirement: Product catalogue snapshot
The audit SHALL capture every product listed on the website with: product name, category, sub-category, declared weight/size, price, any shelf-life or storage claim, key ingredients if shown, image URL, and product URL.

#### Scenario: Prices are captured with currency and date
- **WHEN** a product is listed in the audit
- **THEN** its price appears as a numeric value with currency (INR) and a `captured_on` date

#### Scenario: Missing fields are explicit
- **WHEN** a product page does not disclose a field (e.g., shelf life)
- **THEN** the audit records the value as `unknown` rather than guessing

### Requirement: Category tree and merchandising
The audit SHALL reconstruct the category/sub-category tree as presented on the site and record SKU counts per leaf category, plus any merchandising devices (bestseller, new, combo, gift pack, festival special).

#### Scenario: Category tree is reproducible
- **WHEN** the audit is reviewed
- **THEN** a reader can redraw the site's full category hierarchy from the document alone, without visiting the site

### Requirement: Brand narrative and storytelling audit
The audit SHALL extract and summarise the brand's own story as presented on the site: founding year, founder(s), heritage claims, hero-product claims, "about us" text, values, and any awards/press featured.

#### Scenario: Heritage claims are quoted, not paraphrased
- **WHEN** the narrative audit references a heritage or founding claim
- **THEN** the exact quoted phrase from the site is included alongside the paraphrase

### Requirement: Trust-signal inventory
The audit SHALL list every trust signal present or absent on the site: FSSAI number, hygiene/quality certifications, customer reviews/ratings, testimonials, media mentions, years-in-business claim, returns policy, refund policy, contact details, physical address, and social proof counters.

#### Scenario: Absent trust signals are recorded
- **WHEN** a standard trust signal (e.g., FSSAI number, returns policy) is not found
- **THEN** it is recorded as `absent` in the trust-signal table, not omitted

### Requirement: Digital / SEO / tech audit
The audit SHALL record: detected CMS/platform, hosting hints if visible, mobile responsiveness observation, Core Web Vitals signals where obtainable via public tools, presence of structured data (Product, Breadcrumb, Organization), robots.txt and sitemap presence, title/meta length issues, and indexed page count where determinable via `site:` search.

#### Scenario: Tech stack is observed, not guessed
- **WHEN** the tech audit names a CMS or framework
- **THEN** the evidence (HTML signature, meta generator, known asset path) is cited

### Requirement: Customer-experience touchpoints
The audit SHALL catalogue every CX surface on the site: checkout flow steps, payment methods, shipping coverage and cost, delivery timelines, WhatsApp/chat presence, newsletter signup, phone/email, physical-store locator, and any B2B/bulk/corporate-gifting path.

#### Scenario: Checkout flow is walked end to end
- **WHEN** the audit describes the checkout
- **THEN** each step (cart → address → payment → confirmation) is listed with observed fields and friction notes

### Requirement: Social and off-site presence
The audit SHALL list every off-site brand surface linked from the website (Instagram, Facebook, YouTube, LinkedIn, Google Business, Amazon storefront, Swiggy/Zomato, Blinkit/Zepto/Instamart, Flipkart) with follower counts / review counts captured on a dated basis.

#### Scenario: Each linked surface is captured
- **WHEN** the site links to an external presence
- **THEN** the audit records the URL, platform, follower/review count, and `captured_on` date

### Requirement: Gaps and quick wins
The audit SHALL conclude with a "gaps and quick wins" section that names concrete, low-effort fixes observable from the audit (e.g., missing meta descriptions, broken links, unclaimed Google Business, missing product schema) and tags each with effort (S/M/L) and expected impact (L/M/H).

#### Scenario: Each gap is actionable
- **WHEN** a gap is listed
- **THEN** it has an owner-ready one-line description, effort tag, impact tag, and pointer to the evidence row it came from
