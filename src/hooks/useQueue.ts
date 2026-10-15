import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { getLatestQueue, getQueueHistorySince } from '@/services/queue';
import { localDateISO, startOfTodayISO } from '@/utils/format';

/** Queue data goes stale fast, so it is refreshed every minute while a screen shows it. */
const QUEUE_REFRESH_MS = 60 * 1000;

export function useLatestQueue() {
  return useQuery({
    queryKey: queryKeys.latestQueue,
    queryFn: getLatestQueue,
    refetchInterval: QUEUE_REFRESH_MS,
  });
}

export function useQueueHistoryToday() {
  return useQuery({
    queryKey: queryKeys.queueHistory(localDateISO()),
    queryFn: () => getQueueHistorySince(startOfTodayISO()),
    refetchInterval: QUEUE_REFRESH_MS,
  });
}
