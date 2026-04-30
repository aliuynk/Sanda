import type { Metadata } from 'next';

import { CheckoutView } from './checkout-view';

export const metadata: Metadata = {
  title: 'Ödeme',
  description:
    'Sipariş ödeme — lisanslı ödeme kuruluşu iyzico üzerinden 3D Secure ve hakediş takibiyle.',
};

export default function CheckoutPage() {
  return (
    <div className="container max-w-5xl py-10 md:py-14">
      <CheckoutView />
    </div>
  );
}
