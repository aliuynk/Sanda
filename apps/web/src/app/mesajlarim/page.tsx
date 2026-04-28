import type { Metadata } from 'next';

import { MessagingView } from '@/components/messaging-view';

export const metadata: Metadata = {
  title: 'Mesajlarım',
  description: 'Üreticilerle mesajlaşma.',
};

export default function BuyerMessagesPage() {
  return (
    <div className="container max-w-5xl py-10 md:py-14">
      <MessagingView role="buyer" />
    </div>
  );
}
