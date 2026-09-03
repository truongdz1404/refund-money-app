import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppIcon } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useOAuthConfig } from '@/hooks/useAppQueries';
import { ApiError, api } from '@/lib/api';
import { signIn } from '@/lib/authStore';
import type { AuthResponse } from '@/lib/types';

export function SocialLoginButtons({
  showDivider = true,
  compact = false,
}: {
  readonly showDivider?: boolean;
  readonly compact?: boolean;
}) {
  const router = useRouter();
  const oauthConfig = useOAuthConfig();
  const [pending, setPending] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const google = oauthConfig.data?.google;
  const facebook = oauthConfig.data?.facebook;
  if (!google?.enabled && !facebook?.enabled) return null;

  async function handleGoogle() {
    if (!google?.enabled) return;
    setError(null);
    setPending('google');
    try {
      const { signInWithGoogle } = await import('@/lib/oauth');
      const idToken = await signInWithGoogle(google.clientId);
      const res = await api.post<AuthResponse>('/login/google', { idToken });
      await signIn(res.token, res.user);
      router.replace('/');
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      setError(err instanceof ApiError ? err.message : 'Đăng nhập Google thất bại, thử lại nhé.');
    } finally {
      setPending(null);
    }
  }

  async function handleFacebook() {
    if (!facebook?.enabled) return;
    setError(null);
    setPending('facebook');
    try {
      const { signInWithFacebook } = await import('@/lib/oauth');
      const accessToken = await signInWithFacebook(facebook.appId);
      const res = await api.post<AuthResponse>('/login/facebook', { accessToken });
      await signIn(res.token, res.user);
      router.replace('/');
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      setError(err instanceof ApiError ? err.message : 'Đăng nhập Facebook thất bại, thử lại nhé.');
    } finally {
      setPending(null);
    }
  }

  return (
    <View style={styles.wrap}>
      {showDivider && (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={compact ? styles.socialRow : styles.socialStack}>
        {google?.enabled && (
          <SocialButton
            label="Google"
            onPress={handleGoogle}
            loading={pending === 'google'}
            disabled={pending !== null}
            icon={<GoogleMark />}
          />
        )}
        {facebook?.enabled && (
          <SocialButton
            label="Facebook"
            onPress={handleFacebook}
            loading={pending === 'facebook'}
            disabled={pending !== null}
            icon={<AppIcon name="logo-facebook" size={19} color="#1877F2" />}
          />
        )}
      </View>
    </View>
  );
}

function SocialButton({
  label,
  icon,
  loading,
  disabled,
  onPress,
}: {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly onPress: () => void;
}) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.socialButton, pressed && !inactive && styles.socialButtonPressed, inactive && styles.socialButtonDisabled]}
    >
      {loading ? <ActivityIndicator color={colors.brand} /> : icon}
      <Text style={styles.socialLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function GoogleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z"
      />
      <Path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6 29.2 4 24 4 16.2 4 9.5 8.4 6.3 14.7Z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.1-5.2C29.2 35.2 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.4 39.5 16.1 44 24 44Z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.1 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  dividerText: { ...typography.caption, color: colors.muted },
  errorText: { ...typography.body, color: colors.danger },
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  socialStack: { gap: spacing.sm },
  socialButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#EDF1F7',
    boxShadow: '0 8px 18px rgba(27, 35, 51, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  socialButtonPressed: { opacity: 0.82, transform: [{ translateY: 1 }] },
  socialButtonDisabled: { opacity: 0.55, boxShadow: 'none' },
  socialLabel: { ...typography.body, color: colors.ink, fontWeight: '800' },
});
