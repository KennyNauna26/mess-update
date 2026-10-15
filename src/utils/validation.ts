import { z } from 'zod';

const email = z.string().trim().min(1, 'Enter your email').email('Enter a valid email address');

const newPassword = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name')
      .max(100, 'Use 100 characters or fewer'),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotEmailSchema = z.object({ email });
export type ForgotEmailValues = z.infer<typeof forgotEmailSchema>;

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Enter the 6-digit code from the email'),
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const FEEDBACK_COMMENT_MAX = 500;

export const feedbackSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Choose a rating' })
    .int()
    .min(1, 'Choose a rating from 1 to 5 stars')
    .max(5, 'Choose a rating from 1 to 5 stars'),
  comment: z
    .string()
    .trim()
    .max(FEEDBACK_COMMENT_MAX, `Keep it under ${FEEDBACK_COMMENT_MAX} characters`),
});
export type FeedbackValues = z.infer<typeof feedbackSchema>;
