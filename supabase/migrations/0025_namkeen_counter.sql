-- ─── 0025 · The namkeen counter — eleven products from the owner's spec sheet ──
--
-- Owner spec sheet 2026-08-23 (krish): eleven Andhra namkeens, each with a
-- title, slug, copy, storage line, shelf life, dietary tags (eggless,
-- sugar-free), ONE 250 g pack with its price and an opening stock of 40, sold
-- by weight, hamper-eligible — and a photograph for each in the `dry` drop.
-- All eleven are filed under Namkeens.
--
-- SEVEN ARE NEW:      Karvepaku Poosa, Ragi Murukulu, Munaga Aku Chekkalu,
--                     Thotakura Chekkalu, Small Chekodi, Jawar Poosa,
--                     Tomato Ribbon Pakodi                       (p_nam_*)
-- FOUR ALREADY EXIST: Janthikalu, Murukulu, Pappu Chekodi, Onion Ribbon
--                     Pakodi — seeded in April under `savouries` with stand-in
--                     photographs, placeholder copy, a 60-day shelf life and
--                     invented ₹120 / ₹480 prices          (p_sav_*, ids kept)
--
-- The repo side already happened (products.ts namkeensGroup, the baked
-- products.generated.ts, the regenerated 0014/0021, and the encoded
-- public/products/<slug>.webp files with their rungs and cutouts). This file
-- is what makes the DATABASE agree, in one paste:
--
--   1. inserts the seven new products + their variant, verbatim from the
--      regenerated 0014 (so pasting 0014 later is a no-op for them);
--   2. moves the four existing rows to the spec — category, copy, storage,
--      shelf life, dietary tags, photograph, 250 g price and stock;
--   3. RETIRES the four ₹480 1 kg variants. The spec sheet prices one 250 g
--      pack and nothing larger, and ₹480/kg next to ₹249 per 250 g would sell
--      a kilo for half price. Variants have no `archived` flag and the build
--      bakes every variant of a live product, so a kept row would resurface
--      as a half-price kilo on the next Publish; deleting is the only retire.
--      `orders.lines` is a jsonb snapshot, not a foreign key, so order history
--      is untouched — but 0005's `variant_location_stock`, `stock_adjustments`
--      and `product_batches` reference variants ON DELETE CASCADE, so the
--      delete refuses any 1 kg row that carries branch stock, a ledger entry,
--      a lot/expiry batch, or a restock (see 2g). Such a row is reported by
--      the VERIFY block and retired by hand after the owner has looked.
--      If the owner wants a 1 kg pack, add it in /admin with a real price.
--
-- BEFORE PASTING, run these two checks (each should return 0 rows):
--   · an admin-created duplicate of one of the seven new slugs — the product
--     insert would then fail loudly (`duplicate key … products_slug_key`) and
--     roll the whole paste back; archive or re-slug the duplicate first:
--       select id, slug from public.products
--        where slug in ('karvepaku-poosa', 'ragi-murukulu', 'munaga-aku-chekkalu',
--                       'thotakura-chekkalu', 'small-chekodi', 'jawar-poosa',
--                       'tomato-ribbon-pakodi')
--          and id not like 'p_nam_%';
--   · inventory history on the 1 kg packs about to be retired (the delete
--     skips them if any exist; this just tells you in advance):
--       select 'variant_location_stock' as t, variant_id from public.variant_location_stock
--        where variant_id like 'p_sav_%\_l'
--       union all select 'stock_adjustments', variant_id from public.stock_adjustments
--        where variant_id like 'p_sav_%\_l'
--       union all select 'product_batches', variant_id from public.product_batches
--        where variant_id like 'p_sav_%\_l';
--
-- SEQUENCING. Paste this and click Publish in /admin in the same sitting.
-- Until the Publish the live site prices from the last bake while the
-- database already carries the new rows; until the paste the next build's
-- bake reads the database, finds seven fewer photographs than the committed
-- snapshot, and the ALLOW_CATALOGUE_REGRESSION guard keeps the committed
-- snapshot (which already has all eleven). Do NOT re-paste 0014 and then
-- Publish before reaching this file: the regenerated 0014 inserts the seven
-- new products with their photographs, which satisfies the photo-count guard
-- while the four moved products are still their April selves.
--
-- PASTE ORDER for a database that is still behind:
--   1. 0014_seed_products.sql        (inserts anything missing)
--   2. 0022_retire_qubani_and_hyderabadi_claims.sql
--   3. 0021_product_photography.sql  (fills images; keys on the slug 0022 renames)
--   4. 0024_nonveg_pickles.sql       (retags chicken-pickle)
--   5. this file                     (then Publish)
-- A database that is current through 0024 needs only this file.
--
-- GUARDED, like 0022 and 0024: every update on the four existing rows matches
-- only the value April seeded, so an edit an admin has since made in
-- /admin/products is left alone, column by column. Idempotent — a second run
-- matches nothing. The product inserts are `on conflict (id) do nothing` and
-- the variant inserts `on conflict do nothing` (the SKU is unique too).
--
-- ALLERGENS ARE A PLACEHOLDER. The spec sheet listed none. An empty array is
-- not "unknown" to the storefront — it passes every Free-from filter and hides
-- the advisory — so all eleven carry the savouries line plus Sesame (four of
-- the photographs show sesame) until the owner states each product's real
-- declaration in /admin/products. Over-declaring is the safe direction.
--
-- NOT TOUCHED on purpose: `theme_palette` and `garnish` (not on the spec
-- sheet), `bestseller`/`featured` (false, as seeded — none of the eleven is
-- signature-ranked).

