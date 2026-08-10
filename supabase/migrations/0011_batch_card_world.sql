-- ─── THE BATCH CARD — the replacement visual world ─────────────────────────
--
-- The storefront's identity moved from "Rose & Cream" (warm cream ground,
-- heritage serif, rose accent) to "The Batch Card": the kitchen's own
-- paperwork as the interface. See the direction contract emitted in the
-- <body> of every page, and apps/storefront/src/lib/theme/palette.ts.
--
-- WHY THIS IS A MIGRATION AND NOT A CODE CHANGE.
-- The storefront resolves its palette at RUNTIME from the active row in
-- public.theme_presets (see active-theme-context.tsx → applyPalette). The
-- CSS custom properties in globals.css are first-paint defaults only and are
-- overwritten the moment the active preset loads. So shipping the new palette
-- in code without this migration leaves the live site on the old colours.
--
-- The partial unique index `theme_presets_one_active` allows exactly one
-- active row, so the deactivate must land before the activate. Both happen in
-- this single transaction.

begin;

-- 1. Stand every existing preset down first — the unique index permits only
--    one `active = true` row and would reject the insert below otherwise.
update public.theme_presets set active = false where active;

-- 2. The house palette, in the new world.
--    base   #E9EAE4  NCR docket stock — cool, deliberately not cream
--    accent #2046C8  stamp-pad blue, hue 226; measured clear of all nine
--                    tracked competitors by >=25deg (violet was rejected at
--                    10deg from Cadbury 2685C)
--    glow   #EBC77E  gummed manila label — washes and panels, never text
--    ink    #161C24  press black, faintly blue
insert into public.theme_presets (id, name, active, palette, hero, banner_text)
values (
  'batch-card',
  'The Batch Card — the house palette',
  true,
  '{"base":"#E9EAE4","accent":"#2046C8","glow":"#EBC77E","ink":"#161C24","grainOpacity":0.04}'::jsonb,
  jsonb_build_object(
    'eyebrow', 'Khammam · Telangana',
    'headline', 'The sweetness of Telangana, slow-cooked in Khammam.',
    'body', 'Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets, namkeens, and gift hampers. Hand-made, preservative-free, delivered across India.',
    'ctaLabel', 'Shop today''s batch',
    'ctaHref', '/category/hyderabadi-specials',
    -- Deliberately empty: every previous preset pointed imageUrl at
    -- ravisweets.com/wp-content/..., the retired WordPress host, which now
    -- 404s on every file. An empty string lets the hero render its own
    -- fallback plate instead of a broken image.
    'imageUrl', ''
  ),
  null
)
on conflict (id) do update set
  name        = excluded.name,
  active      = excluded.active,
  palette     = excluded.palette,
  hero        = excluded.hero,
  banner_text = excluded.banner_text;

-- 3. The carbon copy — the dark register, offered as a selectable preset for
--    festival drops and night campaigns. Inactive by default.
insert into public.theme_presets (id, name, active, palette, hero, banner_text)
values (
  'carbon-copy',
  'The Carbon Copy — the dark register',
  false,
  '{"base":"#232A2E","accent":"#F2732F","glow":"#16328F","ink":"#E8EBE6","grainOpacity":0.06}'::jsonb,
  jsonb_build_object(
    'eyebrow', 'Evening counter',
    'headline', 'The counter runs until the last box is tied.',
    'body', 'Premium hampers, corporate runs, and drop-night exclusives — packed and recorded the same evening in Khammam.',
    'ctaLabel', 'Shop gift hampers',
    'ctaHref', '/category/gift-hampers',
    'imageUrl', ''
  ),
  null
)
on conflict (id) do update set
  name    = excluded.name,
  palette = excluded.palette,
  hero    = excluded.hero;

-- 4. The retired presets keep their rows (an admin may still want the
--    festival hero copy) but their dead hot-linked images are cleared, so
--    activating one can never reintroduce a 404 hero.
update public.theme_presets
set hero = jsonb_set(hero, '{imageUrl}', '""'::jsonb)
where hero->>'imageUrl' like 'https://ravisweets.com/wp-content/%';

commit;
