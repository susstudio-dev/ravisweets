'use client';

import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import {
  loadSettings,
  saveSettings,
  type DeliveryZoneEntry,
  type StoreHourEntry,
  type StoreSettings,
} from '@/lib/supabase/settings';
import { logAdminAction } from '@/lib/supabase/orders';
import { useSession } from '@/lib/supabase/session-context';

export function AdminSettings() {
  const { configured } = useSession();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  async function save() {
    if (!settings) return;
    if (!configured) {
      window.alert('Supabase not configured.');
      return;
    }
    setBusy(true);
    const r = await saveSettings(settings);
    setBusy(false);
    if (!r.ok) {
      window.alert(`Save failed: ${r.reason}`);
      return;
    }
    await logAdminAction('save', 'store_settings', 'singleton', null, settings);
    window.alert('Settings saved.');
  }

  if (!settings) return <div className="h-8 w-32 animate-pulse rounded bg-theme-ink/10" />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
            Configuration
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-theme-ink/65">
            Store hours, delivery zones, owner profile, and filter taxonomy. All edits land in the
            singleton <code>store_settings</code> row.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={busy || !configured}
          className="inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-[color:var(--theme-base)] shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </header>

      <Section title="Store hours">
        {settings.storeHours.map((h, i) => (
          <div key={i} className="grid grid-cols-[2fr_3fr_auto] items-end gap-2">
            <Field label="Days">
              <input
                type="text"
                value={h.days}
                onChange={(e) => {
                  const next = [...settings.storeHours];
                  next[i] = { ...next[i]!, days: e.target.value };
                  setSettings({ ...settings, storeHours: next });
                }}
                className={inputCls}
              />
            </Field>
            <Field label="Hours">
              <input
                type="text"
                value={h.time}
                onChange={(e) => {
                  const next = [...settings.storeHours];
                  next[i] = { ...next[i]!, time: e.target.value };
                  setSettings({ ...settings, storeHours: next });
                }}
                className={inputCls}
              />
            </Field>
            <RemoveBtn
              onClick={() => {
                const next = settings.storeHours.filter((_, idx) => idx !== i);
                setSettings({ ...settings, storeHours: next });
              }}
            />
          </div>
        ))}
        <AddBtn
          onClick={() => {
            const next: StoreHourEntry = { days: '', time: '' };
            setSettings({ ...settings, storeHours: [...settings.storeHours, next] });
          }}
        >
          Add hours row
        </AddBtn>
      </Section>

      <Section title="Delivery zones">
        {settings.deliveryZones.map((z, i) => (
          <div key={i} className="grid grid-cols-[2fr_2fr_1fr_auto] items-end gap-2">
            <Field label="Label">
              <input
                type="text"
                value={z.label}
                onChange={(e) => {
                  const next = [...settings.deliveryZones];
                  next[i] = { ...next[i]!, label: e.target.value };
                  setSettings({ ...settings, deliveryZones: next });
                }}
                className={inputCls}
              />
            </Field>
            <Field label="Pincode pattern">
              <input
                type="text"
                value={z.pincodes}
                onChange={(e) => {
                  const next = [...settings.deliveryZones];
                  next[i] = { ...next[i]!, pincodes: e.target.value };
                  setSettings({ ...settings, deliveryZones: next });
                }}
                className={inputCls}
              />
            </Field>
            <Field label="Lead days">
              <input
                type="number"
                value={z.leadDays}
                onChange={(e) => {
                  const next = [...settings.deliveryZones];
                  next[i] = { ...next[i]!, leadDays: Number(e.target.value) };
                  setSettings({ ...settings, deliveryZones: next });
                }}
                className={inputCls}
              />
            </Field>
            <RemoveBtn
              onClick={() => {
                const next = settings.deliveryZones.filter((_, idx) => idx !== i);
                setSettings({ ...settings, deliveryZones: next });
              }}
            />
          </div>
        ))}
        <AddBtn
          onClick={() => {
            const next: DeliveryZoneEntry = { label: '', pincodes: '', leadDays: 3 };
            setSettings({ ...settings, deliveryZones: [...settings.deliveryZones, next] });
          }}
        >
          Add delivery zone
        </AddBtn>
      </Section>

      <Section title="Owner profile">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contact name">
            <input
              type="text"
              value={settings.ownerProfile.contactName ?? ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ownerProfile: { ...settings.ownerProfile, contactName: e.target.value },
                })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={settings.ownerProfile.phone ?? ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ownerProfile: { ...settings.ownerProfile, phone: e.target.value },
                })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={settings.ownerProfile.email ?? ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ownerProfile: { ...settings.ownerProfile, email: e.target.value },
                })
              }
              className={inputCls}
            />
          </Field>
          <Field label="FSSAI number">
            <input
              type="text"
              value={settings.ownerProfile.fssaiNumber ?? ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ownerProfile: { ...settings.ownerProfile, fssaiNumber: e.target.value },
                })
              }
              className={inputCls}
            />
          </Field>
          <Field label="GSTIN">
            <input
              type="text"
              value={settings.ownerProfile.gstinNumber ?? ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ownerProfile: { ...settings.ownerProfile, gstinNumber: e.target.value.toUpperCase() },
                })
              }
              className={`${inputCls} font-mono uppercase`}
            />
          </Field>
        </div>
      </Section>

      <Section title="Filter taxonomy">
        <p className="text-[11px] text-theme-ink/65">
          One filter group per row. Comma-separated values. The shop page reads these to render
          facets.
        </p>
        {Object.entries(settings.filterTaxonomy).map(([group, values]) => (
          <div key={group} className="grid grid-cols-[1fr_3fr_auto] items-end gap-2">
            <Field label="Group">
              <input
                type="text"
                value={group}
                onChange={(e) => {
                  const newKey = e.target.value;
                  const { [group]: oldVals, ...rest } = settings.filterTaxonomy;
                  setSettings({
                    ...settings,
                    filterTaxonomy: { ...rest, [newKey]: oldVals ?? [] },
                  });
                }}
                className={inputCls}
              />
            </Field>
            <Field label="Values (comma-separated)">
              <input
                type="text"
                value={values.join(', ')}
                onChange={(e) => {
                  const next = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setSettings({
                    ...settings,
                    filterTaxonomy: { ...settings.filterTaxonomy, [group]: next },
                  });
                }}
                className={inputCls}
              />
            </Field>
            <RemoveBtn
              onClick={() => {
                const { [group]: _, ...rest } = settings.filterTaxonomy;
                setSettings({ ...settings, filterTaxonomy: rest });
              }}
            />
          </div>
        ))}
        <AddBtn
          onClick={() => {
            setSettings({
              ...settings,
              filterTaxonomy: { ...settings.filterTaxonomy, NewGroup: [] },
            });
          }}
        >
          Add filter group
        </AddBtn>
      </Section>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
      <h2 className="font-display text-lg font-semibold text-theme-ink">{title}</h2>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
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

function AddBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-[color:var(--color-border)] px-3 py-1.5 text-xs font-semibold text-theme-ink/65 hover:border-theme-accent hover:text-theme-accent"
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove row"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-theme-ink/55 hover:bg-red-500/10 hover:text-red-700"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
