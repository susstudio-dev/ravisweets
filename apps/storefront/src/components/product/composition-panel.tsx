import type { Product } from '@ravisweets/shared';

/**
 * THE COMPOSITION RECORD.
 *
 * Transparency is the thesis of this product (PRODUCT.md principle 2), so the
 * ingredient list, the allergen declaration and the pack facts are set as the
 * record they are — ruled label/value rows with every recorded value in the
 * typed face — rather than icon cards. Every claim here already exists on the
 * pack copy; none is invented, and "certified" is never asserted.
 */

const NUTRITION_ROWS = [
  { k: 'calories', label: 'Calories', unit: 'kcal' },
  { k: 'protein_g', label: 'Protein', unit: 'g' },
  { k: 'fat_g', label: 'Fat', unit: 'g' },
  { k: 'carbs_g', label: 'Carbs', unit: 'g' },
  { k: 'sugar_g', label: 'Sugar', unit: 'g' },
  { k: 'fibre_g', label: 'Fibre', unit: 'g' },
  { k: 'sodium_mg', label: 'Sodium', unit: 'mg' },
] as const;

export function CompositionPanel({ product }: { product: Product }) {
  const hasNutrition =
    product.nutrition && Object.values(product.nutrition).some((v) => typeof v === 'number');

  return (
    <section aria-labelledby="composition-heading" className="container-site section-y-tight">
      <div className="docket-head">
        {/*
          NAMES THE PRODUCT, NOT "THE BOX".
          "What's in the box." was identical on all 83 product pages, which is
          how it turned up as the site's largest duplicate-H2 group in the
          crawl. A section heading is a ranking signal for the section it
          heads; repeated verbatim it signals that 83 pages cover one topic.
          Interpolating the product name makes each one true and unique, and
          costs nothing editorially — the docket voice is unchanged.
        */}
        <h2
          id="composition-heading"
          className="font-display text-display-md text-theme-ink leading-[1.05]"
        >
          What&rsquo;s in {product.title}.
        </h2>
        <p className="field-label">Composition record</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-14">
        <div>
          <p className="text-theme-ink/70 max-w-prose">
            Every ingredient is named on the pack. Nothing artificial, no preservatives, no
            &ldquo;flavour enhancers.&rdquo; If we wouldn&rsquo;t feed it to our children, we
            don&rsquo;t put it in the box.
          </p>

          <p className="field-label mt-6">Ingredients</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {product.ingredients.map((ing) => (
              <li
                key={ing}
                className="bg-surface-elevated text-theme-ink/85 inline-flex items-center gap-1.5 rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm"
              >
                <span
                  className="h-1.5 w-1.5 rotate-45"
                  style={{ backgroundColor: product.theme_palette.accent }}
                  aria-hidden="true"
                />
                {ing}
              </li>
            ))}
          </ul>

          {product.allergens.length > 0 && (
            <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
              <p className="field-label text-amber-700">Allergen advisory</p>
              <p className="text-theme-ink/85 mt-1">
                Contains: <span className="font-semibold">{product.allergens.join(', ')}</span>. Made
                in a kitchen that also handles tree-nuts, dairy, gluten and sesame. If you have a
                serious allergy, please call us before ordering —
                <span className="field-value ml-1 font-bold">+91 93988 59978</span>.
              </p>
            </div>
          )}

          {/* Nutrition — only shown when admin has filled at least one field. */}
          {hasNutrition && (
            <div className="docket mt-6 p-4 md:p-5">
              <p className="field-label">Nutrition · per 100 g</p>
              <dl className="mt-1 grid grid-cols-2 gap-x-6 md:grid-cols-3">
                {NUTRITION_ROWS.map(({ k, label, unit }) => {
                  const v = (product.nutrition as Record<string, number | undefined> | undefined)?.[
                    k
                  ];
                  if (typeof v !== 'number') return null;
                  return (
                    <div key={k} className="field-row">
                      <dt className="field-label">{label}</dt>
                      <dd className="field-value text-theme-ink text-sm font-bold">
                        {v}
                        <span className="text-theme-ink/55 ml-0.5 text-[10px] font-normal">
                          {unit}
                        </span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="text-theme-ink/55 mt-2 text-[10px]">
                Values are typical per the most recent batch. Actual contents may vary ±5% within
                FSSAI tolerance.
              </p>
            </div>
          )}
        </div>

        {/* THE PACK RECORD. The trust claims, stated as the fields they are. */}
        <div>
          <dl className="docket px-5 py-2">
            <div className="field-row">
              <dt className="field-label">Preservatives</dt>
              <dd className="field-value text-theme-ink text-sm font-bold">NIL</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Shelf life</dt>
              <dd className="field-value text-theme-ink text-sm font-bold">
                {product.shelf_life_days} DAYS
              </dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Storage</dt>
              <dd className="field-value text-right text-sm">{product.storage_instructions}</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Country of origin</dt>
              <dd className="field-value text-right text-sm">India</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">FSSAI</dt>
              <dd className="field-value text-right text-sm">Licence no. on every box</dd>
            </div>
            <div className="field-row">
              <dt className="field-label">Supply</dt>
              <dd className="field-value text-right text-sm">Suppliers audited yearly</dd>
            </div>
          </dl>
          <p className="text-theme-ink/70 mt-4 text-sm leading-relaxed">
            Sealed the morning we ship. Shelf life is short on purpose — that&rsquo;s how you know
            it&rsquo;s real. Audit-ready paperwork available on request.
          </p>
          <p className="text-theme-ink/70 mt-2 text-sm leading-relaxed">
            Anjeer from Pune, badam from California, ghee from a single Telangana dairy.
          </p>
        </div>
      </div>
    </section>
  );
}
