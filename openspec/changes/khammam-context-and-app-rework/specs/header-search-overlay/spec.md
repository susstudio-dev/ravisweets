## ADDED Requirements

### Requirement: Header search opens an overlay
The header's search icon SHALL open a modal-style search overlay rather than navigating to `/search`. The keyboard shortcut `Cmd/Ctrl + K` MUST also open it from anywhere in the app. Pressing Escape closes the overlay.

#### Scenario: Click search icon → overlay opens
- **WHEN** a user clicks the header search icon
- **THEN** an overlay panel opens, the input is auto-focused, and the page background dims behind the panel

#### Scenario: Cmd/Ctrl+K opens overlay anywhere
- **WHEN** a user presses `Cmd+K` (Mac) or `Ctrl+K` (Win/Linux) on any page
- **THEN** the overlay opens with focus in the input

#### Scenario: Escape closes overlay
- **WHEN** the overlay is open and the user presses Escape
- **THEN** the overlay closes and focus returns to the search icon in the header

#### Scenario: Click outside closes overlay
- **WHEN** the overlay is open and the user clicks the dim backdrop
- **THEN** the overlay closes

### Requirement: Inline autocomplete from the catalogue
The overlay SHALL show inline results from `searchProducts(CATALOGUE, query)` — same scorer used by the `/search` page — limited to the top 6 hits. Each result is keyboard-navigable (↑/↓ arrows) and selectable via Enter or click.

#### Scenario: Typing produces hits
- **WHEN** the user types "kaju" in the overlay input
- **THEN** up to 6 product hits matching the scorer appear inline, each showing image + title + price + category badge

#### Scenario: Arrow keys navigate
- **WHEN** the user presses ↓ with results visible
- **THEN** focus moves to the first result; subsequent ↓ moves down the list; Enter on a focused result navigates to that product

#### Scenario: Empty / no-hits state
- **WHEN** the input is empty
- **THEN** the overlay shows a small "Try typing 'kaju' or 'qubani'" placeholder along with 4 quick-link suggestions
- **WHEN** the input has text but no matches
- **THEN** the overlay shows "No results — view all of `/shop`?" with a link

### Requirement: View all results affordance
The overlay SHALL include a "View all results for ‘<query>’" footer link that routes to `/search?q=<query>`. This preserves the existing search page as the deep-result destination.

#### Scenario: Footer link routes to /search
- **WHEN** a user with query "kaju" clicks the footer "View all results"
- **THEN** they navigate to `/search?q=kaju`, which shows the full filtered results page

### Requirement: Existing /search page still works as a destination
The page-level `/search?q=...` route SHALL continue to function exactly as it does today. The overlay is additive; it does not replace the page route.

#### Scenario: Direct URL still works
- **WHEN** a user visits `/search?q=qubani` directly via URL
- **THEN** the search page renders with the query pre-filled and results shown

### Requirement: Overlay is keyboard-trapped while open
While open, focus MUST stay within the overlay (Tab cycles through input → result list → footer link → close button → input). The body must not be scrollable.

#### Scenario: Tab cycles within overlay
- **WHEN** the user tabs while the overlay is open
- **THEN** focus moves only between the input, the result items, and the close button — it does not escape to header / page underneath

#### Scenario: Body scroll locked
- **WHEN** the overlay is open
- **THEN** the page behind cannot be scrolled

### Requirement: Performance budget
The overlay's total contribution to the critical-route bundle MUST be ≤ **3 KB gzipped**. The scorer is shared with the `/search` page (no duplication).

#### Scenario: Bundle audit
- **WHEN** `pnpm build` runs and `size-limit` reports
- **THEN** the home / any page with the overlay component shows a delta ≤ 3 KB gz attributable to overlay code
