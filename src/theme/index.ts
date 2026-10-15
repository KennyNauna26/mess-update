// The single source of colour, type and spacing for the whole app (brief §3.5).

export const colors = {
  primary: '#1B5E20',
  primaryLight: '#E8F5E9',
  accent: '#F57C00',
  accentLight: '#FFF3E0',
  background: '#F7F7F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#5F6368',
  border: '#E0E0E0',
  white: '#FFFFFF',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#B26A00',
  warningLight: '#FFF4E0',
  danger: '#C62828',
  dangerLight: '#FDECEA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  heading: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, fontWeight: '400', color: colors.text },
  label: { fontSize: 14, fontWeight: '500', color: colors.text },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
} as const;

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export const toneColors: Record<StatusTone, { fg: string; bg: string }> = {
  success: { fg: colors.success, bg: colors.successLight },
  warning: { fg: colors.warning, bg: colors.warningLight },
  danger: { fg: colors.danger, bg: colors.dangerLight },
  neutral: { fg: colors.textMuted, bg: colors.background },
};
