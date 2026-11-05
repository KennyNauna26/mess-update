import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { FormMessage } from '@/components/StateViews';
import { ControlledTextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { sendPasswordResetCode, updatePassword, verifyRecoveryCode } from '@/services/auth';
import { colors, spacing, typography } from '@/theme';
import { toFriendlyMessage } from '@/utils/errors';
import {
  forgotEmailSchema,
  resetPasswordSchema,
  type ForgotEmailValues,
  type ResetPasswordValues,
} from '@/utils/validation';

/**
 * Two steps, all inside the app:
 * 1. email → Supabase sends a 6–8 digit recovery code
 * 2. code + new password → verify the code, then save the password
 */
export default function ForgotPasswordScreen() {
  const { setRecoveringPassword } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Never leave the auth layout stuck in "recovering" mode if the user backs out.
  useEffect(() => () => setRecoveringPassword(false), [setRecoveringPassword]);

  const emailForm = useForm<ForgotEmailValues>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: '' },
  });
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  });

  const onSendCode = emailForm.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await sendPasswordResetCode(values.email);
      setEmail(values.email);
    } catch (error) {
      setFormError(toFriendlyMessage(error));
    }
  });

  const onReset = resetForm.handleSubmit(async (values) => {
    if (!email) return;
    setFormError(null);
    try {
      if (!codeVerified) {
        setRecoveringPassword(true);
        await verifyRecoveryCode(email, values.code);
        setCodeVerified(true);
      }
      await updatePassword(values.password);
      // Now signed in with the new password; releasing the flag lets the layout open Home.
      setRecoveringPassword(false);
    } catch (error) {
      if (!codeVerified) setRecoveringPassword(false);
      setFormError(toFriendlyMessage(error));
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          {email
            ? `Enter the code we sent to ${email} and choose a new password.`
            : 'Enter your account email and we will send you a reset code.'}
        </Text>
      </View>

      {formError ? <FormMessage tone="danger" message={formError} /> : null}

      {email ? (
        <>
          {!codeVerified ? (
            <ControlledTextField
              control={resetForm.control}
              name="code"
              label="Reset code"
              placeholder="12345678"
              keyboardType="number-pad"
              maxLength={8}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
            />
          ) : null}
          <ControlledTextField
            control={resetForm.control}
            name="password"
            label="New password"
            secureTextEntry
            autoComplete="new-password"
          />
          <ControlledTextField
            control={resetForm.control}
            name="confirmPassword"
            label="Confirm new password"
            secureTextEntry
            autoComplete="new-password"
            onSubmitEditing={onReset}
          />
          <AppButton
            title="Save new password"
            onPress={onReset}
            loading={resetForm.formState.isSubmitting}
          />
          {!codeVerified ? (
            <AppButton
              title="Send a new code"
              variant="secondary"
              onPress={() => {
                setEmail(null);
                setFormError(null);
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          <ControlledTextField
            control={emailForm.control}
            name="email"
            label="Email"
            placeholder="student@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onSubmitEditing={onSendCode}
          />
          <AppButton
            title="Send reset code"
            onPress={onSendCode}
            loading={emailForm.formState.isSubmitting}
          />
        </>
      )}

      <Link href="/login" style={styles.link}>
        Back to login
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  title: typography.title,
  subtitle: { ...typography.body, color: colors.textMuted },
  link: { ...typography.label, color: colors.primary, textAlign: 'center', padding: spacing.sm },
});
