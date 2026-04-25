import type { ProductStatus } from '@sanda/db/types';

export const productStatusTr: Record<ProductStatus, string> = {
  DRAFT: 'Taslak',
  ACTIVE: 'Yayında',
  PAUSED: 'Duraklatıldı',
  OUT_OF_STOCK: 'Stokta yok',
  ARCHIVED: 'Arşiv',
};
