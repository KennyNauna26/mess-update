import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, toneColors, typography } from '@/theme';

import { AppButton } from './AppButton';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.caption}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'restaurant-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <AppButton title={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorState({ message, onRetry, retrying = false }: ErrorStateProps) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.danger} />
      <Text style={styles.title}>Couldn't load this</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <AppButton title="Retry" onPress={onRetry} loading={retrying} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

/** Inline banner for form-level errors and notices (not tied to one field). */
export function FormMessage({ tone, message }: { tone: 'danger' | 'success'; message: string }) {
  const palette = toneColors[tone];
  return (
    <View
      style={[styles.banner, { backgroundColor: palette.bg, borderColor: palette.fg }]}
      accessibilityLiveRegion="polite"
    >
      <Text style={[typography.label, { color: palette.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: { ...typography.heading, textAlign: 'center' },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  caption: typography.caption,
  action: { marginTop: spacing.sm, alignSelf: 'stretch' },
  banner: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
