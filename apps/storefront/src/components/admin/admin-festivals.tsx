'use client';

import { useEffect, useMemo, useState } from 'react';
import { CATALOGUE, type Product } from '@ravisweets/shared';
import { Calendar, Check, Sparkles, X as XIcon } from 'lucide-react';
import {
  loadSiteContent,
  saveSiteContent,
  type ActiveFestival,
} from '@/lib/supabase/site-content';
import { useSession } from '@/lib/supabase/session-context';
import { logAdminAction } from '@/lib/supabase/orders';

/**
 * Festival "go live" manager.
 *
 * Single page that controls which festival is active sitewide. Picks one
 * of the 10 festival slugs, sets the banner copy + end date, and curates
 * up to 12 products that get featured under the festival hero. Storefront
 * SiteContentProvider reads the result via realtime + 60s poll, so the
 * site reflects the change without a redeploy.
 *
 * If the brand owner just wants to clear everything (festival is over),
 * the "Go off-season" button writes slug=null which makes the storefront
 * fall back to its default theme + banner.
 */

interface FestivalOption {
  slug: string;
  title: string;
  telugu: string;
  defaultBanner: string;
}

const FESTIVALS: FestivalOption[] = [
  { slug: 'pongal', title: 'Pongal', telugu: 'పొంగల్', defaultBanner: 'Pongal pots ship from Khammam — order by Jan 12 for arrival before the harvest morning.' },
  { slug: 'sankranti', title: 'Sankranti', telugu: 'సంక్రాంతి', defaultBanner: 'Til, gud, and a new year on the kitchen door — order Sankranti boxes by Jan 11.' },
  { slug: 'holi', title: 'Holi', telugu: 'హోలీ', defaultBanner: 'Holi gujiya boxes + sweet bites — order by Mar 10 for delivery before the colours.' },
  { slug: 'ugadi', title: 'Ugadi', telugu: 'ఉగాది', defaultBanner: 'Ugadi six-taste boxes ship from Khammam — order by Mar 16.' },
  { slug: 'eid', title: 'Eid', telugu: 'ఈద్', defaultBanner: 'Sheer Khurma + Double ka Meetha — Eid signature boxes, ship before the long day.' },
  { slug: 'raksha-bandhan', title: 'Raksha Bandhan', telugu: 'రక్షా బంధన్', defaultBanner: 'Rakhi-ready hampers with thread + thali — book by Aug 24.' },
  { slug: 'ganesh-chaturthi', title: 'Ganesh Chaturthi', telugu: 'వినాయక చవితి', defaultBanner: 'Modak boxes in counts of 11, 21, 51 — the auspicious numbers.' },
  { slug: 'onam', title: 'Onam', telugu: 'ഓണം', defaultBanner: 'Onam sadya-side payasam kits + Soan Papdi tins — Kerala-table ready.' },
  { slug: 'diwali', title: 'Diwali', telugu: 'దీపావళి', defaultBanner: 'Diwali pre-orders open — silver-leaf hampers + brass diya. Reserve early.' },
  { slug: 'christmas', title: 'Christmas', telugu: 'క్రిస్మస్', defaultBanner: 'Sweet Bites tins + soft kalakand for Christmas Eve — order by Dec 22.' },
];

const DEFAULT_STATE: ActiveFestival = {
  slug: null,
  banner_text: null,
  ends_at: null,
  curated_product_ids: [],
  auto_apply_theme: true,
};

