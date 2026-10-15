import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { MealCard } from '@/components/MealCard';
import { QueueStatusCard } from '@/components/QueueStatusCard';
import { Screen } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useTodayMeals } from '@/hooks/useMeals';
import { useLatestQueue } from '@/hooks/useQueue';
import { colors, spacing, typography } from '@/theme';
import type { Meal } from '@/types/models';
import { toFriendlyMessage } from '@/utils/errors';

function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** The meal a student most likely cares about right now: serving, else next, else the last one. */
function pickFeaturedMeal(meals: Meal[]): Meal | undefined {
  return (
    meals.find((meal) => meal.status === 'serving') ??
    meals.find((meal) => meal.status === 'upcoming') ??
    meals.at(-1)
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const meals = useTodayMeals();
  const queue = useLatestQueue();

  const firstName = String(user?.user_metadata?.full_name ?? '').split(' ')[0] || 'Student';
  const featured = meals.data ? pickFeaturedMeal(meals.data) : undefined;

  const refresh = () => {
    meals.refetch();
    queue.refetch();
  };

  return (
    <Screen refreshing={meals.isRefetching || queue.isRefetching} onRefresh={refresh}>
      <View>
        <Text style={typography.caption}>{greeting()},</Text>
        <Text style={typography.title}>{firstName}</Text>
      </View>

      <Text style={typography.heading}>Today's meal</Text>
      {meals.isPending ? (
        <LoadingState message="Loading today's menu…" />
      ) : meals.isError ? (
        <ErrorState message={toFriendlyMessage(meals.error)} onRetry={() => meals.refetch()} />
      ) : featured ? (
        <MealCard meal={featured} onPress={() => router.push(`/meal/${featured.id}`)} />
      ) : (
        <Card>
          <Text style={typography.body}>No meals have been posted for today yet.</Text>
        </Card>
      )}

      <Text style={typography.heading}>Queue</Text>
      {queue.isPending ? (
        <LoadingState message="Checking the queue…" />
      ) : queue.isError ? (
        <ErrorState message={toFriendlyMessage(queue.error)} onRetry={() => queue.refetch()} />
      ) : queue.data ? (
        <QueueStatusCard report={queue.data} onPress={() => router.push('/queue')} />
      ) : (
        <Card>
          <Text style={typography.body}>No queue reports yet today.</Text>
        </Card>
      )}

      <Card>
        <View style={styles.row}>
          <Ionicons name="location" size={24} color={colors.primary} />
          <Text style={typography.heading}>Find the mess</Text>
        </View>
        <Text style={typography.body}>See where the mess is and how far you are from it.</Text>
        <AppButton title="View map" variant="secondary" onPress={() => router.push('/map')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
