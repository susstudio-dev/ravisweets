-- ─── 0008 — Fresh palette presets ───────────────────────────────────
-- Seeds three additional theme_presets so the brand can compare and swap
-- between palettes from /admin/themes without a redeploy. The new
-- "Rose & Cream" preset becomes the active palette on the storefront,
-- the older "Saffron & Cardamom" + "Dusk & Lamplight" stay as switchable
-- options, and a darker "Midnight Saffron" preset gives a contemplative
-- evening look for late-festival promos.
--
-- All four use the same hero shape so the existing /admin/themes UI
-- renders them without changes.

-- Demote the previously active default so only one preset is active.
update public.theme_presets set active = false where active;

insert into public.theme_presets (id, name, active, palette, hero, banner_text)
values
  (
    'rose-cream',
    'Rose & Cream — the house palette',
    true,
    jsonb_build_object(
      'base', '#FAF5E9',
      'accent', '#A8345D',
      'glow', '#E8A13C',
      'ink', '#2E2118',
      'grainOpacity', 0.05
    ),
    jsonb_build_object(
      'eyebrow', 'Khammam · Telangana',
      'headline', 'The sweetness of Telangana, slow-cooked in Khammam.',
      'body', 'Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets, namkeens, and gift hampers. Hand-made, preservative-free, delivered across India.',
      'ctaLabel', 'Shop Hyderabadi specials',
      'ctaHref', '/category/hyderabadi-specials',
      'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png'
    ),
    null
  ),
  (
    'saffron-cardamom',
    'Saffron & Cardamom — festival crimson',
    false,
    jsonb_build_object(
      'base', '#fbf2e6',
      'accent', '#b8312c',
      'glow', '#f2b96a',
      'ink', '#221008',
      'grainOpacity', 0.05
    ),
    jsonb_build_object(
      'eyebrow', 'Festival ready',
      'headline', 'A box for every occasion — from rakhi to christmas.',
      'body', 'Festival hampers, corporate runs, and pre-order drops timed to every Indian calendar.',
      'ctaLabel', 'Shop festival hampers',
      'ctaHref', '/category/festival-specials',
      'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png'
    ),
    'Free festival shipping above ₹1499'
  ),
  (
    'dusk-lamplight',
    'Dusk & Lamplight — the shop after sunset',
    false,
    jsonb_build_object(
      'base', '#3A1F31',
      'accent', '#E8A13C',
      'glow', '#7C2344',
      'ink', '#F6EAD8',
      'grainOpacity', 0.07
    ),
    jsonb_build_object(
      'eyebrow', 'Evening counter',
      'headline', 'The counter glows until the last box is tied.',
      'body', 'Premium hampers, corporate runs, and drop-night exclusives — packed under the lamplight in Khammam.',
      'ctaLabel', 'Shop gift hampers',
      'ctaHref', '/category/gift-hampers',
      'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png'
    ),
    null
  ),
  (
    'midnight-saffron',
    'Midnight Saffron — late-festival',
    false,
    jsonb_build_object(
      'base', '#1a1208',
      'accent', '#f2b96a',
      'glow', '#e9b249',
      'ink', '#fdf6ec',
      'grainOpacity', 0.07
    ),
    jsonb_build_object(
      'eyebrow', 'Late festival drops',
      'headline', 'Sweets for the night before the morning prasad.',
      'body', 'Saffron-amber boxes for last-mile festival pickups — Khammam + Hyderabad same-day.',
      'ctaLabel', 'Shop tonight',
      'ctaHref', '/category/sweets',
      'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/boondi_laddu-removebg-preview.png'
    ),
    'Same-day pickup · Khammam + Hyderabad'
  )
on conflict (id) do update
  set name = excluded.name,
      palette = excluded.palette,
      hero = excluded.hero,
      banner_text = excluded.banner_text;
