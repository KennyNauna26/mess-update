import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { OfflineBanner } from '@/components/OfflineBanner';
import { LoadingState } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

/**
 * Authentication boundary. Every route inside (app) renders through here, so a
 * signed-out user is redirected to Login whatever URL or navigation state they try.
 */
export default function AppLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) return <LoadingState />;
  if (!session) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.surface },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meal/[id]" options={{ title: 'Meal details' }} />
        <Stack.Screen name="feedback/index" options={{ title: 'My feedback' }} />
        <Stack.Screen name="feedback/[id]" options={{ title: 'Feedback' }} />
        <Stack.Screen name="feedback/form" options={{ title: 'Feedback' }} />
      </Stack>
    </View>
  );
}
