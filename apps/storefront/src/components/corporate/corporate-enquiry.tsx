'use client';

import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Send, Sparkles, Wand2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

type State = 'idle' | 'pending' | 'success' | 'error';

interface FormState {
  company: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  quantity: string;
  budget: string;
  deliveryDate: string;
  hamperTier: 'essence' | 'premium' | 'grande' | 'custom';
  customisation: string;
  sampleRequest: boolean;
  notes: string;
}

const INITIAL: FormState = {
  company: '',
  name: '',
  email: '',
  phone: '',
  gstin: '',
  quantity: '',
  budget: '',
  deliveryDate: '',
  hamperTier: 'premium',
  customisation: '',
  sampleRequest: false,
  notes: '',
};

export function CorporateEnquiry() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [state, setState] = useState<State>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [fromBuilder, setFromBuilder] = useState(false);
  const [, startSubmit] = useTransition();
  const reduced = useReducedMotion();
  const searchParams = useSearchParams();

  // Pre-fill from builder hand-off on mount.
  useEffect(() => {
    if (searchParams.get('from') !== 'builder') return;
    setFromBuilder(true);
    const summary = searchParams.get('summary') ?? '';
    const state = searchParams.get('state') ?? '';
    const stateParams = new URLSearchParams(state);
    const tier = stateParams.get('t');
    const qty = stateParams.get('qty');
    setForm((f) => ({
      ...f,
      customisation: summary,
      quantity: qty ?? f.quantity,
      hamperTier:
        tier === 'essence' || tier === 'premium' || tier === 'grande'
          ? tier
          : 'custom',
    }));
  }, [searchParams]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.company.trim()) next.company = 'Company name is required';
    if (!form.name.trim()) next.name = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!/^\+?\d[\d\s-]{8,14}\d$/.test(form.phone)) next.phone = 'Enter a valid phone';
    const qty = parseInt(form.quantity, 10);
    if (!form.quantity || Number.isNaN(qty) || qty < 25)
      next.quantity = 'Minimum 25 units (Grande tier). Essence/Premium start at 50.';
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(form.gstin))
      next.gstin = 'GSTIN looks off — leave blank if unsure';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== 'idle') return;
    if (!validate()) return;
    setState('pending');
    startSubmit(async () => {
      // Simulated — real handler routes to Resend + admin queue in corporate-gifting spec.
      await new Promise((r) => setTimeout(r, 900));
      setState('success');
    });
  }

  if (state === 'success') {
    return (
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.emphasised }}
        className="flex flex-col items-start gap-4 rounded-3xl border border-theme-accent/40 bg-theme-glow/10 p-8 md:p-10"
      >
        <CheckCircle2 className="h-8 w-8 text-theme-accent" aria-hidden="true" />
        <h3 className="font-display text-2xl font-semibold text-theme-ink md:text-3xl">
          Enquiry received.
        </h3>
        <p className="max-w-xl text-theme-ink/75">
          Your account manager will email you within 24 hours with a quote, sample-pack options
          (where applicable), and available delivery dates. If it&rsquo;s urgent, ping{' '}
          <a
            href="https://wa.me/919876543210"
            className="font-semibold text-theme-accent hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
        <p className="text-xs font-semibold uppercase tracking-wider text-theme-ink/60">
          Reference · RSC-{Date.now().toString(36).slice(-6).toUpperCase()}
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-3xl border border-[color:var(--color-border)] bg-surface-elevated p-6 shadow-soft md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Company"
          name="company"
          value={form.company}
          onChange={(v) => update('company', v)}
          error={errors.company}
          autoComplete="organization"
          required
        />
        <Field
          label="Your name"
          name="name"
          value={form.name}
          onChange={(v) => update('name', v)}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(v) => update('email', v)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Field
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={(v) => update('phone', v)}
          error={errors.phone}
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          required
        />
        <Field
          label="GSTIN (optional)"
          name="gstin"
          value={form.gstin}
          onChange={(v) => update('gstin', v.toUpperCase())}
          error={errors.gstin}
          placeholder="22AAAAA0000A1Z5"
        />
        <Field
          label="Approx. quantity"
          name="quantity"
          value={form.quantity}
          onChange={(v) => update('quantity', v)}
          error={errors.quantity}
          inputMode="numeric"
          required
          placeholder="150"
        />
        <Field
          label="Budget per unit (₹, optional)"
          name="budget"
          value={form.budget}
          onChange={(v) => update('budget', v)}
          inputMode="numeric"
          placeholder="1500"
        />
        <Field
          label="Delivery date"
          name="deliveryDate"
          type="date"
          value={form.deliveryDate}
          onChange={(v) => update('deliveryDate', v)}
        />
      </div>

      <fieldset className="mt-6">
        <legend className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
          Preferred hamper tier
          {fromBuilder && (
            <span className="inline-flex items-center gap-1 rounded-full bg-theme-glow/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-accent">
              <Wand2 className="h-3 w-3" aria-hidden="true" />
              From builder
            </span>
          )}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['essence', 'premium', 'grande', 'custom'] as const).map((t) => {
            const selected = form.hamperTier === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => update('hamperTier', t)}
                aria-pressed={selected}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                  selected
                    ? 'border-theme-accent bg-theme-accent text-[color:var(--theme-base)] shadow-soft'
                    : 'border-[color:var(--color-border)] bg-surface text-theme-ink/80 hover:-translate-y-0.5 hover:border-theme-accent',
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5">
        <Textarea
          label="Customisation"
          name="customisation"
          value={form.customisation}
          onChange={(v) => update('customisation', v)}
          placeholder="Logo print on packaging, ribbon colour, personalised message, any dietary preferences…"
          rows={3}
        />
      </div>

      <div className="mt-5">
        <Textarea
          label="Anything else we should know?"
          name="notes"
          value={form.notes}
          onChange={(v) => update('notes', v)}
          placeholder="Multi-city delivery details, timing, specific SKUs to include or exclude."
          rows={3}
        />
      </div>

      <label className="mt-5 flex items-center gap-2 text-sm text-theme-ink/85">
        <input
          type="checkbox"
          checked={form.sampleRequest}
          onChange={(e) => update('sampleRequest', e.target.checked)}
          className="h-4 w-4 rounded border-[color:var(--color-border)] text-theme-accent focus:ring-theme-accent"
        />
        Please also send a small sample pack.
      </label>

      <div className="mt-7 flex items-center gap-3">
        <button
          type="submit"
          disabled={state === 'pending'}
          className={cn(
            'group inline-flex items-center gap-2 rounded-full bg-theme-accent px-7 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300',
            state === 'pending' ? 'opacity-70' : 'hover:-translate-y-0.5 hover:shadow-lifted',
          )}
        >
          <AnimatePresence mode="wait">
            {state === 'pending' ? (
              <motion.span
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  className="inline-block h-4 w-4 rounded-full border-2 border-[color:var(--theme-base)] border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  aria-hidden="true"
                />
                Sending…
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Send enquiry
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <p className="flex items-center gap-1.5 text-xs text-theme-ink/60">
          <Sparkles className="h-3 w-3 text-theme-accent" aria-hidden="true" />
          Response within 24 hours
        </p>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  required,
}: FieldProps) {
  const invalid = Boolean(error);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
        {label}
        {required && <span className="ml-1 text-theme-accent">*</span>}
      </span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-err` : undefined}
        className={cn(
          'rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-theme-ink placeholder:text-theme-ink/40 transition-colors focus-visible:outline-none focus-visible:ring-2',
          invalid
            ? 'border-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/30'
            : 'border-[color:var(--color-border)] focus-visible:border-theme-accent focus-visible:ring-theme-accent/30',
        )}
      />
      {invalid && (
        <span id={`${name}-err`} className="text-[11px] font-semibold text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}

interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

function Textarea({ label, name, value, onChange, placeholder, rows = 4 }: TextareaProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/60">
        {label}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-xl border border-[color:var(--color-border)] bg-surface px-3.5 py-2.5 text-sm text-theme-ink placeholder:text-theme-ink/40 transition-colors focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
      />
    </label>
  );
}
