/** Turns Supabase / network errors into messages a student can act on. */
export function toFriendlyMessage(error: unknown): string {
  const friendly = friendlyMessageFor(error);
  // In development (Expo Go) also show the raw error, so problems can be diagnosed.
  // Release builds (__DEV__ === false) only ever show the friendly message.
  if (__DEV__ && error instanceof Error && error.message) {
    return `${friendly}\n\n[dev] ${error.message}`;
  }
  return friendly;
}

function friendlyMessageFor(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  const message = raw.toLowerCase();
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status: unknown }).status)
      : 0;

  if (message.includes('network request failed') || message.includes('failed to fetch')) {
    return 'No connection. Check your internet and try again.';
  }
  if (message.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (message.includes('email not confirmed')) {
    return 'Confirm your email first — check your inbox for the link.';
  }
  if (message.includes('error sending') || message.includes('smtp')) {
    return 'We could not send the email right now. Please try again in a few minutes.';
  }
  if (message.includes('database error saving new user')) {
    return 'Your account could not be set up. Please try again later.';
  }
  if (message.includes('invalid api key') || message.includes('no api key')) {
    return 'The app is not connected to the server correctly.';
  }
  if (message.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in.';
  }
  if (message.includes('token has expired') || message.includes('otp')) {
    return 'That code is wrong or has expired. Request a new one.';
  }
  if (status === 429 || message.includes('rate limit')) {
    return 'Too many attempts. Wait a few minutes and try again.';
  }
  if (code === '23505') {
    return 'You have already reviewed this meal. Edit your existing feedback instead.';
  }
  if (code === '42501') {
    return 'You do not have permission to do that.';
  }
  return 'Something went wrong. Please try again.';
}
