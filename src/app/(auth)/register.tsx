import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { AppButton } from '@/design/components';
import { colors, spacing, typography } from '@/design/tokens';
import { ApiError, api } from '@/lib/api';
import { signIn } from '@/lib/authStore';
import type { AuthResponse } from '@/lib/types';

export default function RegisterScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!phone.trim() || !password) {
      setError('Vui lòng nhập số điện thoại và mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<AuthResponse>('/register', {
        phone: phone.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
      });
      await signIn(res.token, res.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng ký thất bại, thử lại nhé.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>
          Nếu số điện thoại từng nhắn Zalo với bot, lịch sử đơn hàng cũ sẽ tự động gộp vào đây.
        </Text>

        <View style={styles.form}>
          <TextField
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="09xxxxxxxx"
          />
          <TextField
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Tối thiểu 6 ký tự"
          />
          <TextField
            label="Mã giới thiệu (không bắt buộc)"
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="none"
            placeholder="Nhập mã của người mời, nếu có"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <AppButton label="Đăng ký" onPress={onSubmit} loading={submitting} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản?</Text>
          <Link href="/login" style={styles.footerLink}>
            Đăng nhập
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.canvas },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  title: { ...typography.hero, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  form: { gap: spacing.md },
  errorText: { ...typography.body, color: colors.danger },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  footerText: { ...typography.body, color: colors.muted },
  footerLink: { ...typography.body, color: colors.brand, fontWeight: '700' },
});
