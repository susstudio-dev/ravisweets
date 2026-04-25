'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CATALOGUE,
  TEMPLATES,
  computePrice,
  BUILDER_MOQ,
  formatMoney,
  type HamperConfig,
  type Product,
  type TemplateId,
} from '@ravisweets/shared';
import { Paisley } from '@/components/brand/paisley';
import { Reveal } from '@/components/motion/reveal';
import {
  BUILDER_SCHEMA_VERSION,
  configFromTemplate,
  parseConfig,
  serialiseConfig,
  summariseConfig,
} from '@/lib/builder/url-schema';
import { TemplatePicker } from './template-picker';
import { ItemPalette } from './item-palette';
import { HamperCanvas } from './hamper-canvas';
import { CustomisationPanel } from './customisation-panel';
import { PriceSummary } from './price-summary';
import { ShareButton } from './share-button';
import { MobileSummaryBar } from './mobile-summary-bar';
import { BuilderStepper, STEP_LABEL, STEP_ORDER, type BuilderStep } from './builder-stepper';
import { TierCelebration } from './tier-celebration';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

const ELIGIBLE_PRODUCTS: Product[] = CATALOGUE.filter((p) => p.builder_eligible);

function isStep(s: string | null): s is BuilderStep {
  return s !== null && (STEP_ORDER as string[]).includes(s);
}

