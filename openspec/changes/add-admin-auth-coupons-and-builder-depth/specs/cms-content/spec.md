## ADDED Requirements

### Requirement: Storefront content is admin-managed via Supabase

Hero copy, festival theme presets, store hours, delivery zones, filter taxonomy, and product field overrides SHALL be persisted in Supabase tables. The storefront build SHALL fetch the active values at build time and bake them into the static bundle.

#### Scenario: Admin edits hero headline
- **WHEN** admin opens `/admin/themes`, edits the active theme's hero headline, and clicks Save
- **THEN** the row updates in `theme_presets`, an audit log entry records the change, and a webhook fires to GitHub Actions to rebuild the storefront

#### Scenario: Build fetches latest content
- **WHEN** the rebuild runs
- **THEN** Next.js calls Supabase from `generateStaticParams` / page-level fetch and uses the returned hero copy in the rendered HTML

### Requirement: Theme presets are switchable

The system SHALL maintain a set of named theme presets (default, diwali, eid, holi, raksha-bandhan, custom). Exactly one preset SHALL be `active` at a time. Activating a different preset SHALL trigger a storefront rebuild. Each preset stores: palette (`base`, `accent`, `glow`, `ink`, `grainOpacity`), hero eyebrow / headline / body / CTA, hero image URL, banner text.

#### Scenario: Switch active theme
- **WHEN** admin clicks "Activate" on the Diwali preset
- **THEN** the previous active flag flips to false on the previous preset and to true on Diwali; rebuild webhook fires; admin sees a toast "Live in ~90 seconds"

#### Scenario: Two active presets are forbidden
- **WHEN** any database write would result in two `active=true` rows in `theme_presets`
- **THEN** a Supabase trigger or unique partial index blocks the write

### Requirement: Webhook-triggered rebuild on admin save

Every admin write that affects storefront content SHALL emit a webhook to a GitHub Actions deploy workflow. Multiple writes within a 5-minute window SHALL coalesce into a single rebuild. An admin "Publish now" override SHALL trigger the rebuild immediately.

#### Scenario: Multiple edits coalesce
- **WHEN** admin edits 5 products within 2 minutes
- **THEN** only one rebuild runs after the 5-minute coalesce window, not 5 separate rebuilds

#### Scenario: Publish now bypass
- **WHEN** admin clicks "Publish now" after an edit
- **THEN** the webhook fires immediately, ignoring the coalesce window

### Requirement: Filter taxonomy is admin-editable

Filter facets shown on `/shop` and category pages SHALL be sourced from a `filter_taxonomy` table editable in admin. Adding a new filter (e.g. "occasion") and assigning values to products SHALL surface that filter on the storefront after rebuild.

#### Scenario: Add new filter
- **WHEN** admin adds a "Gifting occasion" filter with values [Diwali, Wedding, Corporate, Eid] and assigns "Wedding" to the Wedding Trousseau Box
- **THEN** after rebuild, `/shop` shows the new filter; selecting "Wedding" returns only the Wedding Trousseau Box

### Requirement: Store hours and delivery zones are admin-editable

The `/stores` page SHALL render `hours` and `delivery_zones` from admin-managed tables. Edits SHALL trigger rebuild via the same webhook.

#### Scenario: Edit Sunday hours
- **WHEN** admin changes Sunday hours from "10:00 am – 9:00 pm" to "Closed"
- **THEN** after rebuild, `/stores` reflects "Closed" for Sunday

### Requirement: Admin preview mode bypasses rebuild lag

When an admin opens a public storefront URL with `?preview=1` and a valid admin JWT, the storefront SHALL fetch the latest content from Supabase at runtime instead of from the bundled values. This SHALL be the only dynamic-fetch path on the storefront.

#### Scenario: Admin previews unsaved theme
- **WHEN** admin saves a theme but doesn't wait for the rebuild and opens `/?preview=1` while logged in as admin
- **THEN** the page renders with the latest theme values fetched live from Supabase

#### Scenario: Non-admin cannot use preview mode
- **WHEN** an anonymous or non-admin visitor opens `/?preview=1`
- **THEN** the query parameter is ignored; the visitor sees the rebuilt static content
