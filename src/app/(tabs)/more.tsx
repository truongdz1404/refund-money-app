import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, AppTopBar, type AppIconName, Card, IconBadge } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { signOut, useAuth } from '@/lib/authStore';

type MenuItem = {
  key: string;
  label: string;
  subtitle: string;
  icon: AppIconName;
  onPress: () => void;
  danger?: boolean;
};

export default function MoreScreen() {
  const router = useRouter();
  const { user } = useAuth();

  function handleLogout() {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  const items: MenuItem[] = [
    {
      key: 'referral',
      label: 'Giới thiệu bạn bè',
      subtitle: 'Mời bạn bè, nhận thêm thưởng',
      icon: 'people-outline',
      onPress: () => router.push('/referral'),
    },
    {
      key: 'profile',
      label: 'Hồ sơ & Cài đặt',
      subtitle: 'Thông tin ngân hàng, bảo mật',
      icon: 'person-circle-outline',
      onPress: () => router.push('/profile'),
    },
    {
      key: 'guide',
      label: 'Hướng dẫn sử dụng',
      subtitle: 'Cách tạo link và nhận hoàn tiền',
      icon: 'book-outline',
      onPress: () => router.push('/guide'),
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      subtitle: 'Thoát khỏi tài khoản hiện tại',
      icon: 'log-out-outline',
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name="Đặng Nguyễn Tiến" subtitle={user?.phone ? `Đang đăng nhập: ${user.phone}` : 'Tài khoản hoàn tiền'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Thêm</Text>
        <Card style={styles.profileCard}>
          <IconBadge name="person" size={44} backgroundColor={colors.brandSoft} iconColor={colors.brand} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Đặng Nguyễn Tiến</Text>
            <Text style={styles.profileSub}>{user?.phone ?? 'Cộng tác viên hoàn tiền'}</Text>
          </View>
          <AppIcon name="qr-code-outline" size={22} color={colors.brand} />
        </Card>

        <View style={styles.menuList}>
          {items.map((item) => (
            <Pressable key={item.key} onPress={item.onPress}>
              <Card style={styles.itemCard}>
                <View style={[styles.iconWrap, item.danger && styles.iconWrapDanger]}>
                  <AppIcon name={item.icon} size={19} color={item.danger ? colors.danger : colors.brand} />
                </View>
                <View style={styles.itemText}>
                  <Text style={[styles.itemLabel, item.danger && styles.itemLabelDanger]}>{item.label}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <AppIcon name="chevron-forward" size={17} color={colors.textMuted} />
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  container: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.sm },
  screenTitle: { ...typography.title, color: colors.ink },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  profileName: { ...typography.body, color: colors.ink, fontWeight: '900' },
  profileSub: { ...typography.caption, color: colors.muted },
  menuList: { gap: spacing.xs },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: '#FEE2E2' },
  itemText: { flex: 1, gap: 2 },
  itemLabel: { ...typography.body, color: colors.ink, fontWeight: '800' },
  itemLabelDanger: { color: colors.danger },
  itemSubtitle: { ...typography.caption, color: colors.muted },
});
