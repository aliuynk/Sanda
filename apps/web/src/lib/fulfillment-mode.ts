import type { FulfillmentMode } from '@sanda/db/types';

export const fulfillmentModeTr: Record<FulfillmentMode, string> = {
  SHIPPING: 'Kargo ile gönderim',
  PICKUP: 'Teslim noktası / elden',
  FARM_VISIT: 'Bahçe / çiftlik ziyareti',
};
