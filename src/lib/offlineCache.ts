import AsyncStorage from '@react-native-async-storage/async-storage';
import { onlineManager } from '@tanstack/react-query';

const PREFIX = 'mess-update:cache:';

function isNetworkError(error: unknown): boolean {
  if (!onlineManager.isOnline()) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('timed out')
  );
}

/**
 * Runs a fetcher and keeps a copy of its last successful result in AsyncStorage.
 * When the phone is offline (or the request fails for network reasons) the last saved
 * copy is returned instead, so the menu and queue stay readable without a connection.
 * Other errors (permission, server) are still thrown so the screen shows its error state.
 */
export async function withOfflineCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const storageKey = `${PREFIX}${key}`;
  try {
    const data = await fetcher();
    AsyncStorage.setItem(storageKey, JSON.stringify(data)).catch(() => undefined);
    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = await AsyncStorage.getItem(storageKey).catch(() => null);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    }
    throw error;
  }
}
