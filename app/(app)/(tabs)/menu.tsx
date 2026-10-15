import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealCard } from '@/components/MealCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useTodayMeals } from '@/hooks/useMeals';
import { colors, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { formatDate, localDateISO } from '@/utils/format';

export default function MenuScreen() {
  const meals = useTodayMeals();

  let body;
  if (meals.isPending) {
    body = <LoadingState message="Loading today's menu…" />;
  } else if (meals.isError) {
    body = <ErrorState message={toFriendlyMessage(meals.error)} onRetry={() => meals.refetch()} retrying={meals.isRefetching} />;
  } else {
    body = (
      <FlatList
        data={meals.data}
        keyExtractor={(meal) => meal.id}
        renderItem={({ item }) => (
          <MealCard meal={item} onPress={() => router.push(`/meal/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title="No menu yet"
            message="The mess hasn't posted today's meals. Pull down to check again."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={meals.isRefetching}
            onRefresh={() => meals.refetch()}
            colors={[colors.primary]}
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={typography.title}>Today's menu</Text>
        <Text style={typography.caption}>{formatDate(localDateISO())}</Text>
      </View>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.xs },
  list: { padding: spacing.lg, flexGrow: 1 },
  separator: { height: spacing.md },
});