begin;

-- ─── 1 · Seven new products ────────────────────────────────────────────────
-- From supabase/migrations/0014_seed_products.sql (generated from products.ts),
-- with the product insert's conflict target narrowed to (id) — see the header.
-- Kept in step by scripts — do not hand-edit these values here; change
-- products.ts, `pnpm run generate:seed`, and re-emit.

-- Karvepaku Poosa (1 variant)
insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url, unit_mode)
values ('p_nam_karvepaku_poosa', 'karvepaku-poosa', 'Karvepaku Poosa', 'A fragrant Andhra-style savoury made with crisp, delicate strands infused with the earthy aroma of fresh curry leaves. Each batch is carefully prepared and fried to achieve a light, crunchy texture with a balanced savoury flavour. The curry leaves add a distinctive South Indian character, making this a wonderfully addictive tea-time snack.', 'namkeens', null, array['eggless', 'sugar-free'], array['See pack label.'], array['Gluten', 'Peanuts', 'Sesame'], 'Store in an airtight container in a cool, dry place.', 20, $json$[{"url":"/products/karvepaku-poosa.webp","alt":"Karvepaku Poosa — short, thick sev strands flecked with curry leaf, heaped in a white bowl","width":1400,"height":1400}]$json$::jsonb, array['in'], false, false, true, $json${"base":"#F3EFDE","accent":"#6B5A0E","glow":"#DCC372","ink":"#161C24","grainOpacity":0.05}$json$::jsonb, 'pistachio', true, date '2026-04-25', 'https://ravisweets.com', 'weight')
on conflict (id) do nothing;
insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available, hsn_code)
values ('p_nam_karvepaku_poosa_s', 'p_nam_karvepaku_poosa', '250 g', 250, 299, 'INR', 'RS-NAM-KARVEPAKU-POOSA-S', 40, '2106')
on conflict do nothing;

