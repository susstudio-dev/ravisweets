## ADDED Requirements

### Requirement: Shop's location reads Khammam, Telangana
Every user-facing reference to the shop's physical location SHALL read "Khammam, Telangana" (or unambiguous synonyms — "our Khammam kitchen", "Khammam-based", "Telangana"). References to "Hyderabad" as the shop's location SHALL be removed.

#### Scenario: Hero eyebrow updated
- **WHEN** a visitor sees the home hero
- **THEN** the eyebrow reads "Khammam · Telangana" (or "Telangana sweet tradition") and the Telugu accent reads `ఖమ్మం` — NOT `హైదరాబాద్`

#### Scenario: About page updated
- **WHEN** a visitor reads `/about`
- **THEN** the founder-narrative copy describes the kitchen as "in Khammam" / "a Khammam family kitchen", not "Hyderabad" or "Nizami royal kitchens"

#### Scenario: Store locator updated
- **WHEN** a visitor visits `/stores`
- **THEN** the flagship store card lists a Khammam address (placeholder pending real address) and the "Visit us" copy frames Khammam as the visit destination

### Requirement: Dish-style references to Hyderabadi remain
The category slug `hyderabadi-specials` SHALL be retained, and dish-level copy referring to "Hyderabadi specialities" / "Nizami-era recipe" / "Hyderabadi tradition" SHALL remain when used to describe the dishes themselves (Qubani ka Meetha, Double ka Meetha, Badam ki Jali, Sheer Khurma).

#### Scenario: Hyderabadi specials category copy
- **WHEN** a visitor visits `/category/hyderabadi-specials`
- **THEN** the page describes the products as Hyderabadi-style dishes; the shop's location is still framed as Khammam

#### Scenario: Product description references Nizami origin where authentic
- **WHEN** a visitor reads the Qubani ka Meetha product description
- **THEN** the copy may legitimately call the dish a Nizami / Hyderabadi classic, distinct from claims about where the shop is

### Requirement: Telugu accent text matches the local language
Telugu accent text SHALL use `ఖమ్మం` for the shop's location and `హైదరాబాద్` only where referring to the city of Hyderabad as a place (not the shop). The Tiro Telugu font remains the accent face.

#### Scenario: Hero Telugu eyebrow
- **WHEN** the home hero renders
- **THEN** the Tiro Telugu accent shows `ఖమ్మం`

#### Scenario: Festival page eyebrows
- **WHEN** a visitor visits `/festivals/diwali`
- **THEN** the festival's Telugu eyebrow remains festival-specific (e.g. `దీపావళి`) — no shop-location text appears

### Requirement: Footer + tax-stub copy reflects Telangana
The footer's FSSAI / GST disclosure block SHALL reference Telangana state where applicable (e.g. "FSSAI · Telangana", "GSTIN — Telangana series"). Numeric placeholders remain until real registrations are confirmed.

#### Scenario: Footer copy updated
- **WHEN** a visitor scrolls to the site footer
- **THEN** the FSSAI / GST sub-line includes Telangana, NOT Hyderabad

### Requirement: Marketing-copy framing differentiates kitchen from dishes
Any home / about / corporate copy that previously framed the brand using "Nizami royal kitchens" as a metaphor for *the shop* SHALL be reframed as "Telangana sweet tradition, made in our Khammam kitchen". The "Nizami" / "royal kitchens" wording remains valid only when describing dish origin in product descriptions.

#### Scenario: About founder quote updated
- **WHEN** a visitor reads the about page's founder quote
- **THEN** the framing is honest about the shop being a Khammam family kitchen; metaphors about royal kitchens are not used to describe the shop itself
