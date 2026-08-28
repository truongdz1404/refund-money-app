import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { TextField } from '@/components/TextField';
import { AppButton, Card, SectionHeader } from '@/design/components';
import { spacing } from '@/design/tokens';
import { useChangePassword, useMe, useUpdateProfile } from '@/hooks/useAppQueries';

export default function ProfileScreen() {
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeader title="Thông tin cá nhân" />
        <Card style={styles.card}>
          <TextField label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label="Tên ngân hàng" value={bankName} onChangeText={setBankName} placeholder="VD: Vietcombank" />
          <TextField
            label="Số tài khoản"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            keyboardType="number-pad"
          />
          <TextField label="Chủ tài khoản" value={bankAccountHolder} onChangeText={setBankAccountHolder} autoCapitalize="characters" />
          <AppButton label="Lưu thay đổi" onPress={handleSaveProfile} loading={updateProfile.isPending} />
        </Card>

        <SectionHeader title="Đổi mật khẩu" />
        <Card style={styles.card}>
          <TextField
            label="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Ít nhất 6 ký tự"
          />
          <TextField label="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          <AppButton
            label="Đổi mật khẩu"
            variant="secondary"
            onPress={handleChangePassword}
            loading={changePassword.isPending}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.md },
  card: { gap: spacing.md, marginBottom: spacing.lg },
});
