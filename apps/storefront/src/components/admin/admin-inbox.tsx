'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Hourglass,
  Inbox,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  User,
} from 'lucide-react';
import {
  listSupportMessages,
  listSupportThreads,
  markThreadRead,
  sendReply,
  setThreadStatus,
  type SupportChannel,
  type SupportMessage,
  type SupportStatus,
  type SupportThread,
} from '@/lib/supabase/support';
import { useSession } from '@/lib/supabase/session-context';

const CHANNEL_META: Record<
  SupportChannel,
  { label: string; icon: typeof Inbox; tone: string }
> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, tone: '#25d366' },
  email: { label: 'Email', icon: Mail, tone: '#1a73e8' },
  instagram: { label: 'Instagram', icon: Instagram, tone: '#dd2a7b' },
  website: { label: 'Website', icon: Globe, tone: '#a8501f' },
};

const STATUS_OPTIONS: { value: SupportStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'spam', label: 'Spam' },
];

export function AdminInbox() {
  const { configured } = useSession();
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState<SupportStatus | 'all'>('open');
  const [filterChannel, setFilterChannel] = useState<SupportChannel | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function refreshThreads() {
    setLoading(true);
    const t = await listSupportThreads();
    setThreads(t);
    if (!activeId && t.length > 0 && t[0]) setActiveId(t[0].id);
    setLoading(false);
  }

  useEffect(() => {
    void refreshThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    void (async () => {
      const m = await listSupportMessages(activeId);
      setMessages(m);
      const t = threads.find((x) => x.id === activeId);
      if (t?.unread) {
        await markThreadRead(activeId);
        setThreads((prev) =>
          prev.map((x) => (x.id === activeId ? { ...x, unread: false } : x)),
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (filterChannel !== 'all' && t.channel !== filterChannel) return false;
      return true;
    });
  }, [threads, filter, filterChannel]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const channelMeta = active ? CHANNEL_META[active.channel] : null;

  async function onSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !reply.trim() || busy) return;
    setBusy(true);
    setError(null);
    const r = await sendReply(activeId, reply);
    setBusy(false);
    if (!r.ok) {
      setError(r.reason ?? 'Send failed.');
      return;
    }
    setReply('');
    const m = await listSupportMessages(activeId);
    setMessages(m);
    void refreshThreads();
  }

  async function onChangeStatus(s: SupportStatus) {
    if (!activeId) return;
    const r = await setThreadStatus(activeId, s);
    if (r.ok) {
      setThreads((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: s } : t)),
      );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
            <Inbox className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
            Customer service
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
            Unified inbox
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-theme-ink/65">
            One screen for WhatsApp, email, Instagram and website enquiries —
            threaded by customer. Channel adapters land progressively; meanwhile
            anything inserted into <code>support_threads</code> shows up here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshThreads()}
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-[color:var(--color-border)] bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-theme-ink/75 hover:border-theme-accent hover:text-theme-accent md:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </header>

      {!configured && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Supabase not configured — connect <code>.env.local</code>.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          label="All"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        {STATUS_OPTIONS.map((s) => (
          <FilterPill
            key={s.value}
            label={s.label}
            active={filter === s.value}
            onClick={() => setFilter(s.value)}
          />
        ))}
        <span className="mx-1 h-4 w-px bg-theme-ink/20" aria-hidden="true" />
        <FilterPill
          label="All channels"
          active={filterChannel === 'all'}
          onClick={() => setFilterChannel('all')}
        />
        {(Object.keys(CHANNEL_META) as SupportChannel[]).map((c) => (
          <FilterPill
            key={c}
            label={CHANNEL_META[c].label}
            tone={CHANNEL_META[c].tone}
            active={filterChannel === c}
            onClick={() => setFilterChannel(c)}
          />
        ))}
      </div>

      {/* Inbox grid: thread list + conversation pane */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:gap-5">
        {/* Thread list */}
        <aside className="flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
          <div className="border-b border-[color:var(--color-border)] px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-theme-ink/55">
              {filtered.length} {filtered.length === 1 ? 'thread' : 'threads'}
            </p>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {loading ? (
              <li className="p-4">
                <div className="h-4 w-32 animate-pulse rounded bg-theme-ink/10" />
                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-theme-ink/10" />
              </li>
            ) : filtered.length === 0 ? (
              <li className="p-6 text-center text-sm text-theme-ink/55">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-theme-ink/30" aria-hidden="true" />
                No threads here yet.
              </li>
            ) : (
              filtered.map((t) => {
                const meta = CHANNEL_META[t.channel];
                const Icon = meta.icon;
                const isActive = t.id === activeId;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(t.id)}
                      className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? 'border-theme-accent bg-theme-glow/15'
                          : 'border-transparent hover:bg-theme-glow/5'
                      }`}
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: meta.tone }}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-theme-ink">
                            {t.customer_name ??
                              t.customer_email ??
                              t.customer_phone ??
                              t.customer_handle ??
                              'Unknown'}
                          </p>
                          {t.unread && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-theme-accent" aria-label="Unread" />
                          )}
                        </div>
                        <p className="truncate text-[11px] text-theme-ink/65">
                          {t.subject ?? '(no subject)'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-theme-ink/45">
                          {formatRelative(t.last_message_at)} · {t.status}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Conversation pane */}
        <section className="flex max-h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
          {!active ? (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-theme-ink/55">
              Pick a thread on the left to read and reply.
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--color-border)] px-5 py-3">
                <div className="flex items-center gap-3">
                  {channelMeta && (
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: channelMeta.tone }}
                    >
                      <channelMeta.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  <div>
                    <p className="font-display text-base font-semibold text-theme-ink">
                      {active.customer_name ?? active.customer_email ?? 'Unknown'}
                    </p>
                    <p className="text-[11px] text-theme-ink/55">
                      {active.customer_email ?? active.customer_phone ?? active.customer_handle ?? '—'}
                    </p>
                  </div>
                </div>
                <select
                  value={active.status}
                  onChange={(e) => void onChangeStatus(e.target.value as SupportStatus)}
                  className="rounded-full border border-[color:var(--color-border)] bg-surface px-3 py-1.5 text-xs font-semibold"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </header>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messages.length === 0 ? (
                  <p className="py-12 text-center text-sm text-theme-ink/55">
                    No messages in this thread yet.
                  </p>
                ) : (
                  messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply box */}
              <form
                onSubmit={onSendReply}
                className="flex items-end gap-2 border-t border-[color:var(--color-border)] p-3"
              >
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={`Reply via ${channelMeta?.label ?? 'this channel'}…`}
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-[color:var(--color-border)] bg-surface px-3 py-2 text-sm text-theme-ink placeholder:text-theme-ink/40 focus-visible:border-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/30"
                />
                <button
                  type="submit"
                  disabled={busy || !reply.trim()}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full bg-theme-accent px-4 text-xs font-semibold text-[color:var(--theme-base)] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  Send
                </button>
              </form>
              {error && (
                <p className="border-t border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}
            </>
          )}
        </section>
      </div>

      {/* Quick channel jumps */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ChannelTile
          icon={MessageCircle}
          label="WhatsApp"
          href="https://wa.me/919398859978"
          tone="#25d366"
          sub="Open in WhatsApp Web"
        />
        <ChannelTile
          icon={Mail}
          label="Email"
          href="mailto:ravisweetshyd@gmail.com"
          tone="#1a73e8"
          sub="ravisweetshyd@gmail.com"
        />
        <ChannelTile
          icon={Instagram}
          label="Instagram DM"
          href="https://instagram.com/direct/inbox"
          tone="#dd2a7b"
          sub="@ravi__sweets"
        />
      </div>

      {/* Setup checklist — collapsed by default now that the inbox is real */}
      <SetupChecklist />
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        active
          ? 'border-transparent bg-theme-ink text-[color:var(--theme-base)]'
          : 'border-[color:var(--color-border)] bg-surface-elevated text-theme-ink/70 hover:border-theme-accent hover:text-theme-accent'
      }`}
      style={active && tone ? { backgroundColor: tone, color: '#fff' } : undefined}
    >
      {label}
    </button>
  );
}

function MessageBubble({ message }: { message: SupportMessage }) {
  const outbound = message.direction === 'outbound';
  return (
    <div className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          outbound
            ? 'bg-theme-accent text-[color:var(--theme-base)]'
            : 'bg-theme-glow/25 text-theme-ink'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
        <p
          className={`mt-1 text-[10px] ${
            outbound ? 'text-[color:var(--theme-base)]/70' : 'text-theme-ink/55'
          }`}
        >
          {!outbound && (
            <>
              <User className="mr-1 inline h-2.5 w-2.5" aria-hidden="true" />
              {message.author_name ?? 'Customer'} ·{' '}
            </>
          )}
          {formatRelative(message.sent_at)}
        </p>
      </div>
    </div>
  );
}

function ChannelTile({
  icon: Icon,
  label,
  href,
  tone,
  sub,
}: {
  icon: typeof Inbox;
  label: string;
  href: string;
  tone: string;
  sub: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: tone }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-base font-semibold text-theme-ink">{label}</p>
        <p className="truncate text-[11px] text-theme-ink/55">{sub}</p>
      </div>
      <Phone
        className="ml-auto h-4 w-4 shrink-0 text-theme-ink/30 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

function SetupChecklist() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-display text-base font-semibold text-theme-ink">
          <Hourglass className="h-4 w-4 text-theme-accent" aria-hidden="true" />
          Channel adapters — what is still pending
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-theme-ink/55" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-theme-ink/55" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="border-t border-[color:var(--color-border)] px-5 py-4 text-sm text-theme-ink/85">
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <strong>WhatsApp Business API</strong> — Gupshup or MSG91. Register
              the brand&rsquo;s number for DLT, approve 4 templates: order
              confirmation, shipping update, abandoned cart, festival pre-order.
            </li>
            <li>
              <strong>Gmail / Email IMAP</strong> — Google App Password for{' '}
              <code>ravisweetshyd@gmail.com</code> stored as{' '}
              <code>SUPABASE_SECRET_GMAIL_APP_PASSWORD</code>. A Supabase Edge
              Function polls every 60 seconds and inserts into{' '}
              <code>support_threads</code>.
            </li>
            <li>
              <strong>Instagram Graph API</strong> — link the Instagram Business
              account to a Facebook Page; request Messenger + Instagram
              Messaging permissions (1-2 week app-review).
            </li>
            <li>
              <strong>Auto-reply rules</strong> — &ldquo;where is my order?&rdquo;
              → tracking link; &ldquo;festival pre-orders?&rdquo; → festival
              page; &ldquo;GST invoice?&rdquo; → corporate enquiry form.
            </li>
          </ol>
          <p className="mt-3 text-[11px] text-theme-ink/55">
            Run migration <code>0007_support_threads.sql</code> to enable the
            tables that power this inbox.
          </p>
        </div>
      )}
    </section>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return 'just now';
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString();
}
