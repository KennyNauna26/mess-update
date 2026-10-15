import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { FormMessage } from '@/components/StateViews';
import { ControlledTextField } from '@/components/TextField';
import { signUp } from '@/services/auth';
import { colors, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import { registerSchema, type RegisterValues } from '@/utils/validation';

export default function RegisterScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { hasSession } = await signUp({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      // With email confirmation on, there is no session until the link is clicked.
      if (!hasSession) setNeedsConfirmation(true);
    } catch (error) {
      setFormError(toFriendlyMessage(error));
    }
  });

  if (needsConfirmation) {
    return (
      <Screen>
        <Text style={styles.title}>Check your email</Text>
        <FormMessage
          tone="success"
          message="We sent you a confirmation link. Open it, then come back and log in."
        />
        <AppButton title="Back to login" onPress={() => router.replace('/login')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Mess Update to get started.</Text>
      </View>

      {formError ? <FormMessage tone="danger" message={formError} /> : null}

      <ControlledTextField
        control={control}
        name="fullName"
        label="Full name"
        placeholder="Your name"
        autoComplete="name"
        textContentType="name"
        maxLength={100}
      />
      <ControlledTextField
        control={control}
        name="email"
        label="Email"
        placeholder="student@university.edu"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <ControlledTextField
        control={control}
        name="password"
        label="Password"
        placeholder="At least 8 characters, with a number"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <ControlledTextField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        placeholder="Type it again"
        secureTextEntry
        autoComplete="new-password"
        onSubmitEditing={onSubmit}
      />

      <AppButton title="Register" onPress={onSubmit} loading={isSubmitting} />

      <View style={styles.footer}>
        <Text style={typography.body}>Already have an account? </Text>
        <Link href="/login" style={styles.linkInline}>
          Log in
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  title: typography.title,
  subtitle: { ...typography.body, color: colors.textMuted },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkInline: { ...typography.body, color: colors.primary, fontWeight: '600' },
});
