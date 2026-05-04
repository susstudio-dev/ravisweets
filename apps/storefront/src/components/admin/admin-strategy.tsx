'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Download,
  FileText,
  Flame,
  FlaskConical,
  Globe2,
  Heart,
  IndianRupee,
  Leaf,
  LineChart,
  ListChecks,
  Megaphone,
  PenLine,
  RefreshCw,
  Search,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { Paisley } from '@/components/brand/paisley';
import { cn } from '@/lib/cn';

/**
 * Admin Strategy — the full Ravi Sweets 12-month growth playbook, rendered as
 * an interactive document inside the admin shell. State persists to
 * localStorage `ravi.strategy.v1` until the Supabase `strategy` table lands.
 *
 * Sections (in render order):
 *   1. Overview / decisions
 *   2. Market intelligence
 *   3. Customer ICPs
 *   4. Bellam health line
 *   5. Spirulina · Bal protein line (deep dive)
 *   6. Brand & positioning
 *   7. Content engine
 *   8. Paid ads
 *   9. NRI / Global
 *  10. Corporate B2B
 *  11. PR & influencers
 *  12. SEO + AEO
 *  13. KPIs
 *  14. Unit economics → ₹25–30L/mo profit
 *  15. Budget
 *  16. 90-day calendar
 *  17. Quick wins this week
 *  18. Founder playbook — minute-by-minute starting routine
 */

type Status = 'idle' | 'progress' | 'done' | 'blocked';

const STATUS_META: Record<Status, { label: string; cls: string; icon: typeof Circle }> = {
  idle: {
    label: 'Not started',
    cls: 'border-theme-ink/20 bg-theme-ink/5 text-theme-ink/55',
    icon: Circle,
  },
  progress: {
    label: 'In progress',
    cls: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
    icon: Clock,
  },
  done: {
    label: 'Done',
    cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
    icon: CheckCircle2,
  },
  blocked: {
    label: 'Blocked',
    cls: 'border-red-500/40 bg-red-500/10 text-red-700',
    icon: AlertTriangle,
  },
};

interface SectionMeta {
  id: string;
  label: string;
  short: string;
  icon: typeof Compass;
}

const SECTIONS = [
  { id: 'overview', label: 'Overview & decisions', short: 'Overview', icon: Compass },
  { id: 'market', label: 'Market intelligence 2026', short: 'Market', icon: BarChart3 },
  { id: 'icps', label: 'Customer ICPs', short: 'ICPs', icon: Users },
  { id: 'health', label: 'Bellam · Health line', short: 'Bellam', icon: Heart },
  { id: 'spirulina', label: 'Spirulina · Bal protein line', short: 'Spirulina', icon: Leaf },
  { id: 'brand', label: 'Brand & positioning', short: 'Brand', icon: Sparkles },
  { id: 'content', label: 'Content engine', short: 'Content', icon: PenLine },
  { id: 'ads', label: 'Paid ads playbook', short: 'Ads', icon: Megaphone },
  { id: 'global', label: 'NRI / Global', short: 'Global', icon: Globe2 },
  { id: 'b2b', label: 'Corporate B2B', short: 'B2B', icon: Building2 },
  { id: 'pr', label: 'PR & influencers', short: 'PR', icon: Trophy },
  { id: 'seo', label: 'SEO + AEO', short: 'SEO', icon: Search },
  { id: 'kpi', label: 'KPIs & dashboard', short: 'KPIs', icon: LineChart },
  { id: 'economics', label: 'Unit economics → ₹25–30L profit', short: 'Economics', icon: FlaskConical },
  { id: 'budget', label: 'Budget · 90 days', short: 'Budget', icon: IndianRupee },
  { id: 'calendar', label: '90-day calendar', short: 'Calendar', icon: CalendarDays },
  { id: 'wins', label: 'Quick wins this week', short: 'Wins', icon: Target },
  { id: 'playbook', label: 'Founder playbook · minute-by-minute', short: 'Playbook', icon: Sunrise },
] as const satisfies readonly SectionMeta[];

type SectionId = (typeof SECTIONS)[number]['id'];

