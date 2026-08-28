import { Palette } from '@/constants/palette';

export const colors = {
  ...Palette,
  ink: Palette.textPrimary,
  muted: Palette.textSecondary,
  canvas: Palette.background,
  card: Palette.surface,
  cardMuted: Palette.surfaceMuted,
  hairline: Palette.border,
  brand: Palette.accent,
  brandBright: Palette.accentBright,
  brandDark: Palette.accentDark,
  brandSoft: Palette.accentSoft,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  section: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
  body: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: '500' as const },
} as const;

export const shadows = {
  sm: '0 2px 6px rgba(27, 35, 51, 0.06)',
  md: '0 6px 14px rgba(27, 35, 51, 0.07)',
  lg: '0 12px 24px rgba(27, 35, 51, 0.09)',
  brand: '0 10px 20px rgba(76, 126, 243, 0.25)',
} as const;
