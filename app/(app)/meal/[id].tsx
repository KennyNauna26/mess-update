import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { RatingStars } from '@/components/RatingStars';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { StatusBadge } from '@/components/StatusBadge';
import { useMyFeedbackForMeal } from '@/hooks/useFeedback';
import { useMeal } from '@/hooks/useMeals';
import { colors, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { formatDate, formatTime, mealStatusLabel, mealTypeLabel } from '@/utils/format';

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.body}>{value}</Text>
    </View>
  );
}

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meal = useMeal(id);
  const myFeedback = useMyFeedbackForMeal(id);

  if (meal.isPending) return <LoadingState />;
  if (meal.isError) {
    return <ErrorState message={toFriendlyMessage(meal.error)} onRetry={() => meal.refetch()} />;
  }
  if (!meal.data) {
    return <EmptyState title="Meal not found" message="It may have been removed by the mess." />;
  }

  const data = meal.data;
  const status = mealStatusLabel[data.status];
  const existing = myFeedback.data;

  return (
    <Screen edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={[typography.label, { color: colors.primary }]}>
          {mealTypeLabel[data.meal_type]} · {formatDate(data.meal_date)}
        </Text>
        <Text style={typography.title}>{data.main_dish}</Text>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>

      <Card>
        <DetailRow label="Serving time" value={`${formatTime(data.serving_start)} – ${formatTime(data.serving_end)}`} />
        <DetailRow label="Side dish" value={data.side_dish} />
        <DetailRow label="Drink" value={data.drink} />
        <DetailRow label="About this meal" value={data.description} />
      </Card>

      <Text style={typography.heading}>Your feedback</Text>
      {myFeedback.isPending ? (
        <LoadingState />
      ) : myFeedback.isError ? (
        <ErrorState message={toFriendlyMessage(myFeedback.error)} onRetry={() => myFeedback.refetch()} />
      ) : existing ? (
        <Card onPress={() => router.push(`/feedback/${existing.id}`)} accessibilityLabel="Open your feedback">
          <RatingStars value={existing.rating} />
          {existing.comment ? <Text style={typography.body}>{existing.comment}</Text> : null}
          <Text style={typography.caption}>Tap to view, edit or delete</Text>
        </Card>
      ) : (
        <AppButton
          title="Give feedback"
          onPress={() => router.push({ pathname: '/feedback/form', params: { mealId: data.id } })}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  detailRow: { gap: 2, paddingVertical: spacing.xs },
});
