'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { DURATION, EASE } from '@/lib/motion/constants';

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  /** Translate Y in px on hover/focus. Default -2. */
  lift?: number;
}

export function HoverLift({ children, className, lift = -2 }: HoverLiftProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: lift }}
      whileFocus={{ y: lift }}
      transition={{ duration: DURATION.quick, ease: EASE.standard }}
    >
      {children}
    </motion.div>
  );
}
