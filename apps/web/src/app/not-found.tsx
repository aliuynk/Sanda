import { buttonVariants, cn } from '@sanda/ui-web';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-5xl">404</h1>
      <p className="text-muted-foreground">Aradığınız sayfayı bulamadık.</p>
      <Link href="/" className={cn(buttonVariants())}>
        Ana sayfaya dön
      </Link>
    </div>
  );
}
