import { useRouter } from 'expo-router';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/QueryState';
import { AppButton, AppIcon, type AppIconName, Card, IconBadge } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useMe, useWallet } from '@/hooks/useAppQueries';
import { getDisplayName } from '@/lib/displayName';
import { formatVnd } from '@/lib/format';
import { signOut, useAuth } from '@/lib/authStore';

type Shortcut = {
  label: string;
  icon: AppIconName;
  onPress: () => void;
  badge?: string;
};

type MenuItem = {
  label: string;
  subtitle: string;
  icon: AppIconName;
  onPress: () => void;
  danger?: boolean;
};

export default function MeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const me = useMe();
  const wallet = useWallet();

  function refetchAll() {
    me.refetch();
    wallet.refetch();
  }

  function handleLogout() {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  const displayName = getDisplayName(me.data);
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || '?';

  const orderShortcuts: Shortcut[] = [
    { label: 'Chờ xác nhận', icon: 'time-outline', badge: `${wallet.data?.pendingOrders ?? 0}`, onPress: () => router.push('/orders') },
    { label: 'Đã hoàn thành', icon: 'checkmark-done-outline', badge: `${wallet.data?.paidOrders ?? 0}`, onPress: () => router.push('/orders') },
    { label: 'Chưa thanh toán', icon: 'wallet-outline', badge: `${wallet.data?.unpaidOrders ?? 0}`, onPress: () => router.push('/orders') },
    { label: 'Tất cả đơn', icon: 'receipt-outline', onPress: () => router.push('/orders') },
  ];

  const utilityShortcuts: Shortcut[] = [
    { label: 'Thanh toán', icon: 'cash-outline', onPress: () => router.push('/wallet') },
    { label: 'Tạo link', icon: 'bag-add-outline', onPress: () => router.push('/link') },
    { label: 'Sự kiện', icon: 'gift-outline', onPress: () => router.push('/campaigns') },
    { label: 'Bạn bè', icon: 'people-outline', onPress: () => router.push('/referral') },
  ];

  const menuItems: MenuItem[] = [
    {
      label: 'Hồ sơ & Cài đặt',
      subtitle: 'Thông tin cá nhân, ngân hàng',
      icon: 'person-circle-outline',
      onPress: () => router.push('/profile'),
    },
    {
      label: 'Hướng dẫn sử dụng',
      subtitle: 'Cách tạo link và nhận hoàn tiền',
      icon: 'book-outline',
      onPress: () => router.push('/guide'),
    },
    {
      label: 'Đăng xuất',
      subtitle: 'Thoát khỏi tài khoản hiện tại',
      icon: 'log-out-outline',
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={me.isFetching || wallet.isFetching} onRefresh={refetchAll} />}
      >
        <View style={styles.headerBand}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Tôi</Text>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerIconButton} onPress={() => router.push('/profile')}>
                <AppIcon name="settings-outline" size={18} color={colors.ink} />
              </Pressable>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profilePhone}>
                {me.data?.phone ?? me.data?.email ?? user?.phone ?? 'Cộng tác viên hoàn tiền'}
              </Text>
            </View>
            <View style={styles.memberBadge}>
              <AppIcon name="shield-checkmark-outline" size={13} color={colors.brandDark} />
              <Text style={styles.memberText}>Đã xác thực</Text>
            </View>
          </View>
        </View>

        <QueryState isLoading={wallet.isLoading && !wallet.data} isError={wallet.isError} onRetry={refetchAll}>
          <Card style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <View>
                <Text style={styles.cardTitle}>Ví hoàn tiền</Text>
                <Text style={styles.cardSubtitle}>Thanh toán được đưa vào mục Tôi</Text>
              </View>
              <Text style={styles.walletTotal}>{formatVnd(wallet.data?.availableAmount)}</Text>
            </View>

            <View style={styles.walletStats}>
              <WalletStat label="Chờ đối soát" value={formatVnd(wallet.data?.pendingAmount)} />
              <WalletStat label="Chưa thanh toán" value={formatVnd(wallet.data?.unpaidAmount)} />
              <WalletStat label="Đã nhận" value={formatVnd(wallet.data?.paidAmount)} />
            </View>

            <View style={styles.paymentRow}>
              <View style={styles.bankMini}>
                <AppIcon name="card-outline" size={16} color={colors.brand} />
                <Text style={styles.bankMiniText} numberOfLines={1}>
                  {me.data?.bankName ? `${me.data.bankName} · ${me.data.bankAccountNumber ?? ''}` : 'Chưa cập nhật ngân hàng'}
                </Text>
              </View>
              <AppButton label="Thanh toán" onPress={() => router.push('/wallet')} style={styles.paymentButton} />
            </View>
          </Card>
        </QueryState>

        <Card style={styles.sectionCard}>
          <SectionTitle title="Đơn mua" action="Xem tất cả" onPress={() => router.push('/orders')} />
          <View style={styles.shortcutGrid}>
            {orderShortcuts.map((item) => (
              <ShortcutItem key={item.label} item={item} />
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <SectionTitle title="Tiện ích của tôi" />
          <View style={styles.shortcutGrid}>
            {utilityShortcuts.map((item) => (
              <ShortcutItem key={item.label} item={item} />
            ))}
          </View>
        </Card>

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable key={item.label} onPress={item.onPress}>
              <Card style={styles.menuCard}>
                <View style={[styles.menuIconWrap, item.danger && styles.menuIconDanger]}>
                  <AppIcon name={item.icon} size={18} color={item.danger ? colors.danger : colors.brand} />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuLabel, item.danger && styles.menuDanger]}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <AppIcon name="chevron-forward" size={16} color={colors.textMuted} />
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  action,
  onPress,
}: {
  readonly title: string;
  readonly action?: string;
  readonly onPress?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.cardTitle}>{title}</Text>
      {action && (
        <Text onPress={onPress} style={styles.sectionAction}>
          {action}
        </Text>
      )}
    </View>
  );
}

