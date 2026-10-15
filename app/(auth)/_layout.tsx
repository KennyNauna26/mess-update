import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { session, isLoading, isRecoveringPassword } = useAuth();

  if (isLoading) return <LoadingState />;
  // Signed-in users never see the login screens (except mid password reset).
  if (session && !isRecoveringPassword) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
