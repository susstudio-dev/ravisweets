-- ─── 0022 · Retire Qubani ka Meetha + drop the "Hyderabadi" claims ─────────
--
-- Owner direction 2026-08-13 (krish): "Qubani ka Meetha — remove this product,
-- we don't make this", and "on sweets or mixtures we have to remove saying it
-- is hyderabadi". Decisions taken with the owner the same day:
--   · the hyderabadi-specials category is retired — its products move to
--     'sweets' (no renamed category, no new URL);
--   · 'Hyderabadi Mixture' becomes 'Special Mixture' (id p_mixture and the
--     RS-MIX-* SKUs are unchanged; only slug + title move).
--
-- The repo side of this change already happened (products.ts, the baked
-- products.generated.ts, and the regenerated 0014/0021). This file is what
-- makes the DATABASE agree. Without it the next deploy's build-time bake reads
-- the old rows back and quietly resurrects both the product and the claims —
-- the exact revert the ALLOW_CATALOGUE_REGRESSION guard exists to catch.
--
-- PASTE ORDER for a database that is still behind:
--   1. 0014_seed_products.sql       (inserts anything missing)
--   2. this file                    (retires / renames / recategorises)
--   3. 0021_product_photography.sql (fills images; keys on the NEW slug)
--
-- Qubani is ARCHIVED, not deleted: archiving is what the admin's own delete
-- does, it cannot orphan any order history that references the variants, and
-- RLS ("anyone reads non-archived products") already hides archived rows from
-- shoppers AND from the anon build-time bake.
--
-- Every product-copy update is guarded on the retired wording, so a row the
-- owner has since rewritten in /admin is left alone. Idempotent: a second run
-- matches nothing.

begin;

-- 1 · Qubani ka Meetha leaves the range.
update public.products set archived = true where id = 'p_qubani';

-- 2 · hyderabadi-specials → sweets (Double ka Meetha, Badam ki Jali,
--     Sheer Khurma, Khubani Dry-Fruit Mithai — and p_qubani's archived row,
--     so nothing keeps a category the code no longer knows).
update public.products
set category = 'sweets'
where category = 'hyderabadi-specials';

-- 3 · Hyderabadi Mixture → Special Mixture.
update public.products
set slug = 'special-mixture', title = 'Special Mixture'
where id = 'p_mixture' and slug = 'hyderabadi-mixture';

-- 4 · Motichoor Ladoo takes Qubani's place as the face of the range (the
--     signature moment, the hero body, the search suggestions all name it),
--     and the bestseller surfaces only show bestseller-flagged products.
update public.products set bestseller = true where id = 'p_motichoor_ladoo';

-- 5 · Product copy that claimed Hyderabad (or listed Qubani as a component),
--     brought in line with the repo. Guarded on the retired wording.
update public.products
set description = 'Golden-fried bread soaked overnight in saffron-infused rabri, scattered with chopped pistachios and served warm. The slow soak is what gives it the custard interior and the crisp saffron edge.'
where id = 'p_double_ka_meetha' and description like 'Hyderabad''s answer to bread pudding%';

update public.products
set description = 'Lace-thin almond discs, crisped with sugar and cardamom until they snap like glass. A delicate gift favourite — arrives in a tissue-lined tin that keeps them intact through a long journey.'
where id = 'p_badam_ki_jali' and description like '%Hyderabadi gift favourite%';

update public.products
set description = 'Apricot paste layered with cashews, almonds, pistachios, and a single thread of edible silver leaf. Cuts cleanly, keeps for weeks, travels well. A trousseau sweet adapted for modern gifting.'
where id = 'p_khubani_mithai' and description like 'An opulent cousin of Qubani ka Meetha%';

update public.products
set description = 'Thin gram-flour threads, salted and lightly spiced, pressed through a brass mould and crisped in ghee. Clean, pure, unfussy — the namkeen that lives on every chai tray.'
where id = 'p_besan_sev' and description like '%every Hyderabadi chai tray%';

update public.products
set description = 'A sweet + savoury pair curated for a festival-week table: 500 g Kaju Katli and 400 g Special Mixture. The two most requested SKUs from our corporate desk, now as a single package.',
    ingredients = array['See component SKUs — Kaju Katli 500g, Special Mixture 400g']
where id = 'p_combo_festival' and description like '%400 g Hyderabadi Mixture%';

update public.products
set description = 'Built for a team table — 1 kg of mixed sweets (Kaju Katli + Motichoor Ladoo), 400 g Special Mixture, 200 g Roasted Almonds. Plain-cream box, no ribbon, no fuss. Logo-printable for orders of 50+.'
where id = 'p_corporate_essentials' and description like '%400 g Hyderabadi Mixture%';

update public.products
set description = 'The full Eid table in one box: 500 g Sheer Khurma, 500 g Double ka Meetha, Khubani Dry-Fruit Mithai, and Saffron-Salt Pistachios. Ships with reheat instructions for the Sheer Khurma.'
where id = 'p_eid_signature' and description like 'The full Hyderabadi Eid table%';

