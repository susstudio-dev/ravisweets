/**
 * Metadata for the home page's Signature Moment image.
 * The image is curated against both the storefront imagery rubric AND the
 * signature-specific criteria in openspec/changes/app-polish-and-motion-depth/
 * specs/signature-home-moment/spec.md.
 *
 * Until production photography lands (photography-gating requirement in the
 * elevate-storefront-visual-experience change), this remains a stock placeholder
 * rendered with the "Dev only" watermark.
 */
export const SIGNATURE_MOMENT = {
  image: {
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1800&q=92&auto=format&fit=crop',
    alt: 'Qubani ka Meetha in a brass bowl, apricots glistening in saffron syrup, with saffron strands scattered across the rim',
    subject: 'Qubani ka Meetha — macro',
    dominant_palette: ['#fff4e3', '#c0592b', '#f29f5a', '#3a1e0c'],
  },
  rubric: {
    passed_on: '2026-04-24',
    source_url: 'https://unsplash.com/license',
    // Signature-specific criteria check:
    criteria_notes: {
      single_dominant_subject: 'Single bowl, single subject — pass',
      macro_or_shallow_dof: 'Macro framing — pass',
      warm_directional_light: 'Warm saffron/amber palette — pass',
      negative_space: 'Negative space bottom-right for the text overlay — pass',
    },
  },
  copy: {
    eyebrow_indic: 'ఖమ్మం',
    eyebrow_en: 'Our signature',
    headline: 'Qubani ka Meetha',
    headline_emphasis: 'slow-cooked the old way.',
    body: 'Four hours, one copper pan, apricots reduced in their own syrup. A Hyderabadi classic, made the slower way in our Khammam kitchen.',
    cta: { label: 'See how we make it', href: '/about' },
  },
} as const;
