## ADDED Requirements

### Requirement: Hover swap is limited to accent + glow
The FlavourAtlas hover handler (`applyPalette`) SHALL write only `--theme-accent` and `--theme-glow` CSS variables on `:root`. It MUST NOT write `--theme-base`, `--theme-ink`, or `--theme-grain-opacity` on hover, regardless of the underlying palette's intent.

#### Scenario: Hovering Diwali leaves text legible
- **WHEN** a user hovers the "Diwali Hamper" chip in the FlavourAtlas
- **THEN** body text (cards, headings, paragraphs) on white surfaces remains the original ink colour and is fully legible; only accent colours and glow tint shift

#### Scenario: All six chips behave the same way
- **WHEN** any of the six FlavourAtlas chips is hovered
- **THEN** `--theme-base` and `--theme-ink` retain their default values; only `--theme-accent` and `--theme-glow` change

### Requirement: Type system enforces hover-safe palette shape
The `Flavour` interface in `flavour-atlas.tsx` SHALL declare `palette: Pick<ThemePalette, 'accent' | 'glow'>`, NOT the full `ThemePalette`. This type prevents future contributors from accidentally re-introducing a dark-base hover that breaks legibility.

#### Scenario: Type-check rejects full palette
- **WHEN** a contributor adds a new chip with `palette: { base, accent, glow, ink, grainOpacity }`
- **THEN** TypeScript rejects the assignment because the type only accepts `accent` + `glow`

### Requirement: Full palette swap remains valid on product detail pages
Product detail pages (`/product/[slug]`) and quick-view modals SHALL continue to use the full `<ThemeVars>` SSR-seed mechanism — that pathway swaps every surface coherently, so dark palettes (e.g. Diwali Premium Hamper at `#2a1505`) remain valid there.

#### Scenario: Diwali product detail still themes the whole page
- **WHEN** a user visits `/product/diwali-premium-hamper`
- **THEN** the entire page (header, body, cards, footer) renders in the dark/brass palette and every text/background pair is legible

### Requirement: Hover revert clears only the same vars it set
The hover-revert handler SHALL clear the same two CSS variables it sets — `--theme-accent` and `--theme-glow` — and reset them to the default-flavour values from `tokens.ts`. It MUST NOT touch `--theme-base` / `--theme-ink` / `--theme-grain-opacity` even on revert.

#### Scenario: Leave-handler is symmetric with enter-handler
- **WHEN** the user moves the cursor away from a hovered chip
- **THEN** `--theme-accent` and `--theme-glow` revert to their default values; nothing else is touched
