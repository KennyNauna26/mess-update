import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import {
  createFeedback,
  deleteFeedback,
  getFeedback,
  getMyFeedbackForMeal,
  listMyFeedback,
  updateFeedback,
} from '@/services/feedback';
import type { FeedbackInput } from '@/types/models';

export function useMyFeedbackList() {
  return useQuery({ queryKey: queryKeys.feedbackList, queryFn: listMyFeedback });
}

export function useFeedbackItem(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.feedback(id ?? ''),
    queryFn: () => getFeedback(id as string),
    enabled: Boolean(id),
  });
}

export function useMyFeedbackForMeal(mealId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.feedbackForMeal(mealId ?? ''),
    queryFn: () => getMyFeedbackForMeal(mealId as string),
    enabled: Boolean(mealId),
  });
}

/** Every feedback query starts with ['feedback'], so one invalidation refreshes list, detail and per-meal views. */
function useInvalidateFeedback() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['feedback'] });
}

export function useCreateFeedback() {
  const invalidate = useInvalidateFeedback();
  return useMutation({
    mutationFn: ({ mealId, input }: { mealId: string; input: FeedbackInput }) =>
      createFeedback(mealId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateFeedback() {
  const invalidate = useInvalidateFeedback();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: FeedbackInput }) => updateFeedback(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteFeedback() {
  const invalidate = useInvalidateFeedback();
  return useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: invalidate,
  });
}