function getSection(id: SectionId): SectionMeta {
  const found = SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section ${id}`);
  return found;
}

function getStatus(map: Record<string, Status>, id: SectionId): Status {
  return map[id] ?? 'idle';
}

interface StrategyState {
  statuses: Record<string, Status>;
  notes: Record<string, string>;
  decisions: {
    subBrandName: string;
    budgetTier: 'lean' | 'recommended' | 'aggressive' | '';
    photoshootDate: string;
    doctorName: string;
    sampleBoxApproved: boolean;
    contentLeadHire: boolean;
    nriPhaseAGo: boolean;
    engPriority: string;
  };
  weekChecklist: Record<string, boolean>;
  lastSavedAt?: string;
}

const STORAGE_KEY = 'ravi.strategy.v1';

function defaultState(): StrategyState {
  return {
    statuses: Object.fromEntries(SECTIONS.map((s) => [s.id, 'idle' as Status])),
    notes: {},
    decisions: {
      subBrandName: 'Ravi Sweets · Bellam (బెల్లం)',
      budgetTier: '',
      photoshootDate: '',
      doctorName: '',
      sampleBoxApproved: false,
      contentLeadHire: false,
      nriPhaseAGo: false,
      engPriority: '',
    },
    weekChecklist: {},
  };
}

function loadState(): StrategyState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<StrategyState>;
    const fallback = defaultState();
    return {
      statuses: { ...fallback.statuses, ...(parsed.statuses ?? {}) },
      notes: { ...fallback.notes, ...(parsed.notes ?? {}) },
      decisions: { ...fallback.decisions, ...(parsed.decisions ?? {}) },
      weekChecklist: { ...fallback.weekChecklist, ...(parsed.weekChecklist ?? {}) },
      lastSavedAt: parsed.lastSavedAt,
    };
  } catch {
    return defaultState();
  }
}

export function AdminStrategy() {
  const [state, setState] = useState<StrategyState>(defaultState);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const next = { ...state, lastSavedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [state, hydrated]);

  // Section observer — highlight TOC entry as you scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id;
        if (id) setActiveSection(id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const setStatus = (id: string, status: Status) =>
    setState((s) => ({ ...s, statuses: { ...s.statuses, [id]: status } }));

  const setNote = (id: string, note: string) =>
    setState((s) => ({ ...s, notes: { ...s.notes, [id]: note } }));

  const setDecision = <K extends keyof StrategyState['decisions']>(
    key: K,
    value: StrategyState['decisions'][K],
  ) =>
    setState((s) => ({
      ...s,
      decisions: { ...s.decisions, [key]: value },
    }));

  const toggleWeekItem = (id: string) =>
    setState((s) => ({
      ...s,
      weekChecklist: { ...s.weekChecklist, [id]: !s.weekChecklist[id] },
    }));

  const overallProgress = useMemo(() => {
    const values = Object.values(state.statuses);
    const done = values.filter((v) => v === 'done').length;
    const progress = values.filter((v) => v === 'progress').length;
    const total = values.length;
    return {
      pct: total === 0 ? 0 : Math.round(((done + progress * 0.5) / total) * 100),
      done,
      progress,
      blocked: values.filter((v) => v === 'blocked').length,
      total,
    };
  }, [state.statuses]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ravi-strategy-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    if (
      window.confirm(
        'Reset every status, note, decision and checklist back to defaults? This clears your local strategy edits.',
      )
    ) {
      setState(defaultState());
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="rounded-2xl border border-[color:var(--color-border)] bg-gradient-to-br from-surface-elevated via-surface-elevated to-theme-glow/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
              <Paisley size="sm" />
              Strategy · 2026 growth playbook
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
              Ravi Sweets · 12-month plan
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-theme-ink/70">
              The complete market-ready plan — research, ICPs, health-line range, content
              engine, paid-ads playbook, NRI phases, B2B tiers, KPIs, budget and a 90-day
              calendar. Mark any section as in-progress or done as you act on it. Notes and
              decisions persist locally.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="rounded-full bg-theme-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-theme-accent">
              v2 · 2026-05-04 · spirulina + ₹25–30L profit path
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadJson}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent"
              >
                <Download className="h-3 w-3" aria-hidden="true" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-700 hover:bg-red-500/10"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Progress band */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <ProgressTile
            label="Overall progress"
            value={`${overallProgress.pct}%`}
            sub={`${overallProgress.done}/${overallProgress.total} sections shipped`}
            accent
          />
          <ProgressTile
            label="In progress"
            value={overallProgress.progress.toString()}
            sub="sections actively moving"
          />
          <ProgressTile
            label="Blocked"
            value={overallProgress.blocked.toString()}
            sub="needing your input"
            danger={overallProgress.blocked > 0}
          />
          <ProgressTile
            label="Last edited"
            value={state.lastSavedAt ? new Date(state.lastSavedAt).toLocaleTimeString() : '—'}
            sub={
              state.lastSavedAt
                ? new Date(state.lastSavedAt).toLocaleDateString()
                : 'no edits yet'
            }
          />
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-theme-ink/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-theme-accent via-theme-glow to-emerald-500 transition-all"
            style={{ width: `${overallProgress.pct}%` }}
          />
        </div>
      </header>

      {/* Layout: TOC + content */}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
            Sections
          </p>
          <nav className="mt-2 flex flex-col gap-0.5">
            {SECTIONS.map((s) => {
              const status = state.statuses[s.id] ?? 'idle';
              const meta = STATUS_META[status];
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    'group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    activeSection === s.id
                      ? 'bg-theme-accent/15 text-theme-accent'
                      : 'text-theme-ink/70 hover:bg-theme-glow/10 hover:text-theme-ink',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {s.short}
                  </span>
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      status === 'done' && 'bg-emerald-500',
                      status === 'progress' && 'bg-amber-500',
                      status === 'blocked' && 'bg-red-500',
                      status === 'idle' && 'bg-theme-ink/15',
                    )}
                    title={meta.label}
                  />
                </a>
              );
            })}
          </nav>
          <p className="mt-6 rounded-lg border border-dashed border-[color:var(--color-border)] p-3 text-[11px] leading-relaxed text-theme-ink/55">
            All edits autosave to your browser. Use <span className="font-semibold">Export JSON</span>{' '}
            to send a snapshot to the team.
          </p>
        </aside>

        {/* Content */}
        <div className="flex min-w-0 flex-col gap-10">
          <SectionShell
            section={getSection('overview')}
            status={getStatus(state.statuses, 'overview')}
            onStatus={(s) => setStatus('overview', s)}
            note={state.notes.overview ?? ''}
            onNote={(n) => setNote('overview', n)}
          >
            <OverviewSection
              decisions={state.decisions}
              setDecision={setDecision}
            />
          </SectionShell>

          <SectionShell
            section={getSection('market')}
            status={getStatus(state.statuses, 'market')}
            onStatus={(s) => setStatus('market', s)}
            note={state.notes.market ?? ''}
            onNote={(n) => setNote('market', n)}
          >
            <MarketSection />
          </SectionShell>

          <SectionShell
            section={getSection('icps')}
            status={getStatus(state.statuses, 'icps')}
            onStatus={(s) => setStatus('icps', s)}
            note={state.notes.icps ?? ''}
            onNote={(n) => setNote('icps', n)}
          >
            <IcpsSection />
          </SectionShell>

          <SectionShell
            section={getSection('health')}
            status={getStatus(state.statuses, 'health')}
            onStatus={(s) => setStatus('health', s)}
            note={state.notes.health ?? ''}
            onNote={(n) => setNote('health', n)}
          >
            <HealthSection subBrand={state.decisions.subBrandName} />
          </SectionShell>

          <SectionShell
            section={getSection('spirulina')}
            status={getStatus(state.statuses, 'spirulina')}
            onStatus={(s) => setStatus('spirulina', s)}
            note={state.notes.spirulina ?? ''}
            onNote={(n) => setNote('spirulina', n)}
          >
            <SpirulinaSection />
          </SectionShell>

          <SectionShell
            section={getSection('brand')}
            status={getStatus(state.statuses, 'brand')}
            onStatus={(s) => setStatus('brand', s)}
            note={state.notes.brand ?? ''}
            onNote={(n) => setNote('brand', n)}
          >
            <BrandSection />
          </SectionShell>

          <SectionShell
            section={getSection('content')}
            status={getStatus(state.statuses, 'content')}
            onStatus={(s) => setStatus('content', s)}
            note={state.notes.content ?? ''}
            onNote={(n) => setNote('content', n)}
          >
            <ContentSection />
          </SectionShell>

          <SectionShell
            section={getSection('ads')}
            status={getStatus(state.statuses, 'ads')}
            onStatus={(s) => setStatus('ads', s)}
            note={state.notes.ads ?? ''}
            onNote={(n) => setNote('ads', n)}
          >
            <AdsSection />
          </SectionShell>

          <SectionShell
            section={getSection('global')}
            status={getStatus(state.statuses, 'global')}
            onStatus={(s) => setStatus('global', s)}
            note={state.notes.global ?? ''}
            onNote={(n) => setNote('global', n)}
          >
            <GlobalSection />
          </SectionShell>

          <SectionShell
            section={getSection('b2b')}
            status={getStatus(state.statuses, 'b2b')}
            onStatus={(s) => setStatus('b2b', s)}
            note={state.notes.b2b ?? ''}
            onNote={(n) => setNote('b2b', n)}
          >
            <B2bSection />
          </SectionShell>

          <SectionShell
            section={getSection('pr')}
            status={getStatus(state.statuses, 'pr')}
            onStatus={(s) => setStatus('pr', s)}
            note={state.notes.pr ?? ''}
            onNote={(n) => setNote('pr', n)}
          >
            <PrSection />
          </SectionShell>

          <SectionShell
            section={getSection('seo')}
            status={getStatus(state.statuses, 'seo')}
            onStatus={(s) => setStatus('seo', s)}
            note={state.notes.seo ?? ''}
            onNote={(n) => setNote('seo', n)}
          >
            <SeoSection />
          </SectionShell>

          <SectionShell
            section={getSection('kpi')}
            status={getStatus(state.statuses, 'kpi')}
            onStatus={(s) => setStatus('kpi', s)}
            note={state.notes.kpi ?? ''}
            onNote={(n) => setNote('kpi', n)}
          >
            <KpiSection />
          </SectionShell>

          <SectionShell
            section={getSection('economics')}
            status={getStatus(state.statuses, 'economics')}
            onStatus={(s) => setStatus('economics', s)}
            note={state.notes.economics ?? ''}
            onNote={(n) => setNote('economics', n)}
          >
            <EconomicsSection />
          </SectionShell>

          <SectionShell
            section={getSection('budget')}
            status={getStatus(state.statuses, 'budget')}
            onStatus={(s) => setStatus('budget', s)}
            note={state.notes.budget ?? ''}
            onNote={(n) => setNote('budget', n)}
          >
            <BudgetSection tier={state.decisions.budgetTier} setTier={(t) => setDecision('budgetTier', t)} />
          </SectionShell>

          <SectionShell
            section={getSection('calendar')}
            status={getStatus(state.statuses, 'calendar')}
            onStatus={(s) => setStatus('calendar', s)}
            note={state.notes.calendar ?? ''}
            onNote={(n) => setNote('calendar', n)}
          >
            <CalendarSection
              checked={state.weekChecklist}
              toggle={toggleWeekItem}
            />
          </SectionShell>

          <SectionShell
            section={getSection('wins')}
            status={getStatus(state.statuses, 'wins')}
            onStatus={(s) => setStatus('wins', s)}
            note={state.notes.wins ?? ''}
            onNote={(n) => setNote('wins', n)}
          >
            <WinsSection
              checked={state.weekChecklist}
              toggle={toggleWeekItem}
            />
          </SectionShell>

          <SectionShell
            section={getSection('playbook')}
            status={getStatus(state.statuses, 'playbook')}
            onStatus={(s) => setStatus('playbook', s)}
            note={state.notes.playbook ?? ''}
            onNote={(n) => setNote('playbook', n)}
          >
            <PlaybookSection
              checked={state.weekChecklist}
              toggle={toggleWeekItem}
            />
          </SectionShell>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Layout helpers ----------------------------- */

function ProgressTile({
  label,
  value,
  sub,
  accent,
  danger,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        accent && 'border-theme-accent/40 bg-theme-accent/5',
        danger && 'border-red-500/40 bg-red-500/5',
        !accent && !danger && 'border-[color:var(--color-border)] bg-surface',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-ink/55">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-semibold',
          danger ? 'text-red-700' : 'text-theme-ink',
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-theme-ink/55">{sub}</p>
    </div>
  );
}

function SectionShell({
  section,
  status,
  onStatus,
  note,
  onNote,
  children,
}: {
  section: SectionMeta;
  status: Status;
  onStatus: (s: Status) => void;
  note: string;
  onNote: (s: string) => void;
  children: ReactNode;
}) {
  const Icon = section.icon;
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  return (
    <section
      id={section.id}
      className="scroll-mt-24 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-accent/15 text-theme-accent">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
              §{SECTIONS.findIndex((s) => s.id === section.id) + 1}
            </p>
            <h2 className="font-display text-xl font-semibold text-theme-ink">
              {section.label}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider',
              meta.cls,
            )}
          >
            <StatusIcon className="h-3 w-3" aria-hidden="true" />
            {meta.label}
          </span>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value as Status)}
            className="rounded-full border border-[color:var(--color-border)] bg-surface px-2 py-1 text-[11px] font-medium text-theme-ink/70 focus-visible:border-theme-accent focus-visible:outline-none"
            aria-label={`Update status of ${section.label}`}
          >
            <option value="idle">Not started</option>
            <option value="progress">In progress</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </header>
      <div className="px-5 py-6">{children}</div>
      <footer className="border-t border-[color:var(--color-border)] px-5 py-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-ink/55">
            Founder notes for this section
          </span>
          <textarea
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Anything to remember, change, push back on, or hand off…"
            rows={2}
            className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm focus-visible:border-theme-accent focus-visible:outline-none"
          />
        </label>
      </footer>
    </section>
  );
}

/* ------------------------------ Section data ------------------------------ */

function OverviewSection({
  decisions,
  setDecision,
}: {
  decisions: StrategyState['decisions'];
  setDecision: <K extends keyof StrategyState['decisions']>(
    key: K,
    value: StrategyState['decisions'][K],
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-theme-accent/30 bg-theme-accent/5 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
          North-star · the number that decides everything
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-theme-ink">
          ₹25–30 L net profit / month by Diwali 2026 · ≈ ₹85L–₹1Cr GMV at 30% blended margin
        </p>
        <p className="mt-2 text-sm text-theme-ink/70">
          Five revenue stacks ladder to the target — D2C web (~40%), Corporate B2B (~25%),
          NRI gifting (~12%), Quick-commerce (~15%), Walk-in (~8%). The new lever versus the
          v1 plan is the <span className="font-semibold text-theme-accent">Spirulina · Bal protein line</span>{' '}
          (60–70% protein per 100g, ~78% gross margin). Window before category consolidation:
          24 months.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: 'Today', v: '₹15–30L', sub: 'GMV / month' },
            { k: 'Month 6', v: '₹50–60L', sub: 'GMV / month' },
            { k: 'Month 12', v: '₹85L–1Cr', sub: 'GMV → ₹25–30L profit' },
            { k: 'Year 2', v: '₹2–3Cr', sub: 'GMV / month, scale-out' },
          ].map((l) => (
            <div key={l.k} className="rounded-lg border border-theme-accent/30 bg-surface-elevated px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
                {l.k}
              </p>
              <p className="font-display text-base font-semibold text-theme-ink">{l.v}</p>
              <p className="text-[10px] text-theme-ink/55">{l.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
          Decisions you owe the team
        </p>
        <p className="mt-1 text-sm text-theme-ink/65">
          Filling these unlocks engineering, marketing and ops in parallel.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DecisionField label="Sub-brand name (health line)">
            <select
              value={decisions.subBrandName}
              onChange={(e) => setDecision('subBrandName', e.target.value)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            >
              <option>Ravi Sweets · Bellam (బెల్లం)</option>
              <option>Ravi Sweets · Pure</option>
              <option>Ravi Sweets · Jaggery &amp; Grain</option>
            </select>
          </DecisionField>
          <DecisionField label="90-day budget tier">
            <select
              value={decisions.budgetTier}
              onChange={(e) =>
                setDecision('budgetTier', e.target.value as StrategyState['decisions']['budgetTier'])
              }
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            >
              <option value="">— select —</option>
              <option value="lean">Lean (₹6L)</option>
              <option value="recommended">Recommended (₹15L)</option>
              <option value="aggressive">Aggressive (₹20L)</option>
            </select>
          </DecisionField>
          <DecisionField label="Photoshoot date">
            <input
              type="date"
              value={decisions.photoshootDate}
              onChange={(e) => setDecision('photoshootDate', e.target.value)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            />
          </DecisionField>
          <DecisionField label="Endocrinologist (name + clinic)">
            <input
              type="text"
              value={decisions.doctorName}
              onChange={(e) => setDecision('doctorName', e.target.value)}
              placeholder="e.g. Dr PV Rao · Apollo Jubilee Hills"
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            />
          </DecisionField>
          <DecisionField label="Top engineering item to ship next">
            <input
              type="text"
              value={decisions.engPriority}
              onChange={(e) => setDecision('engPriority', e.target.value)}
              placeholder="e.g. Resend order receipts"
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm"
            />
          </DecisionField>
          <div className="grid gap-3">
            <Toggle
              label="₹40K corporate sample-box budget approved"
              checked={decisions.sampleBoxApproved}
              onChange={(v) => setDecision('sampleBoxApproved', v)}
            />
            <Toggle
              label="Hire content lead (₹35–45K/month)"
              checked={decisions.contentLeadHire}
              onChange={(v) => setDecision('contentLeadHire', v)}
            />
            <Toggle
              label="Greenlight NRI Phase A (send-from-abroad)"
              checked={decisions.nriPhaseAGo}
              onChange={(v) => setDecision('nriPhaseAGo', v)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Pill icon={Heart} title="Health line" body="10 SKUs · jaggery + millet · doctor-endorsed" />
        <Pill icon={Globe2} title="NRI Phase A" body="Send-from-abroad live in 6 weeks" />
        <Pill icon={Building2} title="B2B" body="4 productised tiers + 800 LinkedIn outbound" />
      </div>
    </div>
  );
}

function MarketSection() {
  const tailwinds = [
    {
      title: 'Health consciousness explosion',
      body: '"Sugar free sweets" search +280% since 2022. "Millet laddu" +640%. 77M Indian diabetics. The "indulgent + better-for-you" framing wins.',
    },
    {
      title: 'Regional pride',
      body: 'Pulla Reddy, Bombay Sweet Shop, Karachi Bakery all raising on identity-led stories. Pan-Indian generalists losing.',
    },
    {
      title: 'NRI gifting flow',
      body: '32M+ Indian diaspora. ~$400M annual sweets-gifting flow. No trusted send-from-Khammam alternative exists.',
    },
    {
      title: 'Corporate gifting recovery',
      body: '₹12,000 Cr/yr · grew 18% in 2025 · only ₹2,000 Cr is "organised + customised" — wide open lane.',
    },
    {
      title: 'AEO (AI search) is new',
      body: 'When users ask ChatGPT/Perplexity for sweets brands, structured-data + Wikipedia + Reddit citations win the answer. 6-month head-start available.',
    },
  ];

  const headwinds = [
    {
      title: 'Quick-commerce margin (25–30%)',
      body: 'Treat Zepto/Blinkit as marketing, not profit centre.',
    },
    {
      title: 'Cold-chain & shelf-life',
      body: 'Khoya-based sweets = 4–7 day life. Need a separate shelf-stable shipping range.',
    },
    {
      title: 'International compliance',
      body: 'FSSAI · FDA (USA · ~$5K/yr) · EU labels · NABL nutrition panels for every shipped SKU.',
    },
    {
      title: 'Trust crisis (Tirupati ladoo)',
      body: 'Provenance and transparency are the #1 unlock. We need to over-show our supply chain.',
    },
  ];

  const stats: { label: string; value: string; hint: string }[] = [
    { label: 'India sweets market', value: '₹54,000 Cr', hint: '~$6.5B · 12–14% CAGR' },
    { label: 'Organised share', value: '~15%', hint: 'D2C sub-tier growing 30% YoY' },
    { label: 'Diwali revenue share', value: '30–35%', hint: 'of annual sweet-brand revenue' },
    { label: 'NRI population', value: '32M+', hint: 'Telugu-concentrated in 14 metros' },
    { label: 'Diabetic population', value: '77M', hint: 'IDF Atlas 2024 · 1 in 11 adults' },
    { label: 'Corp gifting · custom', value: '₹2,000 Cr', hint: 'fastest growing sub-segment' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[color:var(--color-border)] bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-ink/55">
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-theme-ink">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-theme-ink/55">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CardList
          title="Five tailwinds we ride"
          tone="emerald"
          items={tailwinds.map((t) => ({ heading: t.title, body: t.body }))}
        />
        <CardList
          title="Four headwinds we plan around"
          tone="amber"
          items={headwinds.map((t) => ({ heading: t.title, body: t.body }))}
        />
      </div>
    </div>
  );
}

function IcpsSection() {
  const rows: {
    rank: number;
    name: string;
    yrGmv: string;
    aov: string;
    freq: string;
    driver: string;
  }[] = [
    { rank: 1, name: 'NRI hamper sender (US/UK/UAE/Aus/Sg/Ca → TG/AP family)', yrGmv: '₹35–60L', aov: '₹3K–₹7K', freq: '4–6×/yr', driver: 'Send-from-Khammam trust + Telugu + WhatsApp' },
    { rank: 2, name: 'Hyderabad Telugu family (working couple, 28–45)', yrGmv: '₹40–70L', aov: '₹900–₹2.2K', freq: '1–2×/mo', driver: 'Quick-commerce + WA catalogue + Sunday delivery' },
    { rank: 3, name: 'Telangana SME / corporate buyer', yrGmv: '₹50L–₹2Cr', aov: '₹40K–₹4L', freq: '1–3×/yr', driver: 'Logo + GST + dispatch CSV + WA account manager' },
    { rank: 4, name: 'Health-first urban buyer (35–55, T1/T2 metro)', yrGmv: '₹15–30L', aov: '₹1.2K–₹3K', freq: '1×/quarter', driver: 'Sugar-free + millet + jaggery + nutrition panel' },
    { rank: 5, name: 'Wedding / event planner (Hyd · Vij · BLR)', yrGmv: '₹25–60L', aov: '₹40K–₹3L', freq: 'Repeat-client', driver: 'White-label hampers · fast turnaround · photo proof' },
    { rank: 6, name: 'Khammam local walk-in + JustDial buyer', yrGmv: '₹40–80L', aov: '₹350–₹1.2K', freq: 'Weekly', driver: '40-yr trust · already owned — automate receipts' },
  ];
  return (
    <div className="overflow-x-auto">
      <p className="mb-4 text-sm text-theme-ink/65">
        ICPs ranked for 2026. ICPs 1, 3, 4 absorb 80% of marketing budget. ICP 2 is the home
        base — protect it. ICP 6 is the cash engine — automate it.
      </p>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
            <Th>#</Th>
            <Th>Segment</Th>
            <Th>Yr-1 GMV</Th>
            <Th>AOV</Th>
            <Th>Freq</Th>
            <Th>Win driver</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rank} className="border-b border-[color:var(--color-border)]/60 hover:bg-theme-glow/5">
              <Td>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent/15 text-[11px] font-semibold text-theme-accent">
                  {r.rank}
                </span>
              </Td>
              <Td className="font-medium text-theme-ink">{r.name}</Td>
              <Td>{r.yrGmv}</Td>
              <Td>{r.aov}</Td>
              <Td>{r.freq}</Td>
              <Td className="text-theme-ink/65">{r.driver}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HealthSection({ subBrand }: { subBrand: string }) {
  const skus = [
    { name: 'Bellam Boondi Laddu', sweetener: 'Jaggery', hero: 'Bengal gram', price: '₹399' },
    { name: 'Ragi Sunnundalu', sweetener: 'Jaggery', hero: 'Ragi + til', price: '₹449' },
    { name: 'Sajja (Bajra) Burelu', sweetener: 'Jaggery', hero: 'Sajja flour', price: '₹449' },
    { name: 'Foxtail Millet Halwa', sweetener: 'Jaggery + dates', hero: 'Foxtail millet', price: '₹549' },
    { name: 'Dates & Almond Katli', sweetener: 'Dates only', hero: 'Almonds', price: '₹699' },
    { name: 'Anjeer Roll', sweetener: 'Figs', hero: 'Pistachio', price: '₹699' },
    { name: 'Kaju Stevia Katli', sweetener: 'Stevia', hero: 'Cashew', price: '₹599' },
    { name: 'Multigrain Chikki', sweetener: 'Jaggery', hero: '7 grains', price: '₹349' },
    { name: 'A2 Ghee Mysore Pak (slim)', sweetener: 'Cane sugar (controlled)', hero: 'A2 ghee', price: '₹499' },
    { name: 'Protein Laddu', sweetener: 'Dates', hero: 'Almond + whey', price: '₹799' },
  ];
  const trust = [
    'NABL-accredited nutrition panel — every SKU (₹4–6K each, one-time)',
    'Endocrinologist-on-camera endorsement (₹50K–₹1.5L) — single highest-ROI trust spend',
    '60-second jaggery-farmer story film',
    'No-preservatives · No-maida · No-refined-sugar SVG stamps',
    'FSSAI sugar-substitute disclosures (stevia / monk-fruit)',
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Sub-brand · positioning
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-theme-ink">{subBrand}</p>
        <p className="mt-2 italic text-theme-ink/75">
          &ldquo;The sweets your grandmother actually made — before sugar, before maida,
          before shortcuts.&rdquo;
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>SKU</Th>
              <Th>Sweetener</Th>
              <Th>Hero ingredient</Th>
              <Th>Target retail (250g)</Th>
            </tr>
          </thead>
          <tbody>
            {skus.map((s) => (
              <tr key={s.name} className="border-b border-[color:var(--color-border)]/60 hover:bg-theme-glow/5">
                <Td className="font-medium text-theme-ink">{s.name}</Td>
                <Td>{s.sweetener}</Td>
                <Td>{s.hero}</Td>
                <Td className="font-display font-semibold">{s.price}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
          Trust artefacts (non-negotiable)
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-theme-ink/75">
          {trust.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BrandSection() {
  const phrases = [
    'Khammam since 1985. — heritage anchor',
    'From our kitchen, not a warehouse. — freshness anchor',
    'Sweetened with bellam. — health anchor (Telugu intentional)',
    'Build your own hamper. — customisation anchor',
    'Anywhere in India in 48 hours, anywhere in the world in 7. — capability anchor',
    'Founder Srinivasa Rao still tastes every batch. — trust anchor',
    'నాణ్యత మాకు ఆనవాయితీ — Quality is our tradition (Telugu soul)',
  ];
  const voice = [
    'Warm, not slick. "We" and "you", not "the brand".',
    'Specific, not generic. "Cardamom from Idukki" beats "premium ingredients".',
    'Telugu when it sings, English when it sells.',
    'Founder voice in stories, brand voice in product copy.',
    'Numbers > adjectives. "Slow-cooked 4 hours" > "carefully prepared".',
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Brand pyramid
        </p>
        <div className="mt-3 space-y-3 text-sm">
          <PyramidLevel label="Why we exist" body='"Sweets that taste like home, from a kitchen that hasn&apos;t moved in 40 years."' />
          <PyramidLevel label="Who we are" body="A Khammam family kitchen since 1985. Two stores, one recipe book, one founder, no shortcuts." />
          <PyramidLevel label="What we do" body="Slow-cooked Telangana & Hyderabadi sweets, plus a new jaggery + millet range. National + worldwide shipping. Custom corporate hampers." />
          <PyramidLevel label="How we differ" body="Khammam-rooted · founder-led · jaggery+millet line · customisable hampers · same-day fresh, no preservatives." />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Seven phrases we say everywhere
          </p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-theme-ink/80">
            {phrases.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Voice rules
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-theme-ink/80">
            {voice.map((v) => (
              <li key={v} className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-accent" aria-hidden="true" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ContentSection() {
  const channels = [
    { ch: 'Instagram', cad: '5–7 posts/wk · 1–2 reels/day', goal: 'Discovery + community' },
    { ch: 'IG broadcast channel', cad: '2–3/wk', goal: 'Loyalty, repeat purchase' },
    { ch: 'YouTube long-form', cad: '1/wk · 3–8 min', goal: 'SEO + NRI emotional pull' },
    { ch: 'YouTube Shorts', cad: '3/wk', goal: 'Reach, low cost' },
    { ch: 'WhatsApp Channel', cad: '1 broadcast/wk', goal: 'Direct sales' },
    { ch: 'Pinterest', cad: '4 pins/wk', goal: 'NRI + wedding planner' },
    { ch: 'LinkedIn (founder)', cad: '2 posts/wk', goal: 'B2B funnel' },
    { ch: 'Email', cad: '1/wk + festival', goal: 'Owned, conversion-grade' },
    { ch: 'Blog (storefront)', cad: '2/wk', goal: 'Organic search, AEO' },
  ];
  const pillars = [
    'Recipe behind the SKU',
    'Ingredient origin (farmer story)',
    'Customer story (NRI letters)',
    'Festival countdowns (21 days)',
    'Build your own hamper',
    'Health line spotlight',
    'Behind the kitchen (ASMR)',
    'Telangana history & food',
    'Diaspora love letters',
    'Wedding + event setups',
    'Reviews wall (compiled)',
    'Founder POV',
  ];
  const festivals = [
    { f: 'Bonalu', d: 'Jul 12', days: 14 },
    { f: 'Raksha Bandhan', d: 'Aug 09', days: 21 },
    { f: 'Ganesh Chaturthi', d: 'Aug 27', days: 14 },
    { f: 'Onam', d: 'Aug 29', days: 7 },
    { f: 'Dussehra', d: 'Oct 20', days: 14 },
    { f: 'Diwali ⭐', d: 'Nov 08', days: 45 },
    { f: 'Bhai Dooj', d: 'Nov 13', days: 7 },
    { f: 'Sankranti', d: 'Jan 14 ’27', days: 14 },
    { f: 'Holi', d: 'Mar 04 ’27', days: 10 },
    { f: 'Ugadi', d: 'Mar 19 ’27', days: 14 },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Channel cadence
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody>
                {channels.map((c) => (
                  <tr key={c.ch} className="border-b border-[color:var(--color-border)]/60">
                    <Td className="font-medium text-theme-ink">{c.ch}</Td>
                    <Td className="text-theme-ink/65">{c.cad}</Td>
                    <Td className="text-theme-ink/55 text-xs">{c.goal}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            12 evergreen pillars (rotate weekly)
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {pillars.map((p, i) => (
              <li key={p} className="flex items-center gap-2 rounded-lg bg-theme-glow/10 px-2.5 py-1.5">
                <span className="text-[10px] font-semibold text-theme-accent">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-theme-ink/80">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Festival calendar 2026 — content campaign windows
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {festivals.map((f) => (
            <div key={f.f} className="rounded-lg border border-[color:var(--color-border)] bg-surface-elevated p-3">
              <p className="font-display text-sm font-semibold text-theme-ink">{f.f}</p>
              <p className="text-[11px] text-theme-ink/55">{f.d}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-theme-accent">
                {f.days}-day campaign
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-theme-ink/60">
          Diwali is 30–35% of annual revenue. Allocate <span className="font-semibold text-theme-accent">50% of paid spend</span> to a 45-day Diwali ramp (Sept 25 → Nov 12).
        </p>
      </div>
    </div>
  );
}

function AdsSection() {
  const mix = [
    { ch: 'Meta (IG + FB)', pct: 50, goal: 'Discovery + retargeting', cac: '₹180–₹350' },
    { ch: 'Google Search + Shopping', pct: 25, goal: 'High-intent (NRI · diabetic · gifting)', cac: '₹150–₹400' },
    { ch: 'YouTube (in-feed + Shorts)', pct: 10, goal: 'Brand films + recipes', cac: '₹220–₹500' },
    { ch: 'WhatsApp click-to-chat', pct: 8, goal: 'Conversational sales', cac: '₹250–₹600' },
    { ch: 'Pinterest', pct: 4, goal: 'NRI + wedding planner', cac: '₹180–₹350' },
    { ch: 'LinkedIn (founder + brand)', pct: 3, goal: 'B2B corporate gifting', cac: '₹600–₹1,200' },
  ];
  const meta = [
    { stage: 'TOF · Reach', audiences: 'Lookalikes · TG/AP/TN/KA 25–55 · NRI lookalikes', creatives: '30s heritage film · founder reel · ASMR · jaggery story', daily: '₹1.5–3.5K/ad-set' },
    { stage: 'MOF · Traffic', audiences: 'Page engagers 90d · reel viewers ≥75% · site visitors 30d', creatives: 'Product carousels · hamper builder demo · testimonials', daily: '₹1–2.5K/ad-set' },
    { stage: 'BOF · Conversion', audiences: 'ATC-no-purchase 14d · past purchasers · abandoned checkout', creatives: '"Complete your hamper" · countdown urgency · founder note', daily: '₹0.8–2K/ad-set' },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Channel allocation (90-day starting mix)
        </p>
        <div className="mt-4 space-y-3">
          {mix.map((m) => (
            <div key={m.ch}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-theme-ink">{m.ch}</span>
                <span className="text-theme-ink/60">
                  {m.pct}% · CAC {m.cac}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-theme-ink/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-theme-accent to-theme-glow"
                  style={{ width: `${m.pct * 1.6}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-theme-ink/55">{m.goal}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Meta · always-on funnel
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
                <Th>Stage</Th>
                <Th>Audiences</Th>
                <Th>Creative</Th>
                <Th>Daily</Th>
              </tr>
            </thead>
            <tbody>
              {meta.map((m) => (
                <tr key={m.stage} className="border-b border-[color:var(--color-border)]/60">
                  <Td className="font-medium text-theme-ink">{m.stage}</Td>
                  <Td className="text-theme-ink/70">{m.audiences}</Td>
                  <Td className="text-theme-ink/70">{m.creatives}</Td>
                  <Td className="text-theme-accent">{m.daily}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900">
          <span className="font-semibold uppercase tracking-wider">Creative guardrails:</span>{' '}
          9:16 reels-first · brand wordmark in first 1.5s · subtitles + bilingual headline ·
          bellam stamp / paisley signature in every frame.
        </p>
      </div>
    </div>
  );
}

function GlobalSection() {
  const phases = [
    {
      tag: 'Phase A',
      timeline: '6 weeks',
      title: 'Send-home',
      points: [
        'International cards via Razorpay International / Stripe',
        '"I&apos;m sending from abroad" toggle + e-card + founder signature',
        'Currency switcher (₹ / $ / £ / AED / S$) — weekly FX',
        'Hindi + Telugu personalised note (Tiro Telugu)',
      ],
      target: '₹35–60L Yr-1 GMV',
      tone: 'emerald',
    },
    {
      tag: 'Phase B',
      timeline: '6 months',
      title: 'Ship-overseas',
      points: [
        'Aramex / DHL / FedEx (or Shyplite aggregator)',
        'Shelf-stable SKUs only — clearly marked "ships abroad"',
        'Transparent shipping (₹1.8–3.5K/kg) at checkout',
        'UAE first → UK → USA (FDA reg ~$5K/yr)',
      ],
      target: '₹15–30L Yr-1 international GMV',
      tone: 'amber',
    },
    {
      tag: 'Phase C',
      timeline: 'Year 2',
      title: 'Local fulfilment',
      points: [
        '"Ghost kitchen" partner in Dallas + London',
        'Dry-pack hampers shipped in bulk every 4 weeks',
        'Last-mile local delivery — no air freight',
        'Moonshot — do not start in year 1',
      ],
      target: 'TBD',
      tone: 'slate',
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {phases.map((p) => (
        <div
          key={p.tag}
          className={cn(
            'rounded-xl border p-5',
            p.tone === 'emerald' && 'border-emerald-500/30 bg-emerald-500/5',
            p.tone === 'amber' && 'border-amber-500/30 bg-amber-500/5',
            p.tone === 'slate' && 'border-[color:var(--color-border)] bg-surface',
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
            {p.tag} · {p.timeline}
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-theme-ink">{p.title}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-theme-ink/75">
            {p.points.map((pt) => (
              <li key={pt} className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-accent" aria-hidden="true" />
                <span dangerouslySetInnerHTML={{ __html: pt }} />
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-surface-elevated px-3 py-2 text-xs font-semibold text-theme-accent">
            Target · {p.target}
          </p>
        </div>
      ))}
    </div>
  );
}

function B2bSection() {
  const tiers = [
    { name: 'Essentials', content: '4 mini-jars + ribbon + card', price: '₹399', minQty: 50, lead: '5 days', buyer: 'SME, sub-50' },
    { name: 'Premium', content: '6 SKUs, wooden tray, brand-foiled lid, handwritten card', price: '₹899', minQty: 25, lead: '7 days', buyer: 'Mid-market 50–500' },
    { name: 'Heritage', content: '8 SKUs (incl. health line) + paisley-foil + founder note + Telugu calligraphy', price: '₹1,799', minQty: 10, lead: '10 days', buyer: 'Senior leadership / VIP' },
    { name: 'Custom', content: 'Anything from the builder + logo on box + multi-address CSV', price: '₹400–₹5K', minQty: 25, lead: '14 days', buyer: 'Anyone wanting control' },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>Tier</Th>
              <Th>Contents</Th>
              <Th>Price</Th>
              <Th>Min qty</Th>
              <Th>Lead</Th>
              <Th>Target buyer</Th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => (
              <tr key={t.name} className="border-b border-[color:var(--color-border)]/60 hover:bg-theme-glow/5">
                <Td className="font-display font-semibold text-theme-ink">{t.name}</Td>
                <Td className="text-theme-ink/70">{t.content}</Td>
                <Td className="font-semibold">{t.price}</Td>
                <Td>{t.minQty}</Td>
                <Td>{t.lead}</Td>
                <Td className="text-theme-ink/60 text-xs">{t.buyer}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Sales motion
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-theme-ink/80">
          <li>Inbound: builder → WhatsApp account manager → quote → order.</li>
          <li>
            Outbound: 800–1,200 SME admins/HRs/founders in Hyd/BLR/Pune/Mumbai. 5-touch
            email sequence Sept 5 → Sept 25. ₹40K samples to 100 leads → 10–20 corporate
            accounts at ₹40K–₹3L. <span className="font-semibold text-theme-accent">₹4–40L revenue from ₹1.5L spend.</span>
          </li>
          <li>Channel partners: 8–12 wedding/event planners with 12% revenue share.</li>
        </ol>
      </div>
    </div>
  );
}

function PrSection() {
  const outlets = [
    'Condé Nast Traveller India', 'The Hindu Friday Review (Hyd)', 'Telangana Today / Deccan Chronicle',
    'YourStory / Inc42', 'Mint Lounge', 'Times Food / TOI Hyderabad', 'Outlook Traveller', 'Forbes India SmallBiz',
  ];
  const tiers = [
    { tier: 'Mega', who: '1 Telugu film personality', followers: '1M+', cost: '₹2–8L (or product + invite)', cad: 'Once per festival' },
    { tier: 'Macro', who: 'Hyd food bloggers (regional)', followers: '100K–1M', cost: '₹40K–₹2L', cad: '2–4/quarter' },
    { tier: 'Micro', who: 'Telugu home-cook · diabetic-coach · NRI lifestyle', followers: '10K–100K', cost: '₹3K–₹15K + product', cad: '8–12/month' },
    { tier: 'Nano (UGC)', who: 'Real customers given a free hamper', followers: '<10K', cost: 'Free hamper', cad: 'Continuous' },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Tier-1 outlets to seed (priority order)
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-1.5 text-sm">
          {outlets.map((o, i) => (
            <li key={o} className="flex items-center gap-2 rounded-md bg-theme-glow/10 px-2 py-1.5">
              <span className="text-[10px] font-semibold text-theme-accent">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-theme-ink/80">{o}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Influencer tiers
        </p>
        <div className="mt-3 space-y-3 text-sm">
          {tiers.map((t) => (
            <div key={t.tier} className="rounded-lg border border-[color:var(--color-border)]/60 p-3">
              <p className="font-display text-base font-semibold text-theme-ink">{t.tier}</p>
              <p className="text-xs text-theme-ink/65">{t.who} · {t.followers}</p>
              <p className="mt-1 text-xs text-theme-ink/55">{t.cost} · {t.cad}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeoSection() {
  const keywords = [
    { kw: 'sweet shop Khammam', target: 'top 3', page: '/' },
    { kw: 'best sweet shop in Khammam', target: 'top 3', page: '/about' },
    { kw: 'sweet shop Kondapur', target: 'top 5', page: '/stores' },
    { kw: 'Telangana sweets online', target: 'top 5', page: '/festivals/telangana-special' },
    { kw: 'send sweets to Khammam', target: 'top 3', page: '/send-from-abroad' },
    { kw: 'jaggery sweets online', target: 'top 5', page: '/bellam-health' },
    { kw: 'sugar free sweets India', target: 'top 8', page: '/bellam-health' },
    { kw: 'diabetic friendly sweets', target: 'top 8', page: '/bellam-health' },
    { kw: 'millet laddu', target: 'top 10', page: 'product page' },
    { kw: 'corporate Diwali gifting Hyderabad', target: 'top 5', page: '/corporate' },
    { kw: 'custom hampers Hyderabad', target: 'top 5', page: '/corporate/builder' },
    { kw: 'Sajja Burelu online', target: '#1', page: 'product page' },
    { kw: 'Annamayi Laddu', target: '#1', page: 'product page' },
    { kw: 'Khammam famous sweets', target: 'top 3', page: '/' },
    { kw: 'Telugu sweets shop', target: 'top 8', page: '/festivals' },
    { kw: 'Hyderabadi sweets online', target: 'top 8', page: '/festivals/hyderabadi-specials' },
    { kw: 'send Diwali sweets to India', target: 'top 8', page: '/send-from-abroad' },
    { kw: 'send Rakhi sweets to India', target: 'top 8', page: '/send-from-abroad' },
  ];
  const aeo = [
    'Wikipedia + Wikidata entry (sourced via 2–3 press citations + 40-yr heritage)',
    '30+ Reddit + Quora founder-voice answers (non-spammy)',
    'FAQPage schema on every long-form blog post',
    'Press citations (most powerful AEO signal)',
    '/about-data or /press page with machine-readable facts',
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Keyword targets — rank by Diwali 2026
        </p>
        <table className="mt-3 w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>Keyword</Th>
              <Th>Target rank</Th>
              <Th>Page</Th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((k) => (
              <tr key={k.kw} className="border-b border-[color:var(--color-border)]/60">
                <Td className="font-medium text-theme-ink">{k.kw}</Td>
                <Td><span className="rounded-full bg-theme-accent/15 px-2 py-0.5 text-xs font-semibold text-theme-accent">{k.target}</span></Td>
                <Td className="font-mono text-xs text-theme-ink/65">{k.page}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          AEO — get cited by ChatGPT / Claude / Perplexity / Google AI Overviews
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-theme-ink/80">
          {aeo.map((a) => (
            <li key={a} className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-accent" aria-hidden="true" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KpiSection() {
  const kpis = [
    { kpi: 'D2C revenue (week)', source: 'Supabase orders', target: '₹3–8L → ₹6–10L' },
    { kpi: 'Orders (week)', source: 'Supabase', target: '80–250 → 350+' },
    { kpi: 'AOV', source: 'Supabase', target: '₹1,200 → ₹1,800' },
    { kpi: 'New customers (week)', source: 'Supabase', target: '60–180 → 250+' },
    { kpi: 'Repeat-customer rate (90d)', source: 'Supabase', target: '18% → 35%' },
    { kpi: 'CAC (blended)', source: 'Spend / new customers', target: '₹400 → ₹250' },
    { kpi: 'ROAS (Meta)', source: 'Meta Ads Mgr', target: '2.5× → 4.5×' },
    { kpi: 'Email open rate', source: 'Resend', target: '28% → 38%' },
    { kpi: 'IG followers', source: 'Instagram', target: '8K → 60K' },
    { kpi: 'IG saves/shares per reel', source: 'Instagram', target: '50 → 400' },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-theme-accent/30 bg-theme-accent/5 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          North-star
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-theme-ink">
          Weekly D2C revenue, Yr-1 target ₹25–35L/month by month 12.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>KPI</Th>
              <Th>Source</Th>
              <Th>Yr-1 target</Th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((k) => (
              <tr key={k.kpi} className="border-b border-[color:var(--color-border)]/60">
                <Td className="font-medium text-theme-ink">{k.kpi}</Td>
                <Td className="text-theme-ink/65">{k.source}</Td>
                <Td className="font-semibold text-theme-accent">{k.target}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-theme-ink/60">
        Tier-2 (review monthly): corporate revenue % of total (target 25%), NRI orders %
        (12%), health-line % (18%), WhatsApp-driven orders % (20%), 5-star reviews per
        location (+10/mo), PR mentions per quarter (≥4).
      </p>
    </div>
  );
}

function BudgetSection({
  tier,
  setTier,
}: {
  tier: StrategyState['decisions']['budgetTier'];
  setTier: (t: StrategyState['decisions']['budgetTier']) => void;
}) {
  const lines = [
    { item: 'Meta ads', m1: 60, m2: 90, m3: 150 },
    { item: 'Google ads (search + shopping + YT)', m1: 35, m2: 50, m3: 80 },
    { item: 'WhatsApp CTW + LinkedIn', m1: 15, m2: 20, m3: 30 },
    { item: 'Photography + creative production', m1: 40, m2: 25, m3: 35 },
    { item: 'Content lead salary', m1: 40, m2: 40, m3: 40 },
    { item: 'Editor / part-time', m1: 18, m2: 18, m3: 18 },
    { item: 'Influencer seeding', m1: 30, m2: 50, m3: 75 },
    { item: 'Doctor endorsement (one-time)', m1: 100, m2: 0, m3: 0 },
    { item: 'NABL labs (10 SKUs × ₹5K)', m1: 50, m2: 0, m3: 0 },
    { item: 'PR retainer (optional)', m1: 40, m2: 40, m3: 40 },
    { item: 'Tooling (Resend, Razorpay, Buffer, Apollo)', m1: 15, m2: 15, m3: 15 },
    { item: 'Reserve / experimentation', m1: 20, m2: 30, m3: 50 },
  ];
  const totals = lines.reduce(
    (acc, l) => ({
      m1: acc.m1 + l.m1,
      m2: acc.m2 + l.m2,
      m3: acc.m3 + l.m3,
    }),
    { m1: 0, m2: 0, m3: 0 },
  );
  const grand = totals.m1 + totals.m2 + totals.m3;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 md:grid-cols-3">
        {(['lean', 'recommended', 'aggressive'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={cn(
              'rounded-xl border p-4 text-left transition-all',
              tier === t
                ? 'border-theme-accent bg-theme-accent/10 ring-2 ring-theme-accent/40'
                : 'border-[color:var(--color-border)] bg-surface hover:border-theme-accent/40',
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
              {t === 'lean' ? 'Lean' : t === 'recommended' ? 'Recommended' : 'Aggressive'}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-theme-ink">
              {t === 'lean' ? '₹6L' : t === 'recommended' ? '₹15L' : '₹20L'}
            </p>
            <p className="mt-0.5 text-[11px] text-theme-ink/55">
              {t === 'lean'
                ? 'drop PR + halve influencer + defer doc video'
                : t === 'recommended'
                ? 'full plan executed cleanly'
                : '+ Diwali ramp + YouTube studio + US campaign'}
            </p>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>Line item</Th>
              <Th align="right">M1 (₹K)</Th>
              <Th align="right">M2 (₹K)</Th>
              <Th align="right">M3 (₹K)</Th>
              <Th align="right">90-day (₹K)</Th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.item} className="border-b border-[color:var(--color-border)]/60">
                <Td className="font-medium text-theme-ink">{l.item}</Td>
                <Td align="right">{l.m1.toLocaleString()}</Td>
                <Td align="right">{l.m2.toLocaleString()}</Td>
                <Td align="right">{l.m3.toLocaleString()}</Td>
                <Td align="right" className="font-semibold">
                  {(l.m1 + l.m2 + l.m3).toLocaleString()}
                </Td>
              </tr>
            ))}
            <tr className="bg-theme-accent/10 text-sm font-semibold">
              <Td className="text-theme-ink">Total</Td>
              <Td align="right">{totals.m1.toLocaleString()}</Td>
              <Td align="right">{totals.m2.toLocaleString()}</Td>
              <Td align="right">{totals.m3.toLocaleString()}</Td>
              <Td align="right" className="text-theme-accent">{grand.toLocaleString()}K · ₹{(grand / 100).toFixed(2)}L</Td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900">
        <span className="font-semibold uppercase tracking-wider">Diwali add-on:</span>{' '}
        ₹6–10L additional for the 45-day Diwali window (Sept 25 → Nov 8). Single most
        important spend of the year.
      </p>
    </div>
  );
}

function CalendarSection({
  checked,
  toggle,
}: {
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  const phases = [
    {
      label: 'Weeks 1–2 · Foundations & ship-blockers',
      items: [
        'Photography shoot (1 day, ₹40K) — 24 SKUs + 6 hampers + founder + kitchen b-roll',
        'Resend wired into Supabase Edge Function — order receipts live',
        'Razorpay live mode — payments for real',
        'Google Business Profile claimed for all 3 locations',
        'IG bio rewrite + broadcast channel set up',
        'WhatsApp Business API via MSG91 / Interakt',
        'Hire content lead + part-time editor',
        '2 founder reels filmed + posted',
        'Apollo.io + first 400-row SME outbound list',
      ],
    },
    {
      label: 'Weeks 3–4 · Content engine ON, Meta launches',
      items: [
        'Meta TOF + MOF + BOF live · 12 ads · ₹2K/day cap',
        'Google search live · brand defence + Khammam/Kondapur local',
        'IG cadence locked · 5 posts + 1 reel/day + 3 stories/day',
        'YouTube relaunched · 1 hero video published',
        'Blog · 3 evergreen posts (recipe + history + diabetic)',
        'Email newsletter v1 sent',
        'PR pitch package finalised · 8 outlets contacted',
        'Admin sales analytics dashboard shipped',
        'Order tracking page shipped',
      ],
    },
    {
      label: 'Weeks 5–6 · Health-line launch + NRI Phase A',
      items: [
        'Bellam health line · first 4 SKUs live',
        '/bellam-health landing page live',
        'Endocrinologist endorsement video filmed',
        'NRI Phase A · currency switcher + intl cards + e-card',
        '/send-from-abroad landing page live',
        '10 Reddit + Quora answers seeded',
        '4 micro-influencer reels live',
        '100 corporate sample-boxes shipped (₹40K)',
      ],
    },
    {
      label: 'Weeks 7–8 · B2B push + reviews engine',
      items: [
        '/corporate rebuilt around 4 tiers',
        'B2B intake form + dedicated WA routing',
        'LinkedIn 5-touch sequence to 800 SMEs live',
        'Founder LinkedIn cadence (2/wk) starts',
        'Customer reviews engine (post-purchase WA → on-site reviews)',
        'Loyalty stamps live',
        'Wikipedia entry drafted + submitted',
        'First Tier-1 PR placement secured',
      ],
    },
    {
      label: 'Weeks 9–10 · Pre-Diwali ramp',
      items: [
        'Diwali hampers (5 tiers) photographed + on storefront',
        '30-day Diwali countdown promo strip',
        'Meta spend +50% · 6 new festival creatives',
        'Google Shopping · Diwali priority campaign',
        'Pinterest · Diwali board with 30 pins',
        'Email · weekly drumbeat newsletter',
        'WhatsApp broadcast · 2/wk pre-Diwali',
        '6 macro-influencer Diwali collabs locked',
        'Begin kitchen-cam / fresh-now widget build',
      ],
    },
    {
      label: 'Weeks 11–12 · Diwali execution + measurement',
      items: [
        'Daily monitoring · CAC + ROAS + stock-outs',
        'Founder live on IG + YouTube on Dhanteras + Diwali',
        'B2B last-mile dispatches (200+ corporate orders)',
        'Daily CSV dispatch flows hardened',
        'Post-Diwali retargeting (Bhai Dooj + year-end)',
        'End-of-90-day review against KPI targets',
      ],
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      {phases.map((phase, pi) => (
        <details key={phase.label} open={pi === 0} className="group rounded-xl border border-[color:var(--color-border)] bg-surface">
          <summary className="cursor-pointer list-none px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-base font-semibold text-theme-ink">{phase.label}</p>
              <span className="text-xs text-theme-ink/55">
                {phase.items.filter((i) => checked[`cal-${pi}-${i}`]).length} / {phase.items.length}
              </span>
            </div>
          </summary>
          <ul className="divide-y divide-[color:var(--color-border)]/60 px-5 pb-4">
            {phase.items.map((item) => {
              const id = `cal-${pi}-${item}`;
              const isDone = !!checked[id];
              return (
                <li key={item} className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggle(id)}
                    className="mt-0.5 h-4 w-4 rounded border-[color:var(--color-border)] accent-[color:var(--color-accent)]"
                  />
                  <span className={cn('text-sm', isDone ? 'text-theme-ink/40 line-through' : 'text-theme-ink/80')}>
                    {item}
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}

function WinsSection({
  checked,
  toggle,
}: {
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  const wins = [
    'Book the photography shoot for the next 14 days — single biggest unlock',
    'Claim Google Business Profile for all three stores tonight',
    'Write 7 Instagram captions today and queue them in Buffer',
    'Record 1 founder reel (60s, phone, no script)',
    'Open Apollo.io account + build 200-row SME list',
    'Greenlight Resend wiring (eng ships order receipts in 2 days)',
    'Decide health-line sub-brand name (recommended: Bellam · బెల్లం)',
    'Pick the endocrinologist (name + clinic)',
    'Approve corporate sample-box budget (₹40K, 100 boxes)',
    'Greenlight ₹2L of Meta spend in month 1',
  ];
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
        10 things to ship this week
      </p>
      <ul className="mt-3 divide-y divide-emerald-500/20">
        {wins.map((w) => {
          const id = `win-${w}`;
          const isDone = !!checked[id];
          return (
            <li key={w} className="flex items-start gap-3 py-2.5">
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => toggle(id)}
                className="mt-0.5 h-4 w-4 rounded border-emerald-500/40 accent-emerald-600"
              />
              <span className={cn('text-sm', isDone ? 'text-theme-ink/40 line-through' : 'text-theme-ink/80')}>
                {w}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------- Atoms --------------------------------- */

function Th({ children, align }: { children: ReactNode; align?: 'right' }) {
  return (
    <th
      className={cn(
        'px-3 py-2 font-semibold',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  align,
}: {
  children: ReactNode;
  className?: string;
  align?: 'right';
}) {
  return (
    <td
      className={cn(
        'px-3 py-2.5 align-top text-theme-ink/80',
        align === 'right' ? 'text-right tabular-nums' : '',
        className,
      )}
    >
      {children}
    </td>
  );
}

function CardList({
  title,
  tone,
  items,
}: {
  title: string;
  tone: 'emerald' | 'amber';
  items: { heading: string; body: string }[];
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        tone === 'emerald' && 'border-emerald-500/30 bg-emerald-500/5',
        tone === 'amber' && 'border-amber-500/30 bg-amber-500/5',
      )}
    >
      <p
        className={cn(
          'text-[10px] font-semibold uppercase tracking-[0.22em]',
          tone === 'emerald' ? 'text-emerald-700' : 'text-amber-700',
        )}
      >
        {title}
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((i) => (
          <li key={i.heading}>
            <p className="font-display text-sm font-semibold text-theme-ink">{i.heading}</p>
            <p className="mt-0.5 text-xs text-theme-ink/70">{i.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PyramidLevel({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)]/60 bg-surface-elevated p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
        {label}
      </p>
      <p className="mt-1 text-theme-ink/85">{body}</p>
    </div>
  );
}

function DecisionField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-ink/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm">
      <span className="text-theme-ink/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 rounded-full border transition-colors',
          checked
            ? 'border-emerald-500/60 bg-emerald-500'
            : 'border-[color:var(--color-border)] bg-theme-ink/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
    </label>
  );
}

function Pill({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Compass;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[color:var(--color-border)] bg-surface p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-accent/15 text-theme-accent">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-theme-ink">{title}</p>
        <p className="text-xs text-theme-ink/65">{body}</p>
      </div>
    </div>
  );
}

// keep FileText import live for future blog/strategy doc embed
void FileText;

/* ----------- New strategy sections (v2) ----------- */

function SpirulinaSection() {
  const facts = [
    {
      title: '57–70 g protein per 100 g',
      body:
        'Dried spirulina is 57–70% complete protein by weight (Wikipedia: 57%, premium-grade brands: 60–70%). One tablespoon (~7 g) delivers 4–5 g of complete protein with all 9 essential amino acids. Beats whey on amino-acid completeness on a per-gram basis.',
    },
    {
      title: 'Plant-based, vegan, gluten-free',
      body:
        'Aligns with the fastest-growing food category in India. Plant-based protein market: $634M (2025) → $2.25B (2034), 14.36% CAGR — every other ingredient class trails it.',
    },
    {
      title: 'Low GI when paired right',
      body:
        'Spirulina + dates + almonds + jaggery (no refined sugar, no maida) clears the bar for diabetic-friendly snacking. Adds iron, B12, beta-carotene, chlorophyll. 290 kcal / 100g but nutrient-dense, so 50g serving = ~145 kcal with ~12 g protein at 3% inclusion (mass format).',
    },
    {
      title: 'FSSAI-approved as nutraceutical',
      body:
        'Listed under FSS (Health Supplements, Nutraceuticals…) Regulations 2016. Need a separate Nutraceutical Division product approval (~30–45 days, ~₹35K) on top of the standard FSSAI license. Cannot make disease-cure claims; can make approved health claims with NABL evidence.',
    },
  ];

  const market = [
    { label: 'India plant-protein market', value: '$634M', hint: '2025 · 14.36% CAGR · fastest-growing food cat.' },
    { label: 'India protein supplements', value: '$1.03B', hint: '2025 · 13.3% CAGR to $2.71B by 2033' },
    { label: 'Active gym/yoga participants', value: '~8.5 Cr', hint: '2025 · India · 22% YoY growth' },
    { label: 'Indian diabetics', value: '77M', hint: '1 in 11 adults · primary low-GI buyer' },
    { label: 'Vegan-curious urban', value: '~9%', hint: 'T1/T2 metros · 25–45 age band' },
    { label: 'Iyurved (closest competitor)', value: '₹12 Cr', hint: 'FY24 revenue · ayurvedic spreads + laddu' },
  ];

  const competitors = [
    { name: 'Iyurved', focus: 'Ayurvedic spreads + protein laddu (kids-first)', rev: '₹12 Cr (FY24)', gap: 'No premium-mithai positioning · D2C-only · no NRI corridor' },
    { name: 'Prolgae (Chennai)', focus: 'B2B spirulina supply + planned chocolates', rev: '₹1.5 Cr', gap: 'Supplier mindset · no consumer brand · no Telugu identity' },
    { name: 'Mirchi · Appetite Food', focus: 'Choc-a-Protein balls (single SKU)', rev: 'Marketplace-only', gap: 'No hamper / corporate / NRI flow' },
    { name: 'Kovise · AnaFoods', focus: 'Single-SKU spirulina laddu', rev: 'Cottage-tier', gap: 'No brand · no shelf-life guarantee · regional only' },
    { name: 'Nutrisattva / Wellbeing', focus: 'Tablets + capsules (clinical)', rev: 'Mid-tier', gap: 'Not edible-as-mithai · pharma framing repels mithai buyer' },
  ];

  const skus = [
    {
      name: 'Spirulina Protein Laddu',
      hero: 'Sattu + spirulina (3%) + dates + almonds + A2 ghee',
      protein: '12 g per 50 g · 24 g per 100 g',
      retail: '₹599 / 250g (5 laddu)',
      role: 'Hero SKU · gym + diabetic + corporate',
    },
    {
      name: 'Blue Spirulina Coconut Barfi',
      hero: 'Phycocyanin (blue spirulina) + coconut + dates + cardamom',
      protein: '8 g per 40 g piece',
      retail: '₹699 / 250g',
      role: 'Viral-aesthetic SKU · Instagram + NRI gift',
    },
    {
      name: 'Spirulina Energy Bites',
      hero: 'Spirulina + cashew butter + dates + chia + cocoa',
      protein: '7 g per 30 g bite',
      retail: '₹549 / 200g (8 bites)',
      role: 'Desk-snack pack · subscription anchor',
    },
    {
      name: 'Spirulina Sajja Halwa Bar',
      hero: 'Bajra (sajja) + jaggery + spirulina (1.5%, subtle)',
      protein: '9 g per 50 g bar',
      retail: '₹549 / 200g (4 bars)',
      role: 'Telangana cross-over · post-workout',
    },
    {
      name: 'Bal Hamper · 4 SKUs',
      hero: 'All four lines · 100g each · glass jars + brand foil + Telugu calligraphy',
      protein: 'Avg 22 g per 100g',
      retail: '₹1,499',
      role: 'Gift-ready · corporate + NRI flagship',
    },
  ];

  const economicsRows = [
    { k: 'Spirulina powder (3% × 50g = 1.5g @ ₹1,200/kg)', v: '₹1.80' },
    { k: 'Sattu (chickpea) — 12g @ ₹240/kg', v: '₹2.88' },
    { k: 'Dates (deseeded paste) — 8g @ ₹350/kg', v: '₹2.80' },
    { k: 'Almonds (slivered) — 5g @ ₹950/kg', v: '₹4.75' },
    { k: 'A2 ghee — 4g @ ₹650/kg', v: '₹2.60' },
    { k: 'Cardamom + minor spices', v: '₹0.50' },
    { k: 'Sub-total ingredients per 50g laddu', v: '₹15.33', strong: true },
    { k: 'Vacuum pouch + paper liner + foil sleeve', v: '₹4.20' },
    { k: 'Labour + overhead allocation (200g batch)', v: '₹5.50' },
    { k: 'Fully-loaded cost / laddu', v: '₹25.03', strong: true },
    { k: 'Retail price / laddu (₹599 / 5 pieces)', v: '₹119.80', strong: true },
    { k: 'Gross margin', v: '79.1%', strong: true, accent: true },
  ];

  const sourcing = [
    'Parry Wellness (E.I.D. Parry, TN) — FSSAI Nutraceutical-grade · COA per batch · ~₹1,150/kg',
    'Prolgae Spirulina Supplies (Chennai) — Indian-grown · vat-cultivated · ₹1,200/kg · low-MOQ',
    'Algamac (Hyderabad-area) — proximity advantage · raw + flake · ₹1,100/kg',
    'Sun Chlorella India / ABL Lifestyle — premium organic · ₹2,400/kg · hero SKU only',
    'Backup: Cyanotech (Hawaii) — gold standard, ₹3,800/kg landed · USA-export range only',
  ];

  const launchPlan = [
    { wk: 'W 0–2', task: 'Sourcing locked · 2 supplier samples blind-tasted · final pick' },
    { wk: 'W 1–3', task: 'Recipe lab — 6 ratios per SKU · founder + chef tasting panel · pick winner' },
    { wk: 'W 2–4', task: 'NABL nutrition panel · ₹6K × 5 SKUs · 14-day turnaround' },
    { wk: 'W 3–5', task: 'FSSAI Nutraceutical product approval filed · ~₹35K · 30–45 days' },
    { wk: 'W 4–6', task: 'Pilot batch · 200 packs · 30-day shelf-life test in real packaging' },
    { wk: 'W 5–7', task: 'Photography (single shoot, dual-purpose with Bellam) · founder reels × 3' },
    { wk: 'W 6–8', task: '/spirulina-bal landing page · 1,000-word evidence-cited content' },
    { wk: 'W 7–9', task: '4 micro-influencer seeding (gym + diabetic-coach + Telugu home-cook + NRI mom)' },
    { wk: 'W 8–10', task: 'Soft launch on D2C + WA broadcast · pre-order list (target 200 buyers)' },
    { wk: 'W 9–11', task: 'Quick-commerce listings (Zepto/Blinkit) · only Bites + Laddu' },
    { wk: 'W 10–12', task: 'B2B sample-box add-on · 50 corporate gym partners (CureFit, Anytime, Gold’s Gym Hyd)' },
  ];

  const risks = [
    { r: 'Spirulina taste is polarising', m: 'Cap inclusion at 3% by weight in mass SKUs · pair with cocoa/dates/cardamom · double-blind test against 50-buyer panel before launch' },
    { r: 'Shelf-life with no preservatives', m: 'Vacuum-pack with nitrogen flush · oxygen scavenger · 90-day life · stamp pack date prominently' },
    { r: 'Heavy-metal scare from cheap supply', m: 'Only buy COA-backed batches · publish lab certs on /spirulina-bal · reject any supplier without third-party heavy-metal panel' },
    { r: 'FSSAI Nutraceutical license delay', m: 'File W3 · keep filing receipt visible to ops · launch as "high-protein dessert" (no claim) until license lands' },
    { r: 'Cannibalisation of traditional line', m: 'Position Bal as additive (gym day + diabetic kin gift) not replacement · bundle 1 traditional + 1 Bal in starter hampers' },
    { r: 'Sourcing single-supplier risk', m: 'Run 2 suppliers concurrently from W4 · 70/30 split · ratio-flexible recipes to switch in 48h' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Spirulina · Bal (బలం · &ldquo;strength&rdquo;) — flagship protein-density line
        </p>
        <p className="mt-2 font-display text-2xl font-semibold text-theme-ink">
          The Indian sweet that&apos;s also a protein bar.
        </p>
        <p className="mt-2 text-sm text-theme-ink/75">
          Spirulina is 57–70% complete protein per 100 g — denser than whey on a gram-for-gram basis.
          No premium mithai brand has claimed this lane in India yet. Iyurved (₹12 Cr) is closest but
          children-first; we own the gym-going + diabetic + NRI-corporate corner with mithai craft +
          founder trust + Telugu identity. Margin profile (~79% gross) funds the entire ad ramp.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {facts.map((f) => (
          <div key={f.title} className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <p className="font-display text-base font-semibold text-theme-ink">{f.title}</p>
            <p className="mt-1 text-xs text-theme-ink/70">{f.body}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
          Market the line is built for
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {market.map((s) => (
            <div key={s.label} className="rounded-xl border border-[color:var(--color-border)] bg-surface p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-ink/55">
                {s.label}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-theme-ink">{s.value}</p>
              <p className="mt-0.5 text-[11px] text-theme-ink/55">{s.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Competitor landscape — where we plant the flag
        </p>
        <table className="mt-3 w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>Brand</Th>
              <Th>Focus</Th>
              <Th>Revenue</Th>
              <Th>Open lane for us</Th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.name} className="border-b border-[color:var(--color-border)]/60 hover:bg-theme-glow/5">
                <Td className="font-display font-semibold text-theme-ink">{c.name}</Td>
                <Td className="text-theme-ink/70">{c.focus}</Td>
                <Td className="text-theme-ink/65">{c.rev}</Td>
                <Td className="text-emerald-700 text-xs">{c.gap}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          5-SKU launch matrix · go-to-market in 90 days
        </p>
        <table className="mt-3 w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>SKU</Th>
              <Th>Hero composition</Th>
              <Th>Protein density</Th>
              <Th>Retail</Th>
              <Th>Role</Th>
            </tr>
          </thead>
          <tbody>
            {skus.map((s) => (
              <tr key={s.name} className="border-b border-[color:var(--color-border)]/60 hover:bg-theme-glow/5">
                <Td className="font-display font-semibold text-theme-ink">{s.name}</Td>
                <Td className="text-theme-ink/70">{s.hero}</Td>
                <Td className="text-emerald-700 font-semibold text-xs">{s.protein}</Td>
                <Td className="font-semibold">{s.retail}</Td>
                <Td className="text-theme-ink/65 text-xs">{s.role}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Unit economics — Spirulina Protein Laddu (50g piece)
          </p>
          <table className="mt-3 w-full text-left text-sm">
            <tbody>
              {economicsRows.map((r) => (
                <tr
                  key={r.k}
                  className={cn(
                    'border-b border-[color:var(--color-border)]/60',
                    r.strong && 'bg-emerald-500/5',
                  )}
                >
                  <Td className={cn('text-theme-ink/80', r.strong && 'font-semibold text-theme-ink')}>
                    {r.k}
                  </Td>
                  <Td
                    align="right"
                    className={cn(
                      'tabular-nums',
                      r.strong && 'font-display font-semibold',
                      r.accent && 'text-emerald-700',
                    )}
                  >
                    {r.v}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-theme-ink/55">
            At ~79% gross margin and ₹599 AOV, every 1,000 boxes/month = ₹4.7L gross profit —
            funds ~₹3L of paid-ad spend and clears ~₹1.7L net. Break-even on the line at
            ~280 boxes / month.
          </p>
        </div>

        <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Sourcing shortlist (audit before W2)
          </p>
          <ul className="mt-3 space-y-2 text-xs text-theme-ink/80">
            {sourcing.map((s) => (
              <li key={s} className="flex items-start gap-2 leading-relaxed">
                <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] text-amber-900">
            <span className="font-semibold uppercase tracking-wider">FSSAI:</span> file the
            Nutraceutical product approval in W3. Until granted, sell as &ldquo;high-protein
            dessert&rdquo; with the protein number on-pack but no health claim. Once approved
            (30–45 days), unlock &ldquo;protein per serve&rdquo; + &ldquo;diabetic-friendly&rdquo;
            front-of-pack badges.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          12-week launch plan
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {launchPlan.map((p) => (
            <div key={p.wk} className="rounded-lg border border-[color:var(--color-border)]/60 bg-surface-elevated p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {p.wk}
              </p>
              <p className="mt-1 text-xs text-theme-ink/80">{p.task}</p>
            </div>
          ))}
        </div>
      </div>

      <CardList
        title="Six risks · pre-mitigated"
        tone="amber"
        items={risks.map((r) => ({ heading: r.r, body: r.m }))}
      />
    </div>
  );
}

function EconomicsSection() {
  const profitTarget = '₹25–30L net / month by month 12';
  const ladder = [
    { m: 'Today', gmv: '₹15–30L', net: 'Break-even / minor', notes: 'Walk-in heavy · D2C nascent · ad spend < ₹1L/mo' },
    { m: 'M 3', gmv: '₹35L', net: '₹4–6L', notes: 'Foundations live · Meta+Google humming at 2.5× ROAS' },
    { m: 'M 6', gmv: '₹55–65L', net: '₹10–14L', notes: 'NRI Phase A live · B2B 2 corporates closed · Bellam launched' },
    { m: 'M 9', gmv: '₹70–80L', net: '₹16–20L', notes: 'Spirulina · Bal soft launch · Diwali ramp begins' },
    { m: 'M 12', gmv: '₹85L–₹1Cr', net: '₹25–30L', notes: 'Diwali execution · all five revenue stacks producing · 35% repeat rate' },
    { m: 'Year 2', gmv: '₹2–3Cr', net: '₹60–80L', notes: 'B2B + NRI scale · second city retail · category-defining Bal line' },
  ];

  const margin = [
    { bucket: 'Spirulina · Bal line (premium)', cogs: '21%', gm: '79%', share: '15%', note: 'Funds ad spend' },
    { bucket: 'Bellam · Health line', cogs: '32%', gm: '68%', share: '18%', note: 'Repeat-rate engine' },
    { bucket: 'Hampers (incl. corporate)', cogs: '36%', gm: '64%', share: '25%', note: 'AOV ₹2K–₹4L' },
    { bucket: 'Dry / shelf-stable traditional', cogs: '38%', gm: '62%', share: '20%', note: 'NRI shipping core' },
    { bucket: 'Fresh traditional (khoya, ghee)', cogs: '46%', gm: '54%', share: '17%', note: 'Walk-in + quick-comm' },
    { bucket: 'Quick-commerce (Zepto/Blinkit)', cogs: '54%', gm: '46%', share: '5%', note: 'Marketing channel, not profit' },
  ];

  const pnl = [
    { line: 'Revenue (GMV ex-GST)', value: '100.0', commentary: '₹85L–₹1Cr / month' },
    { line: 'Less: COGS (blended)', value: '34.0', commentary: 'Mix-weighted' },
    { line: 'Gross profit', value: '66.0', commentary: 'Gross margin 66%', strong: true },
    { line: 'Less: marketing (paid + influencer)', value: '15.0', commentary: 'Steady-state · was 18% in M3' },
    { line: 'Less: payroll (kitchen + content + ops)', value: '6.5', commentary: 'Founder draw separate' },
    { line: 'Less: logistics + packaging', value: '4.0', commentary: 'Shiprocket + cold-chain bursts' },
    { line: 'Less: tooling + Razorpay + MSG91 + Resend', value: '1.5', commentary: 'Locked' },
    { line: 'Less: rent + overhead (3 locations)', value: '4.0', commentary: 'Khammam + Kondapur + central kitchen' },
    { line: 'Less: PR + miscellaneous', value: '2.0', commentary: 'Retainer + experiments' },
    { line: 'EBITDA', value: '33.0', commentary: '~₹28–33L / month at scale', strong: true, accent: true },
    { line: 'Less: tax (effective ~6% of revenue)', value: '6.0', commentary: 'GST set-off · income tax · advance' },
    { line: 'Net profit', value: '27.0', commentary: '₹23–27L / month landed clean', strong: true, accent: true },
  ];

  const channels = [
    { ch: 'D2C web (storefront)', share: 40, aov: '₹1,400', cac: '₹280', ltv: '₹4,200', payback: '2.0 mo' },
    { ch: 'Corporate B2B', share: 25, aov: '₹62K', cac: '₹3.5K', ltv: '₹1.8L (3 cycles)', payback: '0.7 mo' },
    { ch: 'Quick-commerce', share: 15, aov: '₹420', cac: 'platform', ltv: '₹1,100', payback: 'low' },
    { ch: 'NRI gifting (intl cards)', share: 12, aov: '₹4,200', cac: '₹650', ltv: '₹16K (4 occasions)', payback: '0.6 mo' },
    { ch: 'Walk-in (Khammam + Kondapur)', share: 8, aov: '₹520', cac: '₹0', ltv: '₹14K (40-yr trust)', payback: 'instant' },
  ];

  const levers = [
    { name: 'AOV uplift', from: '₹1,200', to: '₹1,800', how: 'Hamper-builder defaults · cross-sell at cart · 3-jar minimum on Bal · gift-add-on (card + foil)' },
    { name: 'Repeat-rate (90d)', from: '18%', to: '35%', how: 'Loyalty stamps · WA broadcast post-purchase · subscription on Bites + Bellam · founder thank-you note in box' },
    { name: 'CAC (blended)', from: '₹400', to: '₹250', how: 'Creative win-rate via 4-reel weekly testing · UGC + nano · branded search defence · Pmax for Diwali' },
    { name: 'ROAS (Meta)', from: '2.5×', to: '4.5×', how: 'Funnel discipline (TOF/MOF/BOF) · catalogue ads · creator-led BOF · pixel + CAPI' },
    { name: 'Gross margin (blended)', from: '58%', to: '66%', how: 'Bal + Bellam mix shift · drop SKUs <55% GM · rationalise 8 lowest-rotation SKUs · own 1 packaging vendor' },
    { name: 'Working capital cycle', from: '38 days', to: '14 days', how: 'Pre-paid only on D2C · UPI-first · corporate 50% advance · weekly Razorpay settlements' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-theme-accent/30 bg-theme-accent/5 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
          The math behind the north-star
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-theme-ink">
          {profitTarget} requires ₹85L–₹1Cr GMV/month at a 30%-net mix
        </p>
        <p className="mt-2 text-sm text-theme-ink/70">
          The plan stops being aspirational once these six levers are pulled simultaneously: AOV
          → ₹1,800 · Repeat → 35% · CAC → ₹250 · ROAS → 4.5× · Blended GM → 66% · Cash cycle → 14 days.
          Each is independently realistic; together they compound.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          12-month GMV → profit ladder
        </p>
        <table className="mt-3 w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>Period</Th>
              <Th>GMV / month</Th>
              <Th>Net profit</Th>
              <Th>Engine of the period</Th>
            </tr>
          </thead>
          <tbody>
            {ladder.map((row) => (
              <tr key={row.m} className="border-b border-[color:var(--color-border)]/60 hover:bg-theme-glow/5">
                <Td className="font-display font-semibold text-theme-ink">{row.m}</Td>
                <Td className="font-semibold">{row.gmv}</Td>
                <Td className="text-emerald-700 font-semibold">{row.net}</Td>
                <Td className="text-theme-ink/65 text-xs">{row.notes}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Margin stack by SKU bucket
          </p>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
                <Th>Bucket</Th>
                <Th>COGS</Th>
                <Th>GM</Th>
                <Th>Mix %</Th>
              </tr>
            </thead>
            <tbody>
              {margin.map((m) => (
                <tr key={m.bucket} className="border-b border-[color:var(--color-border)]/60">
                  <Td className="font-medium text-theme-ink">{m.bucket}</Td>
                  <Td>{m.cogs}</Td>
                  <Td className="text-emerald-700 font-semibold">{m.gm}</Td>
                  <Td>{m.share}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-theme-ink/55">
            Blended GM target: 66% — driven by lifting Bal + Bellam + Hampers to 58% combined mix.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Channel economics (steady-state)
          </p>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
                <Th>Channel</Th>
                <Th>%</Th>
                <Th>AOV</Th>
                <Th>CAC → LTV</Th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.ch} className="border-b border-[color:var(--color-border)]/60">
                  <Td className="font-medium text-theme-ink">{c.ch}</Td>
                  <Td>{c.share}%</Td>
                  <Td>{c.aov}</Td>
                  <Td className="text-xs">
                    <span className="text-theme-ink/65">{c.cac}</span>{' '}
                    <span className="text-theme-ink/40">→</span>{' '}
                    <span className="text-emerald-700 font-semibold">{c.ltv}</span>
                    <span className="text-theme-ink/45"> · {c.payback}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          P&amp;L at month-12 scale (% of revenue)
        </p>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] text-[10px] uppercase tracking-wider text-theme-ink/55">
              <Th>Line</Th>
              <Th align="right">% of revenue</Th>
              <Th>Commentary</Th>
            </tr>
          </thead>
          <tbody>
            {pnl.map((row) => (
              <tr
                key={row.line}
                className={cn(
                  'border-b border-[color:var(--color-border)]/60',
                  row.strong && 'bg-theme-accent/5',
                )}
              >
                <Td className={cn('text-theme-ink/80', row.strong && 'font-semibold text-theme-ink')}>
                  {row.line}
                </Td>
                <Td
                  align="right"
                  className={cn(
                    'tabular-nums',
                    row.strong && 'font-display font-semibold',
                    row.accent && 'text-emerald-700',
                  )}
                >
                  {row.value}%
                </Td>
                <Td className="text-theme-ink/65 text-xs">{row.commentary}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[11px] text-theme-ink/55">
          On ₹1Cr/month revenue: ₹66L gross profit → ₹33L EBITDA → ₹27L net. Allow ±₹3L band for
          mix variance. Every 1% GM uplift = ₹1L extra net profit / month.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Six levers — each independently moves the model
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {levers.map((l) => (
            <div key={l.name} className="rounded-lg border border-[color:var(--color-border)]/60 bg-surface-elevated p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-base font-semibold text-theme-ink">{l.name}</p>
                <p className="text-xs">
                  <span className="text-theme-ink/55">{l.from}</span>{' '}
                  <ArrowRight className="inline h-3 w-3 text-theme-accent" aria-hidden="true" />{' '}
                  <span className="font-semibold text-emerald-700">{l.to}</span>
                </p>
              </div>
              <p className="mt-1 text-xs text-theme-ink/70">{l.how}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlaybookSectionProps {
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
}

function PlaybookSection({ checked, toggle }: PlaybookSectionProps) {
  const day1 = [
    { time: '07:00–07:30', task: 'Open Supabase admin · read yesterday’s revenue, orders, AOV, top SKU. Note one number that surprised you.' },
    { time: '07:30–08:00', task: 'Triage WhatsApp inbox · reply to corporate + NRI inquiries first. SLA: 30 min.' },
    { time: '08:00–09:00', task: 'Family / personal block. Non-negotiable.' },
    { time: '09:00–10:00', task: 'Kitchen walk-through (alternate Khammam ↔ Kondapur weekly). Taste 2 batches. Capture 1 process clip on phone (vertical, 30s, ASMR-style).' },
    { time: '10:00–11:00', task: 'Founder reel — 60s, phone, no script. Topic: today’s ingredient story OR a customer letter. Hand to content lead by 11:15.' },
    { time: '11:00–12:00', task: 'Daily standup (15 min) → eng/content/ops blockers. Then deep-work block on one strategic initiative.' },
    { time: '12:00–13:00', task: 'Founder LinkedIn / IG comment engagement — 25 comments, real replies, no automation.' },
    { time: '13:00–14:00', task: 'Lunch + decompress.' },
    { time: '14:00–16:00', task: 'Sales block — 3 corporate B2B prospects (15 min each call) + 2 wedding planner intros + 1 NRI partnership ping.' },
    { time: '16:00–17:00', task: 'Content review — approve captions + reels for next 24h. Reject anything not specific (no "premium ingredients" generic).' },
    { time: '17:00–18:00', task: 'One initiative push — pick from: Bellam launch / Bal line / NRI page / corporate sample-box / influencer brief.' },
    { time: '18:00–19:00', task: 'Office hours (open door for team) → end-of-day numbers check → tomorrow’s priority on a sticky note.' },
    { time: '19:00→', task: 'Off. Phone-on for ops emergencies only. The brand is built on you sleeping.' },
  ];

  const week = [
    { day: 'Mon', focus: 'Numbers + planning', tasks: ['Weekly KPI review (90 min) · CAC, ROAS, AOV, repeat, GM by SKU bucket', 'Set the 1 thing this week must achieve', 'Founder LinkedIn long post (700 words, story-led)'] },
    { day: 'Tue', focus: 'B2B day', tasks: ['2 demo calls with corporate prospects (45 min each)', '4 Apollo.io outbound calls', '1 wedding-planner partnership conversation', 'Update B2B pipeline tracker'] },
    { day: 'Wed', focus: 'Content day', tasks: ['1 hero reel filmed (founder + chef + kitchen)', '4 short B-roll clips for week', '1 long-form YouTube (3–8 min) recorded', 'Caption writing block (60 min)'] },
    { day: 'Thu', focus: 'NRI + corporate sales push', tasks: ['Send 50 cold emails to NRI Telugu Whatsapp groups (admins + organisers)', '3 corporate quotes turned around within 4 hours', 'WA broadcast to NRI list (1 message)'] },
    { day: 'Fri', focus: 'Founder + community', tasks: ['Founder Instagram live (15 min, Q&A or kitchen tour)', 'Reply to top 30 IG comments personally', 'Customer thank-you DMs to 10 recent buyers', 'Schedule weekend posts'] },
    { day: 'Sat', focus: 'Khammam visit + team', tasks: ['Half-day at Khammam kitchen (in-person presence)', 'Tea + chat with kitchen team — surface 1 product idea', 'Walk-in customer interviews (5)', 'Photograph 2 kitchen moments for Instagram'] },
    { day: 'Sun', focus: 'Off / family', tasks: ['No work email until 5 PM', 'Optional: 30-min reflection log → what worked, what didn’t, what to change Mon'] },
  ];

  const morningStack = [
    'Yesterday’s revenue + orders + AOV',
    'Top selling SKU last 7 days',
    'Inventory of top-3 SKUs (days of cover)',
    'Open WA threads · pending replies',
    'Meta ROAS rolling-7d',
  ];

  const month12 = [
    { m: 'Month 1', gmv: '₹20L', focus: 'Foundations + photography + Resend + WA Business + Apollo · ad spend ₹2L · launch IG cadence' },
    { m: 'Month 2', gmv: '₹26L', focus: 'Meta funnel mature · Bellam first 4 SKUs live · 100 corporate sample-boxes shipped · 1 macro-influencer collab' },
    { m: 'Month 3', gmv: '₹35L', focus: 'NRI Phase A live · /send-from-abroad · endocrinologist endorsement video · 3 new B2B clients · ROAS 3.0×' },
    { m: 'Month 4', gmv: '₹42L', focus: 'Spirulina W1–W4 sourcing + recipe lab · LinkedIn 800-prospect sequence · YouTube weekly cadence' },
    { m: 'Month 5', gmv: '₹48L', focus: 'Bal NABL panels back · FSSAI Nutraceutical filed · pilot batches · 6 micro-influencer collabs · Wikipedia draft submitted' },
    { m: 'Month 6', gmv: '₹55L', focus: 'Bal soft-launch (D2C + WA only) · loyalty + reviews engine · 5 active corporate accounts · NRI orders 12% of mix' },
    { m: 'Month 7', gmv: '₹60L', focus: 'Bal full launch · gym partnerships (CureFit, Anytime, Gold’s Gym Hyd) · Diwali photo shoot · Meta budget +30%' },
    { m: 'Month 8', gmv: '₹65L', focus: 'Pre-Diwali ramp begins · WA broadcast 2/wk · 6 macro-influencer Diwali collabs locked · Pinterest Diwali board live · email weekly' },
    { m: 'Month 9', gmv: '₹78L', focus: 'Diwali prep · 5 hamper tiers photographed · Google Shopping priority · Meta budget +50% · 200+ corporate orders queued' },
    { m: 'Month 10', gmv: '₹95L', focus: '🪔 Diwali execution week · daily monitoring · founder live on Dhanteras + Diwali · ROAS 4.5× · zero stock-outs' },
    { m: 'Month 11', gmv: '₹78L', focus: 'Post-Diwali retargeting (Bhai Dooj + year-end gifting) · review against KPIs · 2027 plan kickoff' },
    { m: 'Month 12', gmv: '₹88L–₹1Cr', focus: 'Steady-state · 35% repeat rate · all 5 channels firing · ₹25–30L net profit · prep Sankranti + Year-2 expansion' },
  ];

  const where = [
    {
      title: 'Day 1 (Monday)',
      items: [
        'Photographer call confirmed for Day 8 (₹40K budget, 1-day shoot, 24 SKUs + 6 hampers + founder + kitchen b-roll)',
        'WA Business catalogue audit · add missing SKUs · check pricing',
        'Apollo.io account opened · first 100 SME contacts uploaded (Hyd → BLR → Pune)',
        'First founder reel filmed at kitchen (60s, no script, "Why I make sweets")',
        'Resend account created, API key handed to engineering',
      ],
    },
    {
      title: 'Day 2 (Tuesday)',
      items: [
        'Eng kick-off — Resend wired into Supabase order webhook · receipt template',
        'MSG91 OTP sandbox tested · WA Business Cloud API onboarded',
        'Storefront analytics review (Plausible / GA4) · top 5 pages last 30 days',
        '5 corporate cold-calls (script: 90 sec hook + sample-box offer + close to demo)',
        'NABL lab visit booked — Hyderabad-based · 5 SKUs to test (Bellam-first)',
      ],
    },
    {
      title: 'Day 3 (Wednesday)',
      items: [
        'Spirulina supplier outreach — email Parry Wellness, Prolgae, Algamac · ask for 500g samples + COA + price-list',
        '/bellam-health landing page wireframe approved · copy starts',
        '3 micro-influencer DMs (Telugu home cook, diabetic coach, NRI mom)',
        'Founder LinkedIn — first long post (700 words: "What 40 years in a Khammam kitchen taught me about trust")',
        'Schedule next 7 days of Instagram posts in Buffer',
      ],
    },
    {
      title: 'Day 4 (Thursday)',
      items: [
        'B2B sample box assembly — 10 boxes, 8 SKUs each, foil + Telugu calligraphy + handwritten note',
        '50 SME outbound emails (template: 110 words, ends with "10 sample boxes available, no charge")',
        'Endocrinologist outreach — book Dr PV Rao (Apollo Jubilee Hills) or alt for endorsement video · ₹50K–₹1.5L budget',
        'WhatsApp Channel set up · invite first 200 customers by SMS',
      ],
    },
    {
      title: 'Day 5 (Friday)',
      items: [
        'Diwali theme brainstorm (90 min, with content lead) → decide hero motif (paisley + lamp?)',
        'Photography shot list finalised — 24 SKUs × 3 angles + 6 hampers + 12 lifestyle',
        'Pinterest board setup · 30 starter pins (NRI + wedding planner audience)',
        '15-min founder Instagram live · "What I’m cooking this weekend"',
      ],
    },
    {
      title: 'Day 6 (Saturday)',
      items: [
        'Khammam kitchen content shoot · founder + family + jaggery vat',
        'Founder story film — "How my father started this in 1985" (5 min, edited Mon)',
        'Local Telangana press contact — pitch The Hans India + Telangana Today + Deccan Chronicle',
        'Walk-in customer interviews (5 buyers · "Why do you buy here?")',
      ],
    },
    {
      title: 'Day 7 (Sunday)',
      items: [
        'OFF (until 5 PM)',
        '30-min weekly reset — what worked, what didn’t, the 1 thing for next week',
        'Plan Monday’s 1 priority on a sticky note · close laptop',
      ],
    },
  ];

  const minimumDay = [
    'Reply to top 5 WhatsApp inquiries (15 min)',
    'Approve / record 1 founder reel (15 min)',
    'Skim Supabase dashboard — note 1 number (5 min)',
    'Comment on 10 IG posts in your space (15 min)',
    'Pick the 1 thing tomorrow must achieve (10 min)',
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
          <Sunrise className="h-3.5 w-3.5" aria-hidden="true" /> Where to begin · the founder routine
        </p>
        <p className="mt-2 font-display text-2xl font-semibold text-theme-ink">
          The first 7 days, then a routine you can run every week for 12 months.
        </p>
        <p className="mt-2 text-sm text-theme-ink/75">
          The trap at this stage is doing everything badly. The plan: one anchor activity per day,
          one founder reel per day, one strategic push per day, and a 5-number dashboard you check
          every morning before you talk to anyone. Compounded across 12 months, that&apos;s how the
          target arrives.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Hour-by-hour · day-1 routine (use this template every weekday)
        </p>
        <div className="mt-3 grid gap-2">
          {day1.map((d) => (
            <div key={d.time} className="grid gap-2 rounded-lg border border-[color:var(--color-border)]/60 bg-surface-elevated p-3 sm:grid-cols-[110px_1fr]">
              <p className="font-mono text-xs font-semibold text-theme-accent">{d.time}</p>
              <p className="text-sm text-theme-ink/85">{d.task}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Where to begin · the first 7 days, day-by-day
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {where.map((d, di) => (
            <div key={d.title} className="rounded-lg border border-[color:var(--color-border)]/60 bg-surface-elevated p-4">
              <p className="font-display text-base font-semibold text-theme-ink">{d.title}</p>
              <ul className="mt-2 divide-y divide-[color:var(--color-border)]/60">
                {d.items.map((item, ii) => {
                  const id = `pb-d${di}-${ii}`;
                  const on = !!checked[id];
                  return (
                    <li key={item} className="flex items-start gap-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(id)}
                        className="mt-1 h-3.5 w-3.5 rounded border-[color:var(--color-border)] accent-[color:var(--color-accent)]"
                      />
                      <span className={cn('text-xs leading-relaxed', on ? 'text-theme-ink/40 line-through' : 'text-theme-ink/80')}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-[color:var(--color-border)] bg-surface p-5">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Weekly cadence · same 7-day pattern repeats
          </p>
          <div className="mt-3 space-y-2">
            {week.map((w) => (
              <div key={w.day} className="rounded-lg border border-[color:var(--color-border)]/60 bg-surface-elevated p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-theme-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-theme-accent">
                    {w.day}
                  </span>
                  <p className="font-display text-sm font-semibold text-theme-ink">{w.focus}</p>
                </div>
                <ul className="mt-2 list-disc pl-5 text-xs text-theme-ink/75">
                  {w.tasks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" /> Morning dashboard · 5 numbers, every day
            </p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-theme-ink/80">
              {morningStack.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ol>
            <p className="mt-3 text-[11px] text-theme-ink/55">
              These 5 numbers fit on a phone screen. If you can&apos;t see them in 30 seconds at
              7 AM, something is broken in your dashboard — fix that before fixing anything else.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" /> &ldquo;Only 2 hours today&rdquo; minimum-viable founder day
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-theme-ink/80">
              {minimumDay.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ol>
            <p className="mt-3 text-[11px] text-amber-900">
              Even on travel / family / crisis days, do these five. The brand keeps moving.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-theme-accent/30 bg-theme-accent/5 p-5">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          <Flame className="h-3.5 w-3.5" aria-hidden="true" /> 12-month milestone ladder · GMV target + the engine of each month
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {month12.map((mo) => (
            <div key={mo.m} className="rounded-lg border border-[color:var(--color-border)]/60 bg-surface-elevated p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-theme-ink">{mo.m}</p>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {mo.gmv}
                </span>
              </div>
              <p className="mt-1 text-xs text-theme-ink/75">{mo.focus}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-theme-ink/65">
          Cumulative 12-month GMV: ~₹6.9 Cr · cumulative net profit: ~₹1.4–1.7 Cr. Diwali (M10) alone
          is ~14% of annual revenue — it pays for itself even if everything else drifts.
        </p>
      </div>
    </div>
  );
}