-- Ragi Murukulu (1 variant)
insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url, unit_mode)
values ('p_nam_ragi_murukulu', 'ragi-murukulu', 'Ragi Murukulu', 'A wholesome twist on the traditional Murukulu, made with nourishing ragi blended into a delicately seasoned dough. Each spiral is carefully pressed and fried to develop a deep, earthy flavour and a wonderfully crisp bite. Rustic, savoury, and satisfying, it brings the goodness of ragi into a much-loved South Indian snack.', 'namkeens', null, array['eggless', 'sugar-free'], array['See pack label.'], array['Gluten', 'Peanuts', 'Sesame'], 'Store in an airtight container in a cool, dry place.', 30, $json$[{"url":"/products/ragi-murukulu.webp","alt":"Ragi Murukulu — dark, ridged ragi strands with sesame showing, piled in a white bowl","width":1400,"height":1400}]$json$::jsonb, array['in'], false, false, true, $json${"base":"#F3EFDE","accent":"#6B5A0E","glow":"#DCC372","ink":"#161C24","grainOpacity":0.05}$json$::jsonb, 'pistachio', true, date '2026-04-25', 'https://ravisweets.com', 'weight')
on conflict (id) do nothing;
insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available, hsn_code)
values ('p_nam_ragi_murukulu_s', 'p_nam_ragi_murukulu', '250 g', 250, 279, 'INR', 'RS-NAM-RAGI-MURUKULU-S', 40, '2106')
on conflict do nothing;

-- Munaga Aku Chekkalu (1 variant)
insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url, unit_mode)
values ('p_nam_munaga_aku_chekkalu', 'munaga-aku-chekkalu', 'Munaga Aku Chekkalu', 'Crisp Andhra-style Chekkalu made special with the earthy, distinctive flavour of fresh moringa leaves. The dough is seasoned with traditional spices, shaped into thin discs, and fried carefully until golden and crunchy. Every bite brings together the rustic taste of moringa with the satisfying crackle of a classic homemade snack.', 'namkeens', null, array['eggless', 'sugar-free'], array['See pack label.'], array['Gluten', 'Peanuts', 'Sesame'], 'Store in an airtight container in a cool, dry place.', 20, $json$[{"url":"/products/munaga-aku-chekkalu.webp","alt":"Munaga Aku Chekkalu — thin golden rice discs flecked with moringa leaf and sesame, stacked in a white bowl","width":1400,"height":1400}]$json$::jsonb, array['in'], false, false, true, $json${"base":"#F3EFDE","accent":"#6B5A0E","glow":"#DCC372","ink":"#161C24","grainOpacity":0.05}$json$::jsonb, 'pistachio', true, date '2026-04-25', 'https://ravisweets.com', 'weight')
on conflict (id) do nothing;
insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available, hsn_code)
values ('p_nam_munaga_aku_chekkalu_s', 'p_nam_munaga_aku_chekkalu', '250 g', 250, 299, 'INR', 'RS-NAM-MUNAGA-AKU-CHEKKALU-S', 40, '2106')
on conflict do nothing;

-- Thotakura Chekkalu (1 variant)
insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url, unit_mode)
values ('p_nam_thotakura_chekkalu', 'thotakura-chekkalu', 'Thotakura Chekkalu', 'A traditional Chekkalu given a distinctive Andhra touch with thotakura, or amaranth leaves. Thin rounds of seasoned dough are carefully shaped and fried until beautifully crisp, bringing together the earthy flavour of greens and the unmistakable crunch of homemade Chekkalu. A rustic snack with plenty of character.', 'namkeens', null, array['eggless', 'sugar-free'], array['See pack label.'], array['Gluten', 'Peanuts', 'Sesame'], 'Store in an airtight container in a cool, dry place.', 20, $json$[{"url":"/products/thotakura-chekkalu.webp","alt":"Thotakura Chekkalu — rustic green-brown rice discs flecked with amaranth leaf and chana dal, in a white bowl","width":1400,"height":1400}]$json$::jsonb, array['in'], false, false, true, $json${"base":"#F3EFDE","accent":"#6B5A0E","glow":"#DCC372","ink":"#161C24","grainOpacity":0.05}$json$::jsonb, 'pistachio', true, date '2026-04-25', 'https://ravisweets.com', 'weight')
on conflict (id) do nothing;
insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available, hsn_code)
values ('p_nam_thotakura_chekkalu_s', 'p_nam_thotakura_chekkalu', '250 g', 250, 299, 'INR', 'RS-NAM-THOTAKURA-CHEKKALU-S', 40, '2106')
on conflict do nothing;

