import type { OrderStatus } from '@sanda/db/types';

export const orderStatusTr: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Ödeme bekleniyor',
  PAID: 'Ödendi',
  AWAITING_FULFILLMENT: 'Hazırlanacak',
  IN_PREPARATION: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  OUT_FOR_DELIVERY: 'Dağıtımda',
  DELIVERED: 'Teslim edildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  REFUND_REQUESTED: 'İade talebi',
  REFUNDED: 'İade edildi',
  DISPUTED: 'İhtilaf',
};
