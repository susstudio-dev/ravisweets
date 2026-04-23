'use client';

import { motion, useInView, type Variants } from 'motion/react';
import { useRef, type ReactNode, type CSSProperties } from 'react';
import { DURATION, EASE } from '@/lib/motion/constants';
import { useReducedMotion } from '@/lib/motion/use-reduced-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'span';
  style?: CSSProperties;
}

function offset(direction: Direction, distance: number) {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance };
    case 'down':
      return { x: 0, y: -distance };
    case 'left':
      return { x: distance, y: 0 };
    case 'right':
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

export function Reveal({
  children,
  direction = 'up',
  distance = 12,
  delay = 0,
  duration = DURATION.slow,
  once = true,
  amount = 0.2,
  className,
  as = 'div',
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduced = useReducedMotion();

  const { x, y } = offset(direction, distance);

  const variants: Variants = reduced
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: DURATION.fast } },
      }
    : {
        hidden: { opacity: 0, x, y },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration, ease: EASE.emphasised, delay },
        },
      };

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </MotionTag>
  );
}
