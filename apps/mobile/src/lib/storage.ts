import { MMKV } from 'react-native-mmkv';

/**
 * A single MMKV instance for the app. MMKV is synchronous and extremely
 * fast, so it is our source of truth for UI state that needs to survive
 * process restarts (locale, seller-mode toggle, draft forms).
 *
 * Sensitive material (refresh tokens, IBAN, TC kimlik) must use
 * `expo-secure-store` instead — never MMKV, never AsyncStorage.
 */
export const storage = new MMKV({ id: 'sanda-mobile' });

export const storageKeys = {
  sellerMode: 'role:seller',
  locale: 'i18n:locale',
  pendingOutbox: 'outbox:v1',
} as const;
