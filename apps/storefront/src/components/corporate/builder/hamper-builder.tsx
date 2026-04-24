'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CATALOGUE,
  TEMPLATES,
  computePrice,
  BUILDER_MOQ,
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
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

const ELIGIBLE_PRODUCTS: Product[] = CATALOGUE.filter((p) => p.builder_eligible);

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

  // Sync config into URL so the page state is shareable + back/forward-friendly.
  useEffect(() => {
    const next = serialiseConfig(config);
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`/corporate/builder?${next}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // Price derivation
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

  // Actions
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

  const pickTemplate = useCallback(
    (id: TemplateId) => {
      setConfig(configFromTemplate(id));
    },
    [],
  );

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
              Compose your hamper.
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

      {/* Template picker */}
      <TemplatePicker
        activeTemplateId={config.templateId}
        itemsDirty={config.items.length > 0}
        onPick={pickTemplate}
      />

      {/* Main grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr_minmax(280px,320px)] lg:gap-10">
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

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <PriceSummary
            price={price}
            totalUnits={config.totalUnits}
            onChangeUnits={(qty) => updateCustomisation({ totalUnits: qty })}
          />

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

          {/* Submit */}
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
        </div>
      </div>

      {/* Mobile-only fixed bottom summary bar */}
      <MobileSummaryBar
        price={price}
        totalUnits={config.totalUnits}
        itemCount={config.items.length}
        disabled={belowMoq || config.items.length === 0}
        onSubmit={submitEnquiry}
      />
    </section>
  );
}

/* Re-export helpers for the child components that don't need the whole builder */
export type { HamperConfig };
