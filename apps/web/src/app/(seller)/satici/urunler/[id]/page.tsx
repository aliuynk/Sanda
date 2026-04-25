import { notFound } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { ProductDetailClient } from './product-detail-client';

export const metadata = { title: 'Ürün detayı' };

export default async function SellerProductDetailPage({
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

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        slug: product.slug,
        nameTr: product.nameTr,
        status: product.status,
        categoryName: product.category.nameTr,
        productionMethod: product.productionMethod,
        summary: product.summary,
        description: product.description,
        minOrderQty: Number(product.minOrderQty),
        stepQty: Number(product.stepQty),
        isSeasonal: product.isSeasonal,
        seasonStartMonth: product.seasonStartMonth,
        seasonEndMonth: product.seasonEndMonth,
        variants: product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          nameTr: v.nameTr,
          unit: v.unit,
          quantityPerUnit: Number(v.quantityPerUnit),
          priceKurus: v.priceKurus,
          compareAtPriceKurus: v.compareAtPriceKurus,
          stockQuantity: Number(v.stockQuantity),
          isDefault: v.isDefault,
          isActive: v.isActive,
        })),
        media: product.media.map((m) => ({ url: m.url, altText: m.altText })),
      }}
    />
  );
}
