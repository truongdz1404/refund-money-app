import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/QueryState';
import { AppButton, AppIcon, AppTopBar, Card, IconBadge, Mascot, ProgressBar } from '@/design/components';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useCampaigns, useMe, useWallet } from '@/hooks/useAppQueries';
import { formatVnd } from '@/lib/format';

const STATS = [
  { label: 'Tổng đơn hàng', value: '156.076đ', icon: 'sparkles', tone: '#FFF7D6', fg: '#D99A00' },
  { label: 'Chờ xử lý', value: '491.355đ', icon: 'hourglass', tone: '#FFF2DA', fg: '#E18B00' },
  { label: 'Đang rút', value: '0đ', icon: 'cash', tone: '#EAF1FF', fg: colors.brand },
  { label: 'Đã hoàn tiền', value: '238.678đ', icon: 'card', tone: '#FFECEC', fg: colors.danger },
  { label: 'Ví đang hoạt động', value: '25', icon: 'wallet', tone: '#F0EAFF', fg: '#7E5CE8' },
  { label: 'Sự kiện', value: '1', icon: 'gift', tone: '#E9FBEF', fg: colors.success },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const me = useMe();
  const wallet = useWallet();
  const campaigns = useCampaigns();

  const isLoading = me.isLoading || wallet.isLoading;
  const isError = me.isError || wallet.isError;
  const refreshing = me.isFetching || wallet.isFetching || campaigns.isFetching;

  function refetchAll() {
    me.refetch();
    wallet.refetch();
    campaigns.refetch();
  }

  const activeCampaign = campaigns.data?.find((c) => c.isActive) ?? campaigns.data?.[0];
  const nextTier = activeCampaign
    ? [...activeCampaign.tiers].sort((a, b) => a.orders - b.orders).find((t) => t.orders > activeCampaign.completedOrders)
    : undefined;
  const progress = activeCampaign && nextTier ? activeCampaign.completedOrders / nextTier.orders : 1;
  const displayName = me.data?.phone ? `Chào ${me.data.phone.slice(-4)}!` : 'Chào Tiến!';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppTopBar name="Đặng Nguyễn Tiến" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} />}
      >
        <QueryState isLoading={isLoading} isError={isError} onRetry={refetchAll}>
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{displayName}</Text>
              <Text style={styles.heroSubtitle}>Sẵn sàng nhận tiền hoàn từ mỗi đơn hàng</Text>
            </View>
            <Mascot size={62} />
          </View>

          <View style={styles.actionRow}>
            <MiniAction
              title="Copy link mới"
              subtitle="Dán link Shopee"
              icon="link"
              onPress={() => router.push('/link')}
            />
            <MiniAction
              title="Cashback"
              subtitle={formatVnd(wallet.data?.availableAmount)}
              icon="wallet"
              onPress={() => router.push('/wallet')}
            />
          </View>

          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              {STATS.map((item, index) => {
                const liveValue =
                  index === 0
                    ? formatVnd(wallet.data?.paidAmount)
                    : index === 1
                      ? formatVnd(wallet.data?.pendingAmount)
                      : index === 2
                        ? formatVnd(wallet.data?.unpaidAmount)
                        : item.value;
                return (
                  <View key={item.label} style={styles.statItem}>
                    <IconBadge
                      name={item.icon}
                      size={28}
                      backgroundColor={item.tone}
                      iconColor={item.fg}
                      iconSize={15}
                    />
                    <Text style={styles.statLabel}>{item.label}</Text>
                    <Text style={[styles.statValue, { color: item.fg }]}>{liveValue}</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <Card style={styles.walletStrip}>
            <View>
              <Text style={styles.stripLabel}>Tiền đã có sẵn</Text>
              <Text style={styles.stripHint}>Đã chuyển vào ví</Text>
            </View>
            <Text style={styles.stripAmount}>{formatVnd(wallet.data?.availableAmount)}</Text>
          </Card>

          <Card style={styles.campaignCard}>
            <View style={styles.campaignHeader}>
              <View style={styles.campaignIcon}>
                <AppIcon name="gift" size={18} color={colors.brand} />
              </View>
              <View style={styles.campaignText}>
                <Text style={styles.campaignTitle}>{activeCampaign?.title ?? 'Sự kiện tháng 8'}</Text>
                <Text style={styles.campaignSubtitle}>Mua sắm đủ đơn, cộng thưởng ngay</Text>
              </View>
              <Text style={styles.campaignPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar progress={progress} height={7} fillColor={colors.success} />
            <Text style={styles.progressHint}>
              {nextTier
                ? `Còn ${Math.max(nextTier.orders - (activeCampaign?.completedOrders ?? 0), 0)} đơn nữa để nhận ${formatVnd(nextTier.reward)}`
                : 'Bạn đã hoàn thành mốc hiện tại'}
            </Text>
          </Card>

          <Card style={styles.readyCard}>
            <IconBadge name="checkmark-done" size={34} backgroundColor="#E9FBEF" iconColor={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.readyTitle}>Sẵn sàng nhận tiền</Text>
              <Text style={styles.readyText}>Tạo link mới để theo dõi hoàn tiền tự động.</Text>
            </View>
            <AppButton label="Tạo link" variant="secondary" onPress={() => router.push('/link')} />
          </Card>
        </QueryState>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniAction({
  title,
  subtitle,
  icon,
  onPress,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: 'link' | 'wallet';
  readonly onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.miniActionPress}>
      <Card style={styles.miniAction}>
      <IconBadge
        name={icon === 'link' ? 'bag-add' : 'cash'}
        size={34}
        backgroundColor={icon === 'link' ? '#FFEFE8' : colors.brandSoft}
        iconColor={icon === 'link' ? colors.danger : colors.brand}
      />
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <AppIcon name="chevron-forward" size={15} color={colors.textMuted} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  container: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.sm },
  hero: {
    minHeight: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    overflow: 'hidden',
  },
  heroText: { flex: 1, gap: 3 },
  heroTitle: { ...typography.title, color: colors.ink },
  heroSubtitle: { ...typography.caption, color: colors.muted },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  miniActionPress: { flex: 1 },
  miniAction: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 68 },
  actionText: { flex: 1, gap: 2 },
  actionTitle: { ...typography.body, color: colors.ink, fontWeight: '800' },
  actionSubtitle: { ...typography.caption, color: colors.muted, fontSize: 10 },
  statsCard: { padding: 0, overflow: 'hidden' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: {
    width: '50%',
    minHeight: 82,
    padding: spacing.sm,
    gap: 3,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairline,
  },
  statLabel: { ...typography.caption, color: colors.muted },
  statValue: { ...typography.section, fontVariant: ['tabular-nums'], fontWeight: '800' },
  walletStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stripLabel: { ...typography.section, color: colors.ink },
  stripHint: { ...typography.caption, color: colors.muted },
  stripAmount: { ...typography.section, color: colors.success },
  campaignCard: { gap: spacing.xs },
  campaignHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  campaignIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignText: { flex: 1, gap: 1 },
  campaignTitle: { ...typography.section, color: colors.ink },
  campaignSubtitle: { ...typography.caption, color: colors.muted },
  campaignPct: { ...typography.caption, color: colors.success, fontWeight: '800' },
  progressHint: { ...typography.caption, color: colors.muted },
  readyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  readyTitle: { ...typography.body, color: colors.ink, fontWeight: '800' },
  readyText: { ...typography.caption, color: colors.muted },
});
