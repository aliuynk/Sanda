import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { SellerReviewPanel } from './review-panel';

export default async function SellerApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trpc = await getServerTrpc();

  let seller: Awaited<ReturnType<typeof trpc.admin.sellers.getById>>;
  try {
    seller = await trpc.admin.sellers.getById({ id });
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/uretici-basvurulari"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Üretici başvuruları
      </Link>

      <SellerReviewPanel seller={seller} />
    </div>
  );
}
