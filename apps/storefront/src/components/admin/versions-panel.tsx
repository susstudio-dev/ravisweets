'use client';

import { useCallback, useEffect, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { listVersions, type ContentVersion } from '@/lib/supabase/versions';

/**
 * Collapsed "History" disclosure over site_content_versions. Every save
 * snapshots the previous row (migration 0013 trigger), so the owner can walk
 * back a bad photo swap. Restore hands the raw snapshot to the caller, whose
 * onRestore MUST route through the ordinary validated save path (spec §6.7).
 */

function shortAuthor(id: string | null): string {
  return id ? id.slice(0, 8) : 'unknown';
}

export function VersionsPanel({
  contentKey,
  onRestore,
}: {
  contentKey: 'page_media' | 'hero';
  onRestore: (data: unknown) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[] | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void listVersions(contentKey).then(setVersions);
  }, [contentKey]);

  // Versions load lazily on first open — the panel is a side-drawer of the
  // Photos tab, not part of its critical path.
  useEffect(() => {
    if (open && versions === null) refresh();
  }, [open, versions, refresh]);

  async function handleRestore(v: ContentVersion) {
    if (
      !window.confirm('Restore this version? The current photos become a new history entry.')
    ) {
      return;
    }
    setRestoringId(v.id);
    setMessage(null);
    setError(null);
    const ok = await onRestore(v.data);
    setRestoringId(null);
    if (!ok) {
      setError('Restore failed — try again.');
      return;
    }
    setMessage('Restored — live in a few seconds.');
    // The restore itself snapshots the replaced row — refetch so it shows.
    refresh();
  }

  return (
    <details
      className="bg-surface-elevated rounded-2xl border border-[color:var(--color-border)] p-5"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="text-theme-ink/85 hover:text-theme-ink flex cursor-pointer items-center gap-2 text-sm font-semibold">
        <History className="h-4 w-4" aria-hidden="true" />
        History
      </summary>

      <div className="mt-3 flex flex-col gap-2">
        {message && <p className="text-[11px] font-medium text-green-700">{message}</p>}
        {error && <p className="text-[11px] font-medium text-red-700">{error}</p>}

        {versions === null ? (
          <div className="bg-theme-ink/10 h-6 w-40 animate-pulse rounded" />
        ) : versions.length === 0 ? (
          <p className="text-theme-ink/55 text-sm">
            No history yet — versions appear here after your first save.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[color:var(--color-border)]">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-theme-ink/70 min-w-0 truncate text-[12px]">
                  {new Date(v.created_at).toLocaleString()}
                  {' · '}
                  <span className="font-mono text-[11px]">{shortAuthor(v.created_by)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void handleRestore(v)}
                  disabled={restoringId !== null}
                  className="text-theme-ink/85 hover:border-theme-accent hover:text-theme-accent inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  {restoringId === v.id ? 'Restoring…' : 'Restore'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
