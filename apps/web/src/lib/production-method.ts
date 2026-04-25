import type { ProductionMethod } from '@sanda/db/types';

export const productionMethodLabelTr: Record<ProductionMethod, string> = {
  CONVENTIONAL: 'Geleneksel',
  GOOD_AGRICULTURE: 'İyi Tarım Uygulamaları',
  ORGANIC_TRANSITION: 'Organik geçiş dönemi',
  CERTIFIED_ORGANIC: 'Organik sertifikalı',
  NATURAL_TRADITIONAL: 'Atasal / doğal',
  WILD_HARVESTED: 'Doğadan toplama',
};
