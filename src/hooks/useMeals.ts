import { useQuery } from '@tanstack/react-query';

import { withOfflineCache } from '@/lib/offlineCache';
import { queryKeys } from '@/lib/queryClient';
import { getMeal, getMealsForDate } from '@/services/meals';
import { localDateISO } from '@/utils/format';

export function useTodayMeals() {
  const today = localDateISO();
  return useQuery({
    queryKey: queryKeys.mealsForDate(today),
    queryFn: () => withOfflineCache(`meals:${today}`, () => getMealsForDate(today)),
    // Run the query even when offline so the cached menu can be returned.
    networkMode: 'offlineFirst',
  });
}

export function useMeal(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.meal(id ?? ''),
    queryFn: () => withOfflineCache(`meal:${id}`, () => getMeal(id as string)),
    enabled: Boolean(id),
    networkMode: 'offlineFirst',
  });
}
