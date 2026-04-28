import { formatTry, kurus } from '@sanda/core';
import type { Metadata } from 'next';

import { getServerTrpc } from '@/trpc/server';

import { EarningsView } from './earnings-view';

export const metadata: Metadata = {
  title: 'Kazanç',
  description: 'Satıcı kazanç özeti, aylık grafik ve hakediş geçmişi.',
};

const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export default async function SellerEarningsPage() {
  const trpc = await getServerTrpc();
  const { items } = await trpc.orders.listForSeller({ limit: 100 });

  const completed = items.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED');
  const pending = items.filter((o) =>
    ['PAID', 'AWAITING_FULFILLMENT', 'IN_PREPARATION', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status),
  );

  const totalGross = completed.reduce((s, o) => s + o.totalKurus, 0);
  const totalNet = completed.reduce((s, o) => s + o.sellerNetKurus, 0);
  const totalCommission = completed.reduce((s, o) => s + o.platformFeeKurus, 0);
  const pendingAmount = pending.reduce((s, o) => s + o.sellerNetKurus, 0);

  // Build monthly aggregation from order dates
  const monthlyMap = new Map<string, { net: number; gross: number }>();
  for (const order of [...completed, ...pending]) {
    const d = new Date(order.placedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    const label = monthNames[d.getMonth()] ?? key;
    const existing = monthlyMap.get(key) ?? { net: 0, gross: 0 };
    existing.gross += order.totalKurus;
    existing.net += order.sellerNetKurus;
    monthlyMap.set(key, existing);
  }

  // Sort by date key and take last 6 months
  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, data]) => {
      const monthIdx = parseInt(key.split('-')[1]!, 10);
      return {
        month: monthNames[monthIdx] ?? key,
        net: data.net,
        gross: data.gross,
      };
    });

  // Placeholder payouts (will be replaced by real payout worker data)
  const recentPayouts = completed.length > 0
    ? [
        {
          id: 'p-1',
          date: new Date().toLocaleDateString('tr-TR', { dateStyle: 'medium' }),
          amount: totalNet,
          status: 'completed' as const,
        },
      ]
    : [];

  return (
    <EarningsView
      data={{
        totalNet,
        totalGross,
        totalCommission,
        pendingAmount,
        completedCount: completed.length,
        pendingCount: pending.length,
        monthlyData,
        recentPayouts,
      }}
    />
  );
}
