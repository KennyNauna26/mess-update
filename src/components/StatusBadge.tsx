import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, toneColors, typography, type StatusTone } from '@/theme';

/** Colour plus a word, so status never depends on colour alone. */
export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const palette = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <View style={[styles.dot, { backgroundColor: palette.fg }]} />
      <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { ...typography.caption, fontWeight: '600' },
});