export function HamperBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();

  const [config, setConfig] = useState<HamperConfig>(() => {
    const parsed = parseConfig(searchParams);
    if (parsed) return parsed;
    const templateParam = searchParams.get('t') as TemplateId | null;
    return configFromTemplate(
      templateParam && TEMPLATES[templateParam] ? templateParam : 'premium',
    );
  });
  const [schemaRejected, setSchemaRejected] = useState<boolean>(() => {
    const v = searchParams.get('v');
    return v !== null && Number(v) !== BUILDER_SCHEMA_VERSION;
  });

  // Stepper state
  const initialStep: BuilderStep = (() => {
    const s = searchParams.get('step');
    if (isStep(s)) return s;
    return 'template';
  })();
  const [step, setStep] = useState<BuilderStep>(initialStep);
  const [visited, setVisited] = useState<Set<BuilderStep>>(() => new Set([initialStep]));

  function jumpTo(next: BuilderStep) {
    setStep(next);
    setVisited((prev) => new Set(prev).add(next));
  }
  function nextStep() {
    const i = STEP_ORDER.indexOf(step);
    if (i < STEP_ORDER.length - 1) jumpTo(STEP_ORDER[i + 1]!);
  }
  function prevStep() {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) jumpTo(STEP_ORDER[i - 1]!);
  }

  // Sync config + step into URL
  useEffect(() => {
    const next = serialiseConfig(config);
    const params = new URLSearchParams(next);
    params.set('step', step);
    const finalQs = params.toString();
    if (finalQs !== searchParams.toString()) {
      router.replace(`/corporate/builder?${finalQs}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, step]);

  const lookup = useCallback((productId: string, variantId: string) => {
    const p = CATALOGUE.find((x) => x.id === productId);
    const v = p?.variants.find((x) => x.id === variantId);
    if (!p || !v) return null;
    return { unitPrice: v.price.amount, currency: 'INR' as const };
  }, []);

  const price = useMemo(
    () => computePrice({ items: config.items, totalUnits: config.totalUnits, lookup }),
    [config.items, config.totalUnits, lookup],
  );

  const addItem = useCallback((productId: string, variantId: string) => {
    setConfig((prev) => {
      const existing = prev.items.find(
        (it) => it.productId === productId && it.variantId === variantId,
      );
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.productId === productId && it.variantId === variantId
              ? { ...it, qtyPerHamper: Math.min(10, it.qtyPerHamper + 1) }
              : it,
          ),
        };
      }
      if (prev.items.length >= 30) return prev;
      return {
        ...prev,
        items: [...prev.items, { productId, variantId, qtyPerHamper: 1 }],
      };
    });
  }, []);

  const updateQty = useCallback((productId: string, variantId: string, qty: number) => {
    setConfig((prev) => {
      if (qty <= 0) {
        return {
          ...prev,
          items: prev.items.filter(
            (it) => !(it.productId === productId && it.variantId === variantId),
          ),
        };
      }
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.productId === productId && it.variantId === variantId
            ? { ...it, qtyPerHamper: Math.min(10, qty) }
            : it,
        ),
      };
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter(
        (it) => !(it.productId === productId && it.variantId === variantId),
      ),
    }));
  }, []);

  const pickTemplate = useCallback((id: TemplateId) => {
    setConfig(configFromTemplate(id));
  }, []);

  const updateCustomisation = useCallback(
    (patch: Partial<
      Pick<HamperConfig, 'ribbon' | 'box' | 'logoPrint' | 'message' | 'totalUnits'>
    >) => {
      setConfig((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const submitEnquiry = useCallback(() => {
    const lookupProduct = (id: string) => {
      const p = CATALOGUE.find((x) => x.id === id);
      return p ? { title: p.title } : null;
    };
    const lookupVariant = (pid: string, vid: string) => {
      const p = CATALOGUE.find((x) => x.id === pid);
      const v = p?.variants.find((x) => x.id === vid);
      return v ? { title: v.title } : null;
    };
    const summary = summariseConfig(config, lookupProduct, lookupVariant);
    const params = new URLSearchParams({
      from: 'builder',
      state: serialiseConfig(config),
      summary,
    });
    router.push(`/corporate?${params.toString()}#enquiry`);
  }, [config, router]);

  const belowMoq = config.totalUnits < BUILDER_MOQ;
  const addedCount = config.items.reduce((s, i) => s + i.qtyPerHamper, 0);
  const canAdvance = step === 'template'
    ? true
    : step === 'compose'
    ? config.items.length > 0
    : step === 'customise'
    ? config.totalUnits >= BUILDER_MOQ
    : !belowMoq && config.items.length > 0;

  return (
    <section className="container-site py-8 md:py-12">
      {/* Header */}
      <Reveal>
        <Link
          href="/corporate"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-theme-ink/60 transition-colors hover:text-theme-accent"
        >
          ← Back to corporate
        </Link>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-accent">
              <Paisley size="sm" />
              Hamper builder
            </p>
            <h1 className="mt-2 font-display text-display-md leading-[1.02] text-theme-ink md:text-display-lg">
              {STEP_LABEL[step].title === 'Start'
                ? 'Start with a template.'
                : STEP_LABEL[step].title === 'Compose'
                ? 'Compose the box.'
                : STEP_LABEL[step].title === 'Customise'
                ? 'Make it yours.'
                : 'Review and submit.'}
            </h1>
          </div>
          <ShareButton
            config={config}
            disabled={config.items.length === 0 || belowMoq}
          />
        </div>
      </Reveal>

      {/* Schema mismatch toast */}
      <AnimatePresence>
        {schemaRejected && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick, ease: EASE.standard }}
            role="status"
            className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-theme-ink"
          >
            <p>
              This link uses an unsupported format. We&rsquo;ve loaded a fresh Premium template
              instead.
            </p>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wider text-theme-accent hover:underline"
              onClick={() => setSchemaRejected(false)}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stepper */}
      <BuilderStepper current={step} onJump={jumpTo} visited={visited} />

      {/* Tier celebration */}
      <TierCelebration
        tierId={price.tier.id}
        tierLabel={price.tier.label}
        discount={price.tier.discount}
      />

      {/* Step content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {step === 'template' && (
            <motion.div
              key="step-template"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
            >
              <TemplatePicker
                activeTemplateId={config.templateId}
                itemsDirty={config.items.length > 0}
                onPick={(id) => {
                  pickTemplate(id);
                }}
              />
              <HelpRow
                helps={[
                  'Pick a template to start fast — we pre-fill items and units.',
                  `Custom builds allowed; minimum order ${BUILDER_MOQ} hampers.`,
                  'You can change everything in the next step.',
                ]}
              />
            </motion.div>
          )}

          {step === 'compose' && (
            <motion.div
              key="step-compose"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="grid gap-8 lg:grid-cols-[minmax(340px,1fr)_1.4fr] lg:gap-10"
            >
              <ItemPalette
                products={ELIGIBLE_PRODUCTS}
                selectedCount={addedCount}
                onAdd={addItem}
              />
              <HamperCanvas
                items={config.items}
                ribbon={config.ribbon}
                box={config.box}
                logoPrint={config.logoPrint}
                message={config.message}
                onUpdateQty={updateQty}
                onRemove={removeItem}
              />
            </motion.div>
          )}

          {step === 'customise' && (
            <motion.div
              key="step-customise"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,360px)] lg:gap-10"
            >
              <div className="flex flex-col gap-6">
                <CustomisationPanel
                  ribbon={config.ribbon}
                  box={config.box}
                  logoPrint={config.logoPrint}
                  message={config.message}
                  onRibbonChange={(r) => updateCustomisation({ ribbon: r })}
                  onBoxChange={(b) => updateCustomisation({ box: b })}
                  onLogoToggle={(v) => updateCustomisation({ logoPrint: v })}
                  onMessageChange={(m) => updateCustomisation({ message: m })}
                />
                <HamperCanvas
                  items={config.items}
                  ribbon={config.ribbon}
                  box={config.box}
                  logoPrint={config.logoPrint}
                  message={config.message}
                  onUpdateQty={updateQty}
                  onRemove={removeItem}
                />
              </div>
              <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
                <PriceSummary
                  price={price}
                  totalUnits={config.totalUnits}
                  onChangeUnits={(qty) => updateCustomisation({ totalUnits: qty })}
                />
                <HelpRow
                  helps={[
                    `Minimum order is ${BUILDER_MOQ} hampers (MOQ).`,
                    'Lead time is 7–10 business days from order confirmation.',
                    'Tier discount is applied per unit and shown live above.',
                  ]}
                />
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="step-review"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.standard }}
              className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10"
            >
              <ReviewSummary config={config} />
              <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
                <PriceSummary
                  price={price}
                  totalUnits={config.totalUnits}
                  onChangeUnits={(qty) => updateCustomisation({ totalUnits: qty })}
                />
                <button
                  type="button"
                  onClick={submitEnquiry}
                  disabled={belowMoq || config.items.length === 0}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Submit as enquiry
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
                {belowMoq && (
                  <p className="text-xs text-theme-ink/70">
                    Minimum {BUILDER_MOQ} units — add {BUILDER_MOQ - config.totalUnits} more to submit.
                  </p>
                )}
                <HelpRow
                  helps={[
                    'After submitting, our team replies within one business day.',
                    'No payment is taken at this step — this is a quote enquiry.',
                  ]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step nav */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={STEP_ORDER.indexOf(step) === 0}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-5 py-2.5 text-sm font-semibold text-theme-ink/80 transition-colors hover:border-theme-accent hover:text-theme-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <p className="text-xs text-theme-ink/55">
          {price.total > 0 && `Live total: ${formatMoney({ amount: price.total, currency: 'INR' })}`}
        </p>
        {step !== 'review' && (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canAdvance}
            className="group inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
          >
            Continue
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Mobile-only fixed bottom summary bar (only useful on compose/customise/review) */}
      {step !== 'template' && (
        <MobileSummaryBar
          price={price}
          totalUnits={config.totalUnits}
          itemCount={config.items.length}
          disabled={belowMoq || config.items.length === 0}
          onSubmit={step === 'review' ? submitEnquiry : nextStep}
        />
      )}
    </section>
  );
}

