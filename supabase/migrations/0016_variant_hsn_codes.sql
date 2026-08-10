-- ─── 0016 · Variant HSN codes — the GST data 0014 forgot to insert ─────────
-- Values emitted from packages/shared/src/catalogue/products.ts
-- (HARDCODED_CATALOGUE) by a one-shot script, so no one hand-typed 165 rows.
-- This file is the artefact, not a build output: there is no committed
-- generator to re-run, because a backfill only has to happen once.
-- Contents: 165 variants · 159 × 2106 · 6 × 0802
-- Apply AFTER 0014. Idempotent: safe to re-run.
--
-- WHY THIS EXISTS. Every variant in the hardcoded catalogue carries an
-- hsn_code — the GST tariff heading an Indian invoice has to print — but
-- 0014_seed_products.sql's variant column list omits the column, so all
-- 165 rows landed with hsn_code null. Re-running 0014 cannot repair that:
-- every insert there is `on conflict do nothing`, which skips an existing row
-- rather than updating it. Restoring the values therefore needs its own
-- migration, and this is it. (The generator has since been fixed, so a
-- database seeded from scratch after this date never has the gap.)
--
-- Nothing on the storefront renders hsn_code today. It is restored anyway
-- because it is a fact about the product that invoicing will need, and the
-- longer it stays null the more variants an admin creates without one.
--
-- THE CODES ARE COPIED, NOT JUDGED. 2106 is "food preparations not elsewhere
-- specified" and 0802 is "other nuts, fresh or dried" — the two headings the
-- catalogue uses. Note that only the two hand-written dry-fruit SKUs (Roasted
-- Almonds, Saffron Pistachios) carry 0802; the seven dry-fruit products built
-- by makeProduct() inherit its literal 2106, which an accountant may well want
-- to change. That is a catalogue decision, not a restore: it belongs in
-- products.ts plus a targeted update, so this file reproduces the existing
-- values exactly rather than quietly inventing better ones.
begin;

