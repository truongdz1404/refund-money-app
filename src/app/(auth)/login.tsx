import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { AppButton } from '@/design/components';
import { colors, spacing, typography } from '@/design/tokens';
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Hoàn tiền Shopee dễ dàng, mọi lúc mọi nơi.</Text>

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
          {error && <Text style={styles.errorText}>{error}</Text>}
          <AppButton label="Đăng nhập" onPress={onSubmit} loading={submitting} />
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
