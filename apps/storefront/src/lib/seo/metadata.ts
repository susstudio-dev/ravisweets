/**
 * SEO METADATA, BUILT TO A BUDGET RATHER THAN COUNTED BY HAND.
 *
 * A Screaming Frog crawl of the live site returned, among other things: 16
 * titles under 30 characters, 2 over 60, 14 meta descriptions over 155, and
 * 32 of 37 pages with no canonical at all. Every one of those is a number
 * problem — a limit that a person writing a `title:` string in a page file
 * cannot see and will not check. So the limits live here, and the helpers
 * below make a string that satisfies them by construction.
 *
 * The rules encoded, all Google's published/observed truncation points:
 *
 *   title        30–60 characters INCLUDING the `| Ravi Sweets` the root
 *                layout template appends. That leaves a 46-character budget
 *                for what a page actually passes to `title:`.
 *   description  70–155 characters. Under 70 wastes the snippet; over 155 is
 *                truncated mid-sentence.
 *   canonical    every indexable page declares one, self-referencing, so
 *                Google is never left to pick a version.
 */

/** Appended by the `title.template` in app/layout.tsx. */
const TITLE_SUFFIX = ' | Ravi Sweets';

export const TITLE_MIN = 30;
export const TITLE_MAX = 60;
export const DESC_MIN = 70;
export const DESC_MAX = 155;

/**
 * What `seoDescription` tops up TOWARDS, as distinct from the 70-character
 * hard floor it must clear.
 *
 * Google also has a ~400-pixel lower bound, and 70 characters of lowercase
 * prose with a lot of spaces falls under it — the privacy policy landed on
 * exactly 70 and was still flagged as too short by width. Aiming at 110 clears
 * both bounds with room to spare, and a 110–155 character snippet is simply a
 * better one: it has space for a benefit as well as a summary.
 */
const DESC_TARGET = 110;

/** Characters a page's own `title:` may use before the suffix breaks 60. */
export const TITLE_BUDGET = TITLE_MAX - TITLE_SUFFIX.length; // 46

/**
 * Pick the richest title that still fits.
 *
 * Pass a bare subject plus progressively less important enrichments; the
 * longest prefix of them that fits the budget is used. This is how a page gets
 * "Kaju Katli — Cashew Barfi, Made Fresh" instead of either a bare "Kaju
 * Katli" (under 30 once the suffix lands) or a truncated sentence.
 *
 * The subject is never dropped, even if it alone busts the budget — a title
 * that names the wrong thing is worse than a long one. `shortenTitle` handles
 * that case for the genuinely long subjects (the festival taglines).
 */
export function seoTitle(subject: string, ...enrichments: string[]): string {
  let out = subject.trim();
  for (const extra of enrichments) {
    if (!extra) continue;
    const next = `${out} — ${extra.trim()}`;
    if (next.length <= TITLE_BUDGET) {
      out = next;
      continue;
    }
    /*
     * DEGRADE, DO NOT DROP.
     *
     * This used to `break` when an enrichment did not fit, which silently
     * discarded it and left the bare subject — and a bare subject is exactly
     * the "under 30 characters" finding this helper exists to prevent. Six
     * category titles regressed that way on the first pass: a 35-character
     * hook against a 33-character allowance produced no hook at all.
     * Truncating at a word boundary keeps most of the phrase and always
     * lands inside the budget.
     */
    out = shortenTitle(out, extra.trim());
    break;
  }
  return out;
}

/**
 * Build a description from sentences, taking as many whole ones as fit.
 *
 * Whole sentences only: a description cut at 155 characters mid-clause reads
 * as broken in the SERP, which costs more click-through than the missing words
 * gain. If the first sentence alone is over budget it is trimmed at the last
 * word boundary and closed with an ellipsis — the only case where a cut is
 * unavoidable.
 *
 * `fallbacks` are appended (in order, whole-sentence, while they fit) only if
 * the result is still under the 70-character floor, so a terse product blurb
 * gets topped up with something true rather than padded with keywords.
 */
export function seoDescription(source: string, ...fallbacks: string[]): string {
  const sentences = splitSentences(source);
  let out = '';
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > DESC_MAX) break;
    out = next;
  }

  if (!out) {
    // A single sentence longer than the whole budget. Cut at a word boundary.
    const cut = source.slice(0, DESC_MAX - 1);
    out = `${cut.slice(0, cut.lastIndexOf(' '))}…`;
  }

  for (const f of fallbacks) {
    if (out.length >= DESC_TARGET) break;
    const next = `${out} ${f.trim()}`;
    if (next.length > DESC_MAX) continue;
    out = next;
  }

  return out;
}

/**
 * Sentence splitter that keeps terminators and does not break on the
 * abbreviations and decimals this catalogue actually contains — "1 kg.",
 * "No. 3", "₹1,299." — by requiring a following space + capital/quote.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z₹"'“‘])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Trim an already-composed title down to the budget at a word boundary.
 *
 * Used for the festival pages, whose titles are `Name — Editorial tagline`
 * and ran to 96 characters. The name is always kept; only the tagline is cut.
 */
export function shortenTitle(subject: string, tagline?: string): string {
  if (!tagline) return subject;
  const full = `${subject} — ${tagline}`;
  if (full.length <= TITLE_BUDGET) return full;
  const room = TITLE_BUDGET - subject.length - 3; // ' — '
  if (room < 12) return subject; // no room for a meaningful tagline
  const cut = tagline.slice(0, room);
  const atWord = cut.slice(0, cut.lastIndexOf(' '));
  return `${subject} — ${(atWord || cut).replace(/[,;:—-]$/, '')}`;
}
