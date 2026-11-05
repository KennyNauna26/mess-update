import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { RatingStars } from '@/components/RatingStars';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, FormMessage, LoadingState } from '@/components/StateViews';
import { useDeleteFeedback, useFeedbackItem } from '@/hooks/useFeedback';
import { spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { formatDate, mealTypeLabel, timeAgo } from '@/utils/format';

/** READ (detail) + entry point to UPDATE and DELETE. */
export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const feedback = useFeedbackItem(id);
  const deleteMutation = useDeleteFeedback();
  const [error, setError] = useState<string | null>(null);

  if (feedback.isPending) return <LoadingState />;
  if (feedback.isError) {
    return (
      <ErrorState message={toFriendlyMessage(feedback.error)} onRetry={() => feedback.refetch()} />
    );
  }
  if (!feedback.data) {
    return (
      <EmptyState
        icon="chatbubbles-outline"
        title="Feedback not found"
        message="It may have been deleted."
      />
    );
  }

  const item = feedback.data;
  const wasEdited = item.updated_at !== item.created_at;

  const confirmDelete = () => {
    Alert.alert('Delete feedback?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setError(null);
          deleteMutation.mutate(item.id, {
            onSuccess: () => router.back(),
            onError: (deleteError) => setError(toFriendlyMessage(deleteError)),
          });
        },
      },
    ]);
  };

  return (
    <Screen edges={['left', 'right']}>
      <View style={{ gap: spacing.xs }}>
        <Text style={typography.title}>{item.meals?.main_dish ?? 'Meal removed'}</Text>
        {item.meals ? (
          <Text style={typography.caption}>
            {mealTypeLabel[item.meals.meal_type]} · {formatDate(item.meals.meal_date)}
          </Text>
        ) : null}
      </View>

      {error ? <FormMessage tone="danger" message={error} /> : null}

      <Card>
        <RatingStars value={item.rating} size={28} />
        <Text style={typography.body}>{item.comment || 'No comment added.'}</Text>
        <Text style={typography.caption}>
          Added {formatDate(item.created_at)}
          {wasEdited ? ` · edited ${timeAgo(item.updated_at)}` : ''}
        </Text>
      </Card>

      <AppButton
        title="Edit feedback"
        onPress={() => router.push({ pathname: '/feedback/form', params: { id: item.id } })}
        disabled={deleteMutation.isPending}
      />
      <AppButton
        title="Delete feedback"
        variant="danger"
        onPress={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </Screen>
  );
}
