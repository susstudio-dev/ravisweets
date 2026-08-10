'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitEnquiry } from '@/lib/supabase/enquiries';
import { useSession } from '@/lib/supabase/session-context';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

type State = 'idle' | 'pending' | 'success' | 'error';

type StepId = 'occasion' | 'quantity' | 'delivery' | 'contact';
const STEP_ORDER: StepId[] = ['occasion', 'quantity', 'delivery', 'contact'];
const STEP_LABEL: Record<StepId, { num: string; title: string }> = {
  occasion: { num: '1', title: 'Occasion' },
  quantity: { num: '2', title: 'Quantity & budget' },
  delivery: { num: '3', title: 'Delivery & customisation' },
  contact: { num: '4', title: 'Contact' },
};

type Occasion = 'diwali' | 'wedding' | 'corporate' | 'eid' | 'rakhi' | 'other';

/*
 * THE ENQUIRY FORM, AS A FORM.
 *
 * Square-cut docket, .field-label captions on every input, stamps for the
 * step navigation. Inputs follow the system's input spec: surface ground,
 * 1px border, 4px radius, accent focus ring. All submission behaviour —
 * validation, autosave, localStorage mirror, Supabase write — is unchanged.
 */

/** The system input: docket-stock ground, hairline border, accent focus. */
const INPUT_CLASS =
  'bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-xl border border-[color:var(--color-border)] px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2';

