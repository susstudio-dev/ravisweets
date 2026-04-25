'use client';

import { useEffect, useState } from 'react';
import { listEnquiries } from '@/lib/supabase/enquiries';
import { useSession } from '@/lib/supabase/session-context';

interface Enquiry {
  refCode: string;
  submittedAt: number;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  occasion?: string;
  quantity?: string;
  budgetPerUnit?: string;
  hamperTier?: string;
  customisation?: string;
  personalNote?: string;
  fromBuilderSummary?: string;
  status?: string;
}

export function AdminEnquiries() {
  const { configured, user, role } = useSession();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let list: Enquiry[] = [];
      // Always layer localStorage submissions in for offline-mode parity.
      try {
        const raw = localStorage.getItem('ravi.enquiries.v1');
        if (raw) list = JSON.parse(raw);
      } catch {
        /* ignore */
      }
      if (configured && user && role === 'admin') {
        const live = await listEnquiries();
        if (cancelled) return;
        const liveMapped: Enquiry[] = live.map((row) => ({
          refCode: row.ref_code,
          submittedAt: new Date(row.created_at).getTime(),
          status: row.status,
          ...(row.data as Record<string, unknown>),
        }));
        const seen = new Set(liveMapped.map((e) => e.refCode));
        const merged = [...liveMapped, ...list.filter((e) => !seen.has(e.refCode))].sort(
          (a, b) => b.submittedAt - a.submittedAt,
        );
        setEnquiries(merged);
      } else {
        setEnquiries(list);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [configured, user, role]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          Inbox
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Corporate enquiries
        </h1>
        <p className="mt-1 text-sm text-theme-ink/65">
          {enquiries.length === 0
            ? 'No enquiries yet — submissions land here as soon as someone completes the corporate form.'
            : `${enquiries.length} enquiry${enquiries.length === 1 ? '' : ' submissions'}`}
        </p>
      </header>

      {enquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-10 text-center">
          <p className="text-sm text-theme-ink/55">
            Submissions are stored locally until Supabase <code>enquiries</code> table is wired.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
          <table className="w-full text-sm">
            <thead className="bg-theme-glow/10 text-[11px] font-semibold uppercase tracking-wider text-theme-ink/65">
              <tr>
                <th className="px-4 py-3 text-left">Ref</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Occasion</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Contact</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr
                  key={e.refCode}
                  className="border-t border-[color:var(--color-border)] hover:bg-theme-glow/10"
                >
                  <td className="px-4 py-3 font-mono text-xs text-theme-ink/85">{e.refCode}</td>
                  <td className="px-4 py-3 text-xs text-theme-ink/65">
                    {new Date(e.submittedAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-theme-ink">{e.name ?? '—'}</td>
                  <td className="px-4 py-3 text-theme-ink/65">{e.company ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-theme-ink/65">{e.occasion ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono">{e.quantity ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-theme-glow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-ink">
                      {e.status ?? 'new'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-theme-ink/65">
                    {e.email}
                    {e.phone && <br />}
                    {e.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
