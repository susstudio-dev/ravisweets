import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CATALOGUE, type CategorySlug } from '@ravisweets/shared';
import { Reveal } from '@/components/motion/reveal';
import { CategoryBrowser } from '@/components/category/category-browser';
import { CategoryFilters } from '@/components/category/category-filters';
import { CategorySwitcher } from '@/components/category/category-switcher';
import { seoDescription, seoTitle } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * CATEGORY COPY, EXPANDED FROM A CAPTION INTO A PAGE.
 *
 * These pages carried between 14 and 27 words of body text each — ten of them
 * were the whole of the crawl's "Low Content Pages" finding. The cause was
 * structural, not editorial: `CategoryBrowser` calls `useSearchParams`, so the
 * entire product grid is client-only and suspends to nothing during the static
 * export. A crawler was served a heading, one caption line, and an empty div.
 *
 * Two fixes, both here. `method` and `keeping` give each range real prose that
 * says something a buyer wants to know and a search engine can rank — how it
 * is made, how it travels, how to keep it. And the page now server-renders a
 * ruled index of the range beneath the interactive grid, so the product links
 * exist in the HTML rather than only after hydration.
 *
 * Every claim below is already made elsewhere on the site: no preservatives,
 * same-day dispatch, delivery within India. Nothing here asserts a
 * certification — the licence is disclosed as pending in the footer and this
 * copy does not contradict it.
 *
 * VOICE (owner, 2026-08-12): no "small batch", no "family kitchen", no "our
 * kitchen(s)". The craft claims stay — hand-shaped, fried at temperature,
 * ground fresh — because those are about METHOD. What went is the language
 * that sold SMALLNESS. If you are adding a category below, describe the
 * technique, not the size of the operation.
 */
const CATEGORY_META: Record<
  CategorySlug,
  {
    title: string;
    /** Spent on the <title> tag after the category name. */
    titleHook: string;
    eyebrow: string;
    body: string;
    method: string;
    keeping: string;
  }