-- Small Chekodi (1 variant)
insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url, unit_mode)
values ('p_nam_small_chekodi', 'small-chekodi', 'Small Chekodi', 'Bite-sized versions of the beloved South Indian Chekodi, made for easy snacking and sharing. Each little ring is carefully shaped and fried until golden, crisp, and delightfully crunchy. With its classic savoury seasoning and satisfying texture, Small Chekodi is the kind of snack that keeps you reaching for just one more.', 'namkeens', null, array['eggless', 'sugar-free'], array['See pack label.'], array['Gluten', 'Peanuts', 'Sesame'], 'Store in an airtight container in a cool, dry place.', 30, $json$[{"url":"/products/small-chekodi.webp","alt":"Small Chekodi — bite-sized orange rice-flour rings with sesame, piled in a white bowl","width":1400,"height":1400}]$json$::jsonb, array['in'], false, false, true, $json${"base":"#F3EFDE","accent":"#6B5A0E","glow":"#DCC372","ink":"#161C24","grainOpacity":0.05}$json$::jsonb, 'pistachio', true, date '2026-04-25', 'https://ravisweets.com', 'weight')
on conflict (id) do nothing;
insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available, hsn_code)
values ('p_nam_small_chekodi_s', 'p_nam_small_chekodi', '250 g', 250, 249, 'INR', 'RS-NAM-SMALL-CHEKODI-S', 40, '2106')
on conflict do nothing;

-- Jawar Poosa (1 variant)
insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url, unit_mode)
values ('p_nam_jawar_poosa', 'jawar-poosa', 'Jawar Poosa', 'A delicate savoury snack crafted with jowar for a rustic, earthy flavour and a wonderfully light crunch. The carefully prepared mixture is shaped into fine strands and fried until crisp, creating a snack that is both delicate and deeply satisfying. A traditional-inspired treat for mindful everyday munching.', 'namkeens', null, array['eggless', 'sugar-free'], array['See pack label.'], array['Gluten', 'Peanuts', 'Sesame'], 'Store in an airtight container in a cool, dry place.', 20, $json$[{"url":"/products/jawar-poosa.webp","alt":"Jawar Poosa — fine orange jowar sev strands mounded in a white bowl","width":1400,"height":1400}]$json$::jsonb, array['in'], false, false, true, $json${"base":"#F3EFDE","accent":"#6B5A0E","glow":"#DCC372","ink":"#161C24","grainOpacity":0.05}$json$::jsonb, 'pistachio', true, date '2026-04-25', 'https://ravisweets.com', 'weight')
on conflict (id) do nothing;
insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available, hsn_code)
values ('p_nam_jawar_poosa_s', 'p_nam_jawar_poosa', '250 g', 250, 299, 'INR', 'RS-NAM-JAWAR-POOSA-S', 40, '2106')
on conflict do nothing;

-- Tomato Ribbon Pakodi (1 variant)
insert into public.products (id, slug, title, description, category, subcategory, dietary_tags, ingredients, allergens, storage_instructions, shelf_life_days, images, region_availability, featured, bestseller, is_new, theme_palette, garnish, builder_eligible, rubric_passed_on, source_url, unit_mode)
values ('p_nam_tomato_ribbon_pakodi', 'tomato-ribbon-pakodi', 'Tomato Ribbon Pakodi', 'Crisp ribbon-shaped Pakodi with the tangy, savoury flavour of ripe tomato and a carefully balanced blend of spices. The dough is pressed into delicate ribbons and fried until light, golden, and wonderfully crunchy. Tangy, spicy, and irresistibly crisp, this is a modern twist on a classic Indian tea-time snack.', 'namkeens', null, array['eggless', 'sugar-free'], array['See pack label.'], array['Gluten', 'Peanuts', 'Sesame'], 'Store in an airtight container in a cool, dry place.', 20, $json$[{"url":"/products/tomato-ribbon-pakodi.webp","alt":"Tomato Ribbon Pakodi — flat red-orange ribbon crisps with sesame seeds, in a white bowl","width":1400,"height":1400}]$json$::jsonb, array['in'], false, false, true, $json${"base":"#F3EFDE","accent":"#6B5A0E","glow":"#DCC372","ink":"#161C24","grainOpacity":0.05}$json$::jsonb, 'pistachio', true, date '2026-04-25', 'https://ravisweets.com', 'weight')
on conflict (id) do nothing;
insert into public.variants (id, product_id, title, weight_grams, price_amount, price_currency, sku, stock_available, hsn_code)
values ('p_nam_tomato_ribbon_pakodi_s', 'p_nam_tomato_ribbon_pakodi', '250 g', 250, 269, 'INR', 'RS-NAM-TOMATO-RIBBON-PAKODI-S', 40, '2106')
on conflict do nothing;

