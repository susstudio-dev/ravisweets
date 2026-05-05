'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import type { FestivalSlug } from '@/app/festivals/[slug]/page';

/**
 * Animated SVG decoration layer for festival hero sections.
 *
 * Replaces the previous opaque hero photograph with a per-festival vector
 * scene — Diwali gets diyas + sparkling crackers + marigold petals, Holi
 * gets pichkaris + gulal splashes + balloons, Eid gets a crescent moon +
 * lanterns + dates, etc. Each motif is positioned absolutely across the
 * hero, animated via motion (float / drift / twinkle), and tinted in the
 * festival's accent + glow so it harmonises with the palette without
 * needing additional asset files.
 *
 * All motion is gated behind `useReducedMotion()` — the decorations stay
 * static for users who've requested reduced motion.
 */

interface FestivalDecorProps {
  slug: FestivalSlug;
  accent: string;
  glow: string;
  ink: string;
}

export function FestivalDecor({ slug, accent, glow, ink }: FestivalDecorProps) {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <SceneFor slug={slug} accent={accent} glow={glow} ink={ink} reduced={reduced} />
    </div>
  );
}

function SceneFor({
  slug,
  accent,
  glow,
  ink,
  reduced,
}: FestivalDecorProps & { reduced: boolean }) {
  switch (slug) {
    case 'diwali':
      return <DiwaliScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'raksha-bandhan':
      return <RakhiScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'eid':
      return <EidScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'holi':
      return <HoliScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'pongal':
      return <PongalScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'sankranti':
      return <SankrantiScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'ugadi':
      return <UgadiScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'onam':
      return <OnamScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'ganesh-chaturthi':
      return <GaneshScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
    case 'christmas':
      return <ChristmasScene accent={accent} glow={glow} ink={ink} reduced={reduced} />;
  }
}

// ─── Animation primitives ────────────────────────────────────────────────

function Floater({
  top,
  left,
  size,
  delay = 0,
  duration = 4,
  reduced,
  amplitude = 12,
  rotate = false,
  children,
}: {
  top: string;
  left: string;
  size: number;
  delay?: number;
  duration?: number;
  reduced: boolean;
  amplitude?: number;
  rotate?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ top, left, width: size, height: size }}
      initial={reduced ? { y: 0, rotate: 0 } : { y: amplitude, opacity: 0.8 }}
      animate={
        reduced
          ? { y: 0 }
          : {
              y: [amplitude, -amplitude, amplitude],
              rotate: rotate ? [-3, 3, -3] : 0,
              opacity: [0.85, 1, 0.85],
            }
      }
      transition={
        reduced
          ? {}
          : { duration, repeat: Infinity, ease: 'easeInOut', delay }
      }
    >
      {children}
    </motion.div>
  );
}

function Twinkle({
  top,
  left,
  size,
  color,
  delay = 0,
  reduced,
}: {
  top: string;
  left: string;
  size: number;
  color: string;
  delay?: number;
  reduced: boolean;
}) {
  return (
    <motion.svg
      className="absolute"
      style={{ top, left }}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      initial={reduced ? { opacity: 0.6, scale: 1 } : { opacity: 0, scale: 0.4 }}
      animate={
        reduced
          ? { opacity: 0.6 }
          : { opacity: [0, 1, 0.6, 0], scale: [0.4, 1, 1.1, 0.4] }
      }
      transition={
        reduced
          ? {}
          : { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay }
      }
    >
      <path
        d="M10 2 L11.5 8.5 L18 10 L11.5 11.5 L10 18 L8.5 11.5 L2 10 L8.5 8.5 Z"
        fill={color}
      />
    </motion.svg>
  );
}

function Drift({
  startX,
  startY,
  endX,
  endY,
  duration,
  delay = 0,
  reduced,
  rotate = true,
  children,
}: {
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  duration: number;
  delay?: number;
  reduced: boolean;
  rotate?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute"
      initial={reduced ? { left: startX, top: startY } : { left: startX, top: startY, opacity: 0 }}
      animate={
        reduced
          ? { left: startX, top: startY }
          : {
              left: [startX, endX],
              top: [startY, endY],
              opacity: [0, 0.85, 0],
              rotate: rotate ? [0, 180] : 0,
            }
      }
      transition={
        reduced ? {} : { duration, repeat: Infinity, ease: 'easeOut', delay }
      }
    >
      {children}
    </motion.div>
  );
}

