## ADDED Requirements

### Requirement: Cart state initialises from localStorage on the very first client render
The `CartProvider`'s `useState` MUST use a lazy initialiser (`useState(() => readFromStorage())`) so the initial state synchronously reflects localStorage content on the very first client render. SSR fallback returns an empty cart safely (`typeof window === 'undefined'`).

#### Scenario: Cart shows existing items on first paint
- **WHEN** a user reloads the page and `localStorage.getItem('ravi.cart.v1')` contains a saved cart
- **THEN** the very first client render of `<Header />`'s cart badge shows the correct item count — no flash of "0", no zero-then-fill

### Requirement: No add-before-hydrate race
A click on "Add to cart" before any `useEffect` runs MUST NOT result in the cart being overwritten by a subsequent localStorage load.

#### Scenario: Click during hydration window
- **WHEN** a user manages to click "Add to cart" within the very first frame after page load
- **THEN** the added item is preserved in cart state; no asynchronous localStorage load can overwrite it later

### Requirement: Persistence runs on subsequent state changes only
The persistence `useEffect` SHALL skip the very first invocation (the initial render's state is already what was loaded from localStorage). Subsequent state changes write back to localStorage.

#### Scenario: First-render persistence skip
- **WHEN** the storefront loads and no cart state changes happen
- **THEN** localStorage is not written on first render — saving a needless write

#### Scenario: Subsequent change persists
- **WHEN** the user adds, updates, or removes an item
- **THEN** the new cart state is written to localStorage

### Requirement: SSR safety
The cart context MUST work correctly under SSR / static-export. The lazy initialiser MUST guard `localStorage` access with `typeof window !== 'undefined'`; on the server, the initial state is `{ lines: [] }` and hydration is corrected by the client lazy initialiser on first render.

#### Scenario: Server-rendered HTML has empty cart
- **WHEN** Next.js static-exports a page using `<CartProvider>`
- **THEN** the prerendered HTML reflects an empty cart; the client takes over and rehydrates immediately on first paint
