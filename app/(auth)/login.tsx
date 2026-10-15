import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { FormMessage } from '@/components/StateViews';
import { ControlledTextField } from '@/components/TextField';
import { signIn } from '@/services/auth';
import { colors, radius, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { loginSchema, type LoginValues } from '@/utils/validation';

export default function LoginScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // On success the auth layout sees the new session and redirects to Home.
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      setFormError(toFriendlyMessage(error));
    }
  });

  return (
    <Screen>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="restaurant" size={40} color={colors.white} />
        </View>
        <Text style={styles.appName}>Mess Update</Text>
        <Text style={styles.tagline}>Check the food. Check the queue. Then go.</Text>
      </View>

      {formError ? <FormMessage tone="danger" message={formError} /> : null}

      <ControlledTextField
        control={control}
        name="email"
        label="Email"
        placeholder="student@university.edu"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <ControlledTextField
        control={control}
        name="password"
        label="Password"
        placeholder="Your password"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        onSubmitEditing={onSubmit}
      />

      <AppButton title="Log in" onPress={onSubmit} loading={isSubmitting} />

      <Link href="/forgot-password" style={styles.link}>
        Forgot password?
      </Link>
      <View style={styles.footer}>
        <Text style={typography.body}>Don't have an account? </Text>
        <Link href="/register" style={styles.linkInline}>
          Register
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.lg },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { ...typography.title, color: colors.primary },
  tagline: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  link: { ...typography.label, color: colors.primary, textAlign: 'center', padding: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkInline: { ...typography.body, color: colors.primary, fontWeight: '600' },
});
