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
-- It also flips `builder_eligible` to false on the same row. The repo side
-- already has this false for all six non-veg products, and the storefront's
-- corporate builder reads the baked catalogue, not the DB, so no customer is
-- affected today — but /admin/products reads the DB directly and edits
-- `dietaryTags` and `builderEligible` as two independent fields, so without
-- this an admin opening Chicken Pickle sees a non-veg product still marked
-- hamper-eligible.
--
-- PASTE ORDER for a database that is still behind:
--   1. 0014_seed_products.sql       (inserts anything missing, incl. non-veg)
--   2. 0022_retire_qubani_and_hyderabadi_claims.sql
--   3. 0021_product_photography.sql (keys on the slug 0022 renames)
--   4. this file                    (retags chicken-pickle)
--
-- Both columns are guarded on their OLD value so a deliberate admin edit is
-- left alone: dietary_tags on the seeded ['eggless'] (unchanged from the
-- comment above), and builder_eligible on `true` — the value every row of
-- this vintage carries until an admin (or this migration) touches it. An
-- admin who had already unmarked it hamper-eligible, or already retagged it,
-- keeps their own edit; this migration only moves the row off its stale
-- defaults, on both columns independently, same as the dietary_tags guard.

update public.products
   set dietary_tags = array['non-veg']
 where slug = 'chicken-pickle'
   and dietary_tags = array['eggless'];

update public.products
   set builder_eligible = false
 where slug = 'chicken-pickle'
   and builder_eligible = true;
