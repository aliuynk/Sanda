import type { AppRouter } from './root';

/**
 * Client-side re-exports so downstream apps can do:
 *   import type { AppRouter } from '@sanda/api/client'
 * without pulling server-only dependencies.
 */
export type { AppRouter };
