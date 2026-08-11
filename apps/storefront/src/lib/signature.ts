import { CATALOGUE, type Product } from '@ravisweets/shared';

/**
 * THE COUNTER'S FRONT ROW — which products lead when a surface shows the
 * best of the shop.
 *
 * Until 2026-08-11 every such surface (hero cutouts, homepage bestsellers)
 * ran `CATALOGUE.filter(bestseller)` and took the first N — which is DB
 * insertion order, and the first row of the generated catalogue happens to
 * be Qubani ka Meetha. Nobody decided the shop's face; a row number did,
 * and the owner called it out ("it is not that primary").
 *
 * This list is that decision, made explicitly. Kaju Katli first — it is
 * literally the brand mark (the katli diamond in the logo, favicon and
 * cursor) — then the volume crowd-pleasers. Products NOT named here still
 * appear on bestseller surfaces after the ranked ones, in catalogue order;
 * being unranked demotes, it never hides. Qubani stays a bestseller and
 * keeps its place inside the Hyderabadi Specials category — it just no
 * longer fronts the whole shop.
 */
const SIGNATURE_ORDER = [
  'kaju-katli',
  'gulab-jamun',
  'motichoor-ladoo',
  'classic-gifting-box',
  'hyderabadi-mixture',
  'masala-kaju',
];

const RANK = new Map(SIGNATURE_ORDER.map((slug, i) => [slug, i]));

/** All bestseller-flagged products, signature-ranked first, rest in catalogue order. */
export function signatureBestsellers(): Product[] {
  return CATALOGUE.filter((p) => p.bestseller).sort(
    (a, b) => (RANK.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (RANK.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
  );
}
