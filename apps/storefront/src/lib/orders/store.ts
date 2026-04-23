'use client';

import type { Order } from './types';

const STORAGE_KEY = 'ravi.orders.v1';

function read(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(orders: Order[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    /* ignore */
  }
}

export function getOrders(): Order[] {
  return read().sort((a, b) => b.placedAt - a.placedAt);
}

export function getOrder(id: string): Order | undefined {
  return read().find((o) => o.id === id);
}

export function saveOrder(order: Order): void {
  const all = read();
  const without = all.filter((o) => o.id !== order.id);
  write([...without, order]);
}

export function generateOrderId(): string {
  // Rough uniqueness is fine — this is a placeholder until real backend assigns IDs.
  return `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateOrderNumber(): string {
  const yy = new Date().getFullYear().toString().slice(-2);
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RS${yy}${mm}-${rand}`;
}
