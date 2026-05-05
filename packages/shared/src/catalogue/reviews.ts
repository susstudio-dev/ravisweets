/**
 * Curated demo reviews for top-3 products by listing prominence
 * (Qubani ka Meetha, Kaju Katli, Diwali Premium Hamper).
 *
 * These render in the product detail page's review block. Voices
 * are stylistically varied — long-form story, short praise, gift
 * use-case, return customer, dietary callout — to feel real.
 *
 * Until /api/reviews lands (Section 3.6 of build-ravisweets-storefront),
 * the storefront reads from this static module. Each review has a
 * stable id so React keys stay deterministic across SSR/CSR.
 */

export interface Review {
  id: string;
  productSlug: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  author: string;
  city?: string;
  date: string; // ISO 8601
  verified: boolean;
  /** Up to 4 customer-uploaded photos. Storage paths in `review-photos` bucket. */
  photos?: string[];
}

const REVIEWS: Review[] = [
  // ── Qubani ka Meetha ────────────────────────────────────────────────────
  {
    id: 'r_qkm_01',
    productSlug: 'qubani-ka-meetha',
    rating: 5,
    title: 'Tastes like my grandmother’s.',
    body: 'My nani used to make this in Hyderabad in the 80s and the smell of the apricots reducing was the smell of every Eid. This is the closest I have had since. Cold, dense, the syrup just on the right side of jam. Will buy every Eid.',
    author: 'Aisha K.',
    city: 'Bangalore',
    date: '2026-04-02',
    verified: true,
  },
  {
    id: 'r_qkm_02',
    productSlug: 'qubani-ka-meetha',
    rating: 5,
    title: 'Worth the chill-and-wait.',
    body: 'Came packed cold, instructions said chill another two hours before serving. Worth it — the apricots had that slow-cooked depth a stovetop hour cannot fake.',
    author: 'Pradeep S.',
    city: 'Hyderabad',
    date: '2026-03-28',
    verified: true,
  },
  {
    id: 'r_qkm_03',
    productSlug: 'qubani-ka-meetha',
    rating: 4,
    title: 'Excellent — could be a touch less sweet.',
    body: 'Flavour is spot on. Personal preference — I would have liked the syrup a half-step less sweet so the apricot tartness comes through more. But that is taste, not quality.',
    author: 'Meera R.',
    city: 'Pune',
    date: '2026-03-21',
    verified: true,
  },
  {
    id: 'r_qkm_04',
    productSlug: 'qubani-ka-meetha',
    rating: 5,
    title: 'Sent as a Eid gift, friend was thrilled.',
    body: 'Posted to a friend in Delhi. She messaged at 11 pm saying she had eaten half the box straight from the fridge. I think that counts as a five-star.',
    author: 'Vikrant T.',
    city: 'Mumbai',
    date: '2026-03-15',
    verified: true,
  },
  {
    id: 'r_qkm_05',
    productSlug: 'qubani-ka-meetha',
    rating: 5,
    title: 'The malai on top is the move.',
    body: 'Tip — let the box sit chilled, then warm a spoonful of the included malai on the stove for 30 seconds and pour it over. Restaurant-grade, at home.',
    author: 'Sunil G.',
    city: 'Chennai',
    date: '2026-03-09',
    verified: false,
  },
  {
    id: 'r_qkm_06',
    productSlug: 'qubani-ka-meetha',
    rating: 5,
    title: 'Eggless, finally.',
    body: 'Most "Hyderabadi sweets" labels online have ambiguous ingredient lists. This one is clearly eggless and I trusted it for an Iftar. No issues.',
    author: 'Fatima Q.',
    city: 'Lucknow',
    date: '2026-02-26',
    verified: true,
  },

  // ── Kaju Katli ──────────────────────────────────────────────────────────
  {
    id: 'r_kk_01',
    productSlug: 'kaju-katli',
    rating: 5,
    title: 'The silver leaf is real, the cashews are real.',
    body: 'I have stopped buying kaju katli from sweet shops because most of it is starch-bulked. This is dense, oily-sheen on the cut, snap when you break it. Real cashews, no compromise.',
    author: 'Rohit M.',
    city: 'Delhi',
    date: '2026-04-08',
    verified: true,
  },
  {
    id: 'r_kk_02',
    productSlug: 'kaju-katli',
    rating: 5,
    title: 'Diwali order — arrived in 36 hours.',
    body: 'Ordered Sunday, arrived Tuesday. Box was sealed, kaju katli was perfect. Distributed to neighbours, got texts back asking where I bought it.',
    author: 'Anita V.',
    city: 'Bangalore',
    date: '2026-03-19',
    verified: true,
  },
  {
    id: 'r_kk_03',
    productSlug: 'kaju-katli',
    rating: 4,
    title: 'Good. The box itself was a little dented in transit.',
    body: 'Sweets were perfect. Outer box arrived with a small dent at one corner — the inner tin was fine and the kaju katli was not damaged. Mentioned it in a reply email and the team offered a partial credit, which was kind. Four stars is for the courier, not the product.',
    author: 'Karan B.',
    city: 'Gurgaon',
    date: '2026-03-12',
    verified: true,
  },
  {
    id: 'r_kk_04',
    productSlug: 'kaju-katli',
    rating: 5,
    title: 'Re-ordering for Raksha Bandhan.',
    body: 'Sent to brother in Pune. He is now firmly of the opinion that I have to do this every Rakhi. Easy decision.',
    author: 'Priya N.',
    city: 'Hyderabad',
    date: '2026-03-04',
    verified: true,
  },
  {
    id: 'r_kk_05',
    productSlug: 'kaju-katli',
    rating: 5,
    title: 'Office gift — got the team talking.',
    body: 'Bought for a 12-person team. Half the box was gone by 10 am, the other half by lunch. The box looks the part of a gift, not a delivery.',
    author: 'Ramesh T.',
    city: 'Hyderabad',
    date: '2026-02-22',
    verified: true,
  },

  // ── Diwali Premium Hamper ───────────────────────────────────────────────
  {
    id: 'r_dh_01',
    productSlug: 'diwali-premium-hamper',
    rating: 5,
    title: 'Best gift hamper I have sent in years.',
    body: 'Five different sweets, two namkeens, dry fruits, and an actual signed note inside. Everything was paisley-tagged and the silk wrap was thick — felt premium without being over-designed.',
    author: 'Sandeep V.',
    city: 'Mumbai',
    date: '2026-04-12',
    verified: true,
  },
  {
    id: 'r_dh_02',
    productSlug: 'diwali-premium-hamper',
    rating: 5,
    title: 'Recipient sent me a video.',
    body: 'My elderly aunt in Vizag sent me a 30-second voice note saying the box was the prettiest thing she had received in a decade. That is the review.',
    author: 'Vikram P.',
    city: 'Chennai',
    date: '2026-04-05',
    verified: true,
  },
  {
    id: 'r_dh_03',
    productSlug: 'diwali-premium-hamper',
    rating: 4,
    title: 'Excellent — would love a small-size version.',
    body: 'The hamper is wonderful but for a single sender-to-single-recipient, it is a lot. Would love to see a half-size version at half the price.',
    author: 'Neha A.',
    city: 'Pune',
    date: '2026-03-30',
    verified: true,
  },
  {
    id: 'r_dh_04',
    productSlug: 'diwali-premium-hamper',
    rating: 5,
    title: 'Worth every rupee.',
    body: 'I have ordered Hyderabadi mithai online for years and this is the first time the box itself made me pause before opening it.',
    author: 'Arjun K.',
    city: 'Delhi',
    date: '2026-03-22',
    verified: true,
  },
  {
    id: 'r_dh_05',
    productSlug: 'diwali-premium-hamper',
    rating: 5,
    title: 'Sent to 4 people, all loved it.',
    body: 'I bulk-ordered four for Diwali. Each came in its own gift wrap with the recipient name on the tag. Customer service handled the addresses cleanly.',
    author: 'Latha S.',
    city: 'Bangalore',
    date: '2026-03-15',
    verified: true,
  },
  {
    id: 'r_dh_06',
    productSlug: 'diwali-premium-hamper',
    rating: 5,
    title: 'Allergens were clearly listed.',
    body: 'My niece is nut-sensitive. Each component had its allergens called out clearly so I could pull the badam jali out before passing the box around. Thoughtful.',
    author: 'Geetha R.',
    city: 'Hyderabad',
    date: '2026-03-04',
    verified: true,
  },
];

export function getReviewsForProduct(slug: string): Review[] {
  return REVIEWS.filter((r) => r.productSlug === slug).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
}

export function getReviewSummary(slug: string): { count: number; avg: number } {
  const list = REVIEWS.filter((r) => r.productSlug === slug);
  if (list.length === 0) return { count: 0, avg: 0 };
  const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  return { count: list.length, avg: Math.round(avg * 10) / 10 };
}

export const ALL_REVIEWS = REVIEWS;