function WalletStat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <View style={styles.walletStat}>
      <Text style={styles.walletStatValue}>{value}</Text>
      <Text style={styles.walletStatLabel}>{label}</Text>
    </View>
  );
}

function ShortcutItem({ item }: { readonly item: Shortcut }) {
  return (
    <Pressable style={styles.shortcutItem} onPress={item.onPress}>
      <View style={styles.shortcutIconWrap}>
        <IconBadge name={item.icon} size={34} backgroundColor={colors.brandSoft} iconColor={colors.brand} iconSize={18} />
        {item.badge && item.badge !== '0' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.shortcutLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F8FD' },
  container: { paddingBottom: spacing.xxl, gap: spacing.xs },
  headerBand: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EDF8',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { ...typography.title, color: colors.ink, fontWeight: '900' },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: '#F6F8FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7EDF8',
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.brandSoft,
  },
  avatarText: { color: colors.textOnAccent, fontSize: 24, fontWeight: '900' },
  profileText: { flex: 1, gap: 3 },
  profileName: { ...typography.section, color: colors.ink, fontWeight: '900' },
  profilePhone: { ...typography.caption, color: colors.muted },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  memberText: { ...typography.caption, color: colors.brandDark, fontSize: 9, fontWeight: '900' },
  walletCard: { marginHorizontal: spacing.sm, marginTop: spacing.xs, gap: spacing.sm },
  walletHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  cardSubtitle: { ...typography.caption, color: colors.muted, fontSize: 10 },
  walletTotal: { ...typography.title, color: colors.brand, fontWeight: '900' },
  walletStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEF2FA',
    paddingVertical: spacing.xs,
  },
  walletStat: { flex: 1, alignItems: 'center', gap: 2 },
  walletStatValue: { ...typography.body, color: colors.ink, fontWeight: '900', fontVariant: ['tabular-nums'] },
  walletStatLabel: { ...typography.caption, color: colors.muted, fontSize: 9 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  bankMini: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E7EDF8',
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bankMiniText: { ...typography.caption, color: colors.muted, flex: 1 },
  paymentButton: { minHeight: 38, paddingHorizontal: spacing.md },
  sectionCard: { marginHorizontal: spacing.sm, gap: spacing.sm },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionAction: { ...typography.caption, color: colors.brand, fontWeight: '900' },
  shortcutGrid: { flexDirection: 'row' },
  shortcutItem: { flex: 1, alignItems: 'center', gap: 6, minHeight: 64 },
  shortcutIconWrap: { position: 'relative' },
  shortcutLabel: { ...typography.caption, color: colors.ink, fontSize: 10, textAlign: 'center', fontWeight: '700' },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.card,
  },
  badgeText: { color: colors.textOnAccent, fontSize: 9, fontWeight: '900' },
  menuList: { gap: spacing.xs, paddingHorizontal: spacing.sm },
  menuCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#FEE2E2' },
  menuText: { flex: 1, gap: 1 },
  menuLabel: { ...typography.body, color: colors.ink, fontWeight: '900' },
  menuDanger: { color: colors.danger },
  menuSubtitle: { ...typography.caption, color: colors.muted, fontSize: 10 },
});
