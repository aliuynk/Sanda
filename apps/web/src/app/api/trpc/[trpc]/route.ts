import { appRouter } from '@sanda/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { createTrpcContext } from '@/server/trpc-context';

export const runtime = 'nodejs';

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTrpcContext(req),
    onError({ error, path }) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(`tRPC ${path} failed`, error);
      }
    },
  });
}

export { handler as GET, handler as POST };
