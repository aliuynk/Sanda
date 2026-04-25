import { redirect } from 'next/navigation';

import { SellerWorkspaceShell } from '@/components/seller/workspace-shell';
import { getServerTrpc } from '@/trpc/server';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const trpc = await getServerTrpc();
  let account: Awaited<ReturnType<typeof trpc.auth.me>>;
  try {
    account = await trpc.auth.me();
  } catch {
    redirect('/giris?next=/satici');
  }
  if (!account.sellerProfile) redirect('/sat');

  return (
    <SellerWorkspaceShell displayName={account.sellerProfile.displayName}>{children}</SellerWorkspaceShell>
  );
}
