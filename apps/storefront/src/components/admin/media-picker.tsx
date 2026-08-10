'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Search, X } from 'lucide-react';
import type { ImageRef } from '@/lib/content/page-media';
import {
  updateAssetAlt,
  uploadMediaAsset,
  type MediaAsset,
  type MediaKind,
} from '@/lib/media/assets';
import { mediaPublicUrl } from '@/lib/media/public-url';
import { useMediaAssets } from '@/lib/supabase/site-content-context';

/**
 * The shared photo-selection surface for every admin edit that ends in an
 * image: MediaPickerDialog (searchable library modal with inline upload) and
 * MediaField (labelled slot editor used by the Photos tab and product forms).
 * Both read the live media_assets registry via useMediaAssets() so an upload
 * anywhere shows up everywhere.
 */

const KIND_OPTIONS: MediaKind[] = [
  'product',
  'hero',
  'festival',
  'store',
  'category',
  'og',
  'general',
];

const ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml';

function pathTail(storagePath: string): string {
  return storagePath.split('/').pop() ?? storagePath;
}

export function MediaPickerDialog({
  open,
  kind,
  onClose,
  onSelect,
}: {
  open: boolean;
  kind?: MediaKind;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}) {
  const { assets, refresh } = useMediaAssets();
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<MediaKind | 'all'>(kind ?? 'all');
  const [progress, setProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Re-arm the defaults every time the dialog opens.
  useEffect(() => {
    if (open) {
      setKindFilter(kind ?? 'all');
      setQuery('');
      setUploadError(null);
    }
  }, [open, kind]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (kindFilter !== 'all' && a.kind !== kindFilter) return false;
      if (!q) return true;
      return a.storage_path.toLowerCase().includes(q) || a.alt.toLowerCase().includes(q);
    });
  }, [assets, query, kindFilter]);

  if (!open) return null;

  const uploadKind: MediaKind = kindFilter !== 'all' ? kindFilter : (kind ?? 'general');

  async function handleFiles(files: File[]) {
    if (files.length === 0 || progress) return;
    setUploadError(null);
    const uploaded: MediaAsset[] = [];
    const failures: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      setProgress(
        files.length > 1
          ? `Uploading ${i + 1} of ${files.length} — ${file.name}…`
          : `Uploading ${file.name}…`,
      );
      const r = await uploadMediaAsset(file, uploadKind);
      if (r.ok) uploaded.push(r.asset);
      else failures.push(`${file.name}: ${r.reason}`);
    }
    setProgress(null);
    if (failures.length > 0) setUploadError(failures.join(' · '));
    refresh();
    // A single fresh upload is what the owner came for — hand it straight back.
    if (files.length === 1 && uploaded.length === 1) {
      onSelect(uploaded[0]!);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close media library"
        onClick={onClose}
        className="absolute inset-0 bg-[#1a0a02]/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a photo"
        className="bg-surface-elevated shadow-lifted relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)]"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4">
          <h2 className="font-display text-theme-ink text-xl">Choose a photo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-theme-ink/55 hover:bg-theme-glow/15 hover:text-theme-ink rounded-full p-1.5"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-[color:var(--color-border)] px-5 py-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFiles(Array.from(e.dataTransfer.files));
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 transition-colors ${
              dragOver
                ? 'border-theme-accent bg-theme-glow/25'
                : 'bg-theme-glow/10 border-[color:var(--color-border)]'
            }`}
          >
            <input
              type="file"
              multiple
              accept={ACCEPT}
              disabled={!!progress}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = '';
                void handleFiles(files);
              }}
              className="sr-only"
            />
            <span className="bg-theme-accent inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[color:var(--theme-base)]">
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              {progress ? 'Uploading…' : 'Upload'}
            </span>
            <span className="text-theme-ink/55 text-[11px]">
              {progress ?? 'or drop photos here — big photos are auto-shrunk'}
            </span>
          </label>
          {uploadError && (
            <p className="text-[11px] font-medium text-red-700">{uploadError}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block flex-1">
              <Search
                className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by filename or alt text…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-full border border-[color:var(--color-border)] px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
              />
            </label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as MediaKind | 'all')}
              aria-label="Filter by kind"
              className="bg-surface text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-full border border-[color:var(--color-border)] px-3 py-2 text-sm capitalize focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="all">All kinds</option>
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="text-theme-ink/55 py-8 text-center text-sm">
              {assets.length === 0
                ? 'No photos yet — upload your first one above.'
                : 'No photos match your search.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((a) => {
                const url = mediaPublicUrl(a.storage_path);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onSelect(a);
                      onClose();
                    }}
                    className="hover:border-theme-accent focus-visible:ring-theme-accent/30 flex flex-col overflow-hidden rounded-xl border border-[color:var(--color-border)] text-left transition-colors focus-visible:outline-none focus-visible:ring-2"
                  >
                    <span className="bg-theme-glow/10 block aspect-square w-full overflow-hidden">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={a.alt}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-theme-ink/40 flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wider">
                          No preview
                        </span>
                      )}
                    </span>
                    <span className="flex w-full items-center justify-between gap-1 px-2 py-1.5">
                      <span className="text-theme-ink/70 truncate font-mono text-[10px]">
                        {pathTail(a.storage_path)}
                      </span>
                      <span className="bg-theme-glow/30 text-theme-accent shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                        {a.kind}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MediaField({
  label,
  hint,
  kind,
  value,
  onChange,
  aspect = 'square',
}: {
  label: string;
  hint?: string;
  kind?: MediaKind;
  value: ImageRef;
  onChange: (ref: ImageRef) => void;
  aspect?: 'square' | 'wide' | 'portrait';
}) {
  const { byId, refresh } = useMediaAssets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);

  const asset = value ? (byId.get(value.assetId) ?? null) : null;
  const url = asset ? mediaPublicUrl(asset.storage_path) : null;
  const aspectClass =
    aspect === 'wide' ? 'aspect-video' : aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';
  const altValue = value?.alt ?? '';
  // Offer to promote a freshly written alt to the library-wide default when
  // the asset itself has none yet.
  const canSaveDefault = !!asset && asset.alt === '' && altValue.trim() !== '';

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
        <p className="text-theme-ink/55 text-[11px]">
          {hint ?? 'WebP/JPEG/PNG/AVIF · big photos are auto-shrunk on upload'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <div
          className={`bg-theme-glow/10 overflow-hidden rounded-xl border border-[color:var(--color-border)] ${aspectClass}`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={altValue || asset?.alt || ''} className="h-full w-full object-cover" />
          ) : (
            <div className="text-theme-ink/40 flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wider">
              No image
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {value ? (
              <>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-[11px] font-semibold transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-[11px] font-semibold transition-colors"
                >
                  Clear
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="bg-theme-accent hover:shadow-soft inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[color:var(--theme-base)] transition-all"
              >
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                Choose from library
              </button>
            )}
          </div>

          {value && !asset && (
            <p className="text-[11px] font-medium text-amber-700">
              This photo is no longer in the library — choose another.
            </p>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
              Alt text
            </span>
            <input
              type="text"
              value={altValue}
              disabled={!value}
              placeholder="Describes the photo for screen readers"
              onChange={(e) => {
                if (value) onChange({ ...value, alt: e.target.value });
              }}
              className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
            />
          </label>

          {canSaveDefault && (
            <button
              type="button"
              disabled={savingDefault}
              onClick={async () => {
                if (!asset) return;
                setSavingDefault(true);
                await updateAssetAlt(asset.id, altValue.trim());
                setSavingDefault(false);
                refresh();
              }}
              className="text-theme-accent self-start text-[11px] font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingDefault ? 'Saving…' : 'Save as the library default for this photo'}
            </button>
          )}
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        kind={kind}
        onClose={() => setPickerOpen(false)}
        onSelect={(a) => onChange({ assetId: a.id, alt: a.alt })}
      />
    </div>
  );
}
