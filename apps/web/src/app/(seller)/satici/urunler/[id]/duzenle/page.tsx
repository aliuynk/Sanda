import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { ProductForm } from '../../yeni/product-form';

export const metadata: Metadata = { title: 'Ürünü düzenle' };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trpc = await getServerTrpc();

  let product: Awaited<ReturnType<typeof trpc.catalog.mineById>>;
  try {
    product = await trpc.catalog.mineById({ productId: id });
  } catch {
    notFound();
  }

  // Map server data to the form's initial values
  const initialData = {
    nameTr: product.nameTr,
    nameEn: product.nameEn ?? '',
    summary: product.summary ?? '',
    description: product.description ?? '',
    categorySlug: product.category?.slug ?? '',
    productionMethod: product.productionMethod,
    originProvince: product.originProvinceCode ?? '',
    originRegion: product.originRegion ?? '',
    isSeasonal: product.isSeasonal,
    seasonStartMonth: product.seasonStartMonth,
    seasonEndMonth: product.seasonEndMonth,
    minOrderQty: Number(product.minOrderQty),
    maxOrderQty: product.maxOrderQty ? Number(product.maxOrderQty) : undefined,
    allergens: product.allergens ?? [],
    harvestNotes: product.harvestNotes ?? '',
    storageNotes: product.storageNotes ?? '',
    variants: product.variants.map((v) => ({
      id: v.id,
      nameTr: v.nameTr,
      unit: v.unit,
      quantityPerUnit: String(Number(v.quantityPerUnit)),
      priceKurus: String(v.priceKurus),
      compareAtPriceKurus: v.compareAtPriceKurus ? String(v.compareAtPriceKurus) : '',
      stockQuantity: String(Number(v.stockQuantity)),
      sku: v.sku,
      isDefault: v.isDefault,
    })),
    media: product.media.map((m) => ({ url: m.url, altText: m.altText })),
  };

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      initialData={initialData}
    />
  );
}