/** Selectable option chips (occasion, tier, delivery mode): square-cut, no lift. */
function optionClass(selected: boolean, extra?: string) {
  return cn(
    'min-h-[44px] rounded-md border text-left transition-colors',
    selected
      ? 'border-theme-accent bg-theme-glow/20 text-theme-ink'
      : 'bg-surface text-theme-ink/85 hover:border-theme-accent border-[color:var(--color-border)]',
    extra,
  );
}

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
      if (
        form.gstin &&
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)
      ) {
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
    /*
     * The acknowledgment is a receipt, so it gets the perforated stub —
     * the one other place besides the hero card the perf edge belongs.
     */
    return (
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.emphasised }}
        className="docket docket--perf p-6 md:p-8"
      >
        <h2 className="font-display text-2xl md:text-3xl">Thank you, {form.name || 'there'}.</h2>
        <dl className="mt-5">
          <div className="field-row">
            <dt className="field-label">Status</dt>
            <dd className="field-value text-sm font-bold">RECEIVED</dd>
          </div>
          <div className="field-row">
            <dt className="field-label">Reference</dt>
            <dd className="field-value text-sm font-bold">{refCode}</dd>
          </div>
          <div className="field-row">
            <dt className="field-label">Reply to</dt>
            <dd className="field-value text-sm">{form.email}</dd>
          </div>
          <div className="field-row">
            <dt className="field-label">Response</dt>
            <dd className="field-value text-sm">WITHIN 1 BUSINESS DAY</dd>
          </div>
        </dl>
        <p className="text-text-muted mt-4 text-sm leading-relaxed">
          Keep the reference handy for any follow-up.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="docket p-5 md:p-7">
      {/* Form head: the sheet's title strip, with the step count recorded. */}
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-[color:var(--color-rule)] pb-3">
        <p className="field-label">Corporate enquiry</p>
        <p className="field-value text-text-muted text-xs">
          STEP {idx + 1} / {STEP_ORDER.length}
        </p>
      </div>
      <h2 className="font-display mt-4 text-2xl md:text-3xl">{STEP_LABEL[step].title}</h2>

      {/* Stepper indicator */}
      <ol className="mt-5 grid grid-cols-2 gap-x-3 sm:grid-cols-4">
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
                  'flex min-h-[44px] w-full items-center gap-1.5 border-b-2 px-1 py-2 text-left transition-colors',
                  isCurrent ? 'border-theme-accent' : 'border-transparent',
                  i > idx && 'cursor-not-allowed opacity-45',
                )}
              >
                <span className="field-value text-xs">{meta.num}.</span>
                <span className={cn('field-label truncate', isCurrent && 'text-theme-ink')}>
                  {meta.title}
                </span>
                {isDone && (
                  <Check className="text-theme-accent h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
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
              <p className="text-text-muted text-sm">
                What&rsquo;s the occasion? Picking one helps us suggest the right hampers.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['diwali', 'wedding', 'corporate', 'eid', 'rakhi', 'other'] as Occasion[]).map(
                  (o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => update('occasion', o)}
                      className={optionClass(form.occasion === o, 'px-4 py-3')}
                    >
                      <p className="font-display text-base capitalize">
                        {o === 'rakhi' ? 'Raksha Bandhan' : o}
                      </p>
                    </button>
                  ),
                )}
              </div>
              {errors.occasion && (
                <p role="alert" className="text-[11px] font-semibold text-red-700">
                  {errors.occasion}
                </p>
              )}
              <Field label="Event date (approximate is fine)" htmlFor="eventDate">
                <input
                  id="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => update('eventDate', e.target.value)}
                  className={INPUT_CLASS}
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
              <p className="text-text-muted text-sm">
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
                    className={INPUT_CLASS}
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
                    className={INPUT_CLASS}
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
                      className={optionClass(form.hamperTier === t, 'px-3 py-2 text-sm')}
                    >
                      {t === 'custom' ? 'Custom build' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
              {form.fromBuilderSummary && (
                <details className="bg-surface rounded-md border border-[color:var(--color-border)] p-3 text-sm">
                  <summary className="text-theme-ink cursor-pointer font-semibold">
                    Loaded from builder
                  </summary>
                  <pre className="text-text-muted mt-2 whitespace-pre-wrap text-xs">
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
              <p className="text-text-muted text-sm">
                How should we deliver, and would you like the box customised?
              </p>
              <Field label="Delivery">
                <div className="grid gap-2 sm:grid-cols-2">
                  {(['single', 'multi'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update('deliveryMode', m)}
                      className={optionClass(form.deliveryMode === m, 'px-3 py-3 text-sm')}
                    >
                      <span className="block font-semibold">
                        {m === 'single' ? 'Single address' : 'Multi-address (CSV)'}
                      </span>
                      <span className="text-text-muted block text-xs">
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
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Customisation">
                <div className="flex flex-col gap-3">
                  <label className="flex min-h-[44px] items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.logoPrint}
                      onChange={(e) => update('logoPrint', e.target.checked)}
                      className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent h-4 w-4 rounded-md"
                    />
                    Add our logo to the box
                  </label>
                  <Field label="Personalised note (max 240 chars)" htmlFor="personalNote">
                    <textarea
                      id="personalNote"
                      value={form.personalNote}
                      maxLength={240}
                      onChange={(e) => update('personalNote', e.target.value)}
                      rows={3}
                      className={INPUT_CLASS}
                      placeholder="From all of us at Acme Pvt Ltd…"
                    />
                  </Field>
                  <Field label="Anything else we should know?" htmlFor="customisation">
                    <textarea
                      id="customisation"
                      value={form.customisation}
                      onChange={(e) => update('customisation', e.target.value)}
                      rows={3}
                      className={INPUT_CLASS}
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
              <p className="text-text-muted text-sm">
                Where should we send the quote? GSTIN is optional but unlocks GST-compliant
                invoicing.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" htmlFor="name" error={errors.name}>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Company / business" htmlFor="company">
                  <input
                    id="company"
                    type="text"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={INPUT_CLASS}
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
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="GSTIN (optional)" htmlFor="gstin" error={errors.gstin}>
                  <input
                    id="gstin"
                    type="text"
                    value={form.gstin}
                    onChange={(e) => update('gstin', e.target.value.toUpperCase())}
                    placeholder="22ABCDE1234F1Z5"
                    className={cn(INPUT_CLASS, 'font-mono uppercase')}
                  />
                </Field>
              </div>
              <label className="text-text-muted flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.marketingConsent}
                  onChange={(e) => update('marketingConsent', e.target.checked)}
                  className="border-theme-ink/30 text-theme-accent focus:ring-theme-accent mt-0.5 h-4 w-4 rounded-md"
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

      {/* Help row: the pencilled note in the sheet's margin. */}
      <div className="text-text-muted mt-8 rounded-md border border-dashed border-[color:var(--color-rule)] p-3 text-xs">
        Your draft is saved automatically — refreshing won&rsquo;t lose your progress. MOQ is 25
        hampers; lead time is 7–10 business days from confirmation.
      </div>

      {/* Step nav */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={idx === 0}
          className="stamp stamp--ghost disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        {!isLast ? (
          <button type="button" onClick={nextStep} className="stamp">
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={state === 'pending'}
            className="stamp disabled:cursor-not-allowed disabled:opacity-50"
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
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-[11px] font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
