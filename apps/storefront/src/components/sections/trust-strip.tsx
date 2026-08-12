import { Award, Clock4, Leaf, Truck } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

/**
 * THE HOUSE RULES, at a glance.
 *
 * Replaces the four-row spec <dl> (~85 words of notes) on the home page with
 * four ruled cells a customer reads in three seconds — the warm pivot's
 * "little to read, everything visible" rule. Every claim survives from the
 * old SPEC table and is one PRODUCT.md substantiates; nothing new is claimed.
 *
 * Ruled cells on the ground, not icon cards: the proof-block grammar the
 * hero already uses, widened to section scale.
 *
 * THE COTTAGE VOICE IS GONE FROM HERE (owner, 2026-08-12). The third cell read
 * "One family kitchen / The same family at the kadai since 1983" and the second
 * said "Morning batch" — family, kitchen and batch all sell smallness, and the
 * owner's position is that the brand is not small. The CLAIMS themselves are
 * unchanged in substance: cell three still says "we have been doing this since
 * 1983", it just no longer says who is holding the ladle. Nothing new is
 * asserted here that PRODUCT.md does not substantiate; do not add any.
 */
const CLAIMS = [
  {
    icon: Leaf,
    value: 'No preservatives, ever',
    note: 'Made to be eaten this week, not this month.',
  },
  {
    icon: Clock4,
    value: 'Same-day dispatch',
    note: 'Made in the morning, on the evening courier.',
  },
  {
    icon: Award,
    value: 'Since 1983',
    note: 'The same recipes, unchanged.',
  },
  {
    icon: Truck,
    value: 'Delivered across India',
    note: 'Temperature-controlled, fresh on arrival.',
  },
] as const;

export function TrustStrip() {
  return (
    <section aria-label="Why order from Ravi Sweets" className="container-site section-y-tight">
      <Reveal>
        <ul className="grid grid-cols-1 border-y border-[color:var(--color-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {CLAIMS.map(({ icon: Icon, value, note }, i) => (
            <li
              key={value}
              className={
                'flex items-start gap-3.5 px-1 py-5 ' +
                (i > 0
                  ? 'border-t border-[color:var(--color-border)] sm:border-t-0 ' +
                    (i % 2 === 1 ? 'sm:border-l sm:pl-6 ' : '') +
                    (i >= 2 ? 'sm:border-t lg:border-t-0 ' : '') +
                    'lg:border-l lg:pl-6'
                  : '')
              }
            >
              <Icon className="text-theme-accent mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-display text-[15px] font-semibold leading-snug">{value}</p>
                <p className="text-text-muted mt-1 text-[13px] leading-relaxed">{note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
