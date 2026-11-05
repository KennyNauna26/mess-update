import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { RatingStars } from '@/components/RatingStars';
import { Screen } from '@/components/Screen';
import { ErrorState, FormMessage, LoadingState } from '@/components/StateViews';
import { ControlledTextField } from '@/components/TextField';
import { useCreateFeedback, useFeedbackItem, useUpdateFeedback } from '@/hooks/useFeedback';
import { useMeal } from '@/hooks/useMeals';
import { colors, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { FEEDBACK_COMMENT_MAX, feedbackSchema, type FeedbackValues } from '@/utils/validation';

/**
 * CREATE when opened with ?mealId=…, UPDATE when opened with ?id=….
 * In edit mode the saved rating and comment are loaded into the form first.
 */
export default function FeedbackFormScreen() {
  const params = useLocalSearchParams<{ id?: string; mealId?: string }>();
  const isEdit = Boolean(params.id);

  const existing = useFeedbackItem(params.id);
  const mealId = params.mealId ?? existing.data?.meal_id;
  const meal = useMeal(mealId);

  const createMutation = useCreateFeedback();
  const updateMutation = useUpdateFeedback();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  // Pre-populate the edit form once the saved feedback has loaded.
  useEffect(() => {
    if (existing.data) {
      reset({ rating: existing.data.rating, comment: existing.data.comment });
    }
  }, [existing.data, reset]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const commentLength = watch('comment').length;

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const input = { rating: values.rating, comment: values.comment.trim() };
    const onError = (error: unknown) => setFormError(toFriendlyMessage(error));

    if (isEdit && params.id) {
      updateMutation.mutate({ id: params.id, input }, { onSuccess: () => router.back(), onError });
    } else if (mealId) {
      createMutation.mutate(
        { mealId, input },
        { onSuccess: (created) => router.replace(`/feedback/${created.id}`), onError },
      );
    }
  });

  if (isEdit && existing.isPending) return <LoadingState />;
  if (isEdit && existing.isError) {
    return (
      <ErrorState message={toFriendlyMessage(existing.error)} onRetry={() => existing.refetch()} />
    );
  }
  if (!mealId) {
    return <ErrorState message="No meal was selected. Go back and choose a meal first." />;
  }

  return (
    <Screen edges={['left', 'right']}>
      <Stack.Screen options={{ title: isEdit ? 'Edit feedback' : 'Give feedback' }} />

      <View style={{ gap: spacing.xs }}>
        <Text style={typography.caption}>Meal</Text>
        <Text style={typography.heading}>{meal.data?.main_dish ?? '…'}</Text>
      </View>

      {formError ? <FormMessage tone="danger" message={formError} /> : null}

      <Controller
        control={control}
        name="rating"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <View style={styles.ratingBlock}>
            <Text style={typography.label}>Your rating</Text>
            <RatingStars value={value} onChange={onChange} size={36} />
            {error ? <Text style={styles.error}>{error.message}</Text> : null}
          </View>
        )}
      />

      <ControlledTextField
        control={control}
        name="comment"
        label="Comment (optional)"
        placeholder="What did you think of the meal?"
        multiline
        maxLength={FEEDBACK_COMMENT_MAX}
        helperText={`${commentLength}/${FEEDBACK_COMMENT_MAX}`}
      />

      <AppButton
        title={isEdit ? 'Save changes' : 'Submit feedback'}
        onPress={onSubmit}
        loading={isSaving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ratingBlock: { gap: spacing.sm },
  error: { ...typography.caption, color: colors.danger },
});
