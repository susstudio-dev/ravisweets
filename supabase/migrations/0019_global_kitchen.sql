-- ─── GLOBAL KITCHEN — retire "Family kitchen" from the brand voice ─────────
--
-- Owner direction 2026-08-11 (krish): "remove family kitchen … we are a
-- global brand, we have a very huge kitchen." The cottage register undersold
-- the operation; the eyebrow becomes "Mithai house" and the body drops
-- "made by one family".
--
-- Same three-source contract as 0012 (read that header before simplifying):
-- the hero resolves site_content → theme_presets → code default, so both DB
-- rows must move together or the higher one shadows the fix. The code
-- defaults in hero-batch.tsx changed in the same commit as this file, and the
-- RETIRED_COPY quarantine there now also matches "family kitchen" — so the
-- new voice paints from code defaults even BEFORE this migration runs. Paste
-- it anyway: once it runs, the DB rows pass the quarantine again and the
-- owner can edit hero copy from /admin/content as usual.

begin;

-- 1. site_content — the highest-precedence source.
update public.site_content
set data = data
  || jsonb_build_object(
       'eyebrowEn', 'Mithai house',
       'body',      'Qubani ka Meetha, Badam ki Jali, Kaju Katli — sweets, namkeens and gift hampers made fresh every morning since 1983. Order from anywhere; delivered fresh to any address in India.'
     )
where key = 'hero';

-- 2. theme_presets — the active house preset, kept in step.
update public.theme_presets
set hero = hero
  || jsonb_build_object(
       'eyebrow', 'Mithai house',
       'body',    'Qubani ka Meetha, Badam ki Jali, Kaju Katli — sweets, namkeens and gift hampers made fresh every morning since 1983. Order from anywhere; delivered fresh to any address in India.'
     )
where id = 'batch-card';

-- 3. Any preset still carrying the retired eyebrow, brought into line.
update public.theme_presets
set hero = jsonb_set(
      hero,
      '{eyebrow}',
      to_jsonb('Mithai house'::text)
    )
where id <> 'batch-card'
  and hero->>'eyebrow' ilike '%family kitchen%';

commit;

-- ─── VERIFY ────────────────────────────────────────────────────────────────
-- Expect one row, eyebrow 'Mithai house':
--   select data->>'eyebrowEn', data->>'body' from public.site_content where key = 'hero';
-- Expect zero rows:
--   select id from public.theme_presets where hero->>'eyebrow' ilike '%family kitchen%';
