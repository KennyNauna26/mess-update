import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';

/** Shown across the app while the phone has no connection. */
export function OfflineBanner() {
  const { isConnected } = useNetInfo();
  const insets = useSafeAreaInsets();

  // isConnected is null while NetInfo is still checking; only warn when it is definitely offline.
  if (isConnected !== false) return null;

  return (
    <View
      style={[styles.banner, { paddingTop: insets.top + spacing.xs }]}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
      <Text style={styles.text}>You're offline — showing the last saved menu and queue.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  text: { ...typography.caption, color: colors.warning, flex: 1 },
});
