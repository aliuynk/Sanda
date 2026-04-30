import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { CertReviewPanel } from './review-panel';

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trpc = await getServerTrpc();

  let cert: Awaited<ReturnType<typeof trpc.admin.certifications.getById>>;
  try {
    cert = await trpc.admin.certifications.getById({ id });
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/sertifikalar"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Sertifika doğrulama
      </Link>

      <CertReviewPanel cert={cert} />
    </div>
  );
}
