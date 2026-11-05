import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { MealRemindersCard } from '@/components/MealRemindersCard';
import { FormMessage } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { signOut } from '@/services/auth';
import { colors, radius, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';

type IconName = ComponentProps<typeof Ionicons>['name'];

function MenuRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={[typography.body, styles.menuLabel]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const profile = useProfile();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = profile.data?.full_name || String(user?.user_metadata?.full_name ?? 'Student');

  const confirmSignOut = () => {
    Alert.alert('Log out?', 'You will need to log in again to use Mess Update.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setIsSigningOut(true);
          setError(null);
          try {
            await signOut();
            // Drop cached data so the next account never sees this student's feedback.
            queryClient.clear();
          } catch (signOutError) {
            setError(toFriendlyMessage(signOutError));
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text style={typography.title}>Profile</Text>

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={colors.white} />
        </View>
        <Text style={typography.heading}>{name}</Text>
        <Text style={typography.caption}>{user?.email}</Text>
        {profile.data?.role === 'admin' ? (
          <Text style={[typography.caption, { color: colors.accent }]}>Mess administrator</Text>
        ) : null}
      </View>

      {error ? <FormMessage tone="danger" message={error} /> : null}

      <Card style={styles.menuCard}>
        <MenuRow
          icon="chatbubbles-outline"
          label="My feedback"
          onPress={() => router.push('/feedback')}
        />
      </Card>

      <Text style={typography.heading}>Meal reminders</Text>
      <MealRemindersCard />

      <AppButton title="Log out" variant="danger" onPress={confirmSignOut} loading={isSigningOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.xs },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  menuCard: { padding: 0 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  menuLabel: { flex: 1 },
  pressed: { backgroundColor: colors.background },
});