// ─── Atomic motifs ────────────────────────────────────────────────────────

function Diya({ accent, glow, ink }: { accent: string; glow: string; ink: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {/* Flame */}
      <motion.ellipse
        cx="30"
        cy="22"
        rx="4"
        ry="9"
        fill={glow}
        animate={{ scaleY: [1, 1.15, 0.95, 1.1, 1], opacity: [0.85, 1, 0.9, 1, 0.85] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '30px 30px' }}
      />
      {/* Flame inner */}
      <ellipse cx="30" cy="24" rx="2" ry="5" fill="#fff5cc" />
      {/* Wick */}
      <rect x="29" y="30" width="2" height="3" fill={ink} opacity="0.5" />
      {/* Diya bowl */}
      <path d="M 12 36 Q 30 56 48 36 L 44 32 L 16 32 Z" fill={accent} />
      <path d="M 12 36 Q 30 56 48 36" stroke={ink} strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Highlight */}
      <ellipse cx="22" cy="38" rx="6" ry="1.5" fill="#fff" opacity="0.25" />
    </svg>
  );
}

function Cracker({ accent, glow }: { accent: string; glow: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {/* Burst lines radiating */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <motion.line
          key={deg}
          x1="30"
          y1="30"
          x2="30"
          y2="6"
          stroke={i % 2 === 0 ? glow : accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 30 30)`}
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: [0, 1, 0], pathLength: [0, 1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
      <circle cx="30" cy="30" r="3" fill={glow} />
    </svg>
  );
}

function Marigold({ accent, glow }: { accent: string; glow: string }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <g>
        {[0, 45, 90, 135].map((deg) => (
          <ellipse
            key={deg}
            cx="20"
            cy="20"
            rx="14"
            ry="5"
            fill={accent}
            opacity="0.8"
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
        {[22, 67, 112, 157].map((deg) => (
          <ellipse
            key={deg}
            cx="20"
            cy="20"
            rx="12"
            ry="4"
            fill={glow}
            opacity="0.85"
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
        <circle cx="20" cy="20" r="3.5" fill={glow} />
      </g>
    </svg>
  );
}

function Sparkler({ glow, accent }: { glow: string; accent: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <line x1="30" y1="48" x2="30" y2="20" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => (
        <motion.line
          key={i}
          x1="30"
          y1="20"
          x2="30"
          y2="6"
          stroke={glow}
          strokeWidth="1.4"
          strokeLinecap="round"
          transform={`rotate(${deg} 30 20)`}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.06 }}
          style={{ transformOrigin: '30px 20px' }}
        />
      ))}
      <circle cx="30" cy="20" r="3" fill={glow}>
        <animate attributeName="r" values="2;4;2" dur="0.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Crescent({ accent, glow }: { accent: string; glow: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <path
        d="M 45 10 A 22 22 0 1 0 45 50 A 16 16 0 1 1 45 10 Z"
        fill={glow}
      />
      <path
        d="M 45 10 A 22 22 0 1 0 45 50 A 16 16 0 1 1 45 10 Z"
        fill={accent}
        opacity="0.2"
      />
    </svg>
  );
}

function Lantern({ accent, glow, ink }: { accent: string; glow: string; ink: string }) {
  return (
    <svg viewBox="0 0 40 60" width="100%" height="100%">
      <line x1="20" y1="0" x2="20" y2="8" stroke={ink} strokeWidth="0.8" />
      <rect x="14" y="8" width="12" height="4" fill={ink} opacity="0.7" />
      <path d="M 8 12 Q 20 10 32 12 L 30 38 Q 20 42 10 38 Z" fill={accent} />
      <path d="M 8 12 Q 20 10 32 12 L 30 38 Q 20 42 10 38 Z" fill={glow} opacity="0.4" />
      <line x1="14" y1="14" x2="14" y2="38" stroke={ink} strokeWidth="0.5" opacity="0.5" />
      <line x1="20" y1="13" x2="20" y2="40" stroke={ink} strokeWidth="0.5" opacity="0.5" />
      <line x1="26" y1="14" x2="26" y2="38" stroke={ink} strokeWidth="0.5" opacity="0.5" />
      <rect x="13" y="38" width="14" height="4" fill={ink} opacity="0.7" />
      <motion.path
        d="M 18 42 L 22 42 L 21 50 L 19 50 Z"
        fill={glow}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function Pichkari({ accent, glow }: { accent: string; glow: string }) {
  return (
    <svg viewBox="0 0 60 30" width="100%" height="100%">
      <rect x="6" y="12" width="28" height="6" rx="1" fill={accent} />
      <rect x="34" y="13" width="14" height="4" fill={accent} opacity="0.85" />
      <rect x="6" y="6" width="6" height="18" rx="2" fill={accent} />
      <motion.g
        animate={{ x: [0, 6, 12], opacity: [1, 0.6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
      >
        <circle cx="50" cy="15" r="2" fill={glow} />
        <circle cx="54" cy="13" r="1.4" fill={glow} />
        <circle cx="56" cy="17" r="1" fill={glow} />
      </motion.g>
    </svg>
  );
}

function GulalSplash({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 50 50" width="100%" height="100%">
      <g>
        <circle cx="25" cy="25" r="14" fill={color} opacity="0.55" />
        <circle cx="20" cy="20" r="3" fill={color} />
        <circle cx="32" cy="22" r="2" fill={color} />
        <circle cx="22" cy="34" r="2.5" fill={color} />
        <circle cx="36" cy="32" r="1.8" fill={color} />
        <circle cx="14" cy="28" r="1.4" fill={color} />
        <circle cx="38" cy="14" r="1.6" fill={color} />
      </g>
    </svg>
  );
}

function Balloon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 60" width="100%" height="100%">
      <ellipse cx="20" cy="22" rx="14" ry="18" fill={color} />
      <ellipse cx="14" cy="16" rx="3" ry="6" fill="#fff" opacity="0.35" />
      <path d="M 17 40 L 23 40 L 20 44 Z" fill={color} />
      <path d="M 20 44 Q 17 50 21 56 Q 24 60 20 60" stroke={color} strokeWidth="0.6" fill="none" />
    </svg>
  );
}

function Kite({ accent, glow, ink }: { accent: string; glow: string; ink: string }) {
  return (
    <svg viewBox="0 0 50 60" width="100%" height="100%">
      <path d="M 25 4 L 44 28 L 25 52 L 6 28 Z" fill={accent} />
      <path d="M 25 4 L 25 52" stroke={ink} strokeWidth="0.6" opacity="0.5" />
      <path d="M 6 28 L 44 28" stroke={ink} strokeWidth="0.6" opacity="0.5" />
      <path d="M 25 4 L 44 28 L 25 28 Z" fill={glow} opacity="0.6" />
      <path d="M 25 52 Q 22 56 25 60 Q 28 56 25 52" stroke={ink} strokeWidth="0.5" fill="none" opacity="0.6" />
    </svg>
  );
}

function ClayPot({ accent, glow, ink }: { accent: string; glow: string; ink: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <ellipse cx="30" cy="24" rx="22" ry="6" fill={accent} />
      <path d="M 8 24 Q 8 50 20 56 L 40 56 Q 52 50 52 24" fill={accent} />
      <path d="M 8 24 Q 8 50 20 56 L 40 56 Q 52 50 52 24" fill={ink} opacity="0.18" />
      <ellipse cx="30" cy="24" rx="20" ry="4" fill="#fff" opacity="0.3" />
      {/* Overflowing milk/rice */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="30" cy="22" rx="18" ry="5" fill={glow} />
        <path d="M 14 22 Q 18 28 22 22" stroke={glow} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 38 22 Q 42 28 46 22" stroke={glow} strokeWidth="3" fill="none" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function Sugarcane({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 16 60" width="100%" height="100%">
      <rect x="6" y="2" width="4" height="56" rx="1" fill={accent} />
      {[10, 22, 34, 46].map((y) => (
        <line key={y} x1="4" y1={y} x2="12" y2={y} stroke="#fff" strokeWidth="0.8" opacity="0.4" />
      ))}
    </svg>
  );
}

function MangoLeaf({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 40 60" width="100%" height="100%">
      <path d="M 20 4 Q 36 30 20 56 Q 4 30 20 4 Z" fill={accent} />
      <path d="M 20 4 L 20 56" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

function Modak({ accent, glow }: { accent: string; glow: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <path d="M 30 6 L 32 14 L 38 16 L 33 22 L 35 30 L 30 26 L 25 30 L 27 22 L 22 16 L 28 14 Z" fill={glow} opacity="0.7" />
      <ellipse cx="30" cy="40" rx="18" ry="14" fill={accent} />
      <ellipse cx="30" cy="36" rx="14" ry="10" fill={glow} opacity="0.35" />
    </svg>
  );
}

function Snowflake({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 30 30" width="100%" height="100%">
      <g stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none">
        {[0, 60, 120].map((deg) => (
          <line
            key={deg}
            x1="15"
            y1="2"
            x2="15"
            y2="28"
            transform={`rotate(${deg} 15 15)`}
          />
        ))}
        {[0, 60, 120].map((deg) => (
          <g key={`b-${deg}`} transform={`rotate(${deg} 15 15)`}>
            <line x1="15" y1="6" x2="11" y2="3" />
            <line x1="15" y1="6" x2="19" y2="3" />
            <line x1="15" y1="24" x2="11" y2="27" />
            <line x1="15" y1="24" x2="19" y2="27" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function Holly({ accent, glow }: { accent: string; glow: string }) {
  return (
    <svg viewBox="0 0 50 30" width="100%" height="100%">
      <path d="M 4 16 Q 12 6 18 16 Q 12 18 4 16" fill={accent} />
      <path d="M 18 16 Q 26 6 32 16 Q 26 18 18 16" fill={accent} />
      <path d="M 32 16 Q 40 6 46 16 Q 40 18 32 16" fill={accent} />
      <circle cx="24" cy="20" r="3" fill={glow} />
      <circle cx="29" cy="22" r="2.5" fill={glow} />
      <circle cx="20" cy="23" r="2" fill={glow} />
    </svg>
  );
}

// ─── Per-festival scenes ──────────────────────────────────────────────────

function DiwaliScene({ accent, glow, ink, reduced }: SceneProps) {
  return (
    <>
      <Floater top="68%" left="8%" size={70} reduced={reduced} duration={5}>
        <Diya accent={accent} glow={glow} ink={ink} />
      </Floater>
      <Floater top="74%" left="80%" size={80} reduced={reduced} duration={5.5} delay={0.4}>
        <Diya accent={accent} glow={glow} ink={ink} />
      </Floater>
      <Floater top="22%" left="16%" size={60} reduced={reduced} duration={4} delay={0.6} rotate>
        <Sparkler glow={glow} accent={accent} />
      </Floater>
      <Floater top="14%" left="78%" size={70} reduced={reduced} duration={4.5} delay={1.1} rotate>
        <Cracker accent={accent} glow={glow} />
      </Floater>
      <Floater top="38%" left="48%" size={50} reduced={reduced} duration={3.8} delay={0.3} rotate>
        <Marigold accent={accent} glow={glow} />
      </Floater>
      <Floater top="58%" left="42%" size={36} reduced={reduced} duration={3.5} delay={0.8} rotate>
        <Marigold accent={accent} glow={glow} />
      </Floater>
      <Twinkle top="30%" left="36%" size={14} color={glow} reduced={reduced} delay={0.2} />
      <Twinkle top="48%" left="68%" size={12} color={glow} reduced={reduced} delay={0.7} />
      <Twinkle top="20%" left="60%" size={16} color={glow} reduced={reduced} delay={1.4} />
      <Twinkle top="62%" left="22%" size={10} color={glow} reduced={reduced} delay={1.0} />
    </>
  );
}

function RakhiScene({ accent, glow, reduced }: SceneProps) {
  return (
    <>
      {/* Rakhi thread arcing across the hero */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 50 150 Q 600 30 1150 200"
          stroke={accent}
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reduced ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
        />
      </svg>
      {/* Rakhi medallions */}
      {[
        { top: '22%', left: '12%' },
        { top: '14%', left: '50%' },
        { top: '18%', left: '82%' },
      ].map((p, i) => (
        <Floater key={i} top={p.top} left={p.left} size={52} reduced={reduced} duration={4 + i * 0.4} delay={i * 0.6} rotate>
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <circle cx="20" cy="20" r="14" fill={glow} />
            <circle cx="20" cy="20" r="10" fill={accent} />
            <circle cx="20" cy="20" r="4" fill={glow} />
            {[0, 45, 90, 135].map((deg) => (
              <line
                key={deg}
                x1="20"
                y1="6"
                x2="20"
                y2="34"
                stroke={glow}
                strokeWidth="1"
                opacity="0.5"
                transform={`rotate(${deg} 20 20)`}
              />
            ))}
          </svg>
        </Floater>
      ))}
      {/* Floating petals */}
      <Floater top="60%" left="20%" size={28} reduced={reduced} duration={6} delay={0.5} rotate>
        <Marigold accent={accent} glow={glow} />
      </Floater>
      <Floater top="70%" left="70%" size={30} reduced={reduced} duration={5.5} delay={1.2} rotate>
        <Marigold accent={accent} glow={glow} />
      </Floater>
      <Twinkle top="40%" left="30%" size={12} color={glow} reduced={reduced} delay={0.4} />
      <Twinkle top="48%" left="64%" size={14} color={glow} reduced={reduced} delay={0.9} />
    </>
  );
}

function EidScene({ accent, glow, ink, reduced }: SceneProps) {
  return (
    <>
      <Floater top="10%" left="74%" size={120} reduced={reduced} duration={8} amplitude={6}>
        <Crescent accent={accent} glow={glow} />
      </Floater>
      <Floater top="20%" left="14%" size={70} reduced={reduced} duration={5} delay={0.6}>
        <Lantern accent={accent} glow={glow} ink={ink} />
      </Floater>
      <Floater top="46%" left="6%" size={56} reduced={reduced} duration={4.5} delay={1.1}>
        <Lantern accent={accent} glow={glow} ink={ink} />
      </Floater>
      <Floater top="56%" left="84%" size={62} reduced={reduced} duration={5} delay={0.4}>
        <Lantern accent={accent} glow={glow} ink={ink} />
      </Floater>
      {/* Date palm hint */}
      <Floater top="68%" left="38%" size={42} reduced={reduced} duration={4} rotate>
        <svg viewBox="0 0 40 40" width="100%" height="100%">
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
            <ellipse
              key={deg}
              cx="20"
              cy="14"
              rx="2"
              ry="14"
              fill={accent}
              opacity="0.7"
              transform={`rotate(${deg} 20 20)`}
            />
          ))}
          <circle cx="20" cy="20" r="3" fill={glow} />
        </svg>
      </Floater>
      <Twinkle top="14%" left="20%" size={12} color={glow} reduced={reduced} delay={0.3} />
      <Twinkle top="22%" left="56%" size={14} color={glow} reduced={reduced} delay={0.8} />
      <Twinkle top="34%" left="44%" size={10} color={glow} reduced={reduced} delay={1.4} />
      <Twinkle top="40%" left="80%" size={12} color={glow} reduced={reduced} delay={0.6} />
    </>
  );
}

function HoliScene({ accent, glow, reduced }: SceneProps) {
  return (
    <>
      {/* Big gulal splashes */}
      <Floater top="14%" left="8%" size={140} reduced={reduced} duration={5} amplitude={8}>
        <GulalSplash color={accent} />
      </Floater>
      <Floater top="56%" left="74%" size={160} reduced={reduced} duration={5.5} delay={0.7} amplitude={6}>
        <GulalSplash color={glow} />
      </Floater>
      <Floater top="68%" left="20%" size={100} reduced={reduced} duration={4.5} delay={1.2} amplitude={6}>
        <GulalSplash color={glow} />
      </Floater>
      {/* Pichkari */}
      <Floater top="36%" left="48%" size={96} reduced={reduced} duration={4} delay={0.3} amplitude={4}>
        <Pichkari accent={accent} glow={glow} />
      </Floater>
      {/* Drifting balloons */}
      <Drift startX="6%" startY="80%" endX="14%" endY="20%" duration={9} reduced={reduced} rotate={false}>
        <div style={{ width: 36, height: 54 }}>
          <Balloon color={accent} />
        </div>
      </Drift>
      <Drift startX="84%" startY="78%" endX="76%" endY="14%" duration={11} delay={1.5} reduced={reduced} rotate={false}>
        <div style={{ width: 30, height: 46 }}>
          <Balloon color={glow} />
        </div>
      </Drift>
      <Twinkle top="30%" left="68%" size={14} color={accent} reduced={reduced} />
      <Twinkle top="48%" left="32%" size={12} color={glow} reduced={reduced} delay={0.4} />
    </>
  );
}

function PongalScene({ accent, glow, ink, reduced }: SceneProps) {
  return (
    <>
      {/* Sun */}
      <Floater top="12%" left="78%" size={100} reduced={reduced} duration={9} amplitude={4}>
        <svg viewBox="0 0 60 60" width="100%" height="100%">
          <circle cx="30" cy="30" r="14" fill={glow} />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="30"
              y1="6"
              x2="30"
              y2="0"
              stroke={glow}
              strokeWidth="1.6"
              strokeLinecap="round"
              transform={`rotate(${i * 30} 30 30)`}
            />
          ))}
        </svg>
      </Floater>
      {/* Clay pot */}
      <Floater top="48%" left="38%" size={140} reduced={reduced} duration={4} amplitude={6}>
        <ClayPot accent={accent} glow={glow} ink={ink} />
      </Floater>
      {/* Sugarcane stalks */}
      {[
        { top: '34%', left: '12%', delay: 0 },
        { top: '30%', left: '20%', delay: 0.4 },
        { top: '32%', left: '76%', delay: 0.2 },
        { top: '36%', left: '84%', delay: 0.6 },
      ].map((s, i) => (
        <Floater key={i} top={s.top} left={s.left} size={20} reduced={reduced} duration={3.5} delay={s.delay} amplitude={3}>
          <div style={{ height: 200 }}>
            <Sugarcane accent={accent} />
          </div>
        </Floater>
      ))}
      <Twinkle top="20%" left="40%" size={12} color={glow} reduced={reduced} />
      <Twinkle top="70%" left="64%" size={10} color={glow} reduced={reduced} delay={0.8} />
    </>
  );
}

function SankrantiScene({ accent, glow, ink, reduced }: SceneProps) {
  return (
    <>
      {/* Kites at multiple angles */}
      <Drift startX="-5%" startY="60%" endX="40%" endY="10%" duration={14} reduced={reduced}>
        <div style={{ width: 50, height: 60 }}>
          <Kite accent={accent} glow={glow} ink={ink} />
        </div>
      </Drift>
      <Drift startX="105%" startY="50%" endX="55%" endY="14%" duration={16} delay={2.5} reduced={reduced}>
        <div style={{ width: 60, height: 72 }}>
          <Kite accent={glow} glow={accent} ink={ink} />
        </div>
      </Drift>
      <Drift startX="20%" startY="120%" endX="78%" endY="36%" duration={18} delay={4} reduced={reduced}>
        <div style={{ width: 44, height: 54 }}>
          <Kite accent={accent} glow={glow} ink={ink} />
        </div>
      </Drift>
      {/* Til laddoo */}
      <Floater top="68%" left="14%" size={42} reduced={reduced} duration={4} amplitude={6}>
        <svg viewBox="0 0 40 40" width="100%" height="100%">
          <circle cx="20" cy="20" r="16" fill={accent} />
          {Array.from({ length: 14 }).map((_, i) => (
            <circle
              key={i}
              cx={10 + (i % 5) * 5}
              cy={12 + Math.floor(i / 5) * 6}
              r="0.8"
              fill={ink}
              opacity="0.6"
            />
          ))}
        </svg>
      </Floater>
      <Floater top="74%" left="80%" size={36} reduced={reduced} duration={5} delay={0.6} amplitude={5}>
        <svg viewBox="0 0 40 40" width="100%" height="100%">
          <circle cx="20" cy="20" r="14" fill={glow} />
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={i}
              cx={10 + (i % 4) * 6}
              cy={14 + Math.floor(i / 4) * 6}
              r="0.7"
              fill={ink}
              opacity="0.55"
            />
          ))}
        </svg>
      </Floater>
      <Twinkle top="22%" left="48%" size={10} color={glow} reduced={reduced} />
      <Twinkle top="38%" left="22%" size={14} color={glow} reduced={reduced} delay={0.6} />
    </>
  );
}

function UgadiScene({ accent, glow, reduced }: SceneProps) {
  return (
    <>
      {/* Mango-leaf toran */}
      <svg
        className="absolute inset-x-0 top-0 h-32 w-full"
        viewBox="0 0 1200 130"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 0 30 Q 300 90 600 40 Q 900 90 1200 30"
          stroke={accent}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reduced ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
        />
      </svg>
      {[10, 24, 38, 52, 66, 80, 94].map((leftPct, i) => (
        <Floater
          key={i}
          top={`${4 + (i % 2 === 0 ? 0 : 6)}%`}
          left={`${leftPct}%`}
          size={30}
          reduced={reduced}
          duration={4 + (i % 3) * 0.3}
          delay={i * 0.2}
          amplitude={6}
          rotate
        >
          <div style={{ height: 50 }}>
            <MangoLeaf accent={accent} />
          </div>
        </Floater>
      ))}
      {/* Six tastes hint */}
      <Floater top="56%" left="44%" size={120} reduced={reduced} duration={6} amplitude={4}>
        <svg viewBox="0 0 60 60" width="100%" height="100%">
          <circle cx="30" cy="30" r="28" fill={accent} opacity="0.16" />
          <circle cx="30" cy="30" r="20" fill={glow} opacity="0.4" />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <circle
              key={i}
              cx="30"
              cy="14"
              r="4"
              fill={accent}
              transform={`rotate(${deg} 30 30)`}
            />
          ))}
        </svg>
      </Floater>
      <Twinkle top="40%" left="20%" size={10} color={glow} reduced={reduced} delay={0.5} />
      <Twinkle top="60%" left="76%" size={12} color={glow} reduced={reduced} delay={1.0} />
    </>
  );
}

function OnamScene({ accent, glow, ink, reduced }: SceneProps) {
  return (
    <>
      {/* Pookalam — concentric flower carpet rings */}
      <Floater top="34%" left="42%" size={220} reduced={reduced} duration={9} amplitude={3}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          {[40, 32, 24, 16, 8].map((r, i) => (
            <g key={r}>
              <circle cx="50" cy="50" r={r} fill={i % 2 === 0 ? accent : glow} opacity={0.18 + i * 0.08} />
              {Array.from({ length: 12 }).map((_, j) => (
                <circle
                  key={j}
                  cx="50"
                  cy={50 - r}
                  r="1.4"
                  fill={i % 2 === 0 ? glow : accent}
                  transform={`rotate(${j * 30} 50 50)`}
                />
              ))}
            </g>
          ))}
        </svg>
      </Floater>
      {/* Banana leaf */}
      <Floater top="60%" left="6%" size={100} reduced={reduced} duration={5} amplitude={4} rotate>
        <svg viewBox="0 0 60 100" width="100%" height="100%">
          <path d="M 30 4 Q 56 50 30 96 Q 4 50 30 4 Z" fill={accent} opacity="0.6" />
          <path d="M 30 4 L 30 96" stroke={ink} strokeWidth="0.8" opacity="0.4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1="30"
              y1={20 + i * 10}
              x2={i % 2 ? 12 : 48}
              y2={28 + i * 10}
              stroke={ink}
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
        </svg>
      </Floater>
      <Floater top="70%" left="80%" size={50} reduced={reduced} duration={5} delay={0.6} rotate>
        <Marigold accent={accent} glow={glow} />
      </Floater>
      <Twinkle top="20%" left="22%" size={12} color={glow} reduced={reduced} />
      <Twinkle top="28%" left="78%" size={14} color={glow} reduced={reduced} delay={0.6} />
    </>
  );
}

function GaneshScene({ accent, glow, reduced }: SceneProps) {
  return (
    <>
      {/* Modaks orbiting */}
      <Floater top="20%" left="14%" size={80} reduced={reduced} duration={5}>
        <Modak accent={accent} glow={glow} />
      </Floater>
      <Floater top="60%" left="78%" size={70} reduced={reduced} duration={5.5} delay={0.6}>
        <Modak accent={accent} glow={glow} />
      </Floater>
      <Floater top="68%" left="14%" size={60} reduced={reduced} duration={4.5} delay={1.0}>
        <Modak accent={accent} glow={glow} />
      </Floater>
      <Floater top="14%" left="76%" size={62} reduced={reduced} duration={5} delay={0.4}>
        <Modak accent={accent} glow={glow} />
      </Floater>
      {/* Lotus blooms */}
      {[
        { top: '36%', left: '40%' },
        { top: '52%', left: '50%' },
      ].map((p, i) => (
        <Floater key={i} top={p.top} left={p.left} size={70} reduced={reduced} duration={6} delay={i * 0.4} rotate>
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
              <ellipse
                key={deg}
                cx="30"
                cy="20"
                rx="5"
                ry="14"
                fill={glow}
                opacity="0.7"
                transform={`rotate(${deg} 30 30)`}
              />
            ))}
            <circle cx="30" cy="30" r="5" fill={accent} />
          </svg>
        </Floater>
      ))}
      <Twinkle top="30%" left="60%" size={14} color={glow} reduced={reduced} />
      <Twinkle top="44%" left="20%" size={12} color={glow} reduced={reduced} delay={0.6} />
      <Twinkle top="50%" left="74%" size={10} color={glow} reduced={reduced} delay={1.0} />
    </>
  );
}

function ChristmasScene({ accent, glow, reduced }: SceneProps) {
  return (
    <>
      {/* Snowflakes drifting downward */}
      {[
        { x: '10%', delay: 0, size: 22 },
        { x: '24%', delay: 1.2, size: 18 },
        { x: '38%', delay: 0.6, size: 26 },
        { x: '52%', delay: 2.0, size: 16 },
        { x: '66%', delay: 0.3, size: 24 },
        { x: '78%', delay: 1.6, size: 18 },
        { x: '90%', delay: 0.9, size: 22 },
      ].map((s, i) => (
        <Drift
          key={i}
          startX={s.x}
          startY="-10%"
          endX={s.x}
          endY="110%"
          duration={9 + (i % 3)}
          delay={s.delay}
          reduced={reduced}
        >
          <div style={{ width: s.size, height: s.size }}>
            <Snowflake color={glow} />
          </div>
        </Drift>
      ))}
      {/* Holly clusters */}
      <Floater top="20%" left="10%" size={70} reduced={reduced} duration={5} amplitude={4}>
        <Holly accent={accent} glow={glow} />
      </Floater>
      <Floater top="68%" left="78%" size={84} reduced={reduced} duration={5.5} delay={0.7} amplitude={4}>
        <Holly accent={accent} glow={glow} />
      </Floater>
      {/* Ornament */}
      <Floater top="46%" left="48%" size={60} reduced={reduced} duration={4} amplitude={6}>
        <svg viewBox="0 0 60 60" width="100%" height="100%">
          <line x1="30" y1="0" x2="30" y2="10" stroke={accent} strokeWidth="1.2" />
          <rect x="26" y="10" width="8" height="4" fill={accent} />
          <circle cx="30" cy="34" r="20" fill={accent} />
          <circle cx="22" cy="28" r="5" fill="#fff" opacity="0.3" />
          <path d="M 12 32 Q 30 40 48 32" stroke={glow} strokeWidth="1.4" fill="none" opacity="0.7" />
        </svg>
      </Floater>
    </>
  );
}

interface SceneProps {
  accent: string;
  glow: string;
  ink: string;
  reduced: boolean;
}
