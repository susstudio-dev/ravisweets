import { Inbox, MessageCircle, Mail, Instagram, Phone, Hourglass } from 'lucide-react';

/**
 * Unified customer-service inbox — placeholder.
 *
 * Phase D wiring requires:
 *  1. WhatsApp Business API account via Gupshup / MSG91 / Wati (DLT-registered)
 *  2. IMAP / Gmail API for ravisweetshyd@gmail.com
 *  3. Instagram Graph API (Basic Display permission)
 *
 * Until those are wired, this page documents the steps + offers a quick-link
 * back to each channel so staff can answer in the native app while the
 * unified inbox lands.
 */
export function AdminInbox() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-accent">
          <Inbox className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          Customer service
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-theme-ink md:text-4xl">
          Unified inbox
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-ink/65">
          One screen for WhatsApp, email, and Instagram DMs threaded by
          customer. Phase D — needs WhatsApp Business API + Gmail IMAP +
          Instagram Graph wired before the full inbox lands.
        </p>
      </header>

      {/* Quick-jump tiles to each native app while the unified flow is built */}
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

      {/* Setup checklist — explicit roadmap so the brand knows what's pending */}
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-surface-elevated p-5">
        <h2 className="font-display text-lg font-semibold text-theme-ink">
          <Hourglass className="mr-1.5 inline h-4 w-4 text-theme-accent" aria-hidden="true" />
          What's needed to wire this fully
        </h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-theme-ink/85">
          <li>
            <strong>WhatsApp Business API</strong> — sign up with{' '}
            <a className="underline hover:text-theme-accent" href="https://www.gupshup.io/" target="_blank" rel="noreferrer">Gupshup</a>{' '}
            or{' '}
            <a className="underline hover:text-theme-accent" href="https://msg91.com/" target="_blank" rel="noreferrer">MSG91</a>.
            Register the brand's number for DLT (Vodafone Idea / Airtel) — 2-7
            day approval. Approve at least 4 message templates: order
            confirmation, shipping update, abandoned cart, festival pre-order.
          </li>
          <li>
            <strong>Gmail / Email IMAP</strong> — generate a Google App Password
            for <code>ravisweetshyd@gmail.com</code>, store as{' '}
            <code>SUPABASE_SECRET_GMAIL_APP_PASSWORD</code>. We'll poll new mail
            every 60 seconds via a Supabase Edge Function and push into a
            <code> support_threads</code> table.
          </li>
          <li>
            <strong>Instagram Graph API</strong> — link the brand's Instagram
            Business account to a Facebook Page → request Messenger and
            Instagram Messaging permissions. App-review approval takes 1-2
            weeks.
          </li>
          <li>
            <strong>Threading model</strong> — every message keys off the
            customer's email + phone, merging into a single thread per
            customer regardless of channel. Reply from this admin page → the
            outbound goes back via the same channel that started the thread.
          </li>
          <li>
            <strong>Auto-reply rules</strong> — first-pass templates: "where is
            my order?" → order tracking link. "festival pre-orders?" → festival
            page deep link. "GST invoice?" → corporate enquiry form.
          </li>
        </ol>
        <p className="mt-4 text-[11px] text-theme-ink/55">
          Estimate: 3-4 dev weeks once the three accounts are provisioned. The
          Phase D PR will deliver the full inbox UI plus the corresponding
          Supabase tables (<code>support_threads</code>, <code>support_messages</code>).
        </p>
      </section>
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
      <Phone className="ml-auto h-4 w-4 shrink-0 text-theme-ink/30 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}
