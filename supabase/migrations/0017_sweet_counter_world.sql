-- ─── THE SWEET COUNTER — the warm pivot ─────────────────────────────────────
--
-- Owner decision 2026-08-10 (krish, after studying foodonfarmpickles.com and
-- sweetkaramcoffee.in): the storefront moves from "The Batch Card" cool NCR
-- grey to a warm halwai cream. The record grammar, the stamp-pad blue accent
-- and the manila label all survive; only the paper warms. See
-- apps/storefront/src/lib/theme/palette.ts and the direction contract in
-- apps/storefront/src/app/layout.tsx.
--
-- WHY THIS IS A MIGRATION AND NOT ONLY A CODE CHANGE (same reason as 0011):
-- the storefront resolves its palette at RUNTIME from the active row in
-- public.theme_presets; the CSS defaults are first-paint only. Shipping the
-- warm palette in code without this migration leaves the live site repainting
-- itself back to the old grey the moment the preset loads.
--
-- Hue discipline carried over from the code (palette.ts header): the cream
-- doubles as the dark register's interactive colour, so it must keep a
-- yellow-green lean (hue >= 42deg) to clear ember #E2571F by 25deg. #FAF6E5
-- measures ~49deg. Do not warm it toward orange here without re-running
-- palette.test.ts.

begin;

-- 1. The house preset warms. Same id — every reference keeps working; only
--    the palette (and the display name) change. Hero copy is owned by
--    0012_global_voice.sql and is deliberately not touched here.
update public.theme_presets
set
  name    = 'The Sweet Counter — the house palette',
  palette = '{"base":"#FAF6E5","accent":"#2046C8","glow":"#EBC77E","ink":"#161C24","grainOpacity":0.04}'::jsonb
where id = 'batch-card';

-- 2. The dark register preset warms to burnt jaggery — and sheds the stale
--    #F2732F accent, which sat two degrees off ember and made "made today"
--    and "clickable" the same orange. The interactive colour on dark is the
--    cream itself, matching CARBON_TOKENS in palette.ts.
update public.theme_presets
set
  name    = 'Burnt Jaggery — the dark register',
  palette = '{"base":"#2B2620","accent":"#FAF6E5","glow":"#16328F","ink":"#F1EDE4","grainOpacity":0.06}'::jsonb
where id = 'carbon-copy';

-- 3. Product palettes stored on rows (products.theme_palette) warm in place,
--    value-mapped exactly as packages/shared/src/catalogue/palettes.ts:
--      house   base #E9EAE4 -> #FAF6E5
--      badam   base #EDEAE2 -> #F2EFE0
--      gulkand base #EFE9E7 -> #F7EFE4
--      kesar   base #EEEBE0 -> #F3EFDE
--      hamper  base #232A2E -> #2B2620, accent #F2732F -> #FAF6E5 (stale
--              orange, see above), ink #E8EBE6 -> #F1EDE4
--    Accents/glows for the light palettes are unchanged. The next
--    `pnpm run generate:catalogue` then bakes the same values the committed
--    snapshot already carries.
update public.products
set theme_palette = theme_palette
  || case theme_palette->>'base'
       when '#E9EAE4' then '{"base":"#FAF6E5"}'::jsonb
       when '#EDEAE2' then '{"base":"#F2EFE0"}'::jsonb
       when '#EFE9E7' then '{"base":"#F7EFE4"}'::jsonb
       when '#EEEBE0' then '{"base":"#F3EFDE"}'::jsonb
       when '#232A2E' then '{"base":"#2B2620"}'::jsonb
       else '{}'::jsonb
     end
  || case when theme_palette->>'accent' = '#F2732F' then '{"accent":"#FAF6E5"}'::jsonb else '{}'::jsonb end
  || case when theme_palette->>'ink' = '#E8EBE6' then '{"ink":"#F1EDE4"}'::jsonb else '{}'::jsonb end
where theme_palette->>'base' in ('#E9EAE4', '#EDEAE2', '#EFE9E7', '#EEEBE0', '#232A2E')
   or theme_palette->>'accent' = '#F2732F';

commit;
