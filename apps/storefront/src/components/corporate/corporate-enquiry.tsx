'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Gift,
  HelpCircle,
  PaintBucket,
  Send,
  Truck,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Paisley } from '@/components/brand/paisley';
import { submitEnquiry } from '@/lib/supabase/enquiries';
import { useSession } from '@/lib/supabase/session-context';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

type State = 'idle' | 'pending' | 'success' | 'error';

type StepId = 'occasion' | 'quantity' | 'delivery' | 'contact';
const STEP_ORDER: StepId[] = ['occasion', 'quantity', 'delivery', 'contact'];
const STEP_LABEL: Record<StepId, { num: string; title: string; icon: typeof Gift }> = {
  occasion: { num: '1', title: 'Occasion', icon: Calendar },
  quantity: { num: '2', title: 'Quantity & budget', icon: Gift },
  delivery: { num: '3', title: 'Delivery & customisation', icon: Truck },
  contact: { num: '4', title: 'Contact', icon: User },
};

type Occasion = 'diwali' | 'wedding' | 'corporate' | 'eid' | 'rakhi' | 'other';

interface FormState {
  // Step 1
  occasion: Occasion | '';
  eventDate: string;
  // Step 2
  quantity: string;
  budgetPerUnit: string;
  hamperTier: 'essence' | 'premium' | 'grande' | 'custom';
  // Step 3
  deliveryMode: 'single' | 'multi';
  deliveryDate: string;
  logoPrint: boolean;
  ribbonChoice: string;
  personalNote: string;
  customisation: string;
  // Step 4
  company: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  marketingConsent: boolean;
  // Carry-over from builder deep-link
  fromBuilderSummary: string;
}

const INITIAL: FormState = {
  occasion: '',
  eventDate: '',
  quantity: '',
  budgetPerUnit: '',
  hamperTier: 'premium',
  deliveryMode: 'single',
  deliveryDate: '',
  logoPrint: false,
  ribbonChoice: '',
  personalNote: '',
  customisation: '',
  company: '',
  name: '',
  email: '',
  phone: '',
  gstin: '',
  marketingConsent: false,
  fromBuilderSummary: '',
};

