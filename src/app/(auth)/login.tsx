import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SocialLoginButtons } from '@/components/SocialLoginButtons';
import { TextField } from '@/components/TextField';
import { AppButton, AppIcon, Mascot } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { ApiError, api } from '@/lib/api';
import { signIn } from '@/lib/authStore';
import type { AuthResponse } from '@/lib/types';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!phone.trim() || !password) {
      setError('Vui lòng nhập số điện thoại và mật khẩu.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<AuthResponse>('/login', { phone: phone.trim(), password });
      await signIn(res.token, res.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng nhập thất bại, thử lại nhé.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backgroundLineOne} />
        <View style={styles.backgroundLineTwo} />
        <View style={styles.backgroundLineThree} />

        <View style={styles.topArea}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <AppIcon name="arrow-back" size={20} color={colors.ink} />
          </Pressable>

          <View style={styles.brandMark}>
            <Mascot size={64} />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để tạo link hoàn tiền, theo dõi đơn hàng và rút tiền nhanh hơn.</Text>
          </View>
        </View>

        <SocialLoginButtons showDivider={false} compact />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.formCard}>
          <TextField
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="09xxxxxxxx"
            style={styles.input}
          />
          <TextField
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Tối thiểu 6 ký tự"
            style={styles.input}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <AppButton label="Đăng nhập" onPress={onSubmit} loading={submitting} style={styles.submitButton} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản?</Text>
          <Link href="/register" style={styles.footerLink}>
            Đăng ký ngay
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F8FA' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  backgroundLineOne: {
    position: 'absolute',
    top: 34,
    left: -56,
    width: 460,
    height: 1,
    backgroundColor: '#D8DEE8',
    transform: [{ rotate: '-28deg' }],
  },
  backgroundLineTwo: {
    position: 'absolute',
    top: 176,
    right: -120,
    width: 440,
    height: 1,
    backgroundColor: '#E0E5EE',
    transform: [{ rotate: '23deg' }],
  },
  backgroundLineThree: {
    position: 'absolute',
    bottom: 90,
    left: -120,
    width: 430,
    height: 1,
    backgroundColor: '#E3E7EF',
    transform: [{ rotate: '18deg' }],
  },
  topArea: { alignItems: 'center', gap: spacing.md },
  backButton: {
    position: 'absolute',
    top: -4,
    left: 0,
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    boxShadow: '0 10px 24px rgba(27, 35, 51, 0.07)',
    zIndex: 2,
  },
  brandMark: {
    width: 92,
    height: 92,
    borderRadius: radius.xxxl,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    boxShadow: '0 16px 34px rgba(27, 35, 51, 0.08)',
  },
  heading: { alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md },
  title: { fontSize: 29, lineHeight: 36, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.muted, textAlign: 'center', maxWidth: 310 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E7EBF2' },
  dividerText: { ...typography.caption, color: colors.muted, fontWeight: '700' },
  formCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    boxShadow: '0 18px 42px rgba(27, 35, 51, 0.08)',
  },
  input: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderColor: '#EDF1F7',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    fontSize: 14,
  },
  submitButton: { minHeight: 52, borderRadius: radius.pill, marginTop: spacing.xs },
  errorText: { ...typography.body, color: colors.danger, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  footerText: { ...typography.body, color: colors.muted },
  footerLink: { ...typography.body, color: colors.brandDark, fontWeight: '900' },
  pressed: { opacity: 0.78, transform: [{ translateY: 1 }] },
});
