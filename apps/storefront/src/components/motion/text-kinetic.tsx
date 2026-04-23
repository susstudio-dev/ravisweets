'use client';

import { motion, type Variants } from 'motion/react';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';
import { DURATION, EASE } from '@/lib/motion/constants';

interface TextKineticProps {
  text: string;
  /** Stagger unit: word or character. Default = word. */
  split?: 'word' | 'char';
  className?: string;
  /** Optional delay in seconds before first entrance. */
  delay?: number;
  /** Gap between units in ms. */
  gap?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function TextKinetic({
  text,
  split = 'word',
  className,
  delay = 0,
  gap = 45,
  as = 'h1',
}: TextKineticProps) {
  const reduced = useReducedMotion();
  const units = split === 'word' ? text.split(/(\s+)/) : Array.from(text);

  if (reduced) {
    const MotionTag = motion[as] as typeof motion.h1;
    return (
      <MotionTag
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.fast }}
      >
        {text}
      </MotionTag>
    );
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap / 1000, delayChildren: delay } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.slow, ease: EASE.emphasised },
    },
  };

  const MotionTag = motion[as] as typeof motion.h1;

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
      aria-label={text}
    >
      {units.map((u, i) => {
        if (u.match(/^\s+$/)) return <span key={i}>{u}</span>;
        return (
          <motion.span key={i} variants={item} style={{ display: 'inline-block' }} aria-hidden="true">
            {u}
          </motion.span>
        );
      })}
    </MotionTag>
  );
}
