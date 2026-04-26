'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  loadAllSiteContent,
  saveSiteContent,
  type EditorialBandHeading,
  type FooterContent,
  type HeroContent,
  type HomeTrust,
  type SignatureMomentContent,
} from '@/lib/supabase/site-content';
import { logAdminAction } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';

interface AllContent {
  hero: HeroContent;
  signature_moment: SignatureMomentContent;
  editorial_band_heading: EditorialBandHeading;
  footer: FooterContent;
  home_trust: HomeTrust;
}

const DEFAULTS: AllContent = {
  hero: {},
  signature_moment: {},
  editorial_band_heading: {},
  footer: {},
  home_trust: { cards: [] },
};

export function AdminContent() {
  const { configured } = useSession();
  const [state, setState] = useState<AllContent | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    void loadAllSiteContent().then((all) => {
      setState({
        hero: { ...DEFAULTS.hero, ...(all.hero ?? {}) },
        signature_moment: { ...DEFAULTS.signature_moment, ...(all.signature_moment ?? {}) },
        editorial_band_heading: {
          ...DEFAULTS.editorial_band_heading,
          ...(all.editorial_band_heading ?? {}),
        },
        footer: { ...DEFAULTS.footer, ...(all.footer ?? {}) },
        home_trust: { cards: all.home_trust?.cards ?? [] },
      });
    });
  }, []);

  async function save(key: keyof AllContent) {
    if (!state || !configured) {
      window.alert('Supabase not configured.');
      return;
    }
    setBusy(key);
    setSaved(null);
    const r = await saveSiteContent(key, state[key] as never);
    setBusy(null);
    if (!r.ok) {
      window.alert(`Save failed: ${r.reason}`);
      return;
    }
    await logAdminAction('save', 'site_content', key, null, state[key]);
    setSaved(key);
    window.setTimeout(() => setSaved(null), 1800);
  }

  if (!state) return <div className="h-8 w-32 animate-pulse rounded bg-theme-ink/10" />;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          Site copy
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Content
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          Edit hero, signature moment, editorial band, footer, and home trust cards. Changes
          propagate live (within ~3 seconds via Supabase Realtime) — no rebuild needed.
        </p>
      </header>

      <Section
        title="Hero"
        busy={busy === 'hero'}
        saved={saved === 'hero'}
        onSave={() => save('hero')}
      >
        <Grid>
          <Field label="Eyebrow (Indic / Telugu)">
            <Input
              value={state.hero.eyebrowIndic ?? ''}
              onChange={(v) => setState({ ...state, hero: { ...state.hero, eyebrowIndic: v } })}
            />
          </Field>
          <Field label="Eyebrow (English)">
            <Input
              value={state.hero.eyebrowEn ?? ''}
              onChange={(v) => setState({ ...state, hero: { ...state.hero, eyebrowEn: v } })}
            />
          </Field>
          <Field label="Headline" full>
            <Input
              value={state.hero.headline ?? ''}
              onChange={(v) => setState({ ...state, hero: { ...state.hero, headline: v } })}
            />
          </Field>
          <Field label="Body" full>
            <TextArea
              value={state.hero.body ?? ''}
              onChange={(v) => setState({ ...state, hero: { ...state.hero, body: v } })}
            />
          </Field>
          <Field label="Primary CTA label">
            <Input
              value={state.hero.primaryCtaLabel ?? ''}
              onChange={(v) =>
                setState({ ...state, hero: { ...state.hero, primaryCtaLabel: v } })
              }
            />
          </Field>
          <Field label="Primary CTA href">
            <Input
              value={state.hero.primaryCtaHref ?? ''}
              onChange={(v) =>
                setState({ ...state, hero: { ...state.hero, primaryCtaHref: v } })
              }
            />
          </Field>
          <Field label="Secondary CTA label">
            <Input
              value={state.hero.secondaryCtaLabel ?? ''}
              onChange={(v) =>
                setState({ ...state, hero: { ...state.hero, secondaryCtaLabel: v } })
              }
            />
          </Field>
          <Field label="Secondary CTA href">
            <Input
              value={state.hero.secondaryCtaHref ?? ''}
              onChange={(v) =>
                setState({ ...state, hero: { ...state.hero, secondaryCtaHref: v } })
              }
            />
          </Field>
        </Grid>
      </Section>

      <Section
        title="Signature moment"
        busy={busy === 'signature_moment'}
        saved={saved === 'signature_moment'}
        onSave={() => save('signature_moment')}
      >
        <Grid>
          <Field label="Eyebrow">
            <Input
              value={state.signature_moment.eyebrow ?? ''}
              onChange={(v) =>
                setState({
                  ...state,
                  signature_moment: { ...state.signature_moment, eyebrow: v },
                })
              }
            />
          </Field>
          <Field label="Image URL">
            <Input
              value={state.signature_moment.imageUrl ?? ''}
              onChange={(v) =>
                setState({
                  ...state,
                  signature_moment: { ...state.signature_moment, imageUrl: v },
                })
              }
            />
          </Field>
          <Field label="Headline" full>
            <Input
              value={state.signature_moment.headline ?? ''}
              onChange={(v) =>
                setState({
                  ...state,
                  signature_moment: { ...state.signature_moment, headline: v },
                })
              }
            />
          </Field>
          <Field label="Body" full>
            <TextArea
              value={state.signature_moment.body ?? ''}
              onChange={(v) =>
                setState({
                  ...state,
                  signature_moment: { ...state.signature_moment, body: v },
                })
              }
            />
          </Field>
        </Grid>
      </Section>

      <Section
        title="Editorial band heading"
        busy={busy === 'editorial_band_heading'}
        saved={saved === 'editorial_band_heading'}
        onSave={() => save('editorial_band_heading')}
      >
        <Grid>
          <Field label="Eyebrow">
            <Input
              value={state.editorial_band_heading.eyebrow ?? ''}
              onChange={(v) =>
                setState({
                  ...state,
                  editorial_band_heading: { ...state.editorial_band_heading, eyebrow: v },
                })
              }
            />
          </Field>
          <Field label="Headline">
            <Input
              value={state.editorial_band_heading.headline ?? ''}
              onChange={(v) =>
                setState({
                  ...state,
                  editorial_band_heading: { ...state.editorial_band_heading, headline: v },
                })
              }
            />
          </Field>
        </Grid>
      </Section>

      <Section
        title="Footer"
        busy={busy === 'footer'}
        saved={saved === 'footer'}
        onSave={() => save('footer')}
      >
        <Grid>
          <Field label="Tagline" full>
            <Input
              value={state.footer.tagline ?? ''}
              onChange={(v) => setState({ ...state, footer: { ...state.footer, tagline: v } })}
            />
          </Field>
          <Field label="FSSAI / GSTIN line" full>
            <Input
              value={state.footer.fssaiLine ?? ''}
              onChange={(v) =>
                setState({ ...state, footer: { ...state.footer, fssaiLine: v } })
              }
            />
          </Field>
          <Field label="Phone">
            <Input
              value={state.footer.phone ?? ''}
              onChange={(v) => setState({ ...state, footer: { ...state.footer, phone: v } })}
            />
          </Field>
          <Field label="Email">
            <Input
              value={state.footer.email ?? ''}
              onChange={(v) => setState({ ...state, footer: { ...state.footer, email: v } })}
            />
          </Field>
        </Grid>
      </Section>

      <Section
        title="Home trust cards"
        busy={busy === 'home_trust'}
        saved={saved === 'home_trust'}
        onSave={() => save('home_trust')}
      >
        <div className="flex flex-col gap-3">
          {state.home_trust.cards.map((card, i) => (
            <Grid key={i}>
              <Field label={`Card ${i + 1} title`}>
                <Input
                  value={card.title}
                  onChange={(v) => {
                    const next = [...state.home_trust.cards];
                    next[i] = { ...next[i]!, title: v };
                    setState({ ...state, home_trust: { cards: next } });
                  }}
                />
              </Field>
              <Field label="Body" full>
                <TextArea
                  value={card.body}
                  onChange={(v) => {
                    const next = [...state.home_trust.cards];
                    next[i] = { ...next[i]!, body: v };
                    setState({ ...state, home_trust: { cards: next } });
                  }}
                />
              </Field>
            </Grid>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  busy,
  saved,
  onSave,
  children,
}: {
  title: string;
  busy: boolean;
  saved: boolean;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-theme-ink">{title}</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent px-4 py-1.5 text-xs font-semibold text-[color:var(--theme-base)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
    />
  );
}

function TextArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
    />
  );
}