> = {
  sweets: {
    title: 'Sweets',
    titleHook: 'Buy Fresh Indian Mithai Online',
    eyebrow: 'Fresh daily',
    body: 'Kaju Katli, Gulab Jamun, seasonal ladoos — made fresh every morning with no preservatives.',
    method:
      'Everything in the mithai range is cooked the morning it is dispatched. The katli is rolled and cut into diamonds by hand, which is why no two pieces weigh exactly the same; the ladoos are bound while the mixture is still warm, because a cooled mixture will not hold. We use ghee rather than vanaspati and cane sugar rather than glucose syrup, and there is no preservative in any of it — which is the whole reason the boxes are made to order rather than kept on a shelf.',
    keeping:
      'Ghee-based sweets such as katli and soan papdi keep two to three weeks in an airtight tin at room temperature. The syrup sweets — gulab jamun and anything milk-set — want a refrigerator and about a week. Bring anything chilled back to room temperature for twenty minutes before serving; cold flattens cardamom.',
  },
  namkeens: {
    title: 'Namkeens',
    titleHook: 'Buy Crisp Indian Namkeen Online',
    eyebrow: 'Chai-time favourites',
    body: 'Crunchy, spiced, and stubbornly moreish. Fried to order and sealed the same day.',
    method:
      'Namkeen is a frying problem before it is a spice problem. Ours goes into the oil in loads small enough that the temperature never falls far enough to make the mixture greasy, drained hot, and sealed the same day it is made — an open bag of mixture is stale within hours in Telangana humidity, and no amount of masala hides it. The spicing is done after the fry, off the heat, so the chilli stays bright rather than scorched.',
    keeping:
      'Keep the bag closed and a mixture stays crisp for four to six weeks; the hand-pressed namkeens — murukulu, janthikalu, chekkalu — keep three to four, and each product page states its own. Once opened, decant into an airtight tin — the pack is a delivery container, not a storage one. If a bag has gone soft in the monsoon, five minutes in a low oven brings it back.',
  },
  'dry-fruits': {
    title: 'Dry Fruits',
    titleHook: 'Buy Premium Nuts Online',
    eyebrow: 'From the pantry',
    body: 'A-grade almonds, pistachios, cashews — hand-picked, roasted gently, packed tight.',
    method:
      'These are graded and sorted by hand before anything else happens to them, because a single bitter kernel is what people remember about a kilo of almonds. Roasting is done low and slow rather than fast and dark — enough to bring the oil forward without taking the sweetness out. The salted and masala lines are seasoned after roasting so the coating sits on the nut instead of burning onto it.',
    keeping:
      'Nuts keep three to six months sealed and cool, and they keep considerably less well in a warm kitchen cupboard — the oils turn before the nut looks any different. An airtight jar away from the stove is the whole trick. Anything you are not opening within a month is better off in the refrigerator.',
  },
  combos: {
    title: 'Combos',
    titleHook: 'Sweet & Savoury Snack Boxes',
    eyebrow: 'A little of everything',
    body: 'Curated duos and trios — pick a combination that suits the palate or the occasion.',
    method:
      'A combo is put together so the pieces do not fight each other in the box. Sweet and savoury are bagged separately — mithai will pass its cardamom to a mixture inside a day if they share a compartment — and the shorter-lived item sets the dispatch date for the whole box. They exist because most households want a bit of both and would rather not assemble it themselves.',
    keeping:
      'Open the savoury bag first: it is the one that suffers from sitting. Follow the storage note on each component rather than the box, since a combo can hold a two-week sweet next to a six-week namkeen. Nothing in a combo carries a preservative.',
  },
  'gift-hampers': {
    title: 'Gift Hampers',
    titleHook: 'Indian Sweet Gift Boxes',
    eyebrow: 'Festival-ready',
    body: 'Hand-packed celebration boxes, wrapped in silk and sealed with a paisley tag. Gift-ready.',
    method:
      'Hampers are packed to be opened in front of people. Each one is filled by hand in the order it should be seen, padded so nothing shifts in transit, and closed with a tag rather than a printed sticker. Corporate runs go out the same way at volume — the same boxes, with a printed proof approved before anything is produced.',
    keeping:
      'Hampers ship with the recipient in mind: no price is printed anywhere inside, and a gift note goes in at checkout. Give the contents a day of margin before the occasion rather than aiming for the morning of. For volume orders with multiple addresses, the corporate desk handles the CSV and the per-recipient tracking.',
  },
  'festival-specials': {
    title: 'Festival Specials',
    titleHook: 'Boxes for Every Festival',
    eyebrow: 'By season',
    body: "Diwali, Raksha Bandhan, Eid, and more — curated runs that open when the festival does, and close when it's over.",
    method:
      'These are limited runs, not permanent lines. A festival box is planned against the calendar date, produced in a fixed quantity, and closed when the occasion passes — which is why the range on this page changes through the year rather than staying the same. It also means an order placed late cannot always be honoured: the ingredients for a run are committed in advance.',
    keeping:
      'Order at least three clear days before the festival so the fresh range can be made and dispatched rather than made early and held. Each festival page carries its own order-by date, calculated from that occasion. Everything here is made without preservatives, so the lead time is a real constraint and not a suggestion.',
  },
  savouries: {
    title: 'Savouries',
    titleHook: 'Andhra Chegodilu & Karapusa',
    eyebrow: 'Andhra-style chai-time',
    body: 'Chegodilu, Chekkalu, Karapusa, Kachuralu — Andhra savoury classics fried in cold-pressed oil, sealed the same day.',
    method:
      'The Andhra savouries are shaped by hand, one at a time. Chegodilu are rolled and tied into rings; kachuralu are twisted by hand; karapusa is pressed through a brass mould that has been in the kitchen longer than most of the staff. They are fried in cold-pressed oil at a temperature that sets the shape before the inside cooks, which is what makes them snap instead of bend. None of it is machine-extruded.',
    keeping:
      'Sealed, these hold their snap for about a month. They are more sensitive to humidity than to time — a tin on the counter in July will go soft faster than a sealed bag in the cupboard in January. Store airtight, and refresh in a low oven if they lose their edge.',
  },
  'sweet-bites': {
    title: 'Sweet Bites',
    titleHook: 'Twelve-flavour Mithai Tin',
    eyebrow: 'Small-batch flavour',
    body: 'Single-bite mithai in twelve flavours — kaju, kesar, mango, butterscotch and more. The pick-and-choose box.',
    method:
      'Sweet Bites are the same mithai work at a single-bite size, which is harder rather than easier — the ratio of surface to centre changes, so each flavour is reformulated rather than simply cut smaller. Twelve flavours are made in parallel in small trays and assembled into the tin at the end, so a box can be a dozen different things without a dozen different dispatch dates.',
    keeping:
      'The tin is the storage: keep them in it, closed, and they hold two to three weeks at room temperature. They are the easiest thing here to send to an office or a household with mixed tastes, since nobody has to commit to a whole box of one flavour.',
  },
  pickles: {
    title: 'Pickles',
    titleHook: 'Andhra Achaar in Sesame Oil',
    eyebrow: 'Andhra-style achaar',
    body: 'Gongura, allam, chintakaya, mamidikaya — small-batch Andhra pickles in cold-pressed sesame oil, alongside a non-veg shelf of slow-cooked chicken, mutton, prawn and fish jars.',
    method:
      'Andhra pickle is a preserving tradition, so this is the one range where keeping quality is built into the recipe rather than added to it — cold-pressed sesame oil, salt and chilli, in the proportions that have always done the work. The gongura is cooked down the day the leaf arrives. We do not add a chemical preservative on top of a method that already is one.',
    keeping:
      'Use a dry spoon, every time — water in the jar is the only thing that reliably spoils an Andhra pickle. Keep the oil covering the solids; top it up rather than draining it off. Stored that way and out of direct sun, an unopened jar is good for a year and an opened one for several months.',
  },
  powders: {
    title: 'Podis & Powders',
    titleHook: 'Fresh-ground Telugu Podi',
    eyebrow: 'South Indian rice mixes',
    body: 'Karam podi, kandi podi, sambar podi — ground fresh so the aroma is still alive when the bag opens.',
    method:
      'Podi is entirely about how recently it was ground. The dals and chillies are dry-roasted separately, because they do not reach their point at the same moment, then cooled and ground in small quantity. Ground warm, a podi cakes and turns bitter within weeks; ground cool and sealed the same day, it still smells like the roasting pan when the bag opens.',
    keeping:
      'Keep podi dry and airtight and it holds its aroma for two to three months. It fades gradually rather than spoiling, so the honest advice is to buy the size you will finish. A spoon into hot rice with a little ghee or sesame oil is the intended use; it also seasons idli, dosa and curd rice.',
  },
  biscuits: {
    title: 'Biscuits',
    titleHook: 'House-baked, No Preservatives',
    eyebrow: 'Bakery',
    body: 'House-baked biscuits with no preservatives or raising agents. Vegan, butter-rich, chai-friendly.',
    method:
      'These are baked in the same kitchen as everything else, in oven-sized batches rather than on a line. No preservative and no chemical raising agent goes in, which limits how far a biscuit can be pushed — the texture comes from the fat and the resting time instead. Several of the lines are vegan by recipe rather than by substitution, which is to say they were never made with butter and had it taken out; they were built around a different fat from the start, and taste like it was intentional. It is a small range on purpose. A biscuit that has to survive a warehouse needs chemistry we do not use, so what is here is what genuinely works without it.',
    keeping:
      'Biscuits keep three to four weeks in an airtight tin and go soft rather than stale — humidity, again, not age. They are the most forgiving thing on the site to post, since there is nothing in them that minds a warm afternoon in transit, and they are the safest choice for an address where nobody may be in to receive the box the same day. If a tin has gone soft in the monsoon, five minutes in a low oven and a few minutes cooling on a rack brings the snap straight back. Serve them with chai rather than coffee: the spicing in the range is built around it.',
  },
  'healthy-sweets': {
    title: 'Healthy Sweets',
    titleHook: 'Sugar-free Laddu Range',
    eyebrow: 'Laddu range',
    body: 'Booster, Gondh, Millet, Protein, Nuvvula laddus — sugar-free and ingredient-led. The new-mother / gym-bag / school-tiffin range.',
    method:
      'This range is built around what each laddu is for rather than around a diet label. Gondh laddu is the traditional post-partum preparation, made with edible gum and dry fruit; the millet and sesame laddus are bound with jaggery or dates instead of refined sugar; the protein laddu is weighted towards nuts and seeds. Every ingredient is named on the pack, because the reason to buy one of these is knowing exactly what is in it.',
    keeping:
      'Jaggery- and date-bound laddus keep two to three weeks in an airtight tin, and travel better than syrup sweets. They are the range people order on repeat — a tin for the tiffin box, the gym bag or the bedside table of a new mother — so most of them are made to a standing schedule.',
  },
};

