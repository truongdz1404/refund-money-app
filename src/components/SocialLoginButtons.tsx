import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/design/components';
import { colors, spacing, typography } from '@/design/tokens';
import { useOAuthConfig } from '@/hooks/useAppQueries';
import { ApiError, api } from '@/lib/api';
import { signIn } from '@/lib/authStore';
import { signInWithFacebook, signInWithGoogle } from '@/lib/oauth';
import type { AuthResponse } from '@/lib/types';

export function SocialLoginButtons() {
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
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>hoặc</Text>
        <View style={styles.dividerLine} />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {google?.enabled && (
        <AppButton
          label="Đăng nhập với Google"
          icon="logo-google"
          variant="secondary"
          onPress={handleGoogle}
          loading={pending === 'google'}
          disabled={pending !== null}
        />
      )}
      {facebook?.enabled && (
        <AppButton
          label="Đăng nhập với Facebook"
          icon="logo-facebook"
          variant="secondary"
          onPress={handleFacebook}
          loading={pending === 'facebook'}
          disabled={pending !== null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  dividerText: { ...typography.caption, color: colors.muted },
  errorText: { ...typography.body, color: colors.danger },
});