-- ─── 2 · Four products that already existed ───────────────────────────────
-- p_sav_janthikalu · p_sav_murukulu · p_sav_pappu_chekodi · p_sav_onion_ribbon_pakodi
-- Ids and SKUs (RS-SAV-*) are unchanged — they are the primary key and a
-- unique column, and both are already in order history.

-- 2a · Category. The spec sheet files all eleven under Namkeens.
update public.products
   set category = 'namkeens'
 where id in ('p_sav_janthikalu', 'p_sav_murukulu', 'p_sav_pappu_chekodi', 'p_sav_onion_ribbon_pakodi')
   and category = 'savouries';

-- 2b · Copy. Each guarded on the opening words of the April placeholder.
update public.products
   set description = 'A traditional Andhra favourite, Janthikalu are delicately shaped savoury spirals with a wonderfully crisp and crunchy texture. Made from seasoned dough and fried in small batches, they carry the comforting flavour of a homemade festive snack. Perfect alongside hot tea or simply enjoyed straight from the box.'
 where id = 'p_sav_janthikalu'
   and description like 'Spiral rice-and-gram-flour twirls pressed through a brass mould%';

update public.products
   set description = 'A classic South Indian favourite, Murukulu are spirals of seasoned dough carefully pressed and fried until perfectly crisp. Their satisfying crunch and lightly spiced, savoury flavour make them an irresistible companion for tea, coffee, or festive gatherings. Traditionally crafted in small batches for that unmistakable homemade texture.'
 where id = 'p_sav_murukulu'
   and description like 'Concentric rice-flour spirals%';

update public.products
   set description = 'Crunchy, golden Chekodi made with a generous touch of lentils for an extra savoury bite. Each ring is carefully shaped and fried until crisp on the outside while retaining a wonderfully satisfying texture. Lightly seasoned and deeply comforting, this traditional snack is made for leisurely tea-time munching.'
 where id = 'p_sav_pappu_chekodi'
   and description like 'Spiral chegodilu enriched with chana dal%';

update public.products
   set description = 'Thin, golden ribbons of crispy Pakodi layered with the savoury sweetness of onion and aromatic spices. Carefully pressed and fried in small batches, each piece delivers an irresistible crunch with a delicious onion-forward flavour. A classic tea-time favourite with the perfect balance of crispness and seasoning.'
 where id = 'p_sav_onion_ribbon_pakodi'
   and description like 'Wide gram-flour ribbons fried with caramelised onion shards%';

-- 2c · Storage line and shelf life. April gave every savoury 60 days and the
--      "away from humidity" line; the spec sheet gives 30 days to the plain
--      fried ones, 20 to the onion ribbon, and its own storage line to all.
update public.products
   set storage_instructions = 'Store in an airtight container in a cool, dry place.'
 where id in ('p_sav_janthikalu', 'p_sav_murukulu', 'p_sav_pappu_chekodi', 'p_sav_onion_ribbon_pakodi')
   and storage_instructions = 'Store in an airtight container away from humidity.';

update public.products
   set shelf_life_days = 30
 where id in ('p_sav_janthikalu', 'p_sav_murukulu', 'p_sav_pappu_chekodi')
   and shelf_life_days = 60;

update public.products
   set shelf_life_days = 20
 where id = 'p_sav_onion_ribbon_pakodi'
   and shelf_life_days = 60;

