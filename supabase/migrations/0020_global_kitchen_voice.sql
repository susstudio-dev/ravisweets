-- ─── GLOBAL KITCHEN VOICE — the purge, finished ────────────────────────────
--
-- SUPERSEDES 0019_global_kitchen.sql. Paste THIS file; do not paste 0019.
--
-- Owner direction 2026-08-12 (krish), extending the 2026-08-11 call that
-- produced 0019: on top of "remove family kitchen … we are a global brand, we
-- have a very huge kitchen", the cottage vocabulary now also loses BATCH and
-- the standalone KITCHEN mention. 0019 was written before that second call and
-- would reintroduce the very word it is now meant to remove — its line 36 sets
-- primaryCtaLabel to 'Shop today''s batch'. Applying 0019 and then this file
-- would work, but pasting one coherent file cannot half-land.
--
-- This file is therefore SELF-SUFFICIENT: every field is set absolutely, never
-- built on top of what 0019 would have left. It is safe on a database where
-- 0019 was pasted and on one where it never was.
--
-- WHAT 0019 DID NOT COVER, and this does: the `footer` and `home_trust` rows.
-- Both still carry the retired voice ("Hand-made Telangana sweets from our
-- Khammam kitchen", "Small-batch, slow-cooked … in our FSSAI-certified
-- kitchen", "Telangana heritage"). Neither row is rendered today — Footer and
-- TrustStrip are hardcoded components that never call useSiteContent — so this
-- is pre-emptive: the strings are live in /admin/content, an owner editing
-- there sees the retired voice, and the day either component is wired to the
-- database the old copy would reappear. Cleaning them costs one statement each.
--
-- Same three-source contract as 0012 and 0019 (read 0012's header before
-- simplifying): the hero resolves site_content → theme_presets → code default,
-- so BOTH rows must move together or the higher one shadows the fix. The code
-- defaults in hero-batch.tsx changed in the same commit as this file, and the
-- RETIRED_COPY quarantine there matches "family kitchen" and "today's batch" —
-- so the new voice paints from code defaults even BEFORE this migration runs.
-- Paste it anyway: once it runs the rows pass the quarantine again and hero
-- copy becomes editable from /admin/content, which it silently is not today.
--
-- The body's three product names lead with the signature range (Kaju Katli is
-- the brand mark), not the Hyderabadi specials — Qubani fronted the old line
-- only by inheritance and the owner flagged it. Keep in step with
-- SIGNATURE_ORDER in apps/storefront/src/lib/signature.ts.
--
-- Idempotent: every statement is an absolute set. Safe to re-run.

begin;

-- 1 · site_content.hero — the highest-precedence source.
--     primaryCtaLabel is set here because the live row still pairs the retired
--     'Shop Hyderabadi specials' label with the '/shop' href 0012 set. The
--     client-side quarantine hides that mismatch today; the moment this
--     migration makes the row admissible again the old label would resurface,
--     so the row must leave this file fully coherent.
update public.site_content
set data = data
  || jsonb_build_object(
       'eyebrowEn',       'Mithai house',
       'body',            'Kaju Katli, Gulab Jamun, Motichoor Ladoo — sweets, namkeens and gift hampers made fresh every morning since 1983. Order from anywhere; delivered fresh to any address in India.',
       'primaryCtaLabel', 'Shop today''s sweets',
       'primaryCtaHref',  '/shop'
     )
where key = 'hero';

-- 2 · theme_presets — the house preset, kept in step. The id is still
--     'batch-card' although the preset was renamed "The Sweet Counter" in
--     0017_sweet_counter_world; the id is the join key and was deliberately
--     left alone there.
update public.theme_presets
set hero = hero
  || jsonb_build_object(
       'eyebrow',  'Mithai house',
       'body',     'Kaju Katli, Gulab Jamun, Motichoor Ladoo — sweets, namkeens and gift hampers made fresh every morning since 1983. Order from anywhere; delivered fresh to any address in India.',
       'ctaLabel', 'Shop today''s sweets',
       'ctaHref',  '/shop'
     )
where id = 'batch-card';

-- 3 · Any other preset still carrying retired copy, brought into line. Matches
--     the eyebrow OR the CTA label, so a preset that 0019 already half-fixed
--     (eyebrow updated, 'Shop today''s batch' left behind) is still caught.
update public.theme_presets
set hero = hero
  || jsonb_build_object(
       'eyebrow',  'Mithai house',
       'ctaLabel', 'Shop today''s sweets'
     )
where id <> 'batch-card'
  and (
    hero->>'eyebrow'  ilike '%family kitchen%'
    or hero->>'ctaLabel' ilike '%batch%'
  );

-- 4 · site_content.footer — tagline only. phone, email and fssaiLine are the
--     owner's and are not this migration's business.
update public.site_content
set data = data
  || jsonb_build_object(
       'tagline', 'Hand-made sweets, namkeens and gift hampers since 1983. No preservatives.'
     )
where key = 'footer';

-- 5 · site_content.home_trust — the four claims, matched to the rewritten
--     TrustStrip component. The third card is where "One family kitchen / The
--     same family at the kadai since 1983" used to sit.
update public.site_content
set data = data
  || jsonb_build_object(
       'cards', jsonb_build_array(
         jsonb_build_object(
           'title', 'No preservatives, ever',
           'body',  'Made to be eaten this week, not this month.'
         ),
         jsonb_build_object(
           'title', 'Same-day dispatch',
           'body',  'Made in the morning, on the evening courier.'
         ),
         jsonb_build_object(
           'title', 'Since 1983',
           'body',  'The same recipes, unchanged.'
         ),
         jsonb_build_object(
           'title', 'Delivered across India',
           'body',  'Temperature-controlled, fresh on arrival.'
         )
       )
     )
where key = 'home_trust';

commit;

-- ─── VERIFY ────────────────────────────────────────────────────────────────
-- Expect 'Mithai house' and a body with no "family":
--   select data->>'eyebrowEn', data->>'primaryCtaLabel' from public.site_content where key = 'hero';
--
-- Expect ZERO rows from each of these three:
--   select id from public.theme_presets
--    where hero->>'eyebrow' ilike '%family kitchen%' or hero->>'ctaLabel' ilike '%batch%';
--   select key from public.site_content
--    where key in ('hero','footer') and data::text ilike '%khammam%';
--   select key from public.site_content
--    where key = 'home_trust' and data::text ~* '(batch|family|kitchen)';