export function AdminFestivals() {
  const { configured, role } = useSession();
  const [active, setActive] = useState<ActiveFestival>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!configured) {
        setLoaded(true);
        return;
      }
      const cur = await loadSiteContent('active_festival');
      if (cancelled) return;
      setActive(cur ?? DEFAULT_STATE);
      setLoaded(true);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [configured]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOGUE.filter((p) => {
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.ingredients.join(' ').toLowerCase().includes(q)
      );
    });
  }, [search]);

  function setSlug(slug: string | null) {
    if (slug === null) {
      setActive((prev) => ({ ...prev, slug: null, banner_text: null, ends_at: null, curated_product_ids: [] }));
      return;
    }
    const fest = FESTIVALS.find((f) => f.slug === slug);
    if (!fest) return;
    setActive((prev) => ({
      ...prev,
      slug,
      banner_text: prev.slug === slug ? prev.banner_text : fest.defaultBanner,
    }));
  }

  function toggleProduct(id: string) {
    setActive((prev) => {
      const has = prev.curated_product_ids.includes(id);
      if (has) {
        return { ...prev, curated_product_ids: prev.curated_product_ids.filter((x) => x !== id) };
      }
      if (prev.curated_product_ids.length >= 12) {
        window.alert('Curate at most 12 products under the festival hero — pick the most-loved.');
        return prev;
      }
      return { ...prev, curated_product_ids: [...prev.curated_product_ids, id] };
    });
  }

  async function publish() {
    if (!configured) {
      window.alert('Connect Supabase to publish festival changes.');
      return;
    }
    setBusy(true);
    const r = await saveSiteContent('active_festival', active);
    if (!r.ok) {
      window.alert(`Save failed: ${r.reason}. Run migration 0004 first.`);
      setBusy(false);
      return;
    }
    await logAdminAction('publish-festival', 'site_content', 'active_festival', null, active);
    setBusy(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  async function goOffSeason() {
    if (!window.confirm('Clear the active festival? The site will return to its default theme + banner.')) return;
    setActive(DEFAULT_STATE);
    setBusy(true);
    const r = await saveSiteContent('active_festival', DEFAULT_STATE);
    setBusy(false);
    if (!r.ok) {
      window.alert(`Save failed: ${r.reason}`);
      return;
    }
    await logAdminAction('clear-festival', 'site_content', 'active_festival', null, DEFAULT_STATE);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  if (!loaded) {
    return <div className="h-12 w-32 animate-pulse rounded bg-theme-ink/10" />;
  }

  const isAdmin = role === 'admin';
  const activeFest = FESTIVALS.find((f) => f.slug === active.slug);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          <Sparkles className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          Festival manager
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Set the season.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-ink/65">
          Pick a festival to surface across the site — banner, theme, curated
          products under the festival hero. The site updates within seconds (no
          deploy). Pick "Go off-season" to clear and return to the default look.
        </p>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-theme-ink/85">
          Supabase not configured — connect <code className="font-mono">.env.local</code> to publish.
        </div>
      )}

      {/* Slug picker */}
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          Active festival
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSlug(null)}
            aria-pressed={active.slug === null}
            className={`rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-all ${
              active.slug === null
                ? 'border-theme-ink bg-theme-ink text-[color:var(--theme-base)]'
                : 'border-[color:var(--color-border)] text-theme-ink/70 hover:border-theme-accent'
            }`}
          >
            Off-season
          </button>
          {FESTIVALS.map((f) => {
            const on = active.slug === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => setSlug(f.slug)}
                aria-pressed={on}
                className={`rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-all ${
                  on
                    ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)] shadow-soft'
                    : 'border-[color:var(--color-border)] text-theme-ink/80 hover:-translate-y-0.5 hover:border-theme-accent'
                }`}
              >
                {f.title}{' '}
                <span
                  className="ml-1 text-[11px] font-normal opacity-70"
                  style={{ fontFamily: 'var(--font-indic)' }}
                >
                  {f.telugu}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Banner + end date — only when a festival is selected */}
      {active.slug && (
        <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            {activeFest?.title} setup
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
                Banner copy
              </span>
              <textarea
                rows={2}
                value={active.banner_text ?? ''}
                onChange={(e) => setActive((prev) => ({ ...prev, banner_text: e.target.value }))}
                placeholder={activeFest?.defaultBanner ?? ''}
                className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
              <span className="text-[10px] text-theme-ink/50">
                Renders in the announcement strip above the header. Keep it under 90 chars.
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
                <Calendar className="mr-1 inline h-3 w-3" aria-hidden="true" />
                Ends at
              </span>
              <input
                type="datetime-local"
                value={active.ends_at ? active.ends_at.slice(0, 16) : ''}
                onChange={(e) =>
                  setActive((prev) => ({
                    ...prev,
                    ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                  }))
                }
                className="rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
              />
              <span className="text-[10px] text-theme-ink/50">
                Storefront auto-clears past this without a write.
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={active.auto_apply_theme}
                onChange={(e) =>
                  setActive((prev) => ({ ...prev, auto_apply_theme: e.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
              />
              <span>
                <span className="font-medium text-theme-ink">Auto-apply festival theme palette</span>
                <span className="block text-[11px] text-theme-ink/55">
                  Off = banner only (default cream stays). On = brass-and-festival look across all routes.
                </span>
              </span>
            </label>
          </div>
        </section>
      )}

      {/* Curated products picker */}
      {active.slug && (
        <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
              Featured products under the festival hero
            </h2>
            <span className="text-xs font-semibold text-theme-ink/65">
              {active.curated_product_ids.length}/12 picked
            </span>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, ingredient…"
            className="mt-3 w-full rounded-full border border-[color:var(--color-border)] bg-surface px-4 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
          />
          <div className="mt-4 grid max-h-[28rem] grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <ProductChip
                key={p.id}
                product={p}
                selected={active.curated_product_ids.includes(p.id)}
                onToggle={() => toggleProduct(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] bg-surface-elevated/95 px-5 py-3 backdrop-blur md:-mx-8 md:-mb-8 md:px-8">
        <div>
          {saved && (
            <p className="text-xs font-semibold text-emerald-700">
              <Check className="mr-1 inline h-3.5 w-3.5" />
              Live on the storefront within ~5 seconds.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {active.slug && (
            <button
              type="button"
              onClick={goOffSeason}
              disabled={busy || !isAdmin}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold text-theme-ink/70 transition-colors hover:border-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Go off-season
            </button>
          )}
          <button
            type="button"
            onClick={publish}
            disabled={busy || !isAdmin}
            className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent px-5 py-2 text-xs font-semibold text-[color:var(--theme-base)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {busy ? 'Publishing…' : active.slug ? 'Publish festival' : 'Save state'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductChip({
  product,
  selected,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border p-2 text-left transition-all ${
        selected
          ? 'border-theme-accent bg-theme-glow/15 shadow-soft'
          : 'border-[color:var(--color-border)] bg-surface hover:-translate-y-0.5 hover:border-theme-accent'
      }`}
    >
      <span className="block text-xs font-semibold text-theme-ink line-clamp-1">
        {product.title}
      </span>
      <span className="block text-[10px] text-theme-ink/55 line-clamp-1">
        {product.category}
      </span>
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-theme-accent text-[color:var(--theme-base)]">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}
