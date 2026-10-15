import { supabase } from '@/lib/supabase';
import type { QueueReport } from '@/types/models';

const QUEUE_COLUMNS = '*, mess_locations(name)';

/** The newest report is the current queue status. */
export async function getLatestQueue(): Promise<QueueReport | null> {
  const { data, error } = await supabase
    .from('queue_status')
    .select(QUEUE_COLUMNS)
    .order('reported_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as QueueReport | null;
}

export async function getQueueHistorySince(sinceISO: string): Promise<QueueReport[]> {
  const { data, error } = await supabase
    .from('queue_status')
    .select(QUEUE_COLUMNS)
    .gte('reported_at', sinceISO)
    .order('reported_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as QueueReport[];
}