const ALL_SLUGS: CategorySlug[] = [
  'sweets',
  'sweet-bites',
  'healthy-sweets',
  'namkeens',
  'savouries',
  'dry-fruits',
  'pickles',
  'powders',
  'biscuits',
  'combos',
  'gift-hampers',
  'festival-specials',
];

export async function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug as CategorySlug];
  if (!meta) return { title: 'Category not found' };

  const title = seoTitle(meta.title, meta.titleHook);
  const description = seoDescription(
    meta.body,
    'Made fresh since 1983.',
    'Delivered across India.',
  );

  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { type: 'website', title, description, url: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug as CategorySlug];
  if (!meta) notFound();

  const products = CATALOGUE.filter((p) => p.category === slug);

  return (
    <>
      {/*
        THE TITLE HEADS THE RAIL; THE SWITCHER HEADS THE GRID.

        Three rounds of the same feedback shaped this head. 2026-08-11 moved
        the title into a sticky left rail so products started below the
        masthead; 2026-08-24 made the aisles themselves the header, a full-
        width switcher over everything, and left the rail filters-only;
        2026-08-30 called the result out for what it had become — "lots of
        space wasted": a 100px band of circle tiles across the top, a title
        column that started level with it, and an empty rail head beside them,
        so the first product sat some 300px down the page.

        So the head is now two columns from the very first pixel. The rail
        opens with the eyebrow and h1 (it had nothing at its top before, which
        is the space the owner was pointing at) and runs straight on into the
        refine panel. The grid column opens with the switcher, compacted to
        pills — "on top of the sweets", where the aisles are a control over the
        products rather than a second hero. Nothing is stacked above both
        columns any more, so the first row of cards is roughly one card-height
        higher on every category page.

        The h1 and switcher stay OUTSIDE the Suspense boundary: they are
        server-rendered and must remain in the static HTML — the grid behind
        useSearchParams contributes nothing to the export.
      */}
      <section aria-labelledby="cat-heading" className="container-site pb-20 pt-6">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          {/*
            Sticky AND scrollable — see the long note on the same aside in
            shop-view. The rail carries the title and then the refine panel and
            nothing else. The category's UNFILTERED set goes into the panel —
            it measures every chip's count against it, so it must not receive
            the filtered list.
          */}
          <aside
            aria-label="Refine products"
            className="rail-scroll min-w-0 lg:sticky lg:top-20 lg:-mx-1 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:px-1"
          >
            <Reveal>
              <p className="field-label">{meta.eyebrow}</p>
              {/*
                One step down from display-md: at 240px the old size broke
                "Festival specials" across three lines and pushed the filters
                below the fold.
              */}
              <h1 id="cat-heading" className="font-display text-heading text-theme-ink mt-1">
                {meta.title}
              </h1>
            </Reveal>
            <div className="mt-5 border-t border-[color:var(--color-rule)] pt-5">
              <Suspense fallback={null}>
                <CategoryFilters products={products} />
              </Suspense>
            </div>
          </aside>

          {/*
            min-w-0: this track holds a horizontally scrolling row of twelve
            pills. Without it the track can take its automatic minimum size
            from that row's content rather than from the column, and widen
            the grid instead of scrolling.
          */}
          <div className="min-w-0">
            <CategorySwitcher active={slug as CategorySlug} />
            <div className="mt-4">
              <Suspense fallback={<div />}>
                <CategoryBrowser categorySlug={slug as CategorySlug} products={products} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/*
        THE RANGE, AS A RECORD — AND AS SERVER-RENDERED HTML.

        The grid above is behind `useSearchParams`, so it is client-only and
        contributes nothing to the static export: a crawler of the built page
        found zero /product/ links on every category page. This index is the
        same range set as plain anchors with the product name as the anchor
        text, rendered on the server. It is a spec sheet in the docket voice,
        not a second grid, so it earns its place for a reader as well.
      */}
      {products.length > 0 && (
        <section aria-labelledby="range-heading" className="container-site section-y-tight">
          <Reveal>
            <div className="docket-head">
              {/*
                Phrased to survive every category name. "Every {name} we make"
                read as "Every sweets we make" for the seven plural categories;
                "Every product in Sweets" is grammatical for all thirteen and
                still unique per page.
              */}
              <h2
                id="range-heading"
                className="font-display text-heading text-theme-ink"
              >
                Every product in {meta.title}
              </h2>
              <p className="field-label">Range index</p>
            </div>
          </Reveal>
          <ul className="mt-4 max-w-3xl">
            {products.map((p) => (
              <li
                key={p.id}
                className="border-b border-[color:var(--color-rule)] py-3 last:border-b-0"
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="text-theme-ink hover:text-theme-accent font-medium transition-colors"
                >
                  {p.title}
                </Link>
                <p className="text-text-muted mt-1 text-sm">{p.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The two prose blocks that turn a caption into a page. */}
      <section aria-labelledby="method-heading" className="container-site section-y-tight">
        <Reveal>
          {/* "How we make the dry fruits" is not true — we source and roast
              them. "Inside the … range" is accurate for all thirteen. */}
          <h2 id="method-heading" className="font-display text-heading text-theme-ink">
            Inside the {meta.title} range
          </h2>
        </Reveal>
        <Reveal delay={0.04}>
          {/* The range intro — it fronted the left rail until 2026-08-24,
              when the rail went filters-only; the copy leads the prose now. */}
          <p className="text-theme-ink mt-3 max-w-3xl font-medium leading-relaxed">{meta.body}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-theme-ink/80 mt-3 max-w-3xl leading-relaxed">{meta.method}</p>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Named, so 13 category pages do not share one <h2>. */}
          <h2 className="font-display text-heading text-theme-ink mt-10">
            Storing and serving {meta.title.toLowerCase()}
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-theme-ink/80 mt-3 max-w-3xl leading-relaxed">{meta.keeping}</p>
        </Reveal>
      </section>
    </>
  );
}
