import type { Metadata } from 'next';

import { FarmVisitView } from './farm-visit-view';

export const metadata: Metadata = {
  title: 'Çiftlik ziyareti',
  description: 'Çiftlik ziyaret yönetimi — zaman dilimleri ve randevular.',
};

export default function FarmVisitPage() {
  return <FarmVisitView />;
}
