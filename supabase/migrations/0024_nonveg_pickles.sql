-- ─── 0024 · The pickle counter splits veg from non-veg ──────────────────────
--
-- Owner direction 2026-08-14 (krish): "In the pickle section have veg and
-- non-veg option." Decisions taken with the owner the same day:
--   · 'non-veg' becomes a dietary tag; vegetarian is the DEFAULT and is
--     marked by the tag's absence (this is a mithai house);
--   · the non-veg range (mutton, gongura mutton, gongura chicken, prawn,
--     fish) arrives via the regenerated 0014;
--   · Chicken Pickle drops 'eggless' — technically true of chicken, but it
--     reads as a vegetarian signal on the shelf.
--
-- The repo side already happened (products.ts, the baked
-- products.generated.ts, the regenerated 0014). This file is what makes the
-- DATABASE agree: 0014 is `on conflict do nothing`, so it inserts the five
-- new rows but cannot retag the chicken-pickle row that April seeded.
-- Without this file the next deploy's build-time bake reads 'eggless' back
-- and quietly un-marks the one product whose marking matters most.
--
-- PASTE ORDER for a database that is still behind:
--   1. 0014_seed_products.sql       (inserts anything missing, incl. non-veg)
--   2. 0022_retire_qubani_and_hyderabadi_claims.sql
--   3. 0021_product_photography.sql (keys on the slug 0022 renames)
--   4. this file                    (retags chicken-pickle)
--
-- Guarded on the old value so an admin's own tag edit is left alone.

update public.products
   set dietary_tags = array['non-veg']
 where slug = 'chicken-pickle'
   and dietary_tags = array['eggless'];
