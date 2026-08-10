'use client';

import { Instagram, MessageCircle, Phone, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * THE CONTACT SLIP — sitewide, mounted in root layout.
 *
 * WhatsApp-first contact is a binding brand commitment (PRODUCT.md), so it is
 * preserved exactly: WhatsApp is the rest state and is always ONE tap away.
 *
 * What changed is the noise. The retired version stacked three 48px circles,
 * each with a 2px ring and a lifted shadow, and the WhatsApp one carried an
 * infinite `animate-ping` halo. Together with the promo strip, the scroll
 * progress bar and the cursor control, a visitor met five floating widgets on
 * first paint — the single loudest reason this did not read as a serious
 * product. Real commerce sites ship one.
 *
 * So: one slip. WhatsApp is the stamp; Call and Instagram are ruled rows
 * behind a disclosure that does not cost anyone the primary channel.
 */

const PHONE_E164 = '919398859978';
const PHONE_DISPLAY = '+91 93988 59978';
const WA_TEXT = encodeURIComponent(
  "Hi Ravi Sweets, I'm interested in placing an order. Could you help?",
);

export function FloatingContact() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    // Tiny delay so the slip does not compete with first paint of the hero.
    const id = window.setTimeout(() => setShown(true), 600);
    return () => window.clearTimeout(id);
  }, []);

  /*
   * Retreat while the visitor is scrolling down, return when they scroll up.
   *
   * A permanently-parked widget in the bottom-right corner sat on top of the
   * quick-add button of the last product in a row, the primary corporate CTA,
   * and the FSSAI/GSTIN compliance line in the footer. A buyer who cannot
   * press "add" does not buy, and a buyer who cannot read the FSSAI line does
   * not trust food. Reading direction is down, so down is when it gets out of
   * the way.
   */
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) > 8) {
        setHidden(y > lastY.current && y > 240);
        lastY.current = y;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={cn(
        'fixed bottom-4 right-4 z-30 flex flex-col items-end gap-1.5 transition-all duration-200',
        shown ? 'opacity-100' : 'translate-y-4 opacity-0',
        // 200%, not 130%: on a 44px control anchored at bottom-4, 130% is only
        // ~57px of travel, so it never fully cleared the viewport and kept
        // painting over the DISPATCH row and the FSSAI compliance line.
        hidden && !open && 'pointer-events-none translate-y-[200%] opacity-0',
      )}
    >
      {/* The secondary rows — disclosed, never competing at rest. */}
      {open && (
        <div className="docket w-[210px] overflow-hidden">
          <p className="field-label border-b border-[color:var(--color-border)] px-3 py-2">
            Talk to us
          </p>
          <a
            href={`tel:+${PHONE_E164}`}
            className="hover:bg-theme-glow/25 flex items-center gap-2.5 border-b border-[color:var(--color-border)] px-3 py-2.5 transition-colors"
          >
            <Phone className="text-theme-accent h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="field-value text-[13px]">{PHONE_DISPLAY}</span>
          </a>
          <a
            href="https://www.instagram.com/ravi__sweets/"
            target="_blank"
            rel="noreferrer"
            className="hover:bg-theme-glow/25 flex items-center gap-2.5 px-3 py-2.5 transition-colors"
          >
            <Instagram className="text-theme-accent h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-[13px] font-medium">@ravi__sweets</span>
          </a>
        </div>
      )}

      <div className="flex items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Hide other contact options' : 'Show other contact options'}
          className="docket text-theme-ink hover:bg-theme-glow/30 flex h-11 w-11 items-center justify-center transition-colors"
        >
          <Plus
            className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-45')}
            aria-hidden="true"
          />
        </button>

        {/* WhatsApp — the brand's primary channel, never behind a disclosure. */}
        <a
          href={`https://wa.me/${PHONE_E164}?text=${WA_TEXT}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="stamp h-11 !px-4"
          style={{ backgroundColor: '#128C4B', color: '#ffffff' }}
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
