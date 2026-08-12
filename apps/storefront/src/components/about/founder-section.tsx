'use client';

import { SlotImage } from '@/components/media/slot-image';
import { Reveal } from '@/components/motion/reveal';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import type { AboutFounder } from '@/lib/supabase/site-content';

/**
 * THE FOUNDER — the grandfather section on /about (owner request 2026-08-12).
 *
 * IT RENDERS NOTHING UNTIL THERE IS SOMETHING REAL TO SAY. No skeleton, no
 * "coming soon", no dashed plate where a face should be. This is a real
 * person's history: an invented biography would be the same failure as an
 * invented review, and the site's rule on that is absolute.
 *
 * The gate is the COPY, not the photo. A story with no photograph is a section
 * worth having — it just runs full width instead of beside a plate. A
 * photograph with no story is not, so the photo alone will not open it.
 *
 * ── WHY THIS IS CLIENT-RENDERED, AND WHAT TO DO ABOUT IT ───────────────────
 * The copy resolves from the `about_founder` site_content row, so it reaches
 * the page after hydration and is ABSENT FROM THE STATIC HTML. For a heritage
 * story — the single most linkable thing on this site — that is a real SEO
 * cost. It is accepted only while the words are still being decided, because
 * the alternative is a developer round-trip for every edit.
 *
 * ONCE THE COPY IS SETTLED, promote it into FOUNDER_FALLBACK below. The hero
 * uses exactly this shape (db ?? code default): the default ships in the HTML
 * and ranks, the database row still overrides it live. That is the finished
 * state of this component, not an optimisation to consider later.
 */
const FOUNDER_FALLBACK: AboutFounder = {};

function hasContent(f: AboutFounder): boolean {
  return Boolean(f.name?.trim() || f.story?.trim());
}

export function FounderSection() {
  const { aboutFounder } = useSiteContent();
  const founder: AboutFounder = { ...FOUNDER_FALLBACK, ...(aboutFounder ?? {}) };

  if (!hasContent(founder)) return null;

  const paragraphs = (founder.story ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const heading = founder.name?.trim() || 'The founder';

  return (
    <section aria-labelledby="founder-heading" className="border-y border-[color:var(--color-border)]">
      <div className="container-site section-y grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <Reveal>
          <div className="docket overflow-hidden">
            {/*
              alt falls back to the name rather than a description of the
              person — a screen reader should hear who this is, and we cannot
              describe a photograph we have never seen.
            */}
            <SlotImage
              slot="about.founder"
              fallbackAlt={heading}
              sizes="(min-width: 768px) 420px, 90vw"
              className="bg-theme-glow/20 aspect-[4/5] border-b border-[color:var(--color-border)]"
            />
            <dl className="p-5">
              <div className="field-row">
                <dt className="field-label">{founder.role?.trim() || 'Founder'}</dt>
                <dd className="field-value text-theme-ink text-right text-sm">{heading}</dd>
              </div>
              {founder.years?.trim() && (
                <div className="field-row">
                  <dt className="field-label">Years</dt>
                  <dd className="field-value text-theme-ink text-sm">{founder.years}</dd>
                </div>
              )}
            </dl>
          </div>
        </Reveal>

        <div>
          <Reveal>
            {founder.role?.trim() && <p className="field-label">{founder.role}</p>}
            <h2
              id="founder-heading"
              className="font-display text-display-md text-theme-ink mt-2 leading-[1.05]"
            >
              {heading}
            </h2>
          </Reveal>

          {paragraphs.length > 0 && (
            <Reveal delay={0.08}>
              <div className="mt-5 flex flex-col gap-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-theme-ink/75 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          )}

          {founder.quote?.trim() && (
            <Reveal delay={0.14}>
              <figure className="mt-7 border-l-2 border-[color:var(--color-rule)] pl-6">
                <blockquote className="font-display text-theme-ink text-xl leading-snug md:text-2xl">
                  &ldquo;{founder.quote.trim()}&rdquo;
                </blockquote>
                <figcaption className="text-text-muted mt-3 text-sm">— {heading}</figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
