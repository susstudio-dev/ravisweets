## ADDED Requirements

### Requirement: Editorial scroll band imagery represents the whole kitchen

The `<EditorialScrollBand>` SHALL render five frames whose imagery collectively spans the kitchen process and SHALL NOT visually centre on any one sweet. No two frames SHALL use the same image source.

#### Scenario: Inspect frame imagery
- **WHEN** the band renders
- **THEN** all five frame `image` URLs are distinct, and the imagery represents at minimum: copper / soaking ingredients / hands / packing / a final hamper — not the same sweet macro repeated

### Requirement: Frame copy reads as five process steps not five sweet showcases

Each frame's `eyebrow` (e.g. "01 · Copper") SHALL describe a kitchen step, and each `title` SHALL describe an *act* (verb-led where possible) rather than naming a single sweet.

#### Scenario: Read the five frames
- **WHEN** a user reads frame titles in sequence
- **THEN** the five titles narrate a kitchen day (e.g. "We still reduce rabri by hand → Apricots get their own time → Silver leaf, one diamond at a time → Almonds roasted in trays → Boxed the morning they ship") rather than reading as five product placements

### Requirement: Heading honours the five-step framing

The section heading SHALL remain "Five small acts, every morning." The eyebrow SHALL stay "Inside the kitchen". This wording SHALL be admin-editable via the CMS theme preset's `editorial_band_copy` field.

#### Scenario: Admin edits heading
- **WHEN** admin edits the editorial band heading from "Five small acts, every morning." to "Five steps, every dawn."
- **THEN** the band re-renders the new heading after the next storefront rebuild
