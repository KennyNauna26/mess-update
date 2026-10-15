import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { RatingStars } from '@/components/RatingStars';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useMyFeedbackList } from '@/hooks/useFeedback';
import { colors, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { formatDate, mealTypeLabel } from '@/utils/format';

/** READ (list): only the signed-in student's rows come back, enforced by RLS. */
export default function MyFeedbackScreen() {
  const feedback = useMyFeedbackList();

  if (feedback.isPending) return <LoadingState message="Loading your feedback…" />;
  if (feedback.isError) {
    return (
      <ErrorState
        message={toFriendlyMessage(feedback.error)}
        onRetry={() => feedback.refetch()}
        retrying={feedback.isRefetching}
      />
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={feedback.data}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <Card
          onPress={() => router.push(`/feedback/${item.id}`)}
          accessibilityLabel={`Feedback for ${item.meals?.main_dish ?? 'meal'}`}
        >
          <Text style={typography.heading} numberOfLines={1}>
            {item.meals?.main_dish ?? 'Meal removed'}
          </Text>
          {item.meals ? (
            <Text style={typography.caption}>
              {mealTypeLabel[item.meals.meal_type]} · {formatDate(item.meals.meal_date)}
            </Text>
          ) : null}
          <RatingStars value={item.rating} size={18} />
          {item.comment ? (
            <Text style={typography.body} numberOfLines={2}>
              {item.comment}
            </Text>
          ) : null}
        </Card>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="chatbubbles-outline"
          title="No feedback yet"
          message="Open a meal from the Menu and tap Give feedback."
          actionLabel="Go to Menu"
          onAction={() => router.push('/menu')}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={feedback.isRefetching}
          onRefresh={() => feedback.refetch()}
          colors={[colors.primary]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, flexGrow: 1 },
  separator: { height: spacing.md },
});
