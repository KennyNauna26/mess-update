import { supabase } from '@/lib/supabase';

export interface SignUpResult {
  /** false when Supabase requires email confirmation before the first login. */
  hasSession: boolean;
}

export async function signUp(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  });
  if (error) throw error;
  return { hasSession: data.session !== null };
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Emails a 6-digit recovery code. The Supabase "Reset Password" email template must
 * include {{ .Token }} (see README) so the reset can finish inside the app without deep links.
 */
export async function sendPasswordResetCode(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/** Exchanges the emailed code for a temporary session that may change the password. */
export async function verifyRecoveryCode(email: string, code: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
