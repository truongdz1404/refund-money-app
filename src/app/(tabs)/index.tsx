import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/QueryState';
import { AppIcon, AppTopBar, Card, IconBadge, Mascot, ProgressBar, type AppIconName } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useCampaigns, useMe, useWallet } from '@/hooks/useAppQueries';
import { formatVnd } from '@/lib/format';

const QUICK_ACTIONS = [
  { title: 'Copy link mới', subtitle: 'Dán link Shopee', icon: 'link-outline' as AppIconName, tone: '#FFEFE8', fg: colors.danger, href: '/link' as const },
  { title: 'Cashback', subtitle: 'Nhận tiền', icon: 'cash-outline' as AppIconName, tone: colors.brandSoft, fg: colors.brand, href: '/wallet' as const },
];

const STAT_META = [
  { label: 'Tổng tiền hoàn', icon: 'sparkles-outline' as AppIconName, tone: '#FFF7D6', fg: '#D99A00' },
  { label: 'Chờ xử lý', icon: 'hourglass-outline' as AppIconName, tone: '#FFF2DA', fg: '#E18B00' },
  { label: 'Chưa thanh toán', icon: 'card-outline' as AppIconName, tone: '#FFECEC', fg: colors.danger },
  { label: 'Ví khả dụng', icon: 'wallet-outline' as AppIconName, tone: colors.brandSoft, fg: colors.brand },
  { label: 'Đơn đã nhận', icon: 'checkmark-done-outline' as AppIconName, tone: '#E9FBEF', fg: colors.success },
  { label: 'Sự kiện', icon: 'gift-outline' as AppIconName, tone: '#F0EAFF', fg: '#7E5CE8' },
];

export default function HomeScreen() {
  const router = useRouter();
  const me = useMe();
  const wallet = useWallet();
  const campaigns = useCampaigns();

  const isLoading = me.isLoading || wallet.isLoading;
  const isError = me.isError || wallet.isError;
  const refreshing = me.isFetching || wallet.isFetching || campaigns.isFetching;
  const activeCampaign = campaigns.data?.find((c) => c.isActive) ?? campaigns.data?.[0];
  const nextTier = activeCampaign
    ? [...activeCampaign.tiers].sort((a, b) => a.orders - b.orders).find((t) => t.orders > activeCampaign.completedOrders)
    : undefined;
  const progress = activeCampaign && nextTier ? activeCampaign.completedOrders / nextTier.orders : 0.35;
  const statValues = [
    formatVnd(wallet.data?.paidAmount),
    formatVnd(wallet.data?.pendingAmount),
    formatVnd(wallet.data?.unpaidAmount),
    formatVnd(wallet.data?.availableAmount),
    `${wallet.data?.paidOrders ?? 0}`,
    `${campaigns.data?.length ?? 1}`,
  ];

  function refetchAll() {
    me.refetch();
    wallet.refetch();
    campaigns.refetch();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name="Đặng Nguyễn Tiến" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} />}
      >
        <QueryState isLoading={isLoading} isError={isError} onRetry={refetchAll}>
          <Card style={styles.hero}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Chào Tiến!</Text>
              <Text style={styles.heroSubtitle}>Sẵn sàng hoàn tiền cho đơn hàng mới</Text>
            </View>
            <Mascot size={58} />
          </Card>

          <View style={styles.actionRow}>
            {QUICK_ACTIONS.map((item) => (
              <Pressable key={item.title} style={styles.actionPress} onPress={() => router.push(item.href)}>
                <Card style={styles.actionCard}>
                  <IconBadge name={item.icon} size={30} backgroundColor={item.tone} iconColor={item.fg} iconSize={16} />
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>

          <View style={styles.statsGrid}>
            {STAT_META.map((item, index) => (
              <Card key={item.label} style={styles.statCard}>
                <IconBadge name={item.icon} size={28} backgroundColor={item.tone} iconColor={item.fg} iconSize={15} />
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, { color: item.fg }]}>{statValues[index]}</Text>
              </Card>
            ))}
          </View>

          <Card style={styles.walletCard}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIcon}>
                <AppIcon name="wallet" size={17} color={colors.brand} />
              </View>
              <View>
                <Text style={styles.walletTitle}>Tiền đã có sẵn</Text>
                <Text style={styles.walletSub}>Có thể yêu cầu thanh toán</Text>
              </View>
            </View>
            <Text style={styles.walletAmount}>{formatVnd(wallet.data?.availableAmount)}</Text>
          </Card>

          <Card style={styles.campaignCard}>
            <View style={styles.campaignTop}>
              <View style={styles.campaignIcon}>
                <AppIcon name="gift-outline" size={17} color={colors.brand} />
              </View>
              <View style={styles.campaignText}>
                <Text style={styles.campaignTitle}>{activeCampaign?.title ?? 'Sự kiện tháng 8'}</Text>
                <Text style={styles.campaignSub}>Sự kiện đang diễn ra</Text>
              </View>
              <Text style={styles.campaignPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar progress={progress} height={6} fillColor={colors.success} />
            <Text style={styles.progressHint}>
              {nextTier
                ? `Còn ${Math.max(nextTier.orders - (activeCampaign?.completedOrders ?? 0), 0)} đơn để nhận ${formatVnd(nextTier.reward)}`
                : 'Tạo thêm đơn để mở khóa thưởng sự kiện'}
            </Text>
          </Card>
        </QueryState>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  container: { padding: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.xs },
  hero: {
    minHeight: 92,
    backgroundColor: colors.brandSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroText: { flex: 1, gap: 3 },
  heroTitle: { ...typography.title, color: colors.ink },
  heroSubtitle: { ...typography.caption, color: colors.muted },
  actionRow: { flexDirection: 'row', gap: spacing.xs },
  actionPress: { flex: 1 },
  actionCard: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { flex: 1, gap: 1 },
  actionTitle: { ...typography.caption, color: colors.ink, fontWeight: '900' },
  actionSubtitle: { ...typography.caption, color: colors.muted, fontSize: 9 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  statCard: { width: '48.8%', minHeight: 72, gap: 3 },
  statLabel: { ...typography.caption, color: colors.muted, fontSize: 10 },
  statValue: { ...typography.body, fontWeight: '900', fontVariant: ['tabular-nums'] },
  walletCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  walletSub: { ...typography.caption, color: colors.muted, fontSize: 10 },
  walletAmount: { ...typography.body, color: colors.success, fontWeight: '900' },
  campaignCard: { gap: spacing.xs },
  campaignTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  campaignIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignText: { flex: 1, gap: 1 },
  campaignTitle: { ...typography.body, color: colors.ink, fontWeight: '900' },
  campaignSub: { ...typography.caption, color: colors.muted, fontSize: 10 },
  campaignPct: { ...typography.caption, color: colors.success, fontWeight: '900' },
  progressHint: { ...typography.caption, color: colors.muted, fontSize: 10 },
});