const AUTOSAVE_KEY = 'ravi.enquiry.draft.v1';
const AUTOSAVE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function readDraft(): Partial<FormState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt: number; data: Partial<FormState> };
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > AUTOSAVE_TTL_MS) {
      localStorage.removeItem(AUTOSAVE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeDraft(data: FormState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    /* ignore */
  }
}

function generateRefCode() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ENQ-${y}-${m}-${day}-${rand}`;
}

export function CorporateEnquiry() {
  const [form, setForm] = useState<FormState>(() => ({ ...INITIAL, ...(readDraft() ?? {}) }));
  const [step, setStep] = useState<StepId>('occasion');
  const [state, setState] = useState<State>('idle');
  const [refCode, setRefCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [, startSubmit] = useTransition();
  const reduced = useReducedMotion();
  const searchParams = useSearchParams();
  const { configured: authConfigured } = useSession();
  const initialised = useRef(false);

  // Builder deep-link: pre-fill quantity + customisation from the builder summary.
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const fromBuilder = searchParams.get('from') === 'builder';
    if (!fromBuilder) return;
    const summary = searchParams.get('summary') ?? '';
    setForm((prev) => ({
      ...prev,
      fromBuilderSummary: summary,
      hamperTier: 'custom',
    }));
  }, [searchParams]);

  // Autosave on form change
  useEffect(() => {
    if (state === 'success') return;
    writeDraft(form);
  }, [form, state]);

  const idx = STEP_ORDER.indexOf(step);
  const isLast = idx === STEP_ORDER.length - 1;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateStep(s: StepId): boolean {
    const next: typeof errors = {};
    if (s === 'occasion') {
      if (!form.occasion) next.occasion = 'Pick an occasion to continue';
    }
    if (s === 'quantity') {
      const qty = Number(form.quantity);
      if (!Number.isFinite(qty) || qty < 25) {
        next.quantity = 'Minimum order is 25 hampers';
      }
    }
    if (s === 'contact') {
      if (!form.name.trim()) next.name = 'Required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Invalid email';
      if (!/^\+?\d{10,13}$/.test(form.phone.replace(/\s/g, ''))) {
        next.phone = 'Phone must be 10–13 digits';
      }
      if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
        next.gstin = 'Invalid GSTIN format';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    if (idx < STEP_ORDER.length - 1) setStep(STEP_ORDER[idx + 1]!);
  }
  function prevStep() {
    if (idx > 0) setStep(STEP_ORDER[idx - 1]!);
  }

  function submit() {
    if (!validateStep('contact')) return;
    setState('pending');
    startSubmit(async () => {
      const code = generateRefCode();
      setRefCode(code);
      // Always mirror to localStorage so /admin/enquiries renders even when
      // Supabase isn't configured (fallback) or when the backend write fails.
      try {
        const all = JSON.parse(localStorage.getItem('ravi.enquiries.v1') ?? '[]');
        all.push({ ...form, refCode: code, submittedAt: Date.now() });
        localStorage.setItem('ravi.enquiries.v1', JSON.stringify(all));
      } catch {
        /* ignore */
      }
      if (authConfigured) {
        const result = await submitEnquiry({
          refCode: code,
          data: { ...form, submittedAt: Date.now() },
          builderState: searchParams.get('state') ?? undefined,
        });
        if (!result.ok) {

          console.warn('Supabase enquiry insert failed:', result.reason);
        }
      }
      localStorage.removeItem(AUTOSAVE_KEY);
      setState('success');
    });
  }

  if (state === 'success' && refCode) {
    return (
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.emphasised }}
        className="rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-10 text-center shadow-soft"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-theme-accent" aria-hidden="true" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          Enquiry received
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-theme-ink">
          Thank you, {form.name || 'there'}.
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-theme-ink/75">
          Your reference code is <span className="font-mono font-semibold text-theme-accent">{refCode}</span>.
          Our corporate team will respond within one business day to {form.email}.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-soft md:p-10">
      <div className="flex items-center gap-2">
        <Paisley size="sm" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Tell us what you&rsquo;re planning
        </p>
      </div>
      <h2 className="mt-2 font-display text-2xl font-semibold text-theme-ink md:text-3xl">
        {STEP_LABEL[step].title}
      </h2>

      {/* Stepper indicator */}
      <ol className="mt-6 grid gap-2 md:grid-cols-4">
        {STEP_ORDER.map((s, i) => {
          const meta = STEP_LABEL[s];
          const isCurrent = s === step;
          const isDone = i < idx;
          return (
            <li key={s}>
              <button
                type="button"
                onClick={() => i <= idx && setStep(s)}
                disabled={i > idx}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors',
                  isCurrent && 'bg-theme-accent text-[color:var(--theme-base)]',
                  !isCurrent && i <= idx && 'bg-theme-glow/15 text-theme-ink',
                  i > idx && 'cursor-not-allowed text-theme-ink/40',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                    isCurrent && 'bg-[color:var(--theme-base)] text-theme-accent',
                    !isCurrent && isDone && 'bg-theme-accent text-[color:var(--theme-base)]',
                    !isCurrent && !isDone && 'border border-[color:var(--color-border)]',
                  )}
                >
                  {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : meta.num}
                </span>
                <span className="truncate text-xs font-semibold">{meta.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Step content */}
      <div className="mt-8 min-h-[18rem]">
        <AnimatePresence mode="wait">
          {step === 'occasion' && (
            <motion.div
              key="step-occasion"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="grid gap-6"
            >
              <p className="text-sm text-theme-ink/70">
                What&rsquo;s the occasion? Picking one helps us suggest the right hampers.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['diwali', 'wedding', 'corporate', 'eid', 'rakhi', 'other'] as Occasion[]).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => update('occasion', o)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft',
                      form.occasion === o
                        ? 'border-theme-accent bg-theme-glow/20 text-theme-ink'
                        : 'border-[color:var(--color-border)] bg-surface text-theme-ink/85',
                    )}
                  >
                    <p className="font-display text-base font-semibold capitalize">
                      {o === 'rakhi' ? 'Raksha Bandhan' : o}
                    </p>
                  </button>
                ))}
              </div>
              {errors.occasion && (
                <p className="text-xs font-medium text-[#c0392b]">{errors.occasion}</p>
              )}
              <Field label="Event date (approximate is fine)" htmlFor="eventDate">
                <input
                  id="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => update('eventDate', e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
              </Field>
            </motion.div>
          )}

          {step === 'quantity' && (
            <motion.div
              key="step-quantity"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="grid gap-5"
            >
              <p className="text-sm text-theme-ink/70">
                Roughly how many hampers, and what&rsquo;s your per-unit budget?
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Number of hampers" htmlFor="quantity" error={errors.quantity}>
                  <input
                    id="quantity"
                    type="number"
                    inputMode="numeric"
                    min={25}
                    placeholder="e.g. 100"
                    value={form.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </Field>
                <Field label="Per-unit budget (₹)" htmlFor="budget">
                  <input
                    id="budget"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 1500"
                    value={form.budgetPerUnit}
                    onChange={(e) => update('budgetPerUnit', e.target.value)}
                    className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </Field>
              </div>
              <Field label="Starting tier">
                <div className="grid gap-2 sm:grid-cols-4">
                  {(['essence', 'premium', 'grande', 'custom'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update('hamperTier', t)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm transition-colors',
                        form.hamperTier === t
                          ? 'border-theme-accent bg-theme-glow/20 text-theme-ink'
                          : 'border-[color:var(--color-border)] bg-surface text-theme-ink/85',
                      )}
                    >
                      {t === 'custom' ? 'Custom build' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
              {form.fromBuilderSummary && (
                <details className="rounded-lg border border-[color:var(--color-border)] bg-surface p-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-theme-ink">
                    Loaded from builder
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-theme-ink/70">
                    {form.fromBuilderSummary}
                  </pre>
                </details>
              )}
            </motion.div>
          )}

          {step === 'delivery' && (
            <motion.div
              key="step-delivery"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="grid gap-5"
            >
              <p className="text-sm text-theme-ink/70">
                How should we deliver, and would you like the box customised?
              </p>
              <Field label="Delivery">
                <div className="grid gap-2 sm:grid-cols-2">
                  {(['single', 'multi'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update('deliveryMode', m)}
                      className={cn(
                        'rounded-lg border px-3 py-3 text-left text-sm transition-colors',
                        form.deliveryMode === m
                          ? 'border-theme-accent bg-theme-glow/20 text-theme-ink'
                          : 'border-[color:var(--color-border)] bg-surface text-theme-ink/85',
                      )}
                    >
                      <span className="block font-semibold">
                        {m === 'single' ? 'Single address' : 'Multi-address (CSV)'}
                      </span>
                      <span className="block text-xs text-theme-ink/60">
                        {m === 'single'
                          ? 'One bulk delivery to your office'
                          : 'Per-recipient with tracking links'}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Target delivery date" htmlFor="deliveryDate">
                <input
                  id="deliveryDate"
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => update('deliveryDate', e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
              </Field>
              <Field label="Customisation">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.logoPrint}
                      onChange={(e) => update('logoPrint', e.target.checked)}
                      className="h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
                    />
                    <PaintBucket className="h-4 w-4 text-theme-accent" aria-hidden="true" />
                    Add our logo to the box
                  </label>
                  <Field label="Personalised note (max 240 chars)" htmlFor="personalNote">
                    <textarea
                      id="personalNote"
                      value={form.personalNote}
                      maxLength={240}
                      onChange={(e) => update('personalNote', e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                      placeholder="From all of us at Acme Pvt Ltd…"
                    />
                  </Field>
                  <Field label="Anything else we should know?" htmlFor="customisation">
                    <textarea
                      id="customisation"
                      value={form.customisation}
                      onChange={(e) => update('customisation', e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                      placeholder="Dietary restrictions, special wrap, ribbon colour, etc."
                    />
                  </Field>
                </div>
              </Field>
            </motion.div>
          )}

          {step === 'contact' && (
            <motion.div
              key="step-contact"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="grid gap-4"
            >
              <p className="text-sm text-theme-ink/70">
                Where should we send the quote? GSTIN is optional but unlocks GST-compliant invoicing.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" htmlFor="name" error={errors.name}>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </Field>
                <Field label="Company / business" htmlFor="company">
                  <input
                    id="company"
                    type="text"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </Field>
                <Field label="Phone" htmlFor="phone" error={errors.phone}>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+91 90000 00000"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </Field>
                <Field label="GSTIN (optional)" htmlFor="gstin" error={errors.gstin}>
                  <input
                    id="gstin"
                    type="text"
                    value={form.gstin}
                    onChange={(e) => update('gstin', e.target.value.toUpperCase())}
                    placeholder="22ABCDE1234F1Z5"
                    className="w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 font-mono text-sm uppercase text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                  />
                </Field>
              </div>
              <label className="flex items-start gap-2 text-xs text-theme-ink/65">
                <input
                  type="checkbox"
                  checked={form.marketingConsent}
                  onChange={(e) => update('marketingConsent', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-theme-ink/30 text-theme-accent focus:ring-theme-accent"
                />
                <span>
                  I&rsquo;d like occasional updates on seasonal hampers and corporate runs.
                  (Optional — no spam, easy unsubscribe.)
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help row */}
      <div className="mt-8 flex items-start gap-2 rounded-lg border border-dashed border-[color:var(--color-border)] p-3 text-xs text-theme-ink/65">
        <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-accent" aria-hidden="true" />
        <span>
          Your draft is saved automatically — refreshing won&rsquo;t lose your progress.
          {' '}MOQ is 25 hampers; lead time is 7–10 business days from confirmation.
        </span>
      </div>

      {/* Step nav */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={idx === 0}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-5 py-2.5 text-sm font-semibold text-theme-ink/80 transition-colors hover:border-theme-accent hover:text-theme-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={nextStep}
            className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            Continue
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={state === 'pending'}
            className="group inline-flex items-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Send enquiry
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  error,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-[#c0392b]">{error}</p>}
    </div>
  );
}

// Building2 import keeps tree-shake stable for occasion icon if added later.
void Building2;
