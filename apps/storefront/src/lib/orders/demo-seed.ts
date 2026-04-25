'use client';

import { CATALOGUE } from '@ravisweets/shared';
import type { Order } from './types';

const SEED_SENTINEL_KEY = 'ravi.demo.seeded.v1';
const STORAGE_KEY = 'ravi.orders.v1';

/**
 * Idempotent: only seeds on the FIRST visit per browser. The sentinel
 * `ravi.demo.seeded.v1` records the seeding so subsequent visits don't
 * recreate orders the user may have already cleared. Resetting demo data
 * (e.g. from /account) clears both the sentinel and the orders.
 */
export function seedDemoOrders(): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(SEED_SENTINEL_KEY)) return;
    if (localStorage.getItem(STORAGE_KEY)) {
      // User already has orders — just stamp the sentinel so we don't seed later.
      localStorage.setItem(SEED_SENTINEL_KEY, '1');
      return;
    }
    const orders = buildDemoOrders();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    localStorage.setItem(SEED_SENTINEL_KEY, '1');
  } catch {
    /* ignore — non-fatal for non-storage envs */
  }
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEED_SENTINEL_KEY);
    seedDemoOrders();
  } catch {
    /* ignore */
  }
}

function findProduct(slug: string) {
  const p = CATALOGUE.find((x) => x.slug === slug);
  if (!p) throw new Error(`Demo seed references missing product: ${slug}`);
  return p;
}

function lineFor(slug: string, qty = 1) {
  const p = findProduct(slug);
  const v = p.variants[0]!;
  return {
    productId: p.id,
    productSlug: p.slug,
    productTitle: p.title,
    variantId: v.id,
    variantTitle: v.title,
    quantity: qty,
    unitPrice: v.price,
    lineTotal: { amount: v.price.amount * qty, currency: v.price.currency },
    imageUrl: p.images[0]?.url,
  };
}

const DEMO_ADDRESS = {
  name: 'You',
  phone: '+91 90000 00000',
  email: 'demo@ravisweets.com',
  line1: '12 Banjara Hills',
  line2: 'Road No. 3',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500034',
  country: 'India',
};

const DAY = 24 * 60 * 60 * 1000;

function buildDemoOrders(): Order[] {
  const now = Date.now();
  const orders: Order[] = [
    {
      id: 'ord_demo_1',
      number: 'RS2604-A1F2',
      placedAt: now - 6 * 60 * 60 * 1000,
      status: 'placed',
      address: DEMO_ADDRESS,
      payment: { method: 'upi', reference: 'pay_demo_a1f2' },
      lines: [lineFor('qubani-ka-meetha', 1), lineFor('kaju-katli', 1)],
      subtotal: { amount: 1198, currency: 'INR' },
      shipping: { amount: 0, currency: 'INR' },
      total: { amount: 1198, currency: 'INR' },
    },
    {
      id: 'ord_demo_2',
      number: 'RS2604-B7C9',
      placedAt: now - 1.5 * DAY,
      status: 'packed',
      address: DEMO_ADDRESS,
      payment: { method: 'card', reference: 'pay_demo_b7c9' },
      lines: [lineFor('diwali-premium-hamper', 1)],
      subtotal: { amount: 2499, currency: 'INR' },
      shipping: { amount: 0, currency: 'INR' },
      total: { amount: 2499, currency: 'INR' },
    },
    {
      id: 'ord_demo_3',
      number: 'RS2604-C3D8',
      placedAt: now - 4 * DAY,
      status: 'shipped',
      address: DEMO_ADDRESS,
      payment: { method: 'netbanking', reference: 'pay_demo_c3d8' },
      lines: [
        lineFor('double-ka-meetha', 1),
        lineFor('hyderabadi-mixture', 2),
        lineFor('roasted-almonds', 1),
      ],
      subtotal: { amount: 1296, currency: 'INR' },
      shipping: { amount: 49, currency: 'INR' },
      total: { amount: 1345, currency: 'INR' },
    },
    {
      id: 'ord_demo_4',
      number: 'RS2603-E4A1',
      placedAt: now - 12 * DAY,
      status: 'delivered',
      address: DEMO_ADDRESS,
      payment: { method: 'upi', reference: 'pay_demo_e4a1' },
      lines: [lineFor('badam-ki-jali', 1), lineFor('saffron-pistachios', 1)],
      subtotal: { amount: 998, currency: 'INR' },
      shipping: { amount: 0, currency: 'INR' },
      total: { amount: 998, currency: 'INR' },
    },
    {
      id: 'ord_demo_5',
      number: 'RS2602-F2B7',
      placedAt: now - 28 * DAY,
      status: 'delivered',
      address: DEMO_ADDRESS,
      payment: { method: 'cod', reference: 'cod_demo_f2b7' },
      lines: [lineFor('motichoor-ladoo', 2)],
      subtotal: { amount: 698, currency: 'INR' },
      shipping: { amount: 49, currency: 'INR' },
      total: { amount: 747, currency: 'INR' },
    },
  ];
  return orders;
}
