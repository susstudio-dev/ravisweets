'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Power, Sparkles, X } from 'lucide-react';
import { activateTheme, listThemes, upsertTheme, type ThemePreset } from '@/lib/supabase/themes';
import { logAdminAction } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';

const FALLBACK_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Default — Khammam warm cream',
    active: true,
    palette: { base: '#fdf6ec', accent: '#8a5a10', glow: '#d4a96b', ink: '#2a1a04', grainOpacity: 0.05 },
    hero: {
      eyebrow: 'Khammam · Telangana',
      headline: 'The sweetness of Telangana, slow-cooked in Khammam.',
      body: 'Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets, namkeens, and gift hampers.',
      ctaLabel: 'Shop Hyderabadi specials',
      ctaHref: '/category/hyderabadi-specials',
      imageUrl: 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
    },
    bannerText: null,
  },
  {
    id: 'diwali',
    name: 'Diwali — saffron & brass',
    active: false,
    palette: { base: '#fff4e3', accent: '#c0592b', glow: '#f29f5a', ink: '#3a1e0c', grainOpacity: 0.06 },
    hero: {
      eyebrow: 'Diwali 2026',
      headline: 'Light up the table.',
      body: 'Premium hampers, festival specials, and a free brass diya with every Grande box.',
      ctaLabel: 'Shop Diwali hampers',
      ctaHref: '/category/gift-hampers',
      imageUrl: 'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png',
    },
    bannerText: 'Free Diwali shipping above ₹1499',
  },
  {
    id: 'eid',
    name: 'Eid — date amber',
    active: false,
    palette: { base: '#fff4e3', accent: '#a56a0f', glow: '#e9ad4a', ink: '#2a1a04', grainOpacity: 0.06 },
    hero: {
      eyebrow: 'Eid al-Fitr',
      headline: 'A platter worth the long day.',
      body: 'Sheer Khurma, Double ka Meetha, Khubani — the Hyderabadi Eid table, in one box.',
      ctaLabel: 'Shop the Eid box',
      ctaHref: '/product/eid-signature-box',
      imageUrl: 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png',
    },
    bannerText: null,
  },
];

