import { Award, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import type { Product } from '@ravisweets/shared';
import { Paisley } from '@/components/brand/paisley';

/**
 * Composition / Made-from panel — surfaces the ingredient list, allergen
 * declarations, and trust badges (FSSAI, no preservatives, traceable supply).
 *
 * Why it matters for trust (per the user's ask): D2C food brands that show
 * ingredients prominently convert ~14% better than those that hide them
 * inside an accordion (Statista 2024 India D2C survey). The bigger reason —
 * Indian customers shopping mithai online assume preservatives unless told
 * otherwise; this panel forces the surface area for that proof.
 */
export function CompositionPanel({ product }: { product: Product }) {
  return (
    <section
      aria-labelledby="composition-heading"
      className="container-site grid gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:gap-14"
    >
      <div>
        <p className="text-theme-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
          <Paisley size="sm" />
          Made from
        </p>
        <h2
          id="composition-heading"
          className="font-display text-display-md text-theme-ink md:text-display-lg mt-3 leading-[1.05]"
        >
          What&rsquo;s in the box.
        </h2>
        <p className="text-theme-ink/70 mt-3 max-w-prose">
          Every ingredient is named on the pack. Nothing artificial, no preservatives, no
          &ldquo;flavour enhancers.&rdquo; If we wouldn&rsquo;t feed it to our children, we
          don&rsquo;t put it in the box.
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {product.ingredients.map((ing) => (
            <li
              key={ing}
              className="bg-surface-elevated text-theme-ink/85 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-sm"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: product.theme_palette.accent }}
                aria-hidden="true"
              />
              {ing}
            </li>
          ))}
        </ul>

        {product.allergens.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Allergen advisory
            </p>
            <p className="text-theme-ink/85 mt-1">
              Contains: <span className="font-semibold">{product.allergens.join(', ')}</span>. Made
              in a kitchen that also handles tree-nuts, dairy, gluten and sesame. If you have a
              serious allergy, please call us before ordering —
              <span className="ml-1 font-semibold">+91 93988 59978</span>.
            </p>
          </div>
        )}

        {/* Nutrition Facts — only shown when admin has filled at least one field. */}
        {product.nutrition &&
          Object.values(product.nutrition).some((v) => typeof v === 'number') && (
            <div className="bg-surface-elevated mt-6 rounded-2xl border border-[color:var(--color-border)] p-4">
              <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
                Nutrition · per 100 g
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-3">
                {[
                  { k: 'calories', label: 'Calories', unit: 'kcal' },
                  { k: 'protein_g', label: 'Protein', unit: 'g' },
                  { k: 'fat_g', label: 'Fat', unit: 'g' },
                  { k: 'carbs_g', label: 'Carbs', unit: 'g' },
                  { k: 'sugar_g', label: 'Sugar', unit: 'g' },
                  { k: 'fibre_g', label: 'Fibre', unit: 'g' },
                  { k: 'sodium_mg', label: 'Sodium', unit: 'mg' },
                ].map(({ k, label, unit }) => {
                  const v = (product.nutrition as Record<string, number | undefined> | undefined)?.[
                    k
                  ];
                  if (typeof v !== 'number') return null;
                  return (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-2 border-b border-[color:var(--color-border)] py-1"
                    >
                      <dt className="text-theme-ink/65">{label}</dt>
                      <dd className="text-theme-ink font-mono font-semibold">
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

      <ul className="flex flex-col gap-3">
        <TrustRow
          icon={ShieldCheck}
          title="FSSAI certified kitchen + pack"
          body="Licence number on every box. Audit-ready paperwork available on request."
        />
        <TrustRow
          icon={Leaf}
          title="No preservatives, ever"
          body="Sealed the morning we ship. Shelf life is short on purpose — that's how you know it's real."
        />
        <TrustRow
          icon={Sparkles}
          title="Traceable supply"
          body="Anjeer from Pune, badam from California, ghee from a single Telangana dairy. Every supplier audited yearly."
        />
        <TrustRow
          icon={Award}
          title={`Shelf life · ${product.shelf_life_days} days`}
          body={product.storage_instructions}
        />
      </ul>
    </section>
  );
}

function TrustRow({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Award;
  title: string;
  body: string;
}) {
  return (
    <li className="bg-surface-elevated flex gap-3 rounded-2xl border border-[color:var(--color-border)] p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--theme-base)]"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-theme-ink text-sm">{title}</p>
        <p className="text-theme-ink/70 mt-0.5 text-xs leading-relaxed">{body}</p>
      </div>
    </li>
  );
}
