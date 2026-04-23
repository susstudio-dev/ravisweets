'use client';

import { LayoutGroup as FramerLayoutGroup } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Wraps children in Framer Motion's LayoutGroup so that
 * `layoutId` animations work across parallel route slots.
 */
export function LayoutGroup({ children }: { children: ReactNode }) {
  return <FramerLayoutGroup>{children}</FramerLayoutGroup>;
}
