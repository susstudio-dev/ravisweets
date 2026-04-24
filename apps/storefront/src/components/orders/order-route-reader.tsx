'use client';

import { useSearchParams } from 'next/navigation';
import { OrderDetail } from './order-detail';

export function OrderRouteReader() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  return <OrderDetail orderId={id} />;
}