-- 1 · Fill in the codes, from the catalogue literal that has always had them.
--
--     ONLY WHERE NULL. `and v.hsn_code is null` is the whole safety story: an
--     admin who has since corrected a code — or an accountant who found the
--     right heading for a SKU whose catalogue entry guessed — keeps their
--     value. This migration fills gaps; it never overwrites a decision.
--     That also makes it idempotent, since a second run finds nothing null.
--
--     ONE STATEMENT, NOT 165. A values list joined on variant id updates the
--     whole set in a single pass; 165 separate UPDATEs would be 165 round
--     trips through the SQL editor for the same result.
--
--     Rows the database does not have are simply not matched by the join —
--     a variant an admin deleted does not resurrect, and does not error.
--
--     The `variants_touch` trigger (0001) bumps updated_at on every row this
--     fills. Expected: the row genuinely changed.
update public.variants as v
   set hsn_code = c.hsn_code
  from (values
         ('v_qubani_250',                '2106'),
         ('v_qubani_500',                '2106'),
         ('v_qubani_1000',               '2106'),
         ('v_dkm_250',                   '2106'),
         ('v_dkm_500',                   '2106'),
         ('v_dkm_1000',                  '2106'),
         ('v_bkj_250',                   '2106'),
         ('v_bkj_500',                   '2106'),
         ('v_bkj_1000',                  '2106'),
         ('v_skh_250',                   '2106'),
         ('v_skh_500',                   '2106'),
         ('v_skh_1000',                  '2106'),
         ('v_khm_300',                   '2106'),
         ('v_khm_500',                   '2106'),
         ('v_khm_1000',                  '2106'),
         ('v_kaju_250',                  '2106'),
         ('v_kaju_500',                  '2106'),
         ('v_gj_500',                    '2106'),
         ('v_gj_1000',                   '2106'),
         ('v_mtl_6',                     '2106'),
         ('v_mtl_12',                    '2106'),
         ('v_mix_200',                   '2106'),
         ('v_mix_400',                   '2106'),
         ('v_mix_1000',                  '2106'),
         ('v_pc_150',                    '2106'),
         ('v_pc_300',                    '2106'),
         ('v_pc_1000',                   '2106'),
         ('v_bs_250',                    '2106'),
         ('v_bs_500',                    '2106'),
         ('v_bs_1000',                   '2106'),
         ('v_alm_200',                   '0802'),
         ('v_alm_500',                   '0802'),
         ('v_alm_1000',                  '0802'),
         ('v_pist_200',                  '0802'),
         ('v_pist_500',                  '0802'),
         ('v_pist_1000',                 '0802'),
         ('v_cc_750',                    '2106'),
         ('v_fc_900',                    '2106'),
         ('v_diwali_premium',            '2106'),
         ('v_cgb_1',                     '2106'),
         ('v_ceb_1',                     '2106'),
         ('v_rt_1',                      '2106'),
         ('v_es_1',                      '2106'),
         ('v_sp_500',                    '2106'),
         ('v_wt_1',                      '2106'),
         ('v_pp_1',                      '2106'),
         ('v_oct_1',                     '2106'),
         ('p_sav_atukula_mixture_s',     '2106'),
         ('p_sav_atukula_mixture_l',     '2106'),
         ('p_sav_chegodilu_s',           '2106'),
         ('p_sav_chegodilu_l',           '2106'),
         ('p_sav_chekkalu_s',            '2106'),
         ('p_sav_chekkalu_l',            '2106'),
         ('p_sav_cornflakes_mixture_s',  '2106'),
         ('p_sav_cornflakes_mixture_l',  '2106'),
         ('p_sav_dal_mudi_snacks_s',     '2106'),
         ('p_sav_dal_mudi_snacks_l',     '2106'),
         ('p_sav_janthikalu_s',          '2106'),
         ('p_sav_janthikalu_l',          '2106'),
         ('p_sav_kara_boondhi_s',        '2106'),
         ('p_sav_kara_boondhi_l',        '2106'),
         ('p_sav_karapusa_s',            '2106'),
         ('p_sav_karapusa_l',            '2106'),
         ('p_sav_masala_kaju_s',         '2106'),
         ('p_sav_masala_kaju_l',         '2106'),
         ('p_sav_masala_palli_s',        '2106'),
         ('p_sav_masala_palli_l',        '2106'),
         ('p_sav_murukulu_s',            '2106'),
         ('p_sav_murukulu_l',            '2106'),
         ('p_sav_onion_ribbon_pakodi_s', '2106'),
         ('p_sav_onion_ribbon_pakodi_l', '2106'),
         ('p_sav_palli_pakodi_s',        '2106'),
         ('p_sav_palli_pakodi_l',        '2106'),
         ('p_sav_pappu_chekkalu_s',      '2106'),
         ('p_sav_pappu_chekkalu_l',      '2106'),
         ('p_sav_pappu_chekodi_s',       '2106'),
         ('p_sav_pappu_chekodi_l',       '2106'),
         ('p_bite_butterscotch_bites_s', '2106'),
         ('p_bite_butterscotch_bites_l', '2106'),
         ('p_bite_choco_bites_s',        '2106'),
         ('p_bite_choco_bites_l',        '2106'),
         ('p_bite_kaju_bites_s',         '2106'),
         ('p_bite_kaju_bites_l',         '2106'),
         ('p_bite_kesar_bites_s',        '2106'),
         ('p_bite_kesar_bites_l',        '2106'),
         ('p_bite_khajoor_bites_s',      '2106'),
         ('p_bite_khajoor_bites_l',      '2106'),
         ('p_bite_mango_crunch_bites_s', '2106'),
         ('p_bite_mango_crunch_bites_l', '2106'),
         ('p_bite_mixed_bites_s',        '2106'),
         ('p_bite_mixed_bites_l',        '2106'),
         ('p_bite_oreo_bites_s',         '2106'),
         ('p_bite_oreo_bites_l',         '2106'),
         ('p_bite_pineapple_bites_s',    '2106'),
         ('p_bite_pineapple_bites_l',    '2106'),
         ('p_bite_silky_bites_s',        '2106'),
         ('p_bite_silky_bites_l',        '2106'),
         ('p_bite_strawberry_bites_s',   '2106'),
         ('p_bite_strawberry_bites_l',   '2106'),
         ('p_bite_tutti_frutti_bites_s', '2106'),
         ('p_bite_tutti_frutti_bites_l', '2106'),
         ('p_df_anjeer_whole_s',         '2106'),
         ('p_df_anjeer_whole_l',         '2106'),
         ('p_df_badam_almonds_s',        '2106'),
         ('p_df_badam_almonds_l',        '2106'),
         ('p_df_cranberry_s',            '2106'),
         ('p_df_cranberry_l',            '2106'),
         ('p_df_kaju_cashew_s',          '2106'),
         ('p_df_kaju_cashew_l',          '2106'),
         ('p_df_pista_whole_s',          '2106'),
         ('p_df_pista_whole_l',          '2106'),
         ('p_df_salted_pista_s',         '2106'),
         ('p_df_salted_pista_l',         '2106'),
         ('p_df_walnuts_s',              '2106'),
         ('p_df_walnuts_l',              '2106'),
         ('p_pkl_allam_pickle_s',        '2106'),
         ('p_pkl_allam_pickle_l',        '2106'),
         ('p_pkl_amla_pickle_s',         '2106'),
         ('p_pkl_amla_pickle_l',         '2106'),
         ('p_pkl_chicken_pickle_s',      '2106'),
         ('p_pkl_chicken_pickle_l',      '2106'),
         ('p_pkl_chintakaya_pickle_s',   '2106'),
         ('p_pkl_chintakaya_pickle_l',   '2106'),
         ('p_pkl_gongura_pickle_s',      '2106'),
         ('p_pkl_gongura_pickle_l',      '2106'),
         ('p_pkl_kakarakaya_pickle_s',   '2106'),
         ('p_pkl_kakarakaya_pickle_l',   '2106'),
         ('p_pkl_lemon_pickle_s',        '2106'),
         ('p_pkl_lemon_pickle_l',        '2106'),
         ('p_pkl_masala_mango_pickle_s', '2106'),
         ('p_pkl_masala_mango_pickle_l', '2106'),
         ('p_pdr_kandi_podi_s',          '2106'),
         ('p_pdr_kandi_podi_l',          '2106'),
         ('p_pdr_karam_podi_s',          '2106'),
         ('p_pdr_karam_podi_l',          '2106'),
         ('p_pdr_karivepaku_podi_s',     '2106'),
         ('p_pdr_karivepaku_podi_l',     '2106'),
         ('p_pdr_kobbari_karam_podi_s',  '2106'),
         ('p_pdr_kobbari_karam_podi_l',  '2106'),
         ('p_pdr_nalla_karam_podi_s',    '2106'),
         ('p_pdr_nalla_karam_podi_l',    '2106'),
         ('p_pdr_nuvvula_karam_podi_s',  '2106'),
         ('p_pdr_nuvvula_karam_podi_l',  '2106'),
         ('p_pdr_palli_karam_podi_s',    '2106'),
         ('p_pdr_palli_karam_podi_l',    '2106'),
         ('p_pdr_rasam_podi_s',          '2106'),
         ('p_pdr_rasam_podi_l',          '2106'),
         ('p_pdr_sambar_podi_s',         '2106'),
         ('p_pdr_sambar_podi_l',         '2106'),
         ('p_pdr_vellulli_karam_podi_s', '2106'),
         ('p_pdr_vellulli_karam_podi_l', '2106'),
         ('p_hs_booster_laddu_s',        '2106'),
         ('p_hs_booster_laddu_l',        '2106'),
         ('p_hs_dry_fruit_laddu_s',      '2106'),
         ('p_hs_dry_fruit_laddu_l',      '2106'),
         ('p_hs_gondh_laddu_s',          '2106'),
         ('p_hs_gondh_laddu_l',          '2106'),
         ('p_hs_high_protein_laddu_s',   '2106'),
         ('p_hs_high_protein_laddu_l',   '2106'),
         ('p_hs_millet_laddu_s',         '2106'),
         ('p_hs_millet_laddu_l',         '2106'),
         ('p_hs_nuvvula_laddu_s',        '2106'),
         ('p_hs_nuvvula_laddu_l',        '2106'),
         ('p_bsk_bournvita_biscuits_s',  '2106'),
         ('p_bsk_bournvita_biscuits_l',  '2106')
       ) as c (id, hsn_code)
 where v.id = c.id
   and v.hsn_code is null;

commit;

-- ─── VERIFY ────────────────────────────────────────────────────────────────
-- Expect zero rows — every seeded variant now has a code:
--   select id, sku from public.variants where hsn_code is null;
-- Expect the distribution above:
--   select hsn_code, count(*) from public.variants group by hsn_code order by 1;
