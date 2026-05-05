'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';
import {
  clearActivePromotion,
  getActivePromotion,
  publishPromotion,
  type PromotionRow,
} from '@/lib/supabase/promotions';
import { useSession } from '@/lib/supabase/session-context';

/**
 * Admin Promotions — flash sales / festival offers / site-wide announcement
 * banners. Persists to the Supabase `promotions` table (only one row may be
 * active at a time, enforced by a partial unique index). Mirrors the active
 * promo into localStorage so <PromoStrip> can render instantly on first
 * paint before the Supabase round-trip resolves.
 */

const STORAGE_KEY = 'ravi.active.promo.v1';

interface Promo {
  id: string;
  message: string;
  code?: string;
  href: string;
  ctaLabel: string;
  bgFrom: string;
  bgTo: string;
  fg: string;
  expiresAt?: string;
}

const PRESETS: Promo[] = [
  {
    id: 'diwali-2026',
    message: 'Diwali — wrapped in brass and silk',
    code: 'DIWALI500',
    href: '/festivals/diwali',
    ctaLabel: 'See hampers',
    bgFrom: '#2a1505',
    bgTo: '#5a3010',
    fg: '#f2c66f',
    expiresAt: '2026-11-08T23:59:59+05:30',
  },
  {
    id: 'first-order-10',
    message: '10% off your first order',
    code: 'FIRSTDIWALI',
    href: '/shop',
    ctaLabel: 'Shop now',
    bgFrom: '#a83c10',
    bgTo: '#d76420',
    fg: '#fff5d4',
  },
  {
    id: 'free-ship-999',
    message: 'Free shipping on orders above ₹999',
    href: '/shop',
    ctaLabel: 'Shop now',
    bgFrom: '#2a1505',
    bgTo: '#5a3010',
    fg: '#fdf6ec',
  },
  {
    id: 'flash-2-hour',
    message: 'Flash sale — next 2 hours',
    code: 'FLASH99',
    href: '/shop',
    ctaLabel: 'Shop now',
    bgFrom: '#a8222a',
    bgTo: '#dd2a4a',
    fg: '#fff5d4',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
];

function emptyPromo(): Promo {
  return {
    id: `promo-${Date.now()}`,
    message: '',
    href: '/shop',
    ctaLabel: 'Shop now',
    bgFrom: '#2a1505',
    bgTo: '#5a3010',
    fg: '#fdf6ec',
  };
}

function readActive(): Promo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Promo) : null;
  } catch {
    return null;
  }
}

function rowToPromo(r: PromotionRow): Promo {
  return {
    id: r.id,
    message: r.message,
    code: r.code ?? undefined,
    href: r.href,
    ctaLabel: r.cta_label,
    bgFrom: r.bg_from,
    bgTo: r.bg_to,
    fg: r.fg,
    expiresAt: r.expires_at ?? undefined,
  };
}

