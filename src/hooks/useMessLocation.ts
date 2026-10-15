import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

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
    queryFn: getMessLocations,
    staleTime: 24 * 60 * 60 * 1000, // the mess does not move
  });
}

type UserLocationState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error'; message: string }
  | { status: 'success'; coords: Coordinates };

/** Asks for permission, then reads the device position. Exposes retry for the error state. */
export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const permission = await requestLocationPermission();
      if (permission === 'denied') {
        setState({ status: 'denied' });
        return;
      }
      const coords = await getCurrentCoordinates();
      setState({ status: 'success', coords });
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes('timed out')
          ? 'Could not get your location. Move near a window or turn on GPS, then retry.'
          : toFriendlyMessage(error);
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load };
}
