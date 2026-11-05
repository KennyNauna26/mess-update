import { useQuery } from '@tanstack/react-query';

import { withOfflineCache } from '@/lib/offlineCache';
import { queryKeys } from '@/lib/queryClient';
import { getLatestQueue, getQueueHistorySince } from '@/services/queue';
import { localDateISO, startOfTodayISO } from '@/utils/format';

/** Queue data goes stale fast, so it is refreshed every minute while a screen shows it. */
const QUEUE_REFRESH_MS = 60 * 1000;

export function useLatestQueue() {
  return useQuery({
    queryKey: queryKeys.latestQueue,
    queryFn: () => withOfflineCache('queue:latest', getLatestQueue),
    refetchInterval: QUEUE_REFRESH_MS,
    networkMode: 'offlineFirst',
  });
}

export function useQueueHistoryToday() {
  const today = localDateISO();
  return useQuery({
    queryKey: queryKeys.queueHistory(today),
    queryFn: () =>
      withOfflineCache(`queue:history:${today}`, () => getQueueHistorySince(startOfTodayISO())),
    refetchInterval: QUEUE_REFRESH_MS,
    networkMode: 'offlineFirst',
  });
}
