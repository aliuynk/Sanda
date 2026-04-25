import { CartView } from './cart-view';

export const metadata = {
  title: 'Sepetim',
};

export default function CartPage() {
  return (
    <div className="container py-10">
      <h1 className="mb-6 font-display text-3xl">Sepetim</h1>
      <CartView />
    </div>
  );
}
