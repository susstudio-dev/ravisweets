'use client';

import { useMemo, useState } from 'react';
import { ImagePlus, Search, Trash2 } from 'lucide-react';
import { CATALOGUE } from '@ravisweets/shared';
import {
  deleteMediaAsset,
  updateAssetAlt,
  uploadMediaAsset,
  type MediaAsset,
  type MediaKind,
} from '@/lib/media/assets';
import { mediaPublicUrl } from '@/lib/media/public-url';
import { scanAssetUsage, type UsageHit } from '@/lib/media/usage';
import { useMediaAssets, useSiteContent } from '@/lib/supabase/site-content-context';

/**
 * The Media library — the single home for every owner photo (spec §5).
 * Upload, search, annotate, and delete media_assets; the "Where is this
 * used?" disclosure + delete guard keep the owner from stranding a page
 * slot or product image on a removed file.
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

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function AdminMedia() {
  const { assets, refresh } = useMediaAssets();
  const { pageMedia, productImages } = useSiteContent();
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<MediaKind | 'all'>('all');
  const [progress, setProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Static catalogue titles + the DB images overlay, so usage hits name real
  // products even before the seed migration fills the products table.
  const products = useMemo(() => {
    const known = new Set<string>();
    const merged: { title: string; images: { url: string }[] }[] = [];
    for (const p of CATALOGUE) {
      known.add(p.id);
      merged.push({ title: p.title, images: productImages[p.id] ?? p.images });
    }
    for (const [id, images] of Object.entries(productImages)) {
      if (!known.has(id)) merged.push({ title: id, images });
    }
    return merged;
  }, [productImages]);

  const usageByAsset = useMemo(() => {
    const map = new Map<string, UsageHit[]>();
    for (const a of assets) {
      map.set(
        a.id,
        scanAssetUsage({ assetId: a.id, storagePath: a.storage_path, pageMedia, products }),
      );
    }
    return map;
  }, [assets, pageMedia, products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (kindFilter !== 'all' && a.kind !== kindFilter) return false;
      if (!q) return true;
      return a.storage_path.toLowerCase().includes(q) || a.alt.toLowerCase().includes(q);
    });
  }, [assets, query, kindFilter]);

  async function handleFiles(files: File[]) {
    if (files.length === 0 || progress) return;
    setUploadError(null);
    const kind: MediaKind = kindFilter !== 'all' ? kindFilter : 'general';
    const failures: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      setProgress(
        files.length > 1
          ? `Uploading ${i + 1} of ${files.length} — ${file.name}…`
          : `Uploading ${file.name}…`,
      );
      const r = await uploadMediaAsset(file, kind);
      if (!r.ok) failures.push(`${file.name}: ${r.reason}`);
    }
    setProgress(null);
    if (failures.length > 0) setUploadError(failures.join(' · '));
    refresh();
  }

  async function handleDelete(asset: MediaAsset) {
    if (
      !window.confirm(`Delete ${pathTail(asset.storage_path)}? This cannot be undone.`)
    ) {
      return;
    }
    setDeletingId(asset.id);
    const r = await deleteMediaAsset(asset);
    setDeletingId(null);
    if (!r.ok) {
      window.alert(`Delete failed: ${r.reason}`);
      return;
    }
    refresh();
  }

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void handleFiles(Array.from(e.dataTransfer.files));
    },
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-theme-accent text-[11px] font-semibold uppercase tracking-[0.18em]">
          Photo library
        </p>
        <h1 className="font-display text-theme-ink mt-1 text-3xl md:text-4xl">Media</h1>
        <p className="text-theme-ink/65 mt-1 text-sm">
          Every photo on the site lives here. Upload once, use it anywhere from the Photos tab or a
          product.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <label
          {...dropHandlers}
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
            {progress ? 'Uploading…' : 'Upload photos'}
          </span>
          <span className="text-theme-ink/55 text-[11px]">
            {progress ?? 'or drop photos here — big photos are auto-shrunk on upload'}
          </span>
        </label>
        {uploadError && <p className="text-[11px] font-medium text-red-700">{uploadError}</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block flex-1 sm:max-w-md">
            <Search
              className="text-theme-ink/40 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by filename or alt text…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-surface-elevated text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-full border border-[color:var(--color-border)] px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as MediaKind | 'all')}
            aria-label="Filter by kind"
            className="bg-surface-elevated text-theme-ink focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 rounded-full border border-[color:var(--color-border)] px-3 py-2 text-sm capitalize focus-visible:outline-none focus-visible:ring-2"
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

      {assets.length === 0 ? (
        <div
          {...dropHandlers}
          className={`bg-surface-elevated rounded-2xl border border-dashed p-10 text-center transition-colors ${
            dragOver ? 'border-theme-accent' : 'border-[color:var(--color-border)]'
          }`}
        >
          <ImagePlus className="text-theme-ink/40 mx-auto h-8 w-8" aria-hidden="true" />
          <p className="text-theme-ink/65 mt-3 text-sm">
            No photos yet — drop images here. Phone photos are fine; they&rsquo;re shrunk
            automatically.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-theme-ink/55 text-sm">No photos match your search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((a) => {
            const url = mediaPublicUrl(a.storage_path);
            const usage = usageByAsset.get(a.id) ?? [];
            const inUse = usage.length > 0;
            return (
              <article
                key={a.id}
                className="bg-surface-elevated flex flex-col rounded-2xl border border-[color:var(--color-border)] p-3"
              >
                <div className="bg-theme-glow/10 aspect-square w-full overflow-hidden rounded-xl border border-[color:var(--color-border)]">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={a.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-theme-ink/40 flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wider">
                      No preview
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between gap-1">
                  <span
                    title={a.storage_path}
                    className="text-theme-ink/70 truncate font-mono text-[11px]"
                  >
                    {pathTail(a.storage_path)}
                  </span>
                  <span className="bg-theme-glow/30 text-theme-accent shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {a.kind}
                  </span>
                </div>
                <p className="text-theme-ink/55 text-[11px]">
                  {a.width && a.height ? `${a.width}×${a.height} · ` : ''}
                  {formatBytes(a.bytes)}
                </p>

                <label className="mt-2 flex flex-col gap-1">
                  <span className="text-theme-ink/55 text-[10px] font-semibold uppercase tracking-wider">
                    Alt text
                  </span>
                  <input
                    type="text"
                    defaultValue={a.alt}
                    placeholder="Describes the photo for screen readers"
                    onBlur={(e) => {
                      const alt = e.target.value;
                      if (alt !== a.alt) void updateAssetAlt(a.id, alt).then(refresh);
                    }}
                    className="bg-surface text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:ring-theme-accent/30 w-full rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2"
                  />
                </label>

                <details className="mt-2">
                  <summary className="text-theme-ink/65 hover:text-theme-ink cursor-pointer text-[11px] font-semibold">
                    Where is this used?
                  </summary>
                  {usage.length === 0 ? (
                    <p className="text-theme-ink/55 mt-1 text-[11px]">Not used anywhere yet.</p>
                  ) : (
                    <ul className="text-theme-ink/70 mt-1 flex flex-col gap-0.5 text-[11px]">
                      {usage.map((h) => (
                        <li key={h.where}>{h.where}</li>
                      ))}
                    </ul>
                  )}
                </details>

                <div className="mt-auto pt-3">
                  <span
                    className="inline-flex"
                    title={
                      inUse
                        ? `In use: ${usage.map((h) => h.where).join(' · ')} — remove it there first.`
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => void handleDelete(a)}
                      disabled={inUse || deletingId === a.id}
                      className="text-theme-ink/70 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-[11px] font-semibold transition-colors hover:border-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {deletingId === a.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
