'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  EMPTY_PAGE_MEDIA,
  FESTIVAL_SLUGS,
  getSlot,
  parsePageMedia,
  setSlot,
  type ImageRef,
  type PageMedia,
  type SlotPath,
} from '@/lib/content/page-media';
import { saveSiteContent } from '@/lib/supabase/site-content';
import { useSiteContent } from '@/lib/supabase/site-content-context';
import { MediaField } from './media-picker';
import { VersionsPanel } from './versions-panel';

/**
 * The Photos tab — every page-level image slot, grouped by the public page
 * it appears on (furor's IA lesson: sections carry the owner's names, not
 * schema paths). Edits are local until the sticky SaveBar writes the whole
 * page_media row; Realtime then carries the swap to live browsers in seconds.
 */

/** 'raksha-bandhan' → 'Raksha Bandhan' */
function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function AdminPhotos() {
  const { pageMedia, loading } = useSiteContent();
  const [media, setMedia] = useState<PageMedia>(EMPTY_PAGE_MEDIA);
  // Seed local state from context exactly ONCE, when the first load lands.
  // Later Realtime refreshes must never clobber unsaved local edits (furor's
  // stale-clobber lesson) — after that first seed, context changes are ignored
  // until the owner's own save re-aligns the two.
  const [seeded, setSeeded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seeded || loading) return;
    setMedia(pageMedia);
    setSeeded(true);
  }, [seeded, loading, pageMedia]);

  function edit(slot: SlotPath, ref: ImageRef) {
    setMedia((m) => setSlot(m, slot, ref));
    setDirty(true);
    setSavedMessage(null);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setSavedMessage(null);
    setError(null);
    const r = await saveSiteContent('page_media', media);
    setSaving(false);
    if (!r.ok) {
      setError(r.reason ?? 'unknown');
      return;
    }
    // Local state IS what was just saved — clearing dirty re-seeds the
    // baseline without touching the slots.
    setDirty(false);
    setSavedMessage('Saved ✓ — live on the site in a few seconds.');
  }

  /** Restores re-validate through the schema, then become the local baseline. */
  async function restore(data: unknown): Promise<boolean> {
    const restored = parsePageMedia(data);
    const r = await saveSiteContent('page_media', restored);
    if (r.ok) {
      setMedia(restored);
      setDirty(false);
      setSavedMessage(null);
      setError(null);
    }
    return r.ok;
  }

  function field(
    slot: SlotPath,
    label: string,
    opts: { hint?: string; kind?: 'general' | 'store' | 'festival' } = {},
  ) {
    return (
      <MediaField
        label={label}
        hint={opts.hint}
        kind={opts.kind}
        value={getSlot(media, slot)}
        onChange={(ref) => edit(slot, ref)}
      />
    );
  }

  if (!seeded) return <div className="bg-theme-ink/10 h-8 w-32 animate-pulse rounded" />;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
          Page photos
        </p>
        <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">Photos</h1>
        <p className="text-theme-ink/65 mt-1 text-sm">
          Each section below is a page on your site. Swap a photo, then Save — it goes live in
          seconds, no rebuild needed.
        </p>
      </header>

      {/* No field on purpose — the card's photos ride the bestseller products. */}
      <Section
        title="Home — festival card"
        orientation="The three little photos on the home-page card come from your bestseller products — edit them under Products."
      />

      <Section title="About page" orientation="The photo dockets on the About page.">
        <div className="grid gap-5 lg:grid-cols-2">
          {field('about.portrait', 'Top plate', {
            hint: 'Top docket on the About page',
            kind: 'general',
          })}
          {field('about.kitchen', 'Second plate', {
            hint: 'Second docket, beside the process story',
            kind: 'general',
          })}
          {field('about.founder', 'Founder photo', {
            hint: 'His photograph. The founder section stays hidden on the site until this or his story is filled in — under Content → Founder.',
            kind: 'general',
          })}
        </div>
      </Section>

      <Section title="Stores page" orientation="The photo on the store-visit page.">
        {field('stores.storefront', 'Shop front photo', { kind: 'store' })}
      </Section>

      <Section
        title="Corporate hampers"
        orientation="The three tier photos on the corporate page."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {field('corporate.essence', 'Essence', {
            hint: 'Thumbnail on the corporate rate card',
            kind: 'general',
          })}
          {field('corporate.premium', 'Premium', {
            hint: 'Thumbnail on the corporate rate card',
            kind: 'general',
          })}
          {field('corporate.grande', 'Grande', {
            hint: 'Thumbnail on the corporate rate card',
            kind: 'general',
          })}
        </div>
      </Section>

      <Section
        title="Festival pages"
        orientation="The hero photo at the top of each festival page."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {FESTIVAL_SLUGS.map((slug) => (
            <div key={slug}>
              {field(`festivals.${slug}`, titleCaseSlug(slug), { kind: 'festival' })}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Brand" orientation="Your logo, shown in the header and the hero seal.">
        {field('brand.logo', 'Logo', {
          hint: 'Header + hero seal. SVG or PNG with transparent background works best.',
          kind: 'general',
        })}
      </Section>

      <div className="bg-surface-elevated shadow-lifted sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-border)] px-5 py-3">
        <div className="min-w-0 text-sm">
          {error ? (
            <p className="font-medium text-red-700">Save failed: {error}</p>
          ) : savedMessage ? (
            <p className="font-medium text-green-700">{savedMessage}</p>
          ) : (
            <p className="text-theme-ink/55">
              {dirty ? 'You have unsaved photo changes.' : 'All photo changes are saved.'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving}
          className="bg-theme-accent hover:shadow-soft inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-[color:var(--theme-base)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      <VersionsPanel contentKey="page_media" onRestore={restore} />
    </div>
  );
}

function Section({
  title,
  orientation,
  children,
}: {
  title: string;
  orientation: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5">
      <h2 className="font-display text-theme-ink text-lg">{title}</h2>
      <p className="text-theme-ink/55 mt-0.5 text-[12px]">{orientation}</p>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
