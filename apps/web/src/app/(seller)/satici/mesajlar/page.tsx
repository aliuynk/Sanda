import type { Metadata } from 'next';

import { MessagingView } from '@/components/messaging-view';

export const metadata: Metadata = {
  title: 'Mesajlar',
  description: 'Alıcılarla mesajlaşma — sipariş ve ürün iletişimi.',
};

export default function SellerMessagesPage() {
  return <MessagingView role="seller" />;
}
