import { authRouter } from './routers/auth';
import { cartRouter } from './routers/cart';
import { catalogRouter } from './routers/catalog';
import { certificationRouter } from './routers/certifications';
import { geoRouter } from './routers/geo';
import { orderRouter } from './routers/orders';
import { sellerRouter } from './routers/sellers';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  catalog: catalogRouter,
  sellers: sellerRouter,
  certifications: certificationRouter,
  cart: cartRouter,
  orders: orderRouter,
  geo: geoRouter,
});

export type AppRouter = typeof appRouter;
