import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { Meal } from '@/types/models';
import { formatTime, mealStatusLabel, mealTypeLabel } from '@/utils/format';

import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

export function MealCard({ meal, onPress }: { meal: Meal; onPress?: () => void }) {
  const status = mealStatusLabel[meal.status];
  const sides = [meal.side_dish, meal.drink].filter(Boolean).join(' · ');

  return (
    <Card onPress={onPress} accessibilityLabel={`${mealTypeLabel[meal.meal_type]}: ${meal.main_dish}`}>
      <View style={styles.headerRow}>
        <Text style={styles.type}>{mealTypeLabel[meal.meal_type]}</Text>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <Text style={typography.heading} numberOfLines={2}>
        {meal.main_dish}
      </Text>
      {sides ? (
        <Text style={styles.sides} numberOfLines={2}>
          {sides}
        </Text>
      ) : null}
      <Text style={typography.caption}>
        {formatTime(meal.serving_start)} – {formatTime(meal.serving_end)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  type: { ...typography.label, color: colors.primary },
  sides: { ...typography.body, color: colors.textMuted },
});
