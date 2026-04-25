import { redirect } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { NewProductForm } from './new-product-form';

export const metadata = { title: 'Yeni ürün' };

export default async function NewProductPage() {
  const trpc = await getServerTrpc();
  const [me, categories] = await Promise.all([trpc.auth.me(), trpc.catalog.categories()]);
  const seller = me.sellerProfile;
  if (!seller) redirect('/sat');

  const flatCategories: { id: string; label: string }[] = [];
  for (const c of categories) {
    flatCategories.push({ id: c.id, label: c.nameTr });
    for (const child of c.children) {
      flatCategories.push({ id: child.id, label: `${c.nameTr} › ${child.nameTr}` });
    }
  }

  return <NewProductForm sellerId={seller.id} categories={flatCategories} />;
}
