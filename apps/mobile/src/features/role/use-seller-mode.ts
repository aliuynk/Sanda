import { useCallback, useEffect, useState } from 'react';

import { storage, storageKeys } from '../../lib/storage';

/**
 * Role switching is intentionally local — it changes which tabs render but
 * does NOT change permissions. Server-side RBAC still enforces real auth.
 */
export function useSellerMode() {
  const [isSellerMode, setState] = useState(() =>
    storage.getBoolean(storageKeys.sellerMode) ?? false,
  );

  useEffect(() => {
    const subscription = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === storageKeys.sellerMode) {
        setState(storage.getBoolean(storageKeys.sellerMode) ?? false);
      }
    });
    return () => subscription.remove();
  }, []);

  const setIsSellerMode = useCallback((next: boolean) => {
    storage.set(storageKeys.sellerMode, next);
  }, []);

  return { isSellerMode, setIsSellerMode };
}
