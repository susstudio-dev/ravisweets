'use client';

import { Instagram, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Floating contact stack — sitewide, mounted in root layout.
 *
 * Three always-visible round buttons stacked vertically: WhatsApp · Instagram · Call.
 * No fan/collapse mechanic — feedback was that the +/X toggle felt like an
 * extra step and obscured the brand-priority channel (WhatsApp).
 *
 * Tooltip-style labels appear on hover (desktop) so the rest state stays calm.
 */

const PHONE_E164 = '919398859978';
const WA_TEXT = encodeURIComponent(
  "Hi Ravi Sweets, I'm interested in placing an order. Could you help?",
);

export function FloatingContact() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Tiny delay so the pills don't compete with first-paint of the hero.
    const id = window.setTimeout(() => setShown(true), 600);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      aria-label="Quick contact"
      className={`pointer-events-none fixed bottom-5 right-4 z-30 flex flex-col items-end gap-2.5 transition-all duration-500 ${
        shown ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
      } md:bottom-28`}
    >
      {/* WhatsApp — primary channel for Indian D2C food brands */}
      <a
        href={`https://wa.me/${PHONE_E164}?text=${WA_TEXT}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
        className="pointer-events-auto group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lifted ring-2 ring-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/70"
      >
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/40"
          style={{ animationDuration: '2.6s' }}
          aria-hidden="true"
        />
        <MessageCircle className="relative h-[22px] w-[22px]" strokeWidth={2.4} aria-hidden="true" />
        <span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-theme-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--theme-base)] opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100 md:block">
          Chat on WhatsApp
        </span>
      </a>

      {/* Instagram */}
      <a
        href="https://instagram.com/ravi__sweets"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow us on Instagram"
        title="@ravi__sweets"
        className="pointer-events-auto group relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lifted ring-2 ring-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/70"
        style={{
          background:
            'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)',
        }}
      >
        <Instagram className="h-[22px] w-[22px]" strokeWidth={2.4} aria-hidden="true" />
        <span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-theme-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--theme-base)] opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100 md:block">
          @ravi__sweets
        </span>
      </a>

      {/* Phone — brand-accent solid + white icon, mirrors WhatsApp / Instagram
          contrast so the three pills read as a single visual unit. The
          previous dark-ink + cream-icon combo blended into the cream page
          background and the icon disappeared on first glance. */}
      <a
        href={`tel:+${PHONE_E164}`}
        aria-label="Call Ravi Sweets"
        title="+91 93988 59978"
        className="pointer-events-auto group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#c0592b] text-white shadow-lifted ring-2 ring-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a04822] hover:ring-white/70"
      >
        <Phone className="h-[22px] w-[22px]" strokeWidth={2.4} aria-hidden="true" />
        <span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-theme-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--theme-base)] opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100 md:block">
          +91 93988 59978
        </span>
      </a>
    </div>
  );
}
