export const Palette = {
  background: '#FFFFFF',
  backgroundAlt: '#F5F8FF',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF1FF',
  border: '#DCE6FA',

  textPrimary: '#1B2333',
  textSecondary: '#5B6478',
  textMuted: '#8A93A6',
  textOnAccent: '#FFFFFF',

  accent: '#4C7EF3',
  accentBright: '#6E97F6',
  accentDark: '#2E5BD1',
  accentSoft: '#EAF1FF',
  accentGlow: 'rgba(76, 126, 243, 0.25)',

  success: '#22C55E',
  danger: '#EF4444',
  info: '#3B82F6',

  shadow: 'rgba(27, 35, 51, 0.08)',
} as const;

export type PaletteColor = keyof typeof Palette;