update public.products
set description = 'A hand-packed celebration box: Kaju Katli, Badam ki Jali, Motichoor Ladoo, roasted almonds, pistachios, and a small brass diya — wrapped in silk and sealed with a paisley tag. Our bestselling Diwali gift for 2026.'
where id = 'p_diwali_premium' and description like '%Qubani ka Meetha%';

update public.products
set description = 'Tangy pineapple-paste bites with a citrus snap. Refreshing on a warm afternoon.'
where id = 'p_bite_pineapple_bites' and description like '%Hyderabadi afternoon%';

update public.products
set description = 'Filo layered with chopped pistachio and walnut, baked to a deep gold and finished with honey syrup. The festive table has claimed it for generations.'
where id = 'p_fry_baklava' and description like '%The Hyderabadi table has claimed it%';

-- 6 · site_content. The signature_moment row still carries the 0002 seed
--     ("Qubani ka Meetha, the slow way."). The component renders its code
--     default today, but the row is live in /admin/content and would resurface
--     the moment the section is wired to the database — same reasoning as
--     0020's footer/home_trust cleanup. Kept in step with
--     signature-moment.meta.ts, which changed in the same commit as this file.
update public.site_content
set data = data
  || jsonb_build_object(
       'headline', 'Motichoor Ladoo, the slow way.',
       'body',     'Tiny boondi pearls, each fried separately and bound in ghee-scented syrup the same morning they leave the counter. Made the slower way in our Khammam kitchen.'
     )
where key = 'signature_moment'
  and (data->>'headline' ilike '%qubani%' or data->>'body' ilike '%hyderabad%');

--     The hero row: 0020 sets it absolutely and is the file of record for the
--     voice. This is the belt to that suspender — if 0020 has not been pasted
--     yet, the seeded body still names Qubani and the CTA still points at the
--     retired category page (a 404 after this deploy). Guarded so it no-ops on
--     a database where 0020 already ran.
update public.site_content
set data = data
  || jsonb_build_object(
       'body',            'Kaju Katli, Gulab Jamun, Motichoor Ladoo — sweets, namkeens and gift hampers made fresh every morning since 1983. Order from anywhere; delivered fresh to any address in India.',
       'primaryCtaLabel', 'Shop today''s sweets',
       'primaryCtaHref',  '/shop'
     )
where key = 'hero'
  and (
    data->>'body' ilike '%qubani%'
    or data->>'primaryCtaLabel' ilike '%hyderabadi%'
    or data->>'primaryCtaHref' = '/category/hyderabadi-specials'
  );

-- 7 · theme_presets. Presets are one admin click from being live, so a preset
--     carrying the retired copy is a loaded gun. Three targeted fixes:
--     7a. Any CTA still pointing at the retired category page (0001, 0008 and
--         0011 all seeded '/category/hyderabadi-specials', which 404s now).
update public.theme_presets
set hero = hero || jsonb_build_object('ctaHref', '/shop')
where hero->>'ctaHref' = '/category/hyderabadi-specials';

--     7b. Any CTA label still selling the retired range.
update public.theme_presets
set hero = hero || jsonb_build_object('ctaLabel', 'Shop today''s sweets')
where hero->>'ctaLabel' ilike '%hyderabadi%';

--     7c. Hero bodies. The Qubani-led line (seeded by 0001/0008/0011, restated
--         by 0012) moves to the 0020 voice; the Eid preset keeps its Eid body,
--         minus the claim.
update public.theme_presets
set hero = hero || jsonb_build_object(
      'body', 'Kaju Katli, Gulab Jamun, Motichoor Ladoo — sweets, namkeens and gift hampers made fresh every morning since 1983. Order from anywhere; delivered fresh to any address in India.'
    )
where hero->>'body' ilike '%qubani%';

update public.theme_presets
set hero = hero || jsonb_build_object(
      'body', 'Sheer Khurma, Double ka Meetha, Khubani — the Eid table, in one box.'
    )
where hero->>'body' ilike '%hyderabadi eid table%';

commit;

-- ─── VERIFY ────────────────────────────────────────────────────────────────
-- Qubani hidden from shoppers (expect archived = true):
--   select archived from public.products where id = 'p_qubani';
-- Category retired (expect 0):
--   select count(*) from public.products where category = 'hyderabadi-specials';
-- Mixture renamed (expect special-mixture · Special Mixture):
--   select slug, title from public.products where id = 'p_mixture';
-- No live product copy still claims Hyderabad (expect 0 rows — the only row
-- still carrying the old wording is p_qubani, which is archived and excluded
-- by the filter):
--   select id from public.products
--    where (description ilike '%hyderabad%' or title ilike '%hyderabad%')
--      and not archived;
-- Motichoor Ladoo fronts the bestseller surfaces (expect bestseller = true):
--   select bestseller from public.products where id = 'p_motichoor_ladoo';
-- No content row or preset still carries the claim or the dead URL (expect 0 rows each):
--   select key from public.site_content where data::text ilike '%hyderabadi%';
--   select id from public.theme_presets
--    where hero::text ilike '%hyderabadi%' or hero::text ilike '%qubani%';
