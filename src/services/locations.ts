import * as Location from 'expo-location';

import { supabase } from '@/lib/supabase';
import type { MessLocation } from '@/types/models';

export async function getMessLocations(): Promise<MessLocation[]> {
  const { data, error } = await supabase
    .from('mess_locations')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MessLocation[];
}

export type LocationPermission = 'granted' | 'denied';

export async function requestLocationPermission(): Promise<LocationPermission> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED ? 'granted' : 'denied';
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Throws if GPS takes too long, so the UI can show an error with Retry instead of hanging. */
export async function getCurrentCoordinates(timeoutMs = 15000): Promise<Coordinates> {
  const position = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Location request timed out')), timeoutMs),
    ),
  ]);
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}