function HelpRow({ helps }: { helps: string[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-2 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-surface-elevated p-4">
      {helps.map((h, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-theme-ink/70">
          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-accent" aria-hidden="true" />
          <span>{h}</span>
        </li>
      ))}
    </ul>
  );
}

function ReviewSummary({ config }: { config: HamperConfig }) {
  const lines = config.items.map((it) => {
    const p = CATALOGUE.find((x) => x.id === it.productId);
    const v = p?.variants.find((x) => x.id === it.variantId);
    return { p, v, qty: it.qtyPerHamper };
  });
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
        Your hamper
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-theme-ink">
        {lines.length} item types · {config.totalUnits} hampers
      </h2>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Box finish
          </dt>
          <dd className="mt-1 font-display text-base font-semibold text-theme-ink capitalize">
            {config.box.replace('-', ' ')}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Ribbon
          </dt>
          <dd className="mt-1 font-display text-base font-semibold text-theme-ink capitalize">
            {config.ribbon}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Logo print
          </dt>
          <dd className="mt-1 font-display text-base font-semibold text-theme-ink">
            {config.logoPrint ? 'Yes' : 'No'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
            Personalised note
          </dt>
          <dd className="mt-1 text-sm text-theme-ink/85">
            {config.message ? `"${config.message}"` : 'None'}
          </dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-[color:var(--color-border)] pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-ink/55">
          Items per hamper
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {lines.map(({ p, v, qty }, i) =>
            p && v ? (
              <li key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-theme-ink">{p.title}</span>
                <span className="text-theme-ink/55">
                  {v.title} × {qty}
                </span>
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </div>
  );
}

/* Re-export helpers for the child components that don't need the whole builder */
export type { HamperConfig };