export function AdminPromotions() {
  const { configured } = useSession();
  const [active, setActive] = useState<Promo | null>(null);
  const [draft, setDraft] = useState<Promo>(emptyPromo);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (configured) {
        const row = await getActivePromotion();
        if (row) {
          const p = rowToPromo(row);
          setActive(p);
          setDraft(p);
          // Mirror to localStorage so PromoStrip's first paint is instant.
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          } catch {
            /* ignore */
          }
          return;
        }
      }
      const a = readActive();
      if (a) {
        setActive(a);
        setDraft(a);
      }
    })();
  }, [configured]);

  async function publish(promo: Promo) {
    setBusy(true);
    setFeedback(null);
    if (configured) {
      const r = await publishPromotion({
        id: promo.id,
        message: promo.message,
        code: promo.code ?? null,
        href: promo.href,
        ctaLabel: promo.ctaLabel,
        bgFrom: promo.bgFrom,
        bgTo: promo.bgTo,
        fg: promo.fg,
        expiresAt: promo.expiresAt ?? null,
      });
      if (!r.ok) {
        setBusy(false);
        setFeedback(`Save failed: ${r.reason}. Run migration 0009.`);
        return;
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(promo));
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    } catch {
      /* ignore */
    }
    setActive(promo);
    setBusy(false);
    setFeedback('Published.');
  }

  async function clearActive() {
    setBusy(true);
    setFeedback(null);
    if (configured) {
      const r = await clearActivePromotion();
      if (!r.ok) {
        setBusy(false);
        setFeedback(`Clear failed: ${r.reason}`);
        return;
      }
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    } catch {
      /* ignore */
    }
    setActive(null);
    setBusy(false);
    setFeedback('Cleared.');
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          <Paisley size="sm" />
          Promotions
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Flash sales &amp; festival banners
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          The active promo lives in the strip above the header on every page.
          One promo at a time. Use a preset or compose your own.
        </p>
      </header>

      {/* Active promo */}
      <section
        aria-labelledby="active-promo"
        className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="active-promo"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent"
          >
            Currently live
          </h2>
          {active && (
            <button
              type="button"
              onClick={() => void clearActive()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-700 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              End promo
            </button>
          )}
        </div>
        {active ? (
          <PromoPreview promo={active} className="mt-3" />
        ) : (
          <p className="mt-2 text-sm text-theme-ink/60">
            No promo is live. The default evergreen &ldquo;Free shipping above
            ₹999&rdquo; strip is showing.
          </p>
        )}
      </section>

      {/* Presets */}
      <section aria-labelledby="presets-heading">
        <h2
          id="presets-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent"
        >
          One-click presets
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {PRESETS.map((p) => (
            <article
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-4"
            >
              <PromoPreview promo={p} />
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void publish(p);
                  setDraft(p);
                }}
                className="self-start rounded-full bg-theme-accent px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--theme-base)] hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="mr-1 inline-block h-3 w-3" aria-hidden="true" />
                Go live
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Custom editor */}
      <section aria-labelledby="custom-heading" className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
        <h2
          id="custom-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent"
        >
          Compose your own
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Message">
            <input
              type="text"
              value={draft.message}
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              placeholder="e.g. 10% off all hampers — today only"
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm focus-visible:border-theme-accent focus-visible:outline-none"
            />
          </Field>
          <Field label="Coupon code (optional)">
            <input
              type="text"
              value={draft.code ?? ''}
              maxLength={20}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() || undefined })}
              placeholder="DIWALI500"
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 font-mono text-sm uppercase focus-visible:border-theme-accent focus-visible:outline-none"
            />
          </Field>
          <Field label="CTA label">
            <input
              type="text"
              value={draft.ctaLabel}
              maxLength={30}
              onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm focus-visible:border-theme-accent focus-visible:outline-none"
            />
          </Field>
          <Field label="Destination URL">
            <input
              type="text"
              value={draft.href}
              onChange={(e) => setDraft({ ...draft, href: e.target.value })}
              placeholder="/festivals/diwali"
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 font-mono text-xs focus-visible:border-theme-accent focus-visible:outline-none"
            />
          </Field>
          <Field label="Background — from">
            <input
              type="color"
              value={draft.bgFrom}
              onChange={(e) => setDraft({ ...draft, bgFrom: e.target.value })}
              className="h-10 w-full rounded-lg border border-[color:var(--color-border)] bg-surface"
            />
          </Field>
          <Field label="Background — to">
            <input
              type="color"
              value={draft.bgTo}
              onChange={(e) => setDraft({ ...draft, bgTo: e.target.value })}
              className="h-10 w-full rounded-lg border border-[color:var(--color-border)] bg-surface"
            />
          </Field>
          <Field label="Foreground colour">
            <input
              type="color"
              value={draft.fg}
              onChange={(e) => setDraft({ ...draft, fg: e.target.value })}
              className="h-10 w-full rounded-lg border border-[color:var(--color-border)] bg-surface"
            />
          </Field>
          <Field label="Expires at (optional)">
            <input
              type="datetime-local"
              value={draft.expiresAt?.slice(0, 16) ?? ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm focus-visible:border-theme-accent focus-visible:outline-none"
            />
          </Field>
        </div>

        <div className="mt-5 border-t border-[color:var(--color-border)] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
            Preview
          </p>
          <PromoPreview promo={draft} className="mt-2" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!draft.message.trim() || busy}
            onClick={() => void publish(draft)}
            className="inline-flex items-center gap-1.5 rounded-full bg-theme-ink px-5 py-2 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {busy ? 'Saving…' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => setDraft(emptyPromo())}
            className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55 hover:text-theme-accent"
          >
            Reset form
          </button>
          {feedback && <p className="text-[11px] text-theme-ink/65">{feedback}</p>}
        </div>
      </section>
    </div>
  );
}

function PromoPreview({ promo, className }: { promo: Promo; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-lg ${className ?? ''}`}
      style={{
        background: `linear-gradient(90deg, ${promo.bgFrom} 0%, ${promo.bgTo} 100%)`,
        color: promo.fg,
      }}
    >
      <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium">
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate font-semibold">{promo.message || 'Your message here'}</span>
        {promo.code && (
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          >
            {promo.code}
          </span>
        )}
        <span className="ml-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: `${promo.fg}55` }}>
          {promo.ctaLabel} →
        </span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-ink/55">
        {label}
      </span>
      {children}
    </label>
  );
}