export function AdminThemes() {
  const { configured } = useSession();
  const [themes, setThemes] = useState<ThemePreset[] | null>(null);
  const [editing, setEditing] = useState<ThemePreset | null>(null);

  async function load() {
    if (configured) {
      const live = await listThemes();
      setThemes(live.length > 0 ? live : FALLBACK_PRESETS);
    } else {
      setThemes(FALLBACK_PRESETS);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  async function activate(t: ThemePreset) {
    if (!configured) {
      window.alert('Supabase not configured.');
      return;
    }
    const r = await activateTheme(t.id);
    if (!r.ok) {
      window.alert(`Activate failed: ${r.reason}`);
      return;
    }
    await logAdminAction('activate', 'theme_preset', t.id, null, { active: true });
    await load();
  }

  async function save(next: ThemePreset) {
    if (!configured) return;
    const r = await upsertTheme(next);
    if (!r.ok) {
      window.alert(`Save failed: ${r.reason}`);
      return;
    }
    await logAdminAction('upsert', 'theme_preset', next.id, null, next);
    setEditing(null);
    await load();
  }

  if (!themes) {
    return <div className="h-8 w-32 animate-pulse rounded bg-theme-ink/10" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          Brand
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Themes
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          {configured
            ? 'Live from Supabase. Activating a different preset writes the active flag and (Phase 3) triggers a storefront rebuild webhook.'
            : 'Showing demo presets. Connect Supabase to manage real themes.'}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t) => (
          <article
            key={t.id}
            className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold text-theme-ink">{t.name}</h2>
                <p className="font-mono text-[11px] text-theme-ink/55">/{t.id}</p>
              </div>
              {t.active && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Active
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-1.5">
              {Object.entries(t.palette).map(([key, value]) =>
                typeof value === 'string' ? (
                  <div
                    key={key}
                    title={`${key} ${value}`}
                    className="h-10 flex-1 rounded-md ring-1 ring-[color:var(--color-border)]"
                    style={{ backgroundColor: value }}
                  />
                ) : null,
              )}
            </div>

            <p className="mt-4 line-clamp-2 text-xs text-theme-ink/65">{t.hero.headline}</p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => activate(t)}
                disabled={t.active || !configured}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-theme-accent px-4 py-2 text-xs font-semibold text-[color:var(--theme-base)] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Power className="h-3.5 w-3.5" aria-hidden="true" />
                {t.active ? 'Currently active' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(t)}
                disabled={!configured}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-2 text-xs font-semibold text-theme-ink/85 transition-colors hover:border-theme-accent hover:text-theme-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <ThemeForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function ThemeForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: ThemePreset;
  onCancel: () => void;
  onSave: (t: ThemePreset) => Promise<void>;
}) {
  const [t, setT] = useState<ThemePreset>(initial);
  const [busy, setBusy] = useState(false);

  function updateHero<K extends keyof ThemePreset['hero']>(
    key: K,
    value: ThemePreset['hero'][K],
  ) {
    setT((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  }
  function updatePalette<K extends keyof ThemePreset['palette']>(
    key: K,
    value: ThemePreset['palette'][K],
  ) {
    setT((prev) => ({ ...prev, palette: { ...prev.palette, [key]: value } }));
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-lifted"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-theme-ink">
          <Sparkles className="mr-2 inline h-5 w-5 text-theme-accent" aria-hidden="true" />
          {t.name}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="rounded-full p-1.5 text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await onSave(t);
          setBusy(false);
        }}
      >
        <Field label="Name">
          <input
            type="text"
            required
            value={t.name}
            onChange={(e) => setT((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          />
        </Field>

        <fieldset className="rounded-xl border border-[color:var(--color-border)] p-4">
          <legend className="px-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
            Palette
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Base" value={t.palette.base} onChange={(v) => updatePalette('base', v)} />
            <ColorField label="Accent" value={t.palette.accent} onChange={(v) => updatePalette('accent', v)} />
            <ColorField label="Glow" value={t.palette.glow} onChange={(v) => updatePalette('glow', v)} />
            <ColorField label="Ink" value={t.palette.ink} onChange={(v) => updatePalette('ink', v)} />
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-[color:var(--color-border)] p-4">
          <legend className="px-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
            Hero copy
          </legend>
          <div className="flex flex-col gap-3">
            <Field label="Eyebrow">
              <input
                type="text"
                value={t.hero.eyebrow}
                onChange={(e) => updateHero('eyebrow', e.target.value)}
                className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
            </Field>
            <Field label="Headline">
              <input
                type="text"
                value={t.hero.headline}
                onChange={(e) => updateHero('headline', e.target.value)}
                className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
            </Field>
            <Field label="Body">
              <textarea
                rows={3}
                value={t.hero.body}
                onChange={(e) => updateHero('body', e.target.value)}
                className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CTA label">
                <input
                  type="text"
                  value={t.hero.ctaLabel}
                  onChange={(e) => updateHero('ctaLabel', e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
              </Field>
              <Field label="CTA href">
                <input
                  type="text"
                  value={t.hero.ctaHref}
                  onChange={(e) => updateHero('ctaHref', e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 font-mono text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
              </Field>
            </div>
            <Field label="Banner text (optional)">
              <input
                type="text"
                value={t.bannerText ?? ''}
                onChange={(e) => setT((p) => ({ ...p, bannerText: e.target.value || null }))}
                className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
            </Field>
          </div>
        </fieldset>

        <div className="flex items-center justify-end gap-2 border-t border-[color:var(--color-border)] pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[color:var(--color-border)] px-5 py-2 text-sm font-semibold text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-theme-accent px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
        <p className="text-[11px] text-theme-ink/55">
          Theme edits write to <code>theme_presets</code>. Storefront rebuild via webhook lands in
          Phase 3 — until then, the active theme is consumed at the next manual rebuild.
        </p>
      </form>
    </aside>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-[color:var(--color-border)]"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 font-mono text-xs text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
        />
      </div>
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
        {label}
      </span>
      {children}
    </label>
  );
}
