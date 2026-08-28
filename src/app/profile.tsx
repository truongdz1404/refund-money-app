import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/TextField';
import { AppButton, AppIcon, Card } from '@/design/components';
import { colors, spacing, typography } from '@/design/tokens';
import { useChangePassword, useMe, useUpdateProfile } from '@/hooks/useAppQueries';

export default function ProfileScreen() {
  const router = useRouter();
  const me = useMe();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hydratedUserId, setHydratedUserId] = useState<number | null>(null);

  if (me.data && me.data.id !== hydratedUserId) {
    setHydratedUserId(me.data.id);
    setPhone(me.data.phone ?? '');
    setBankName(me.data.bankName ?? '');
    setBankAccountNumber(me.data.bankAccountNumber ?? '');
    setBankAccountHolder(me.data.bankAccountHolder ?? '');
  }

  function handleSaveProfile() {
    updateProfile.mutate(
      { phone, bankName, bankAccountNumber, bankAccountHolder },
      {
        onSuccess: () => Alert.alert('Đã lưu', 'Thông tin hồ sơ đã được cập nhật.'),
        onError: (err) => Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể lưu.'),
      },
    );
  }

  function handleChangePassword() {
    if (newPassword.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Không khớp', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    changePassword.mutate(
      { newPassword },
      {
        onSuccess: () => {
          setNewPassword('');
          setConfirmPassword('');
          Alert.alert('Thành công', 'Mật khẩu đã được đổi.');
        },
        onError: (err) => Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể đổi mật khẩu.'),
      },
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text onPress={() => router.back()} style={styles.backButton}>
          <AppIcon name="arrow-back" size={22} color={colors.ink} />
        </Text>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <Card style={styles.card}>
            <TextField label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextField label="Tên ngân hàng" value={bankName} onChangeText={setBankName} placeholder="VD: Vietcombank" />
            <TextField
              label="Số tài khoản"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              keyboardType="number-pad"
            />
            <TextField
              label="Chủ tài khoản"
              value={bankAccountHolder}
              onChangeText={setBankAccountHolder}
              autoCapitalize="characters"
            />
            <View style={styles.buttonRow}>
              <AppButton
                label="Lưu thay đổi"
                onPress={handleSaveProfile}
                loading={updateProfile.isPending}
                style={styles.primaryButton}
              />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
          <Card style={styles.card}>
            <TextField
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Ít nhất 6 ký tự"
            />
            <TextField
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <View style={styles.buttonRow}>
              <AppButton
                label="Đổi mật khẩu"
                variant="secondary"
                onPress={handleChangePassword}
                loading={changePassword.isPending}
                style={styles.secondaryButton}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  keyboard: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FA',
    backgroundColor: colors.card,
  },
  backButton: { width: 42, color: colors.ink },
  headerTitle: { ...typography.title, color: colors.ink, fontSize: 18, flex: 1 },
  headerSpacer: { width: 42 },
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
  sectionTitle: { ...typography.section, color: colors.ink, fontWeight: '900' },
  card: { gap: spacing.md, padding: spacing.md },
  buttonRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.xs },
  primaryButton: { minWidth: 132 },
  secondaryButton: { minWidth: 138 },
});
