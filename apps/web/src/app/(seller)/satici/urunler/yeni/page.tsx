import type { Metadata } from 'next';

import { ProductForm } from './product-form';

export const metadata: Metadata = {
  title: 'Yeni ürün',
  description: 'Yeni ürün oluştur — taslak olarak kaydet veya doğrudan yayına al.',
};

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}
