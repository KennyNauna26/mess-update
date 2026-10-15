import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { getMeal, getMealsForDate } from '@/services/meals';
import { localDateISO } from '@/utils/format';

export function useTodayMeals() {
  const today = localDateISO();
  return useQuery({
    queryKey: queryKeys.mealsForDate(today),
    queryFn: () => getMealsForDate(today),
  });
}

export function useMeal(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.meal(id ?? ''),
    queryFn: () => getMeal(id as string),
    enabled: Boolean(id),
  });
}