-- 2d · Dietary tags: the spec sheet marks all eleven eggless + sugar-free.
--      Guarded on the seeded ['eggless'] exactly, same as 0024.
update public.products
   set dietary_tags = array['eggless', 'sugar-free']
 where id in ('p_sav_janthikalu', 'p_sav_murukulu', 'p_sav_pappu_chekodi', 'p_sav_onion_ribbon_pakodi')
   and dietary_tags = array['eggless'];

-- 2e · Photographs. Three were on a family stand-in (0021 BORROWED); each is
--      keyed on the stand-in URL 0021 wrote, so an admin upload — any other
--      URL — survives. Murukulu already had its own file; that file was
--      re-encoded from the new shot in the repo, so only its alt text moves,
--      keyed on the generic alt 0021 wrote. Each also matches a row with NO
--      usable image (the April seed, on a database where 0021 was never
--      pasted) — the same predicate 0021 itself uses — so this file does not
--      depend on 0021 having run first.
update public.products
   set images = $json$[{"url":"/products/janthikalu.webp","alt":"Janthikalu — loose orange-gold ribbed spirals pressed through a mould, heaped in a white bowl","width":1400,"height":1400}]$json$::jsonb
 where id = 'p_sav_janthikalu'
   and (
     images -> 0 ->> 'url' = '/products/murukulu.webp'
     or not exists (
       select 1 from jsonb_array_elements(coalesce(images, '[]'::jsonb)) as img
        where coalesce(img ->> 'url', '') <> ''
     )
   );

update public.products
   set images = $json$[{"url":"/products/murukulu.webp","alt":"Murukulu — five orange-gold rice-flour spirals, ridged from the press, in a white bowl","width":1400,"height":1400}]$json$::jsonb
 where id = 'p_sav_murukulu'
   and (
     (images -> 0 ->> 'url' = '/products/murukulu.webp' and images -> 0 ->> 'alt' like 'Murukulu % photographed at the Khammam kitchen')
     or not exists (
       select 1 from jsonb_array_elements(coalesce(images, '[]'::jsonb)) as img
        where coalesce(img ->> 'url', '') <> ''
     )
   );

update public.products
   set images = $json$[{"url":"/products/pappu-chekodi.webp","alt":"Pappu Chekodi — orange twisted chekodi strands studded with whole chana dal, in a white bowl","width":1400,"height":1400}]$json$::jsonb
 where id = 'p_sav_pappu_chekodi'
   and (
     images -> 0 ->> 'url' = '/products/chegodilu.webp'
     or not exists (
       select 1 from jsonb_array_elements(coalesce(images, '[]'::jsonb)) as img
        where coalesce(img ->> 'url', '') <> ''
     )
   );

update public.products
   set images = $json$[{"url":"/products/onion-ribbon-pakodi.webp","alt":"Onion Ribbon Pakodi — pale golden ribbon crisps with onion flecks, in a white bowl","width":1400,"height":1400}]$json$::jsonb
 where id = 'p_sav_onion_ribbon_pakodi'
   and (
     images -> 0 ->> 'url' = '/products/masala-pakodi.webp'
     or not exists (
       select 1 from jsonb_array_elements(coalesce(images, '[]'::jsonb)) as img
        where coalesce(img ->> 'url', '') <> ''
     )
   );

-- 2f · Allergens: the counter's placeholder line (see the header), guarded on
--      the seeded Gluten/Peanuts so a declaration the owner has since entered
--      in /admin is kept.
update public.products
   set allergens = array['Gluten', 'Peanuts', 'Sesame']
 where id in ('p_sav_janthikalu', 'p_sav_murukulu', 'p_sav_pappu_chekodi', 'p_sav_onion_ribbon_pakodi')
   and allergens = array['Gluten', 'Peanuts'];

