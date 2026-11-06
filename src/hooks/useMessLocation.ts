import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { withOfflineCache } from '@/lib/offlineCache';
import { queryKeys } from '@/lib/queryClient';
import {
  getCurrentCoordinates,
  getMessLocations,
  requestLocationPermission,
  type Coordinates,
} from '@/services/locations';
import { toFriendlyMessage } from '@/utils/errors';

export function useMessLocations() {
  return useQuery({
    queryKey: queryKeys.messLocations,
    queryFn: () => withOfflineCache('mess-locations', getMessLocations),
    staleTime: 24 * 60 * 60 * 1000, // the mess does not move
    networkMode: 'offlineFirst',
  });
}

type UserLocationState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error'; message: string }
  | { status: 'success'; coords: Coordinates };

/** Asks for permission, then reads the device position. Returns the new state; sets nothing. */
async function readUserLocation(): Promise<UserLocationState> {
  try {
    const permission = await requestLocationPermission();
    if (permission === 'denied') return { status: 'denied' };
    const coords = await getCurrentCoordinates();
    return { status: 'success', coords };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('timed out')
        ? 'Could not get your location. Move near a window or turn on GPS, then retry.'
        : toFriendlyMessage(error);
    return { status: 'error', message };
  }
}

/** Reads the device position on mount and again on every retry. */
export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    // State is set only in the callback, after the GPS reply arrives.
    readUserLocation().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false; // ignore a late reply after the screen closes
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
