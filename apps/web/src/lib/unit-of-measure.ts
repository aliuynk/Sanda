import type { UnitOfMeasure } from '@sanda/db/types';

export const unitOfMeasureLabelTr: Record<UnitOfMeasure, string> = {
  GRAM: 'gram',
  KILOGRAM: 'kilogram',
  PIECE: 'adet',
  LITER: 'litre',
  MILLILITER: 'mililitre',
  BUNCH: 'demet',
  DOZEN: 'düzine',
  BOX: 'kutu',
};

export const unitOfMeasureShortTr: Record<UnitOfMeasure, string> = {
  GRAM: 'gr',
  KILOGRAM: 'kg',
  PIECE: 'adet',
  LITER: 'lt',
  MILLILITER: 'ml',
  BUNCH: 'demet',
  DOZEN: 'düz.',
  BOX: 'kutu',
};
