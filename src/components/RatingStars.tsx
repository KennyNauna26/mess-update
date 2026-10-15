import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

const STARS = [1, 2, 3, 4, 5] as const;

interface RatingStarsProps {
  value: number;
  /** Omit for a read-only display. */
  onChange?: (value: number) => void;
  size?: number;
}

export function RatingStars({ value, onChange, size = 20 }: RatingStarsProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole={onChange ? 'adjustable' : 'text'}
      accessibilityLabel={`${value} out of 5 stars`}
    >
      {STARS.map((star) => {
        const icon = (
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={colors.accent}
          />
        );
        if (!onChange) return <View key={star}>{icon}</View>;
        return (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} out of 5`}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
});
