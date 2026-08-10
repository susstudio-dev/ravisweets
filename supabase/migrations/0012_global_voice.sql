-- ─── GLOBAL BRAND VOICE — demote locality from the hero ────────────────────
--
-- The owner's instruction: "we don't have to say Khammam or Hyderabad very
-- frequently or in the hero, we are a global brand."
--
-- The decision implemented here is DEMOTE, NOT REMOVE. Khammam stops being a
-- claim in the brand voice and becomes a field in the record:
--   * Hero, homepage title/description, OG/Twitter, logo lockup  → no locality
--   * Batch card KITCHEN row, homepage spec, footer, product provenance
--                                                              → locality once, as fact
--   * /about, /stores, shipping policies, LocalBusiness JSON-LD → unchanged
--
-- WHY THIS MIGRATION EXISTS AT ALL — read before "simplifying" it.
-- The hero strings live in THREE places and the code resolves them as
--     site_content.hero.headline  ??  theme_presets.hero.headline  ??  code default
-- (see hero-batch.tsx). So `site_content` silently wins over everything. A
-- previous change that edited only `theme_presets` had no visible effect,
-- because the site_content row shadowed it. Both rows are updated here, in one
-- transaction, so they cannot disagree.
--
-- The code defaults in hero-batch.tsx were updated in the same commit. All
-- three sources now say the same thing.
--
-- NOTE FOR THE STATIC EXPORT: editing these rows changes what a BROWSER
-- renders, but not what a crawler or an OG scraper reads — those see the
-- prerendered HTML. The code defaults and the metadata in layout.tsx are what
-- serve them, which is why both had to change together.

begin;

-- 1. site_content — the highest-precedence source.
update public.site_content
set data = data
  || jsonb_build_object(
       'headline',   'Made this morning. Nothing added to make it last.',
       'body',       'Qubani ka Meetha, Badam ki Jali, Kaju Katli — sweets, namkeens and gift hampers made by one family since 1983. Order from anywhere; delivered fresh to any address in India.',
       'eyebrowEn',  'Family kitchen',
       -- Telugu script is retained deliberately: it reads as authenticity to
       -- the diaspora buyer. What changed is that it now says the BRAND name
       -- rather than the town.
       'eyebrowIndic', 'రవి స్వీట్స్',
       -- The label said "Shop today's batch" while pointing at a single
       -- category. Send it to the whole catalogue.
       'primaryCtaHref', '/shop'
     )
where key = 'hero';

-- 2. theme_presets — the active house preset, kept in step.
update public.theme_presets
set hero = hero
  || jsonb_build_object(
       'headline', 'Made this morning. Nothing added to make it last.',
       'body',     'Qubani ka Meetha, Badam ki Jali, Kaju Katli — sweets, namkeens and gift hampers made by one family since 1983. Order from anywhere; delivered fresh to any address in India.',
       'eyebrow',  'Family kitchen',
       'ctaHref',  '/shop'
     )
where id = 'batch-card';

-- 3. The retired festival presets keep their own campaign headlines, but the
--    two that named the town in the brand voice are brought into line. Their
--    hero copy is only shown while that preset is active.
update public.theme_presets
set hero = jsonb_set(
      hero,
      '{eyebrow}',
      to_jsonb('Family kitchen'::text)
    )
where id <> 'batch-card'
  and hero->>'eyebrow' ilike '%khammam%';

commit;

-- ─── VERIFY ────────────────────────────────────────────────────────────────
-- Expect one row, headline starting "Made this morning":
--   select data->>'headline', data->>'eyebrowEn' from public.site_content where key = 'hero';
-- Expect no customer-facing hero copy containing the town:
--   select id, hero->>'headline' from public.theme_presets where hero->>'headline' ilike '%khammam%';