-- 2g · The 250 g pack: spec price and opening stock, each guarded on its own
--      seeded value (₹120 / 60) so a restock or a repricing done in /admin
--      is kept independently of the other.
update public.variants set price_amount = 249 where id = 'p_sav_janthikalu_s' and price_amount = 120;
update public.variants set stock_available = 40 where id = 'p_sav_janthikalu_s' and stock_available = 60;
update public.variants set price_amount = 249 where id = 'p_sav_murukulu_s' and price_amount = 120;
update public.variants set stock_available = 40 where id = 'p_sav_murukulu_s' and stock_available = 60;
update public.variants set price_amount = 269 where id = 'p_sav_pappu_chekodi_s' and price_amount = 120;
update public.variants set stock_available = 40 where id = 'p_sav_pappu_chekodi_s' and stock_available = 60;
update public.variants set price_amount = 269 where id = 'p_sav_onion_ribbon_pakodi_s' and price_amount = 120;
update public.variants set stock_available = 40 where id = 'p_sav_onion_ribbon_pakodi_s' and stock_available = 60;

-- 2h · Retire the ₹480 1 kg packs (see the header). Guarded on the invented
--      price and on the absence of any history: a 1 kg variant an admin has
--      since repriced or restocked, or that carries branch stock, a ledger
--      entry or a lot/expiry batch (all of which 0005 declares ON DELETE
--      CASCADE), is a real decision and stays — the VERIFY block lists it.
delete from public.variants as v
 where v.id in ('p_sav_janthikalu_l', 'p_sav_murukulu_l', 'p_sav_pappu_chekodi_l', 'p_sav_onion_ribbon_pakodi_l')
   and v.price_amount = 480
   and v.last_restocked_at is null
   and not exists (select 1 from public.variant_location_stock ls where ls.variant_id = v.id)
   and not exists (select 1 from public.stock_adjustments sa where sa.variant_id = v.id)
   and not exists (select 1 from public.product_batches pb where pb.variant_id = v.id);

commit;

-- ─── VERIFY ────────────────────────────────────────────────────────────────
-- Every statement above is guarded, so any of them can match zero rows while
-- the paste still reports success. Check the resulting state, not the counts.
--
-- All eleven present, under namkeens, with their own photograph
-- (expect 11 rows, every url = '/products/<slug>.webp', none archived):
--   select slug, category, shelf_life_days, dietary_tags, images -> 0 ->> 'url' as photo
--     from public.products
--    where slug in ('karvepaku-poosa', 'murukulu', 'ragi-murukulu', 'munaga-aku-chekkalu',
--                   'pappu-chekodi', 'thotakura-chekkalu', 'small-chekodi', 'janthikalu',
--                   'jawar-poosa', 'tomato-ribbon-pakodi', 'onion-ribbon-pakodi')
--      and not archived
--    order by slug;
--
-- One 250 g pack each at the spec price, stock 40 (expect 11 rows, no 1 kg):
--   select p.slug, v.title, v.price_amount, v.stock_available, v.sku
--     from public.variants v join public.products p on p.id = v.product_id
--    where p.category = 'namkeens' and (p.id like 'p_nam_%' or p.id in (
--          'p_sav_janthikalu', 'p_sav_murukulu', 'p_sav_pappu_chekodi', 'p_sav_onion_ribbon_pakodi'))
--    order by p.slug, v.weight_grams;
--
-- Expected prices: karvepaku-poosa 299 · murukulu 249 · ragi-murukulu 279 ·
-- munaga-aku-chekkalu 299 · pappu-chekodi 269 · thotakura-chekkalu 299 ·
-- small-chekodi 249 · janthikalu 249 · jawar-poosa 299 · tomato-ribbon-pakodi 269 ·
-- onion-ribbon-pakodi 269.
--
-- Nothing left in savouries that the spec sheet moved (expect 0):
--   select count(*) from public.products
--    where category = 'savouries'
--      and id in ('p_sav_janthikalu', 'p_sav_murukulu', 'p_sav_pappu_chekodi', 'p_sav_onion_ribbon_pakodi');
--
-- No 1 kg pack survived (expect 0 rows). A row here carries history — a
-- repricing, a restock, branch stock, a ledger entry or a batch — and 2h left
-- it alone on purpose. Look at it in /admin, then retire it by hand.
--   select id, price_amount, stock_available, last_restocked_at
--     from public.variants
--    where id in ('p_sav_janthikalu_l', 'p_sav_murukulu_l', 'p_sav_pappu_chekodi_l', 'p_sav_onion_ribbon_pakodi_l');
