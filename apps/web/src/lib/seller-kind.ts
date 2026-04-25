import type { SellerKind } from '@sanda/db/types';

export const sellerKindLabelTr: Record<SellerKind, string> = {
  INDIVIDUAL_FARMER: 'Bireysel çiftçi',
  REGISTERED_FARMER: 'ÇKS kayıtlı çiftçi',
  COOPERATIVE: 'Kooperatif',
  SMALL_BUSINESS: 'Esnaf / şahıs işletmesi',
  COMPANY: 'Şirket (Ltd. / A.Ş.)',
};

export const sellerKindDescriptionTr: Record<SellerKind, string> = {
  INDIVIDUAL_FARMER:
    'Gerçek usulde vergilendirilmeyen çiftçi. Müstahsil makbuzu ile satış yapar.',
  REGISTERED_FARMER:
    'ÇKS kayıtlı ve vergi mükellefi. Kendi adına ticari faaliyet yürütür.',
  COOPERATIVE: 'Tarımsal kalkınma / üretim kooperatifi.',
  SMALL_BUSINESS: 'Vergi mükellefi esnaf veya şahıs işletmesi.',
  COMPANY: 'Limited veya anonim şirket (MERSİS ile doğrulanır).',
};
