import { Marquee } from '@/components/motion/marquee';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';

const LINES = [
  { who: 'Hyderabad Times', what: '"The city’s most persuasive box of sweets."' },
  { who: 'The Hindu', what: '"A Nizami table, quietly modernised."' },
  { who: 'Preeti, Jubilee Hills', what: '"My Diwali list now starts and ends here."' },
  { who: 'Kiran, Bengaluru', what: '"Flew perfectly. Arrived like it was hand-delivered."' },
  { who: 'Mint Lounge', what: '"A gift that actually feels like one."' },
  { who: 'Ananya, Gurgaon', what: '"I ordered once for Raksha Bandhan. Now I order monthly."' },
  { who: 'Forbes India', what: '"Heritage without the heaviness."' },
];

export function PressMarquee() {
  return (
    <section
      aria-label="Press and customers"
      className="relative border-y border-[color:var(--color-border)] bg-[color:var(--theme-ink)]/[0.03] py-10"
    >
      <Reveal className="container-site mb-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
          <Paisley size="sm" />
          In kitchens. In press. In our inbox.
        </p>
      </Reveal>

      <Marquee speed={30}>
        {LINES.map((l) => (
          <div
            key={l.who}
            className="flex items-center gap-5 whitespace-nowrap text-theme-ink/80"
          >
            <span className="font-display text-lg italic">{l.what}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
              — {l.who}
            </span>
            <Paisley size="sm" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
